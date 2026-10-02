# Momentum

A dopamine-focused to-do desktop app for TSplus / ANZ work. Dark, clean, and
built to make finishing tasks feel rewarding: completing work fills a growth
orb (levels), builds a streak, and drives a 7-day momentum chart.

## Stack
- **React 19 + TypeScript + Vite 8** (renderer)
- **Tailwind CSS v4** (design tokens in `src/index.css`)
- **Zustand** (state, persisted to localStorage)
- **Electron 44** (desktop shell, frameless with a custom title bar)
- **Supabase** (cloud sync — planned, phase 4)

## Project layout
```
momentum/
├── electron/
│   ├── main.cjs        # window + IPC (frameless controls)
│   └── preload.cjs     # window.momentum bridge
├── src/
│   ├── App.tsx         # layout, view filtering, recurring rollover
│   ├── types.ts        # Task / Completion / views
│   ├── store/useStore.ts   # Zustand store (tasks, completions, actions)
│   ├── lib/
│   │   ├── dates.ts    # due labels, recurrence logic
│   │   └── stats.ts    # streaks, growth/leveling, weekly counts
│   └── components/     # TitleBar, Sidebar, QuickAdd, TaskList, TaskItem,
│                       #   MomentumPanel, GrowthOrb, WeekChart
├── build/icon.png      # app icon (source for the installer icon)
└── package.json
```

## Develop
```bash
npm run dev            # Vite dev server at http://localhost:5273
npm run electron:dev   # native window against the dev server
```

## Build the .exe
```bash
npm run build          # type-check + production bundle -> dist/
npx electron-builder -c.directories.output="%LOCALAPPDATA%/MomentumBuild"
```
> The output dir is set outside the OneDrive-synced Desktop on purpose —
> OneDrive locks files mid-build and causes EPERM rename errors otherwise.

Output: `Momentum Setup 0.1.0.exe` (NSIS installer) + `win-unpacked/` (portable).

## Data model notes
- **Recurring tasks** (daily / weekdays / weekly) stay visible and checked for
  the current day, then roll back to un-done at local midnight (`rolloverRecurring`).
- **Completions** are logged separately from tasks so streaks and stats survive
  even after a task is deleted.
- **Leveling**: total lifetime completions feed `growthFromTotal()` — each level
  needs a few more than the last; a new visual growth stage every 2 levels.

## Roadmap
- [ ] Supabase cloud sync (source of truth + local cache, last-write-wins)
- [ ] Optional phone PWA hitting the same Supabase data
- [ ] Tie tasks to TSplus clients (link to the CRM)
