import { BoxGeometry, BufferGeometry, ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three';

/**
 * Small helpers for building aircraft shapes from code.
 * Convention: X = forwards (nose at +X), Y = up, Z = span (right wing at +Z).
 */

/** A body of revolution around the X axis. `profile` is a list of [x, radius] points, front last. */
export function lathe(profile: [number, number][], segments = 48) {
  const g = new LatheGeometry(
    profile.map(([x, r]) => new Vector2(r, x)),
    segments,
  );
  g.rotateZ(-Math.PI / 2); // lathe axis (+Y) → body axis (+X)
  g.computeVertexNormals();
  return g;
}

/** Sample a function into lathe profile points. */
export function profile(x0: number, x1: number, r: (t: number) => number, steps = 16): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([x0 + (x1 - x0) * t, Math.max(0, r(t))]);
  }
  return pts;
}

export const smoothstep = (t: number) => t * t * (3 - 2 * t);

interface PlateOptions {
  thickness: number;
  bevel?: number;
}

/**
 * A flat plate lying in the X–Z plane (like a wing seen from above), centred on y = 0.
 * `outline` is a list of [x, z] points.
 */
export function horizontalPlate(outline: [number, number][], { thickness, bevel = 0.012 }: PlateOptions) {
  const shape = new Shape(outline.map(([x, z]) => new Vector2(x, z)));
  const g = new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 8,
  });
  g.rotateX(Math.PI / 2); // shape Y → world Z, extrusion → world −Y
  g.translate(0, thickness / 2, 0);
  g.computeVertexNormals();
  return g;
}

/**
 * A flat plate standing in the X–Y plane (like a fin seen from the side), centred on z = 0.
 * `outline` is a list of [x, y] points.
 */
export function verticalPlate(outline: [number, number][], { thickness, bevel = 0.008 }: PlateOptions) {
  const shape = new Shape(outline.map(([x, y]) => new Vector2(x, y)));
  const g = new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 8,
  });
  g.translate(0, 0, -thickness / 2);
  g.computeVertexNormals();
  return g;
}

/**
 * One propeller blade pointing along +Y, from `root` to `tip`, twisted like a real
 * blade (steep near the hub, flatter at the tip) and tapered towards the tip.
 */
export function propBlade({ root = 0.05, tip = 0.4, chord = 0.075, thickness = 0.012 } = {}) {
  const length = tip - root;
  const g = new BoxGeometry(thickness, length, chord, 1, 14, 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const yLocal = pos.getY(i) + length / 2; // 0..length
    const z = pos.getZ(i);
    const t = yLocal / length;
    const taper = 1 - 0.45 * t * t;
    const twist = 0.75 - 0.55 * t;
    const zt = z * taper;
    const xt = x * (1 - 0.3 * t);
    pos.setXYZ(i, xt * Math.cos(twist) - zt * Math.sin(twist), yLocal + root, xt * Math.sin(twist) + zt * Math.cos(twist));
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Scale a geometry's thickness (Y) by a function of its spanwise position (|Z|),
 * e.g. to make a wing thick at the root and thin at the tip.
 */
export function taperThickness<T extends BufferGeometry>(g: T, scaleAt: (absZ: number) => number): T {
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) * scaleAt(Math.abs(pos.getZ(i))));
  g.computeVertexNormals();
  return g;
}
