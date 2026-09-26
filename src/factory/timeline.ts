import type { AssemblyDef, Vec3 } from '../types';

/**
 * The factory time-lapse as a pure function of time, so any moment can be shown
 * (play, pause, jump to a station) and tested without rendering anything.
 * Times are in seconds at 1× speed.
 */
export const TIMING = {
  /** How long one part takes to be lowered and fitted. */
  move: 0.62,
  /** Delay between parts at the same station. */
  stagger: 0.24,
  /** Pause after each station. */
  gap: 0.3,
  /** The final check once every part is on. */
  check: 1.8,
  /** Moving the finished drone down the line. */
  rollout: 1.6,
};

/** How far above its fitted place a part appears before it is lowered (metres). */
export const LIFT = 1.9;

export interface PartSlot {
  id: string;
  station: number;
  start: number;
  end: number;
  /** Offset it slides in from once lowered (see AssemblyDef.approach). */
  from: Vec3;
}

export interface Phase {
  kind: 'station' | 'check' | 'rollout';
  title: string;
  body: string;
  start: number;
  /** The next phase's start: phases tile the whole cycle. */
  end: number;
}

export interface Schedule {
  slots: PartSlot[];
  byId: Map<string, PartSlot>;
  phases: Phase[];
  /** Every part is on. */
  buildEnd: number;
  checkEnd: number;
  /** One drone, from the first part to leaving the line. */
  cycle: number;
}

export function buildSchedule(assembly: AssemblyDef, timing = TIMING): Schedule {
  const slots: PartSlot[] = [];
  const phases: Phase[] = [];
  let t = 0;
  assembly.stations.forEach((station, i) => {
    const start = t;
    station.parts.forEach((id, j) => {
      const s = start + j * timing.stagger;
      slots.push({ id, station: i, start: s, end: s + timing.move, from: assembly.approach?.[id] ?? [0, 0, 0] });
    });
    t = start + Math.max(0, station.parts.length - 1) * timing.stagger + timing.move + timing.gap;
    phases.push({ kind: 'station', title: station.title, body: station.body, start, end: t });
  });
  const buildEnd = t;
  const checkEnd = buildEnd + timing.check;
  const cycle = checkEnd + timing.rollout;
  phases.push({ kind: 'check', title: 'Final check', body: assembly.check, start: buildEnd, end: checkEnd });
  phases.push({ kind: 'rollout', title: 'Off the line', body: assembly.rollout, start: checkEnd, end: cycle });
  return { slots, byId: new Map(slots.map((s) => [s.id, s])), phases, buildEnd, checkEnd, cycle };
}

/** Index of the phase playing at time `t`. */
export function phaseAt(schedule: Schedule, t: number): number {
  const i = schedule.phases.findIndex((p) => t < p.end);
  return i < 0 ? schedule.phases.length - 1 : i;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

export interface PartPose {
  visible: boolean;
  /** Offset from the fitted place. */
  offset: Vec3;
  /** Parts grow in as they appear. */
  scale: number;
  /** 0..1 glow in the part's system colour: dim while moving, a flash as it clicks into place. */
  glow: number;
}

/**
 * Where a part is at time `t`. It appears above its place, is lowered, then (if it
 * has an approach offset) slides in sideways, like a sleeve going over the parts inside.
 */
export function partPose(slot: PartSlot, t: number, out: PartPose): PartPose {
  if (t < slot.start) {
    out.visible = false;
    return out;
  }
  const p = clamp01((t - slot.start) / (slot.end - slot.start));
  const slides = slot.from.some((v) => v !== 0);
  const down = easeOutCubic(clamp01(p / (slides ? 0.55 : 1)));
  const across = slides ? easeInOutCubic(clamp01((p - 0.45) / 0.55)) : 1;
  const [fx, fy, fz] = slot.from;
  out.visible = true;
  out.offset[0] = fx * (1 - across);
  out.offset[1] = LIFT * (1 - down) + fy * (1 - across);
  out.offset[2] = fz * (1 - across);
  out.scale = easeOutCubic(clamp01(p / 0.18));
  out.glow = t < slot.end ? 0.25 : 0.75 * Math.exp(-(t - slot.end) * 3.5);
  return out;
}

export const newPose = (): PartPose => ({ visible: false, offset: [0, 0, 0], scale: 1, glow: 0 });

const schedules = new WeakMap<AssemblyDef, Schedule>();

/** The schedule for a drone's assembly, built once and shared by the scene and the panels. */
export function scheduleFor(assembly: AssemblyDef): Schedule {
  let s = schedules.get(assembly);
  if (!s) schedules.set(assembly, (s = buildSchedule(assembly)));
  return s;
}
