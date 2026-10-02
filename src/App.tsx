import { useEffect, useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import type { Task, ViewId } from './types'
import { useStore } from './store/useStore'
import { isOverdue, recursOn } from './lib/dates'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { QuickAdd } from './components/QuickAdd'
import { TaskList } from './components/TaskList'
import { UpcomingPeek, type PeekGroup } from './components/UpcomingPeek'
import { MomentumPanel } from './components/MomentumPanel'

const VIEW_TITLES: Record<ViewId, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  all: 'All open',
  done: 'Completed',
}

const VIEW_SUB: Record<ViewId, string> = {
  today: "What's on for today",
  upcoming: 'Scheduled ahead',
  all: 'Everything still open',
  done: 'Recently completed',
}

/** Does a task belong in the "Today" bucket at all (done or not)? */
function isTodayTask(t: Task): boolean {
  // Recurring tasks that fire today stay visible even once checked, so you
  // can see them done-for-today until they roll over at midnight.
  if (t.recurrence !== 'none') return recursOn(t)
  if (t.done) return false
  if (!t.dueDate) return true // undated one-offs live in Today
  return isOverdue(t.dueDate) || t.dueDate <= new Date().toISOString().slice(0, 10)
}

export function App() {
  const tasks = useStore((s) => s.tasks)
  const rolloverRecurring = useStore((s) => s.rolloverRecurring)
  const [view, setView] = useState<ViewId>('today')

  // Roll recurring tasks over on launch and at each local midnight.
  useEffect(() => {
    rolloverRecurring()
    const now = new Date()
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime()
    const t = setTimeout(() => rolloverRecurring(), msToMidnight + 1000)
    return () => clearTimeout(t)
  }, [rolloverRecurring])

  const counts = useMemo(() => {
    const open = tasks.filter((t) => !t.done)
    return {
      today: tasks.filter((t) => isTodayTask(t) && !t.done).length,
      upcoming: open.filter((t) => t.dueDate && t.dueDate > new Date().toISOString().slice(0, 10)).length,
      all: open.length,
      done: tasks.filter((t) => t.done && t.recurrence === 'none').length,
    }
  }, [tasks])

  const visible = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let list: Task[]
    switch (view) {
      case 'today':
        list = tasks.filter(isTodayTask)
        break
      case 'upcoming':
        list = tasks.filter((t) => !t.done && t.dueDate && t.dueDate > today)
        break
      case 'all':
        list = tasks.filter((t) => !t.done)
        break
      case 'done':
        list = tasks.filter((t) => t.done && t.recurrence === 'none')
        break
    }
    const prio = { high: 0, normal: 1, low: 2 } as const
    return [...list].sort((a, b) => {
      if (view === 'done') {
        return (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
      }
      if (view === 'upcoming') {
        return (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      }
      // Completed (recurring) tasks sink to the bottom.
      if (a.done !== b.done) return a.done ? 1 : -1
      if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority]
      return a.order - b.order
    })
  }, [tasks, view])

  // "Coming up" peek: dated one-offs due over the next 2 days (tomorrow + after).
  const peekGroups = useMemo<PeekGroup[]>(() => {
    if (view !== 'today') return []
    const groups: PeekGroup[] = []
    for (let offset = 1; offset <= 2; offset++) {
      const d = addDays(new Date(), offset)
      const key = format(d, 'yyyy-MM-dd')
      const items = tasks
        .filter((t) => !t.done && t.recurrence === 'none' && t.dueDate === key)
        .sort((a, b) => {
          const prio = { high: 0, normal: 1, low: 2 } as const
          return prio[a.priority] - prio[b.priority]
        })
      if (items.length > 0) {
        groups.push({
          label: offset === 1 ? 'Tomorrow' : format(d, 'EEEE'),
          items,
        })
      }
    }
    return groups
  }, [tasks, view])

  return (
    <div className="flex h-full flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar view={view} onChange={setView} counts={counts} />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="px-8 pt-6 pb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              {VIEW_TITLES[view]}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{VIEW_SUB[view]}</p>
          </header>

          {view !== 'done' && <QuickAdd defaultRecurring={view === 'today'} />}

          <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10 pt-2">
            <TaskList tasks={visible} view={view} />
            {view === 'today' && <UpcomingPeek groups={peekGroups} />}
          </div>
        </main>

        <MomentumPanel />
      </div>
    </div>
  )
}
