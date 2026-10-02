import { subDays, startOfWeek } from 'date-fns'
import type { Completion } from '../types'
import { dayKey } from './dates'

export interface DayCount {
  date: string // yyyy-mm-dd
  label: string // e.g. "Mon"
  count: number
}

/** Count completions per day for the last `days` days (oldest first). */
export function lastNDays(completions: Completion[], days: number): DayCount[] {
  const counts = new Map<string, number>()
  for (const c of completions) counts.set(c.date, (counts.get(c.date) ?? 0) + 1)

  const out: DayCount[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(now, i)
    const key = dayKey(d)
    out.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: counts.get(key) ?? 0,
    })
  }
  return out
}

/** Consecutive days (ending today or yesterday) with at least one completion. */
export function currentStreak(completions: Completion[]): number {
  const days = new Set(completions.map((c) => c.date))
  let streak = 0
  const now = new Date()
  // Allow the streak to still count if nothing done yet today but done yesterday.
  let cursor = 0
  if (!days.has(dayKey(now))) {
    if (days.has(dayKey(subDays(now, 1)))) cursor = 1
    else return 0
  }
  for (let i = cursor; ; i++) {
    if (days.has(dayKey(subDays(now, i)))) streak++
    else break
  }
  return streak
}

export function bestStreak(completions: Completion[]): number {
  const days = [...new Set(completions.map((c) => c.date))].sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const key of days) {
    const d = new Date(key + 'T00:00:00')
    if (prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1) {
      run++
    } else {
      run = 1
    }
    best = Math.max(best, run)
    prev = d
  }
  return best
}

export function completedToday(completions: Completion[]): number {
  const key = dayKey()
  return completions.filter((c) => c.date === key).length
}

/** Completions since the start of the current week (Monday). Resets weekly. */
export function completedThisWeek(completions: Completion[]): number {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  return completions.filter((c) => new Date(c.completedAt) >= start).length
}

/* -------------------------------------------------------------------------- */
/*  Growth / leveling                                                         */
/*  Total lifetime completions feed a gently-curving level system that        */
/*  drives the visual growth element.                                         */
/* -------------------------------------------------------------------------- */

export interface Growth {
  level: number
  stage: number // 0..5 visual growth stage
  inLevel: number // completions earned toward next level
  needed: number // completions needed this level
  total: number
  progress: number // 0..1 toward next level
}

/** Completions required to REACH a given level (level 1 = 0). */
function thresholdForLevel(level: number): number {
  // 0, 5, 12, 21, 32, 45, ... grows by an extra 2 each level.
  let total = 0
  let step = 5
  for (let l = 2; l <= level; l++) {
    total += step
    step += 2
  }
  return total
}

export function growthFromTotal(total: number): Growth {
  let level = 1
  while (total >= thresholdForLevel(level + 1)) level++
  const base = thresholdForLevel(level)
  const next = thresholdForLevel(level + 1)
  const needed = next - base
  const inLevel = total - base
  const progress = needed > 0 ? inLevel / needed : 0
  const stage = Math.min(5, Math.floor((level - 1) / 2)) // new visual stage every 2 levels
  return { level, stage, inLevel, needed, total, progress }
}
