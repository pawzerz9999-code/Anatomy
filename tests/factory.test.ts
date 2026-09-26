import { describe, expect, it } from 'vitest';
import { DRONES } from '../src/data/drones';
import { buildSchedule, LIFT, newPose, partPose, phaseAt } from '../src/factory/timeline';

const withFactory = Object.values(DRONES).filter((d) => d.assembly);

describe.each(withFactory)('$name factory', (drone) => {
  const assembly = drone.assembly!;
  const schedule = buildSchedule(assembly);

  it('fits every part exactly once, apart from the ones it says are not fitted', () => {
    const fitted = assembly.stations.flatMap((s) => s.parts);
    const notFitted = assembly.notFitted?.map((n) => n.id) ?? [];
    expect(new Set(fitted).size).toBe(fitted.length);
    expect([...fitted, ...notFitted].sort()).toEqual(drone.parts.map((p) => p.id).sort());
  });

  it('only gives approach offsets to parts it fits', () => {
    const fitted = new Set(assembly.stations.flatMap((s) => s.parts));
    for (const id of Object.keys(assembly.approach ?? {})) expect(fitted.has(id), id).toBe(true);
  });

  it('has plain-language text, headline figures and sources', () => {
    for (const s of assembly.stations) expect(s.body.length, s.title).toBeGreaterThan(40);
    expect(assembly.stats.length).toBeGreaterThan(0);
    for (const s of assembly.stats) expect(s.note.length, s.label).toBeGreaterThan(10);
    expect(assembly.sources.length).toBeGreaterThan(1);
    for (const src of assembly.sources) expect(src.url, src.title).toMatch(/^https:\/\//);
  });

  it('plays the stations in order, then the check and the roll-out, with no gaps', () => {
    const { phases } = schedule;
    expect(phases.map((p) => p.kind)).toEqual([...assembly.stations.map(() => 'station'), 'check', 'rollout']);
    expect(phases[0].start).toBe(0);
    for (let i = 1; i < phases.length; i++) expect(phases[i].start).toBeCloseTo(phases[i - 1].end);
    expect(phases.at(-1)!.end).toBeCloseTo(schedule.cycle);
    for (const slot of schedule.slots) {
      const phase = phases[slot.station];
      expect(slot.start).toBeGreaterThanOrEqual(phase.start);
      expect(slot.end).toBeLessThanOrEqual(phase.end);
    }
    expect(phaseAt(schedule, 0)).toBe(0);
    expect(phaseAt(schedule, schedule.cycle - 0.01)).toBe(phases.length - 1);
  });

  it('has every part in place by the final check', () => {
    const pose = newPose();
    for (const slot of schedule.slots) {
      partPose(slot, schedule.buildEnd, pose);
      expect(pose.visible, slot.id).toBe(true);
      for (const v of pose.offset) expect(Math.abs(v), slot.id).toBe(0);
      expect(pose.scale, slot.id).toBe(1);
    }
  });
});

describe('part motion', () => {
  const slide = { id: 'sleeve', station: 0, start: 1, end: 2, from: [2, 0, 0] as [number, number, number] };
  const drop = { ...slide, id: 'drop', from: [0, 0, 0] as [number, number, number] };
  const pose = newPose();

  it('is hidden until its turn, then appears above its place', () => {
    expect(partPose(drop, 0.5, pose).visible).toBe(false);
    partPose(drop, 1, pose);
    expect(pose.visible).toBe(true);
    expect(pose.offset[1]).toBeCloseTo(LIFT);
  });

  it('is lowered first, then slides in', () => {
    partPose(slide, 1.5, pose);
    expect(pose.offset[1]).toBeCloseTo(0, 2);
    expect(pose.offset[0]).toBeGreaterThan(1);
    partPose(slide, 2, pose);
    for (const v of pose.offset) expect(Math.abs(v)).toBe(0);
  });

  it('glows as it clicks into place, then fades', () => {
    const atFit = partPose(drop, 2, pose).glow;
    const later = partPose(drop, 3, pose).glow;
    expect(atFit).toBeGreaterThan(0.5);
    expect(later).toBeLessThan(0.05);
  });
});
