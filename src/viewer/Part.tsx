import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber';
import { Box3, Camera, Color, Group, Matrix4, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { SYSTEM_BY_ID } from '../data/systems';
import { useStore } from '../state/store';
import type { DroneDef, Vec3 } from '../types';
import { damp, partRegistry, runtime } from './runtime';
import { patchSkinMaterial } from './xray';

export const DroneContext = createContext<DroneDef | null>(null);

export function useDrone(): DroneDef {
  const drone = useContext(DroneContext);
  if (!drone) throw new Error('useDrone must be used inside <DroneContext.Provider>');
  return drone;
}

const noRaycast = () => {};
const tmpV = new Vector3();

interface AdoptedMaterial {
  mat: MeshStandardMaterial;
  baseEmissive: Color;
  baseEmissiveIntensity: number;
}

/** Render order: inner parts first, then the see-through shell on top of them. */
const RENDER_ORDER_INTERNAL = 0;
const RENDER_ORDER_SKIN = 10;

/**
 * Wraps the meshes of one anatomical part. Handles picking, hover/selection
 * highlight, visibility (hidden / isolated / system layers), system focus
 * dimming, X-ray behaviour and the explode offset.
 */
export function Part({ id, children }: { id: string; children: ReactNode }) {
  const drone = useDrone();
  const def = useMemo(() => drone.parts.find((p) => p.id === id), [drone, id]);
  if (!def) console.error(`[Part] No part data for id "${id}" in drone "${drone.id}"`);

  const group = useRef<Group>(null);
  const meshes = useRef<Mesh[]>([]);
  const mats = useRef<AdoptedMaterial[]>([]);
  const glow = useRef(0);
  const systemColor = useMemo(() => new Color(def ? SYSTEM_BY_ID[def.system].color : '#ffffff'), [def]);

  useLayoutEffect(() => {
    const g = group.current;
    if (!g || !def) return;
    meshes.current = [];
    mats.current = [];
    g.traverse((o) => {
      if (!(o instanceof Mesh) || o.userData.noAdopt) return;
      o.userData.partId = id;
      o.renderOrder = def.skin ? RENDER_ORDER_SKIN : RENDER_ORDER_INTERNAL;
      meshes.current.push(o);
      const list = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of list) {
        if (!(m instanceof MeshStandardMaterial)) continue;
        if (def.skin) patchSkinMaterial(m);
        else m.transparent = true; // lets us fade parts when another system is in focus
        mats.current.push({ mat: m, baseEmissive: m.emissive.clone(), baseEmissiveIntensity: m.emissiveIntensity });
      }
    });
    // Capture the assembled bounding box in local space for the camera, and pick the
    // mesh labels point at: one marked `userData.anchor`, otherwise the first one.
    g.updateWorldMatrix(true, true);
    const localBox = new Box3().setFromObject(g).applyMatrix4(new Matrix4().copy(g.matrixWorld).invert());
    const anchorMesh = meshes.current.find((m) => m.userData.anchor) ?? meshes.current[0];
    anchorMesh.geometry.computeBoundingBox();
    const anchor = { object: anchorMesh, local: anchorMesh.geometry.boundingBox!.getCenter(new Vector3()) };
    partRegistry.set(id, { def, group: g, localBox, anchor });
    return () => {
      partRegistry.delete(id);
    };
  }, [id, def]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || !def) return;
    const s = useStore.getState();

    // Explode: slide the part along its explode vector.
    const e = runtime.explode;
    g.position.set(def.explode[0] * e, def.explode[1] * e, def.explode[2] * e);

    // Visibility: hidden part, hidden system, or another part is isolated.
    const visible =
      !s.hiddenParts[id] && !s.hiddenSystems[def.system] && (!s.isolatedId || s.isolatedId === id);
    g.visible = visible;

    const dimmed = !!s.focusSystem && s.focusSystem !== def.system;
    const xrayOn = s.xray !== 'off';
    // While X-ray is on, the shell can't be clicked, so the pointer reaches the parts inside.
    const pickable = visible && !dimmed && !(def.skin && xrayOn);
    for (const m of meshes.current) m.raycast = pickable ? Mesh.prototype.raycast : noRaycast;

    // How strongly should this part glow in its system colour?
    const selected = s.selectedId === id;
    const hovered = s.hoveredId === id;
    let target = 0;
    if (!def.skin && s.xray === 'full') target = s.focusSystem === def.system ? 0.32 : 0.16;
    if (!def.skin && s.xray === 'lens' && runtime.pointerInside && isInsideLens(id, g, state.camera, state.size)) target = 0.4;
    if (hovered) target = Math.max(target, 0.45);
    if (selected) target = Math.max(target, 0.55 + 0.25 * Math.sin(state.clock.elapsedTime * 4));
    glow.current = damp(glow.current, target, 12, dt);

    const opacityTarget = dimmed ? (def.skin ? 0.35 : 0.1) : 1;
    for (const a of mats.current) {
      const m = a.mat;
      if (glow.current > 0.01) {
        m.emissive.copy(systemColor);
        m.emissiveIntensity = glow.current;
      } else {
        m.emissive.copy(a.baseEmissive);
        m.emissiveIntensity = a.baseEmissiveIntensity;
      }
      m.opacity = damp(m.opacity, opacityTarget, 10, dt);
      m.depthWrite = def.skin ? s.xray !== 'full' : !dimmed;
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useStore.getState().hover(id);
  };
  const onOut = () => {
    if (useStore.getState().hoveredId === id) useStore.getState().hover(null);
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return; // it was a drag to rotate, not a click
    e.stopPropagation();
    useStore.getState().select(id);
  };

  return (
    <group ref={group} name={`part:${id}`} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      {children}
    </group>
  );
}

/** Is the centre of this part inside the X-ray lens circle on screen? */
function isInsideLens(id: string, g: Group, camera: Camera, size: { width: number; height: number }) {
  const reg = partRegistry.get(id);
  if (!reg) return false;
  reg.localBox.getCenter(tmpV).applyMatrix4(g.matrixWorld).project(camera);
  if (tmpV.z > 1) return false;
  const px = (tmpV.x * 0.5 + 0.5) * size.width * runtime.dpr;
  const py = (tmpV.y * 0.5 + 0.5) * size.height * runtime.dpr;
  return Math.hypot(px - runtime.pointerPx.x, py - runtime.pointerPx.y) < runtime.lensPx;
}

/**
 * A sub-piece of a part that spreads out further when exploded, e.g. the left and
 * right elevons move apart from each other.
 */
export function ExplodeGroup({ offset, children, ...rest }: { offset: Vec3; children: ReactNode } & ThreeElements['group']) {
  const ref = useRef<Group>(null);
  const base = useMemo(() => {
    const p = rest.position;
    return Array.isArray(p) ? new Vector3(p[0], p[1], p[2]) : new Vector3();
  }, [rest.position]);
  useFrame(() => {
    const e = runtime.explode;
    ref.current?.position.set(base.x + offset[0] * e, base.y + offset[1] * e, base.z + offset[2] * e);
  });
  return (
    <group ref={ref} {...rest}>
      {children}
    </group>
  );
}

