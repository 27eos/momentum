export type Priority = 'low' | 'normal' | 'high'
export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly'
export type ViewId = 'today' | 'upcoming' | 'all' | 'done'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  notes?: string
  priority: Priority
  done: boolean
  createdAt: string // ISO datetime
  completedAt?: string // ISO datetime of most recent completion
  dueDate?: string // yyyy-mm-dd (local), optional
  recurrence: Recurrence
  subtasks?: Subtask[] // optional checklist; when present, done is derived
  order: number
  updatedAt: string // ISO datetime, for cloud sync reconciliation
  deleted?: boolean // soft-delete tombstone for sync
}

export interface Completion {
  id: string
  taskId: string
  title: string
  completedAt: string // ISO datetime
  date: string // yyyy-mm-dd (local) for per-day grouping
}
