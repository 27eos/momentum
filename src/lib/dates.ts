import {
  format,
  isToday,
  isPast,
  parseISO,
  differenceInCalendarDays,
  startOfDay,
} from 'date-fns'
import type { Recurrence, Task } from '../types'

/** Local yyyy-mm-dd key for a date (defaults to now). */
export function dayKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd')
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** Friendly relative label for a due date string (yyyy-mm-dd). */
export function dueLabel(due?: string): { text: string; tone: 'over' | 'today' | 'soon' | 'none' } {
  if (!due) return { text: '', tone: 'none' }
  const d = parseISO(due)
  if (isToday(d)) return { text: 'Today', tone: 'today' }
  const diff = differenceInCalendarDays(d, startOfDay(new Date()))
  if (diff < 0) return { text: diff === -1 ? 'Yesterday' : `${Math.abs(diff)}d overdue`, tone: 'over' }
  if (diff === 1) return { text: 'Tomorrow', tone: 'soon' }
  if (diff <= 7) return { text: format(d, 'EEE'), tone: 'soon' }
  return { text: format(d, 'd MMM'), tone: 'soon' }
}

export function isOverdue(due?: string): boolean {
  if (!due) return false
  const d = parseISO(due)
  return isPast(d) && !isToday(d)
}

/** Does a recurring task fire on the given day? */
export function recursOn(task: Task, d: Date = new Date()): boolean {
  const wd = d.getDay() // 0 = Sun ... 6 = Sat
  switch (task.recurrence) {
    case 'daily':
      return true
    case 'weekdays':
      return wd >= 1 && wd <= 5
    case 'weekly': {
      const created = parseISO(task.createdAt)
      return created.getDay() === wd
    }
    default:
      return false
  }
}

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  none: 'One-off',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
}
