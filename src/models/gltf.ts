import { Box3, Group, Matrix4, Mesh, Object3D, Vector3 } from 'three';
import type { GltfModelDef } from '../types';

type Matcher = { test: (name: string) => boolean; partId: string };

/** Turns a `nodeMap` into matchers. Keys like `/^Wing/i` are regular expressions; others match exactly. */
export function nodeMatchers(nodeMap: Record<string, string>): Matcher[] {
  return Object.entries(nodeMap).map(([key, partId]) => {
    const re = /^\/(.+)\/([a-z]*)$/.exec(key);
    if (re) {
      const pattern = new RegExp(re[1], re[2]);
      return { test: (name) => pattern.test(name), partId };
    }
    return { test: (name) => name === key, partId };
  });
}

/** Which part a node belongs to, going by its own name only. */
export function partForName(name: string, matchers: Matcher[]): string | undefined {
  return matchers.find((m) => m.test(name))?.partId;
}

export interface SplitModel {
  /** Objects for each part, already placed in the drone's own coordinates. */
  parts: Map<string, Object3D[]>;
  /** Whatever was not given to a part: shown as-is, not pickable. */
  rest: Group;
}

/**
 * Clones a loaded glTF scene, turns and scales it into the drone's coordinates
 * (nose at +X, up +Y, centred on the origin), and hands each node to its part.
 */
export function splitIntoParts(scene: Object3D, model: GltfModelDef): SplitModel {
  const root = scene.clone(true);
  // Parts change their materials (glow, fade, X-ray), so no two meshes may share one.
  root.traverse((o) => {
    if (o instanceof Mesh) o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
  });

  const rest = new Group();
  rest.name = 'unmapped';
  const turned = new Group();
  if (model.rotation) turned.rotation.set(...model.rotation);
  turned.add(root);
  rest.add(turned);

  // Centre it and scale its longest side to the real length.
  rest.updateMatrixWorld(true);
  const box = new Box3().setFromObject(rest);
  const size = box.getSize(new Vector3());
  const scale = model.length / Math.max(size.x, size.y, size.z, 1e-6);
  const center = box.getCenter(new Vector3());
  rest.scale.setScalar(scale);
  rest.position.copy(center).multiplyScalar(-scale);
  rest.updateMatrixWorld(true);

  // Find the top-most node that each nodeMap entry matches.
  const matchers = nodeMatchers(model.nodeMap);
  const picked: { node: Object3D; partId: string }[] = [];
  const visit = (o: Object3D) => {
    const partId = partForName(o.name, matchers);
    if (partId) {
      picked.push({ node: o, partId });
      return;
    }
    if (o instanceof Mesh && model.fallbackPart) {
      picked.push({ node: o, partId: model.fallbackPart });
      return;
    }
    for (const child of [...o.children]) visit(child);
  };
  visit(root);

  // Lift each picked node out of the file's hierarchy, keeping where it was on screen.
  const parts = new Map<string, Object3D[]>();
  const m = new Matrix4();
  for (const { node, partId } of picked) {
    m.copy(node.matrixWorld);
    node.removeFromParent();
    m.decompose(node.position, node.quaternion, node.scale);
    if (!parts.has(partId)) parts.set(partId, []);
    parts.get(partId)!.push(node);
  }
  return { parts, rest };
}
