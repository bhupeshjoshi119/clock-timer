import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  Hourglass,
  Clock,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";

// Returns true when viewport width is <= 640px (mobile)
function useIsMobile() {
  // if you are in laptop ,it is false ,in mobile ye true hogi
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    // yeh function media query ko match karne k liye hai
    const mq = window.matchMedia("(max-width: 640px)");
// screen ki width ko rakhta hai ,small screen
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// A small productivity clock that can run as a countdown Timer
// or a count-up Stopwatch. Kept in one file on purpose so it's
// easy to read top-to-bottom.

type Mode = "timer" | "stopwatch";

// Default countdown length for the timer (10 minutes).
const DEFAULT_TIMER_MS = 10 * 60 * 1000;

// --- formatting helpers -------------------------------------------------
// Stopwatch shows seconds with two decimals, like 7.44
function formatStopwatch(ms: number) {
  return (ms / 1000).toFixed(2);
}

// Timer shows MM:SS, like 9:30
function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ClockApp() {
  const isMobile = useIsMobile();


  // UI state
  const [mode, setMode] = useState<Mode>("timer");
  const [isMuted, setIsMuted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  // Has the user kicked things off yet? Until they do, we show a single
  // big "Start" button instead of the play/pause + reset pair.
  const [hasStarted, setHasStarted] = useState(false);

  // Stopwatch state — counts up from zero
  const [stopwatchMs, setStopwatchMs] = useState(0);

  // Timer state — counts down from `timerTotalMs` to zero
  const [timerTotalMs, setTimerTotalMs] = useState(DEFAULT_TIMER_MS);
  const [timerRemainingMs, setTimerRemainingMs] = useState(DEFAULT_TIMER_MS);

  // refs for the animation loop
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
// wrapperRef full screen k liye same component mai use kar rahe hai yaha.
// forwardRef tab use hota hai jab parent component apna data child component tak pahuchana chahte hai

  // --- ticking loop -----------------------------------------------------
  // We use requestAnimationFrame instead of setInterval so the stopwatch
  // stays smooth and the timer doesn't drift.
  // useEffect isRunning: false requestAnimationFrame start
  // isRunning true -->
  // isRunning false --> requestAnimationFrame clear(cancelAnimationFrame))
  useEffect(() => {
    if (!isRunning) return;

    lastFrameTimeRef.current = performance.now();

    const tick = (now: number) => {
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (mode === "stopwatch") {
        setStopwatchMs((prev) => prev + delta);
      } else {
        setTimerRemainingMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            setIsRunning(false);
            return 0;
          }
          return next;
        });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isRunning, mode]);

  // --- button handlers --------------------------------------------------
  function handlePlayPause() {
    setHasStarted(true);
    setIsRunning((running) => !running);
  }

  function handleStart() {
    setHasStarted(true);
    setIsRunning(true);
  }

  function handleReset() {
    // Full reset — back to the initial state, single Start button reappears.
    setIsRunning(false);
    setHasStarted(false);
    if (mode === "stopwatch") {
      setStopwatchMs(0);
    } else {
      setTimerRemainingMs(timerTotalMs);
    }
  }

  // Add seconds to the active clock. Works for both modes so the
  // +0:30 / +1:00 chips are useful everywhere.
  function addSeconds(seconds: number) {
    const ms = seconds * 1000;
    if (mode === "timer") {
      setTimerTotalMs((total) => total + ms);
      setTimerRemainingMs((remaining) => remaining + ms);
    } else {
      setStopwatchMs((elapsed) => Math.max(0, elapsed + ms));
    }
  }



  function toggleFullscreen() {
    const el = wrapperRef.current;
    // screen status , 
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      // Avoid Crashes? Browser Compatibility
    } else {
      el.requestFullscreen?.();
    }
  }

  // --- derived values ---------------------------------------------------
  const isTimer = mode === "timer";
  const accentColor = isTimer ? "var(--timer-accent)" : "var(--stopwatch-accent)";

  // How far around the ring we should be (0..1).
  // Timer: how much has elapsed of the total.
  // Stopwatch: position of the dot on a 60-second sweep.
  // we are animating timer progress bar here.
  const progress = isTimer
    ? timerTotalMs > 0
      ? 1 - timerRemainingMs / timerTotalMs
      : 0
    : (stopwatchMs % 60_000) / 60_000;

  const displayText = isTimer
    ? formatTimer(timerRemainingMs)
    : formatStopwatch(stopwatchMs);

  // Ring geometry — smaller on mobile so it fits without scrolling
  const SIZE = isMobile ? 220 : 280;
  const STROKE = 2;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  // Position of the small dot on the stopwatch ring.
  const dotAngle = progress * 2 * Math.PI - Math.PI / 2;
  const dotX = SIZE / 2 + radius * Math.cos(dotAngle);
  const dotY = SIZE / 2 + radius * Math.sin(dotAngle);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-4">
      <div
        ref={wrapperRef}
        className="w-full max-w-3xl rounded-3xl border border-white/5 bg-[oklch(0.22_0.015_260)] shadow-2xl overflow-hidden"
        style={isMobile ? undefined : { aspectRatio: "16/10" }}
      >
        {/* Top bar: mode tabs on the left, mute + fullscreen on the right */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex gap-2">
            <ModeButton
              label="Timer"
              isActive={isTimer}
              onClick={() => setMode("timer")}
              accent="var(--timer-accent)"
              idleIcon={<Hourglass className="w-4 h-4" />}
            />
            <ModeButton
              label="Stopwatch"
              isActive={!isTimer}
              onClick={() => setMode("stopwatch")}
              accent="var(--stopwatch-accent)"
              idleIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1 text-foreground/70">
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-2 rounded-lg hover:bg-white/5 transition"
              aria-label="Toggle mute"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/5 transition"
              aria-label="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clock face */}
        <div className="flex items-center justify-center py-2 sm:py-2 py-1">
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            {/* The two rings: a faint track and the colored progress arc. */}
            <svg
              width={SIZE}
              height={SIZE}
              className="absolute inset-0 -rotate-90"
            >
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={radius}
                fill="none"
                stroke="var(--ring-track)"
                strokeWidth={STROKE}
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={radius}
                fill="none"
                stroke={accentColor}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                opacity={0.6}
              />
            </svg>

            {/* Hour numbers around the dial — gives it that clock feel. */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
              const r = radius - 22;
              const x = SIZE / 2 + r * Math.cos(angle);
              const y = SIZE / 2 + r * Math.sin(angle);
              return (
                <span
                  key={i}
                  className="absolute text-xs font-medium text-foreground/30 -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{ left: x, top: y }}
                >
                  {i + 1}
                </span>
              );
            })}

            {/* Indicator dot — only shown in stopwatch mode. */}
            {!isTimer && (
              <div
                className="absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ left: dotX, top: dotY, background: accentColor }}
              />
            )}

            {/* Center: big number + quick-add chips */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-5xl font-light text-foreground tabular-nums tracking-tight"
                >
                  {displayText}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex gap-2">
                <QuickAddButton label="+0:30" onClick={() => addSeconds(30)} />
                <QuickAddButton label="+1:00" onClick={() => addSeconds(60)} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar.
            Before the user has started: a single full-width Start button.
            After they've started: play/pause + reset side-by-side. */}
        <div className="px-5 pb-5 pt-2">
          <AnimatePresence mode="wait" initial={false}>
            {!hasStarted ? (
              <motion.button
                key="start"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition"
                style={{
                  background: accentColor,
                  color: "oklch(0.15 0.02 260)",
                }}
              >
                <Play className="w-5 h-5" />
                Start
              </motion.button>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-2 gap-3"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlayPause}
                  className="h-12 rounded-xl flex items-center justify-center font-medium transition"
                  style={{
                    background: accentColor,
                    color: "oklch(0.15 0.02 260)",
                  }}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="h-12 rounded-xl flex items-center justify-center bg-[oklch(0.28_0.02_260)] hover:bg-[oklch(0.32_0.02_260)] transition text-foreground"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ----- small presentational components ---------------------------------

// A pill-shaped tab. When it becomes active, the idle icon is swapped
// for an animated check (tick) so the user gets a clear confirmation.
function ModeButton({
  label,
  isActive,
  onClick,
  accent,
  idleIcon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  accent: string;
  idleIcon: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm transition-colors"
      style={{
        background: isActive ? accent : "transparent",
        color: isActive ? "oklch(0.15 0.02 260)" : "var(--foreground)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isActive ? (
          <motion.span
            key="tick"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, color: accent }}
            exit={{ opacity: 0 }}
            className="flex"
          >
            {idleIcon}
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}

function QuickAddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="px-3 py-1 rounded-full bg-[oklch(0.28_0.02_260)] hover:bg-[oklch(0.32_0.02_260)] text-xs text-foreground/80 transition"
    >
      {label}
    </motion.button>
  );
}
