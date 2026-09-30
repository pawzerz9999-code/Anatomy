import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { nodeMatchers, partForName, splitIntoParts } from '../src/models/gltf';

function box(name: string, x: number, y: number, z: number, size = 1) {
  const m = new Mesh(new BoxGeometry(size, size, size), new MeshStandardMaterial());
  m.name = name;
  m.position.set(x, y, z);
  return m;
}

const center = (objs: Object3D[]) => {
  const o = objs[0];
  o.updateMatrixWorld(true);
  return new Vector3().setFromMatrixPosition(o.matrixWorld);
};

describe('nodeMap matching', () => {
  const matchers = nodeMatchers({ Body: 'fuselage', '/^prop(eller)?[._]?\\d*$/i': 'propeller' });

  it('matches plain names exactly', () => {
    expect(partForName('Body', matchers)).toBe('fuselage');
    expect(partForName('Body.001', matchers)).toBeUndefined();
  });

  it('matches /regex/ keys', () => {
    expect(partForName('Propeller', matchers)).toBe('propeller');
    expect(partForName('prop_2', matchers)).toBe('propeller');
    expect(partForName('Propshaft', matchers)).toBeUndefined();
  });
});

describe('splitIntoParts', () => {
  // A 10-unit-long "drone" along Z (as many files are), with a nested engine group.
  const scene = new Group();
  const engine = new Group();
  engine.name = 'EngineAssembly';
  engine.position.set(0, 0, -4);
  engine.add(box('Cylinder1', 0.5, 0, 0), box('Cylinder2', -0.5, 0, 0));
  scene.add(box('Hull', 0, 0, 0, 1), box('Nose', 0, 0, 4.5), engine, box('Antenna', 0, 1, 0, 0.2));
  scene.children[0].scale.set(1, 1, 8); // stretch the hull to 8 units

  const split = splitIntoParts(scene, {
    kind: 'gltf',
    url: 'x.glb',
    nodeMap: { Hull: 'body', Nose: 'nose', EngineAssembly: 'engine' },
    rotation: [0, Math.PI / 2, 0], // turn the nose from +Z to +X
    length: 3.5,
  });

  it('gives each mapped node (and its whole subtree) to its part', () => {
    expect([...split.parts.keys()].sort()).toEqual(['body', 'engine', 'nose']);
    expect(split.parts.get('engine')).toHaveLength(1);
    expect(split.parts.get('engine')![0].children).toHaveLength(2);
  });

  it('keeps unmapped meshes as scenery', () => {
    const names: string[] = [];
    split.rest.traverse((o) => o instanceof Mesh && names.push(o.name));
    expect(names).toEqual(['Antenna']);
  });

  it('turns, centres and scales the model to its real length', () => {
    const nose = center(split.parts.get('nose')!);
    const engineAt = center(split.parts.get('engine')!);
    expect(nose.x).toBeGreaterThan(1.2); // nose now points to +X
    expect(engineAt.x).toBeLessThan(-1);
    expect(Math.abs(nose.z)).toBeLessThan(1e-6);
    // It spans z = -4.5 (engine) … 5 (nose tip): 9.5 units → 3.5 m, centred on z = 0.25.
    expect(nose.x).toBeCloseTo(((4.5 - 0.25) * 3.5) / 9.5, 6);
  });

  it('never shares a material between meshes, and leaves the loaded scene untouched', () => {
    const mats = new Set<unknown>();
    for (const objs of split.parts.values())
      for (const o of objs) o.traverse((c) => c instanceof Mesh && mats.add(c.material));
    expect(mats.size).toBe(4);
    expect(scene.children).toHaveLength(4);
  });
});
