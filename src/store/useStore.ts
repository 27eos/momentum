import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Completion, Priority, Recurrence, Subtask, Task } from '../types'
import { dayKey, nowIso, recursOn } from '../lib/dates'

function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
  )
}

/**
 * Apply a change to a task's subtask list and reconcile the parent's done
 * state + completion log. For a task with subtasks, `done` is DERIVED: the
 * task is complete exactly when every subtask is checked, and the marble /
 * completion is logged (or removed) as it crosses that line.
 */
function reconcileSubtasks(
  tasks: Task[],
  completions: Completion[],
  taskId: string,
  transform: (subs: Subtask[]) => Subtask[],
): { tasks: Task[]; completions: Completion[] } {
  const task = tasks.find((t) => t.id === taskId)
  if (!task) return { tasks, completions }

  const subtasks = transform(task.subtasks ?? [])
  const nowDone = subtasks.length > 0 && subtasks.every((x) => x.done)
  const wasDone = task.done
  const when = nowIso()

  let nextCompletions = completions
  if (nowDone && !wasDone) {
    nextCompletions = [
      { id: uid(), taskId: task.id, title: task.title, completedAt: when, date: dayKey() },
      ...completions,
    ]
  } else if (!nowDone && wasDone) {
    const idx = completions.findIndex((c) => c.taskId === task.id)
    if (idx >= 0) nextCompletions = completions.filter((_, i) => i !== idx)
  }

  const nextTasks = tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          subtasks,
          done: nowDone,
          completedAt: nowDone ? when : wasDone ? undefined : t.completedAt,
          updatedAt: when,
        }
      : t,
  )

  return { tasks: nextTasks, completions: nextCompletions }
}

export interface NewTaskInput {
  title: string
  notes?: string
  priority?: Priority
  dueDate?: string
  recurrence?: Recurrence
}

interface State {
  tasks: Task[]
  completions: Completion[]
  addTask: (input: NewTaskInput) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subId: string) => void
  deleteSubtask: (taskId: string, subId: string) => void
  toggleAllSubtasks: (taskId: string) => void
  reorder: (orderedIds: string[]) => void
  rolloverRecurring: () => void
  clearCompleted: () => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: [],
      completions: [],

      addTask: (input) =>
        set((s) => {
          const minOrder = s.tasks.reduce((m, t) => Math.min(m, t.order), 0)
          const task: Task = {
            id: uid(),
            title: input.title.trim(),
            notes: input.notes?.trim() || undefined,
            priority: input.priority ?? 'normal',
            done: false,
            createdAt: nowIso(),
            dueDate: input.dueDate || undefined,
            recurrence: input.recurrence ?? 'none',
            order: minOrder - 1, // new tasks float to the top
            updatedAt: nowIso(),
          }
          return { tasks: [task, ...s.tasks] }
        }),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t,
          ),
        })),

      toggleTask: (id) => {
        const s = get()
        const task = s.tasks.find((t) => t.id === id)
        if (!task) return

        if (!task.done) {
          // Completing.
          const when = nowIso()
          const completion: Completion = {
            id: uid(),
            taskId: task.id,
            title: task.title,
            completedAt: when,
            date: dayKey(),
          }
          set({
            tasks: s.tasks.map((t) =>
              t.id === id
                ? { ...t, done: true, completedAt: when, updatedAt: when }
                : t,
            ),
            completions: [completion, ...s.completions],
          })
        } else {
          // Un-completing: remove the most recent completion for this task today.
          const idx = s.completions.findIndex(
            (c) => c.taskId === id && c.date === dayKey(),
          )
          const completions =
            idx >= 0
              ? s.completions.filter((_, i) => i !== idx)
              : s.completions
          set({
            tasks: s.tasks.map((t) =>
              t.id === id
                ? { ...t, done: false, completedAt: undefined, updatedAt: nowIso() }
                : t,
            ),
            completions,
          })
        }
      },

      addSubtask: (taskId, title) =>
        set((s) => {
          const clean = title.trim()
          if (!clean) return {}
          return reconcileSubtasks(s.tasks, s.completions, taskId, (subs) => [
            ...subs,
            { id: uid(), title: clean, done: false },
          ])
        }),

      toggleSubtask: (taskId, subId) =>
        set((s) =>
          reconcileSubtasks(s.tasks, s.completions, taskId, (subs) =>
            subs.map((x) => (x.id === subId ? { ...x, done: !x.done } : x)),
          ),
        ),

      deleteSubtask: (taskId, subId) =>
        set((s) =>
          reconcileSubtasks(s.tasks, s.completions, taskId, (subs) =>
            subs.filter((x) => x.id !== subId),
          ),
        ),

      // One-click complete-all / reset-all for a task's subtasks.
      toggleAllSubtasks: (taskId) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId)
          const subs = task?.subtasks ?? []
          const allDone = subs.length > 0 && subs.every((x) => x.done)
          return reconcileSubtasks(s.tasks, s.completions, taskId, () =>
            subs.map((x) => ({ ...x, done: !allDone })),
          )
        }),

      // Deleting a task also removes its completion records, so its marbles /
      // stats disappear with it (a deleted task shouldn't keep counting).
      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          completions: s.completions.filter((c) => c.taskId !== id),
        })),

      reorder: (orderedIds) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            const idx = orderedIds.indexOf(t.id)
            return idx >= 0 ? { ...t, order: idx, updatedAt: nowIso() } : t
          }),
        })),

      // Reset recurring tasks that were completed on a previous day so they
      // reappear on their next active day. Runs on app start and midnight.
      rolloverRecurring: () =>
        set((s) => {
          const today = dayKey()
          let changed = false
          const tasks = s.tasks.map((t) => {
            if (t.recurrence === 'none' || !t.done) return t
            const completedDay = t.completedAt ? dayKey(new Date(t.completedAt)) : ''
            if (completedDay !== today && recursOn(t)) {
              changed = true
              return {
                ...t,
                done: false,
                completedAt: undefined,
                subtasks: t.subtasks?.map((x) => ({ ...x, done: false })),
              }
            }
            return t
          })
          return changed ? { tasks } : {}
        }),

      clearCompleted: () =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.recurrence !== 'none' || !t.done),
        })),
    }),
    {
      name: 'momentum-store',
      version: 1,
    },
  ),
)
