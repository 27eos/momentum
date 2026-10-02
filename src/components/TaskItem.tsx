import { useState } from 'react'
import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  ListTree,
  Pencil,
  Plus,
  Repeat,
  Trash2,
} from 'lucide-react'
import type { Priority, Recurrence, Task, ViewId } from '../types'
import { useStore } from '../store/useStore'
import { dueLabel, RECURRENCE_LABEL } from '../lib/dates'
import { SubtaskRing } from './SubtaskRing'

const PRIO_BAR: Record<Priority, string> = {
  low: 'bg-faint/40',
  normal: 'bg-accent/50',
  high: 'bg-danger',
}

const PRIORITIES: { id: Priority; label: string; dot: string }[] = [
  { id: 'low', label: 'Low', dot: 'bg-faint' },
  { id: 'normal', label: 'Normal', dot: 'bg-accent-soft' },
  { id: 'high', label: 'High', dot: 'bg-danger' },
]

const DUE_TONE: Record<string, string> = {
  over: 'text-danger',
  today: 'text-warn',
  soon: 'text-muted',
  none: 'text-faint',
}

export function TaskItem({ task, view }: { task: Task; view: ViewId }) {
  const toggleTask = useStore((s) => s.toggleTask)
  const updateTask = useStore((s) => s.updateTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const addSubtask = useStore((s) => s.addSubtask)
  const toggleSubtask = useStore((s) => s.toggleSubtask)
  const deleteSubtask = useStore((s) => s.deleteSubtask)
  const toggleAllSubtasks = useStore((s) => s.toggleAllSubtasks)

  const subs = task.subtasks ?? []
  const hasSubs = subs.length > 0
  const doneCount = subs.filter((x) => x.done).length
  const pct = hasSubs ? Math.round((doneCount / subs.length) * 100) : 0

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [expanded, setExpanded] = useState(hasSubs)
  const [showAdd, setShowAdd] = useState(false)
  const [newSub, setNewSub] = useState('')

  const due = dueLabel(task.dueDate)
  const showSection = expanded && (hasSubs || showAdd)

  function commitTitle() {
    const t = draft.trim()
    if (t && t !== task.title) updateTask(task.id, { title: t })
    else setDraft(task.title)
  }

  function addStep() {
    const v = newSub.trim()
    if (!v) return
    addSubtask(task.id, v)
    setNewSub('')
  }

  return (
    <li className="group animate-rise relative overflow-hidden rounded-xl border border-border-soft bg-surface/50 transition-colors hover:border-border hover:bg-surface">
      <span
        className={`absolute inset-y-0 left-0 w-[3px] ${task.done ? 'bg-grow/50' : PRIO_BAR[task.priority]}`}
      />

      {/* Main row */}
      <div className="flex items-center gap-3 py-2.5 pr-3 pl-4">
        {hasSubs ? (
          <SubtaskRing done={doneCount} total={subs.length} onClick={() => toggleAllSubtasks(task.id)} />
        ) : (
          <button
            onClick={() => toggleTask(task.id)}
            aria-label={task.done ? 'Mark incomplete' : 'Complete task'}
            className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              task.done
                ? 'border-grow bg-grow text-bg'
                : 'border-border-soft text-transparent hover:border-grow-soft'
            }`}
          >
            {task.done && <Check size={14} strokeWidth={3.5} className="animate-check-pop" />}
          </button>
        )}

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitTitle()
                  setEditing(false)
                }
                if (e.key === 'Escape') {
                  setDraft(task.title)
                  setEditing(false)
                }
              }}
              className="w-full bg-transparent text-[15px] text-text focus:outline-none"
            />
          ) : (
            <p
              onDoubleClick={() => setEditing(true)}
              className={`truncate text-[15px] ${task.done ? 'text-faint line-through' : 'text-text'}`}
              title={task.title}
            >
              {task.title}
            </p>
          )}

          {(task.dueDate || task.recurrence !== 'none') && !editing && (
            <div className="mt-0.5 flex items-center gap-2.5 text-xs">
              {task.dueDate && view !== 'done' && (
                <span className={DUE_TONE[due.tone]}>{due.text}</span>
              )}
              {task.recurrence !== 'none' && (
                <span className="flex items-center gap-1 text-faint">
                  <Repeat size={11} />
                  {RECURRENCE_LABEL[task.recurrence]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Subtask progress + expander */}
        {hasSubs && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted transition-colors hover:text-text"
            title={`${doneCount} of ${subs.length} steps`}
          >
            <span className={`tabular-nums font-semibold ${pct === 100 ? 'text-grow' : ''}`}>
              {pct}%
            </span>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        {/* Hover actions */}
        {!hasSubs && (
          <button
            onClick={() => {
              setExpanded(true)
              setShowAdd(true)
            }}
            aria-label="Add subtasks"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint opacity-0 transition-all hover:bg-surface-2 hover:text-text group-hover:opacity-100"
            title="Break into steps"
          >
            <ListTree size={15} />
          </button>
        )}
        <button
          onClick={() => setEditing((e) => !e)}
          aria-label="Edit task"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all ${
            editing
              ? 'bg-accent/15 text-accent-soft opacity-100'
              : 'text-faint opacity-0 hover:bg-surface-2 hover:text-text group-hover:opacity-100'
          }`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          aria-label="Delete task"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-faint opacity-0 transition-all hover:bg-danger/15 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Subtask checklist */}
      {showSection && (
        <div className="animate-rise space-y-1.5 border-t border-border-soft px-4 pt-2.5 pb-3 pl-[52px]">
          {subs.map((st) => (
            <div key={st.id} className="group/sub flex items-center gap-2.5">
              <button
                onClick={() => toggleSubtask(task.id, st.id)}
                aria-label={st.done ? 'Uncheck step' : 'Check step'}
                className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  st.done ? 'border-grow bg-grow text-bg' : 'border-border-soft text-transparent hover:border-grow-soft'
                }`}
              >
                {st.done && <Check size={11} strokeWidth={3.5} />}
              </button>
              <span className={`flex-1 truncate text-sm ${st.done ? 'text-faint line-through' : 'text-muted'}`}>
                {st.title}
              </span>
              <button
                onClick={() => deleteSubtask(task.id, st.id)}
                aria-label="Delete step"
                className="shrink-0 text-faint opacity-0 transition-all hover:text-danger group-hover/sub:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border text-faint">
              <Plus size={11} strokeWidth={3} />
            </span>
            <input
              value={newSub}
              autoFocus={showAdd && !hasSubs}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addStep()
                if (e.key === 'Escape') setNewSub('')
              }}
              onBlur={addStep}
              placeholder="Add a step…"
              className="flex-1 bg-transparent text-sm text-text placeholder:text-faint focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Edit panel */}
      {editing && (
        <div className="animate-rise flex flex-wrap items-center gap-2 border-t border-border-soft px-4 py-2.5 pl-[52px]">
          <div className="flex items-center gap-1 rounded-lg bg-bg-soft/60 p-0.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => updateTask(task.id, { priority: p.id })}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  task.priority === p.id ? 'bg-surface-2 text-text' : 'text-muted hover:text-text'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                {p.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 rounded-lg bg-bg-soft/60 px-2.5 py-1.5 text-xs text-muted focus-within:text-text">
            <CalendarClock size={14} />
            <input
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
              className="bg-transparent text-xs text-text focus:outline-none [color-scheme:dark]"
            />
            {task.dueDate && (
              <button
                onClick={() => updateTask(task.id, { dueDate: undefined })}
                className="ml-1 text-faint hover:text-danger"
                aria-label="Clear date"
              >
                ✕
              </button>
            )}
          </label>

          <label className="flex items-center gap-1.5 rounded-lg bg-bg-soft/60 px-2.5 py-1.5 text-xs text-muted focus-within:text-text">
            <Repeat size={14} />
            <select
              value={task.recurrence}
              onChange={(e) => updateTask(task.id, { recurrence: e.target.value as Recurrence })}
              className="bg-transparent text-xs text-text focus:outline-none [&>option]:bg-surface"
            >
              {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                <option key={r} value={r}>
                  {RECURRENCE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => {
              commitTitle()
              setEditing(false)
            }}
            className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-accent-soft"
          >
            Done
          </button>
        </div>
      )}
    </li>
  )
}
