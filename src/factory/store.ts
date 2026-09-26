import { create } from 'zustand';

export const SPEEDS = [1, 2, 4] as const;
export type FactorySpeed = (typeof SPEEDS)[number];

/**
 * The time-lapse clock. It changes every frame, so like `runtime` it lives outside
 * React and is read inside useFrame. Seconds into the current build, at 1× speed.
 */
export const factoryClock = { time: 0 };

/** DOM elements the scene updates every frame: the progress bar fill of each phase. */
export const factoryHud: { fills: (HTMLElement | null)[] } = { fills: [] };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface FactoryState {
  playing: boolean;
  speed: FactorySpeed;
  /** Index of the phase playing now (the stations, then the check and roll-out). Set when it changes. */
  phase: number;
  /** Drones finished since the page was opened. */
  built: number;

  setPlaying: (on: boolean) => void;
  setSpeed: (speed: FactorySpeed) => void;
  /** Jump to a moment in the build. */
  seek: (time: number) => void;
  setPhase: (phase: number) => void;
  finishOne: () => void;
}

export const useFactory = create<FactoryState>((set) => ({
  // With reduced motion the line waits for the Play button.
  playing: !prefersReducedMotion(),
  speed: 1,
  phase: 0,
  built: 0,

  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  seek: (time) => {
    factoryClock.time = Math.max(0, time);
  },
  setPhase: (phase) => set({ phase }),
  finishOne: () => set((s) => ({ built: s.built + 1 })),
}));
