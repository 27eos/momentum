import type { DayCount } from '../lib/stats'
import { dayKey } from '../lib/dates'

export function WeekChart({ data }: { data: DayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const today = dayKey()

  return (
    <div className="flex items-end justify-between gap-1.5" style={{ height: 84 }}>
      {data.map((d) => {
        const h = (d.count / max) * 100
        const isToday = d.date === today
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-md transition-all duration-500 ${
                  d.count === 0
                    ? 'bg-surface-2'
                    : isToday
                      ? 'bg-gradient-to-t from-grow to-grow-soft'
                      : 'bg-grow/40'
                }`}
                style={{ height: `${Math.max(d.count === 0 ? 6 : 12, h)}%` }}
                title={`${d.count} on ${d.date}`}
              />
            </div>
            <span className={`text-[10px] ${isToday ? 'font-semibold text-text' : 'text-faint'}`}>
              {d.label[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
