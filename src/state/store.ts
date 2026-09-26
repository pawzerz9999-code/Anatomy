import { create } from 'zustand';
import { DRONES } from '../data/drones';
import type { SystemId } from '../types';

export type XrayMode = 'off' | 'lens' | 'full';
export type ViewMode = 'anatomy' | 'realistic';

export type CameraCommand =
  | { kind: 'reset'; nonce: number }
  | { kind: 'part'; id: string; nonce: number }
  | { kind: 'system'; id: SystemId; nonce: number };

interface ViewerState {
  droneId: string;
  view: ViewMode;
  selectedId: string | null;
  hoveredId: string | null;
  hiddenParts: Record<string, boolean>;
  hiddenSystems: Partial<Record<SystemId, boolean>>;
  isolatedId: string | null;
  focusSystem: SystemId | null;
  /** 0 = assembled, 1 = fully exploded. */
  explode: number;
  xray: XrayMode;
  /** Radius of the hover lens in CSS pixels. */
  lensRadius: number;
  labels: boolean;
  autoRotate: boolean;
  spinProp: boolean;
  search: string;
  /** Systems expanded in the parts list. */
  openSystems: Partial<Record<SystemId, boolean>>;
  /** Show the "drag to spin / tap a part" hint until the first interaction. */
  hint: boolean;
  camera: CameraCommand;

  setView: (view: ViewMode) => void;
  select: (id: string | null, flyTo?: boolean) => void;
  hover: (id: string | null) => void;
  togglePart: (id: string) => void;
  toggleSystem: (id: SystemId) => void;
  isolate: (id: string | null) => void;
  focus: (id: SystemId | null) => void;
  setExplode: (v: number) => void;
  setXray: (m: XrayMode) => void;
  setLensRadius: (r: number) => void;
  setLabels: (on: boolean) => void;
  setAutoRotate: (on: boolean) => void;
  setSpinProp: (on: boolean) => void;
  setSearch: (s: string) => void;
  toggleOpen: (id: SystemId) => void;
  dismissHint: () => void;
  showAll: () => void;
  resetView: () => void;
}

let nonce = 0;

// People who ask their system for less motion get a still model and propeller.
const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useStore = create<ViewerState>((set, get) => ({
  droneId: 'shahed-136',
  view: 'anatomy',
  selectedId: null,
  hoveredId: null,
  hiddenParts: {},
  hiddenSystems: {},
  isolatedId: null,
  focusSystem: null,
  explode: 0,
  xray: 'off',
  lensRadius: 110,
  labels: false,
  autoRotate: !reducedMotion,
  spinProp: !reducedMotion,
  search: '',
  openSystems: {},
  hint: true,
  camera: { kind: 'reset', nonce: nonce++ },

  setView: (view) => set({ view }),
  select: (id, flyTo = true) =>
    set((s) => {
      const part = id ? DRONES[s.droneId]?.parts.find((p) => p.id === id) : undefined;
      return {
        selectedId: id,
        // Picking something stops the turntable so the part doesn't spin away.
        autoRotate: id ? false : s.autoRotate,
        // A part hidden inside the shell can't be seen with X-ray off, so switch it on.
        xray: part?.inside && s.xray === 'off' ? 'full' : s.xray,
        camera: id && flyTo ? { kind: 'part', id, nonce: nonce++ } : s.camera,
        // Open the part's system in the parts list so it can be seen there too.
        openSystems: part ? { ...s.openSystems, [part.system]: true } : s.openSystems,
        hint: id ? false : s.hint,
      };
    }),
  hover: (id) => {
    if (get().hoveredId !== id) set({ hoveredId: id });
  },
  togglePart: (id) =>
    set((s) => ({ hiddenParts: { ...s.hiddenParts, [id]: !s.hiddenParts[id] } })),
  toggleSystem: (id) =>
    set((s) => ({ hiddenSystems: { ...s.hiddenSystems, [id]: !s.hiddenSystems[id] } })),
  isolate: (id) => set({ isolatedId: id }),
  focus: (id) =>
    set((s) => ({
      focusSystem: id,
      // Focusing a system switches on full X-ray so its inner parts are visible.
      xray: id ? 'full' : s.xray,
      autoRotate: id ? false : s.autoRotate,
      camera: id ? { kind: 'system', id, nonce: nonce++ } : s.camera,
      openSystems: id ? { ...s.openSystems, [id]: true } : s.openSystems,
      hint: id ? false : s.hint,
    })),
  setExplode: (explode) => set({ explode }),
  setXray: (xray) => set((s) => ({ xray, focusSystem: xray === 'full' ? s.focusSystem : null })),
  setLensRadius: (lensRadius) => set({ lensRadius }),
  setLabels: (labels) => set({ labels }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setSpinProp: (spinProp) => set({ spinProp }),
  setSearch: (search) => set({ search }),
  toggleOpen: (id) => set((s) => ({ openSystems: { ...s.openSystems, [id]: !s.openSystems[id] } })),
  dismissHint: () => {
    if (get().hint) set({ hint: false });
  },
  showAll: () => set({ hiddenParts: {}, hiddenSystems: {}, isolatedId: null, focusSystem: null }),
  resetView: () =>
    set({
      selectedId: null,
      isolatedId: null,
      focusSystem: null,
      explode: 0,
      camera: { kind: 'reset', nonce: nonce++ },
    }),
}));
