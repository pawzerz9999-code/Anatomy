import { Box3, Group, Object3D, Vector3 } from 'three';
import type { CameraControls } from '@react-three/drei';
import type { PartDef } from '../types';

/**
 * Per-frame values shared by the scene. These change every frame, so they live
 * outside React/zustand and are read inside useFrame.
 */
export const runtime = {
  /** Smoothed explode factor (the store holds the target). */
  explode: 0,
  /** Is the pointer currently over the 3D canvas? */
  pointerInside: false,
  /** Pointer position in drawing-buffer pixels (origin bottom-left), for the X-ray lens. */
  pointerPx: { x: -9999, y: -9999 },
  /** Lens radius in drawing-buffer pixels. */
  lensPx: 100,
  /** Device pixel ratio of the canvas. */
  dpr: 1,
  /** The orbit controls, once mounted. */
  controls: null as CameraControls | null,
};

interface RegisteredPart {
  def: PartDef;
  group: Group;
  /** Bounding box in the part group's local space, captured when assembled. */
  localBox: Box3;
  /** The mesh a label points at, and the point on it (in that mesh's local space). */
  anchor: { object: Object3D; local: Vector3 };
}

/** Every mounted <Part>, so labels and the camera can find them. */
export const partRegistry = new Map<string, RegisteredPart>();

/** Where the part's box will be once the explode animation reaches `explode`. */
export function partTargetBox(id: string, explode: number, target = new Box3()): Box3 | null {
  const p = partRegistry.get(id);
  if (!p) return null;
  const [x, y, z] = p.def.explode;
  target.copy(p.localBox).translate(new Vector3(x * explode, y * explode, z * explode));
  const parent = p.group.parent;
  if (parent) {
    parent.updateWorldMatrix(true, false);
    target.applyMatrix4(parent.matrixWorld);
  }
  return target;
}

/** World position a label or name tag should point at. */
export function partAnchor(id: string, target = new Vector3()): Vector3 | null {
  const p = partRegistry.get(id);
  if (!p) return null;
  return target.copy(p.anchor.local).applyMatrix4(p.anchor.object.matrixWorld);
}

/** Frame-rate independent smoothing towards a target. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
