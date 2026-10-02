import { useState } from 'react'
import { CalendarClock, Plus, Repeat } from 'lucide-react'
import type { Priority, Recurrence } from '../types'
import { useStore } from '../store/useStore'
import { RECURRENCE_LABEL } from '../lib/dates'

const PRIORITIES: { id: Priority; label: string; dot: string }[] = [
  { id: 'low', label: 'Low', dot: 'bg-faint' },
  { id: 'normal', label: 'Normal', dot: 'bg-accent-soft' },
  { id: 'high', label: 'High', dot: 'bg-danger' },
]

export function QuickAdd({ defaultRecurring }: { defaultRecurring?: boolean }) {
  const addTask = useStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [focused, setFocused] = useState(false)

  void defaultRecurring

  function submit() {
    const t = title.trim()
    if (!t) return
    addTask({ title: t, priority, dueDate: dueDate || undefined, recurrence })
    setTitle('')
    setDueDate('')
    setRecurrence('none')
    setPriority('normal')
  }

  const showOptions = focused || title.length > 0

  return (
    <div className="px-8 pb-1">
      <div
        className={`rounded-2xl border bg-surface/70 transition-colors ${
          showOptions ? 'border-accent/40' : 'border-border-soft'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={submit}
            aria-label="Add task"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors hover:bg-accent hover:text-white"
          >
            <Plus size={17} strokeWidth={2.5} />
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Add a task…  (Enter to save)"
            className="w-full bg-transparent text-[15px] text-text placeholder:text-faint focus:outline-none"
          />
        </div>

        {showOptions && (
          <div className="animate-rise flex flex-wrap items-center gap-2 border-t border-border-soft px-4 py-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-bg-soft/60 p-0.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPriority(p.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    priority === p.id
                      ? 'bg-surface-2 text-text'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  {p.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 rounded-lg bg-bg-soft/60 px-2.5 py-1.5 text-xs text-muted focus-within:text-text">
              <CalendarClock size={14} />
              <input
                type="date"
                value={dueDate}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-xs text-text focus:outline-none [color-scheme:dark]"
              />
            </label>

            <label className="flex items-center gap-1.5 rounded-lg bg-bg-soft/60 px-2.5 py-1.5 text-xs text-muted focus-within:text-text">
              <Repeat size={14} />
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                className="bg-transparent text-xs text-text focus:outline-none [&>option]:bg-surface"
              >
                {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                  <option key={r} value={r}>
                    {RECURRENCE_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
