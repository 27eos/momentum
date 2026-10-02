import { useEffect, useState } from 'react'
import { Minus, Square, X, Zap } from 'lucide-react'

// Bridge exposed by Electron preload (absent in the browser).
declare global {
  interface Window {
    momentum?: {
      minimize: () => void
      toggleMaximize: () => void
      close: () => void
      isElectron: boolean
    }
  }
}

export function TitleBar() {
  const [today, setToday] = useState(fmt())
  const isElectron = !!window.momentum?.isElectron

  useEffect(() => {
    const t = setInterval(() => setToday(fmt()), 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="drag flex h-11 shrink-0 items-center justify-between border-b border-border-soft bg-bg-soft/60 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Zap size={15} strokeWidth={2.5} />
        </span>
        <span className="text-sm font-semibold tracking-tight">Momentum</span>
      </div>

      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-muted">
        {today}
      </span>

      {isElectron ? (
        <div className="no-drag flex items-center gap-1">
          <WinBtn onClick={() => window.momentum?.minimize()} label="Minimize">
            <Minus size={15} />
          </WinBtn>
          <WinBtn onClick={() => window.momentum?.toggleMaximize()} label="Maximize">
            <Square size={12} />
          </WinBtn>
          <WinBtn onClick={() => window.momentum?.close()} label="Close" danger>
            <X size={15} />
          </WinBtn>
        </div>
      ) : (
        <div className="w-16" />
      )}
    </div>
  )
}

function WinBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`flex h-7 w-9 items-center justify-center rounded-md text-muted transition-colors hover:text-text ${
        danger ? 'hover:bg-danger/80 hover:text-white' : 'hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  )
}

function fmt(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
