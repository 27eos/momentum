import { Check } from 'lucide-react'

/**
 * A small progress ring that replaces the checkbox on a task with subtasks.
 * The green arc fills with completion; at 100% it becomes a solid check.
 * Clicking it completes or resets all subtasks at once.
 */
export function SubtaskRing({
  done,
  total,
  onClick,
}: {
  done: number
  total: number
  onClick: () => void
}) {
  const pct = total > 0 ? done / total : 0
  const full = total > 0 && done === total
  const size = 22
  const r = 8
  const c = size / 2
  const circ = 2 * Math.PI * r

  return (
    <button
      onClick={onClick}
      aria-label={full ? 'Reset all steps' : 'Complete all steps'}
      title={`${done}/${total} steps`}
      className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center"
    >
      {full ? (
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-grow text-bg">
          <Check size={14} strokeWidth={3.5} className="animate-check-pop" />
        </span>
      ) : (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--color-grow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${circ * pct} ${circ}`}
            transform={`rotate(-90 ${c} ${c})`}
            style={{ transition: 'stroke-dasharray 0.35s ease' }}
          />
        </svg>
      )}
    </button>
  )
}
