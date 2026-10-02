import { CalendarClock, CheckCircle2, Flame, Inbox, Sun } from 'lucide-react'
import type { ViewId } from '../types'
import { useStore } from '../store/useStore'
import { currentStreak } from '../lib/stats'

const NAV: { id: ViewId; label: string; icon: typeof Sun }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
  { id: 'all', label: 'All open', icon: Inbox },
  { id: 'done', label: 'Completed', icon: CheckCircle2 },
]

export function Sidebar({
  view,
  onChange,
  counts,
}: {
  view: ViewId
  onChange: (v: ViewId) => void
  counts: Record<ViewId, number>
}) {
  const completions = useStore((s) => s.completions)
  const streak = currentStreak(completions)
  const totalDone = completions.length

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border-soft bg-bg-soft/40 px-3 py-4">
      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-surface text-text shadow-[inset_0_0_0_1px_var(--color-border)]'
                  : 'text-muted hover:bg-surface/60 hover:text-text'
              }`}
            >
              <Icon
                size={17}
                className={active ? 'text-accent-soft' : 'text-faint group-hover:text-muted'}
              />
              <span className="flex-1 text-left font-medium">{label}</span>
              {counts[id] > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active ? 'bg-accent/20 text-accent-soft' : 'bg-surface-2 text-faint'
                  }`}
                >
                  {counts[id]}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-surface/60 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Flame size={16} className="text-warn" />
            <span className="text-muted">Streak</span>
          </div>
          <span className="text-sm font-bold text-text">
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface/60 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-grow" />
            <span className="text-muted">Done</span>
          </div>
          <span className="text-sm font-bold tabular-nums text-text">{totalDone}</span>
        </div>
      </div>
    </aside>
  )
}
