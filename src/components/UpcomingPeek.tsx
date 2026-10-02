import { Check } from 'lucide-react'
import type { Priority, Task } from '../types'
import { useStore } from '../store/useStore'

const PRIO_DOT: Record<Priority, string> = {
  low: 'bg-faint/60',
  normal: 'bg-accent/60',
  high: 'bg-danger',
}

export interface PeekGroup {
  label: string
  items: Task[]
}

/**
 * A muted "coming up" look-ahead shown beneath Today's list. Deliberately
 * secondary — smaller and dimmed — so clearing Today still feels like the goal,
 * while tomorrow and the day after stay in view.
 */
export function UpcomingPeek({ groups }: { groups: PeekGroup[] }) {
  const toggleTask = useStore((s) => s.toggleTask)
  if (groups.length === 0) return null

  return (
    <section className="mt-9">
      <div className="mb-1 flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-faint">
          Coming up
        </span>
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      {groups.map((g) => (
        <div key={g.label} className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-muted">{g.label}</p>
          <ul className="flex flex-col gap-1.5">
            {g.items.map((t) => (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-lg border border-border-soft/70 bg-surface/25 py-1.5 pr-3 pl-3 opacity-80 transition-all hover:opacity-100"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  aria-label="Complete task early"
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-border-soft text-transparent transition-all hover:border-grow-soft"
                >
                  <Check size={12} strokeWidth={3.5} />
                </button>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIO_DOT[t.priority]}`} />
                <span className="truncate text-sm text-muted" title={t.title}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
