import { Flame, Target, Trophy, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  bestStreak,
  completedThisWeek,
  completedToday,
  currentStreak,
  lastNDays,
} from '../lib/stats'
import { MarbleCluster } from './MarbleCluster'
import { WeekChart } from './WeekChart'

export function MomentumPanel() {
  const completions = useStore((s) => s.completions)

  const total = completions.length
  const streak = currentStreak(completions)
  const best = bestStreak(completions)
  const today = completedToday(completions)
  const thisWeek = completedThisWeek(completions)
  const week = lastNDays(completions, 7)
  const weekTotal = week.reduce((a, d) => a + d.count, 0)

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border-soft bg-bg-soft/50 p-5 xl:flex">
      {/* This week's marble jar */}
      <section className="rounded-2xl border border-border-soft bg-surface/50 p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Done this week</h2>
          <span className="text-2xl font-bold tabular-nums text-grow">{thisWeek}</span>
        </div>
        <div className="my-2 flex justify-center">
          <MarbleCluster total={thisWeek} />
        </div>
        <p className="text-center text-xs text-muted">
          {thisWeek === 0
            ? 'Finish a task to drop your first marble'
            : 'Resets Monday — keep them stacking'}
        </p>
      </section>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={<Flame size={16} />} tint="text-warn" value={streak} label="day streak" />
        <StatTile icon={<Target size={16} />} tint="text-grow" value={today} label="done today" />
        <StatTile icon={<Trophy size={16} />} tint="text-accent-soft" value={best} label="best streak" />
        <StatTile icon={<CheckCircle2 size={16} />} tint="text-grow" value={total} label="all-time" />
      </div>

      {/* Weekly chart */}
      <section className="rounded-2xl border border-border-soft bg-surface/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Last 7 days</h2>
          <span className="text-xs text-muted">{weekTotal} tasks</span>
        </div>
        <WeekChart data={week} />
      </section>
    </aside>
  )
}

function StatTile({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ReactNode
  tint: string
  value: number
  label: string
}) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface/50 p-4">
      <span className={tint}>{icon}</span>
      <div className="mt-2 text-2xl font-bold leading-none tabular-nums text-text">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  )
}
