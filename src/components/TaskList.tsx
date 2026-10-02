import { CheckCircle2, Sparkles } from 'lucide-react'
import type { Task, ViewId } from '../types'
import { TaskItem } from './TaskItem'

const EMPTY: Record<ViewId, { title: string; sub: string }> = {
  today: { title: 'All clear for today', sub: 'Add a task above, or enjoy the calm.' },
  upcoming: { title: 'Nothing scheduled ahead', sub: 'Tasks with a future date will show here.' },
  all: { title: 'Inbox zero', sub: 'No open tasks. Nice work.' },
  done: { title: 'Nothing completed yet', sub: 'Checked-off tasks land here.' },
}

export function TaskList({ tasks, view }: { tasks: Task[]; view: ViewId }) {
  if (tasks.length === 0) {
    const e = EMPTY[view]
    return (
      <div className="mt-16 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-grow">
          {view === 'done' ? <CheckCircle2 size={26} /> : <Sparkles size={26} />}
        </div>
        <p className="text-base font-medium text-text">{e.title}</p>
        <p className="mt-1 text-sm text-muted">{e.sub}</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} view={view} />
      ))}
    </ul>
  )
}
