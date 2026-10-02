/**
 * A tightly-stacked cluster of glossy marbles — one per task completed this week.
 * Marbles fill a hexagonal close-packing (centre → ring of 6 → ring of 12 → …),
 * so they stack "magnetically" and grow outward ring by ring, the same feel as
 * the CRM map's Apple-Watch dot-pack clusters. Green-leaning with warm pops.
 */

type Grad = { id: string; hi: string; mid: string; lo: string }

const GREEN: Grad = { id: 'm-green', hi: '#b8f5d0', mid: '#46d17f', lo: '#1f9e57' }
const GREEN2: Grad = { id: 'm-green2', hi: '#d6f7c2', mid: '#7bd957', lo: '#3f9e2a' }
const GOLD: Grad = { id: 'm-gold', hi: '#ffe7a3', mid: '#f5c24a', lo: '#c8890f' }
const AMBER: Grad = { id: 'm-amber', hi: '#ffdd9e', mid: '#f2b03d', lo: '#b9760f' }
const ORANGE: Grad = { id: 'm-orange', hi: '#ffcf9e', mid: '#ff9f43', lo: '#cf6a1f' }
const ALL = [GREEN, GREEN2, GOLD, AMBER, ORANGE]

// Green-forward pattern (~55% green), stable per index as the cluster grows.
const PATTERN = [GREEN, GREEN2, GOLD, GREEN, AMBER, GREEN2, GREEN, ORANGE, GREEN2, AMBER]

const MARBLE_R = 7.5
const GAP = 2.2
const D = MARBLE_R * 2 + GAP // centre-to-centre spacing

// Cube-hex directions (Red Blob Games ordering) for ring traversal.
const DIRS = [
  [1, -1, 0],
  [1, 0, -1],
  [0, 1, -1],
  [-1, 1, 0],
  [-1, 0, 1],
  [0, -1, 1],
]

/** Axial [q, r] coords in hex-spiral order (centre first, then each ring). */
function hexSpiral(n: number): [number, number][] {
  const out: [number, number][] = []
  if (n <= 0) return out
  out.push([0, 0])
  for (let k = 1; out.length < n; k++) {
    // Start at one corner of ring k, then walk the six sides.
    let x = DIRS[4][0] * k
    let y = DIRS[4][1] * k
    let z = DIRS[4][2] * k
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < k; step++) {
        if (out.length < n) out.push([x, z]) // axial q=x, r=z
        x += DIRS[side][0]
        y += DIRS[side][1]
        z += DIRS[side][2]
      }
    }
  }
  return out
}

function toPixel([q, r]: [number, number]): [number, number] {
  // Pointy-top axial → pixel, neighbours exactly D apart.
  return [D * (q + r / 2), D * (Math.sqrt(3) / 2) * r]
}

export function MarbleCluster({
  total,
  max = 90,
  size = 188,
}: {
  total: number
  max?: number
  size?: number
}) {
  const shown = Math.min(total, max)
  const px = hexSpiral(shown).map(toPixel)

  // Fit the cluster inside the box, scaling down only if it would overflow.
  const maxR = px.reduce((m, [x, y]) => Math.max(m, Math.hypot(x, y)), 0)
  const pad = 4
  const fitScale = Math.min(1, (size / 2 - MARBLE_R - pad) / Math.max(maxR, 1))
  const c = size / 2

  const defs = (
    <defs>
      {ALL.map((g) => (
        <radialGradient key={g.id} id={g.id} cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor={g.hi} />
          <stop offset="38%" stopColor={g.mid} />
          <stop offset="100%" stopColor={g.lo} />
        </radialGradient>
      ))}
      <radialGradient id="m-ghost" cx="36%" cy="30%" r="72%">
        <stop offset="0%" stopColor="var(--color-surface-2)" />
        <stop offset="100%" stopColor="var(--color-surface)" />
      </radialGradient>
    </defs>
  )

  const r = MARBLE_R * fitScale

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {defs}

        {total === 0 &&
          hexSpiral(7).map(([q, rr], i) => {
            const [dx, dy] = toPixel([q, rr])
            return (
              <circle
                key={`ghost-${i}`}
                cx={c + dx}
                cy={c + dy}
                r={MARBLE_R}
                fill="url(#m-ghost)"
                stroke="var(--color-border)"
                strokeWidth="0.5"
              />
            )
          })}

        {px.map(([dx, dy], i) => {
          const g = PATTERN[i % PATTERN.length]
          const isNewest = i === shown - 1
          return (
            <circle
              key={i}
              cx={c + dx * fitScale}
              cy={c + dy * fitScale}
              r={r}
              fill={`url(#${g.id})`}
              stroke="rgba(0,0,0,0.32)"
              strokeWidth="0.5"
              style={
                isNewest
                  ? {
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      animation: 'marble-in 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                    }
                  : undefined
              }
            />
          )
        })}
      </svg>

      {total > max && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-grow px-2 py-0.5 text-[11px] font-bold text-bg">
          +{total - max}
        </span>
      )}
    </div>
  )
}
