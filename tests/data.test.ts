import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATALOG, CATEGORIES, DRONES } from '../src/data/drones';
import { SYSTEMS } from '../src/data/systems';

const systemIds = new Set(SYSTEMS.map((s) => s.id));
const categoryIds = new Set(CATEGORIES.map((c) => c.id));

describe.each(Object.values(DRONES))('$name data', (drone) => {
  it('has unique part ids', () => {
    const ids = drone.parts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every part a known system and plain-language text', () => {
    for (const p of drone.parts) {
      expect(systemIds.has(p.system), `${p.id} system`).toBe(true);
      expect(p.name.trim(), `${p.id} name`).not.toBe('');
      expect(p.summary.length, `${p.id} summary`).toBeGreaterThan(15);
      expect(p.details.length, `${p.id} details`).toBeGreaterThan(40);
      expect(p.explode).toHaveLength(3);
    }
  });

  it('marks how well every part is documented, and cites sources', () => {
    for (const p of drone.parts) expect(['reported', 'typical'], p.id).toContain(p.evidence);
    expect(drone.sources.length).toBeGreaterThan(2);
    for (const src of drone.sources) expect(src.url, src.title).toMatch(/^https:\/\//);
  });

  it('has a known category and overview content', () => {
    expect(categoryIds.has(drone.category)).toBe(true);
    expect(drone.overview.length).toBeGreaterThan(100);
    expect(drone.specs.length).toBeGreaterThan(3);
  });

  it('has a few short headline stats for the big tiles', () => {
    expect(drone.stats.length).toBeGreaterThanOrEqual(3);
    expect(drone.stats.length).toBeLessThanOrEqual(6);
    for (const s of drone.stats) {
      expect(s.value.length, s.label).toBeLessThanOrEqual(12);
      expect(s.label.length, s.label).toBeLessThanOrEqual(16);
    }
  });

  it('has a live catalog entry', () => {
    expect(CATALOG.find((c) => c.id === drone.id)?.status).toBe('live');
  });
});

describe('Shahed-136', () => {
  const drone = DRONES['shahed-136'];

  it('has the reported three-tank fuel system: both wings plus the body', () => {
    const fuel = drone.parts.filter((p) => p.system === 'fuel').map((p) => p.id);
    expect(fuel).toEqual(expect.arrayContaining(['wing-tanks', 'fuel-tank', 'fuel-lines', 'fuel-pump', 'fuel-filter']));
  });

  it('has the reported control surfaces: two elevons and two rudders', () => {
    const ids = drone.parts.filter((p) => p.system === 'flight-control').map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(['elevons', 'rudders', 'servos']));
  });

  it('uses exactly the part ids that its 3D model renders', () => {
    const source = readFileSync(new URL('../src/models/shahed136/Shahed136Model.tsx', import.meta.url), 'utf8');
    const modelIds = [...source.matchAll(/<Part id="([^"]+)"/g)].map((m) => m[1]).sort();
    expect(modelIds).toEqual(drone.parts.map((p) => p.id).sort());
  });
});

describe('catalog', () => {
  it('uses unique ids and known categories', () => {
    expect(new Set(CATALOG.map((c) => c.id)).size).toBe(CATALOG.length);
    for (const c of CATALOG) expect(categoryIds.has(c.category), c.id).toBe(true);
  });

  it('only marks drones with data as live', () => {
    for (const c of CATALOG.filter((c) => c.status === 'live')) expect(DRONES[c.id], c.id).toBeDefined();
  });

  it('covers kamikaze and interceptor drones', () => {
    const cats = new Set(CATALOG.map((c) => c.category));
    expect(cats.has('kamikaze')).toBe(true);
    expect(cats.has('interceptor')).toBe(true);
  });
});
