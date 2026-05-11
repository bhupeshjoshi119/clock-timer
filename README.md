# Clock & Stopwatch — Productivity App

A minimal, animated productivity clock built as a learning experiment.
Switch between a **10-minute Timer** and a **Stopwatch**, add time on the fly,
and run it fullscreen when you want to focus.

## ✨ Features

- **Two modes** — Timer (countdown) and Stopwatch (count-up), toggled with
  pill tabs that animate to a ✓ tick when active.
- **Single Start → Play/Pause + Reset** — one big Start button on load.
  Once kicked off, it splits into play/pause and a reset button. State is
  preserved across pause; only Reset truly clears it.
- **Quick-add chips** — `+0:30` and `+1:00` chips add time to whichever mode
  is active.
- **Animated clock face** — SVG ring with numerals 1–12, a progress arc, and
  a sweeping dot in stopwatch mode.
- **Right-side controls** — mute toggle and fullscreen button.
- **Smooth animations** — powered by `framer-motion` (`AnimatePresence`,
  `whileTap`, spring transitions).
- **Smooth ticking** — uses `requestAnimationFrame` so the stopwatch is
  buttery and the timer doesn't drift.

## 🧱 Tech Stack

- **React 19** + **TypeScript**
- **TanStack Start** (file-based routing in `src/routes/`)
- **Vite 7**
- **Tailwind CSS v4** (via `src/styles.css`, with semantic design tokens in
  `oklch`)
- **framer-motion** for animations
- **lucide-react** for icons

## 📂 Project Structure

```
src/
├── components/
│   └── ClockApp.tsx     # The whole app — kept in one file on purpose
├── routes/
│   ├── __root.tsx       # Root layout
│   └── index.tsx        # Mounts <ClockApp />
└── styles.css           # Design tokens (--timer-accent, --stopwatch-accent, ...)
```

## 🚀 Getting Started

```bash
bun install or pnpm i
bun dev or pnpm dev
```

Then open the preview URL shown in the terminal.

## 🎨 Design Tokens

Defined in `src/styles.css`:

| Token | Purpose |
|-------|---------|
| `--timer-accent` | Amber accent for Timer mode |
| `--stopwatch-accent` | Blue accent for Stopwatch mode |
| `--ring-track` | Faint background ring color |
| `--background` / `--foreground` | App base colors |

## 🧠 What I Learned

- Driving smooth time with `requestAnimationFrame` + state deltas instead of
  `setInterval`.
- Coordinating UI states (`hasStarted`, `isRunning`, `mode`) without them
  fighting each other.
- Animating presence transitions with `framer-motion`'s `AnimatePresence
  mode="wait"`.
- Building a design system with semantic CSS tokens in `oklch` and Tailwind v4.

---

Experiment complete ✅
