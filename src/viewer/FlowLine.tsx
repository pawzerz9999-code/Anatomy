import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  CanvasTexture,
  CatmullRomCurve3,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  TubeGeometry,
  Vector3,
} from 'three';
import { useStore } from '../state/store';
import type { SystemId, Vec3 } from '../types';
import { damp } from './runtime';
import { useDrone } from './Part';

function makeDashTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 4;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.15)');
  grad.addColorStop(0.85, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 4);
  const tex = new CanvasTexture(c);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  return tex;
}

interface FlowLineProps {
  points: Vec3[];
  radius?: number;
  color: string;
  flowColor: string;
  /** The flow animation plays when this system is focused, hovered or selected. */
  system: SystemId;
}

/**
 * A pipe along a smooth path, plus a glowing "flow" overlay whose dashes travel
 * from the first point to the last one (e.g. fuel moving from tank to engine).
 */
export function FlowLine({ points, radius = 0.012, color, flowColor, system }: FlowLineProps) {
  const drone = useDrone();
  const { geometry, flowGeometry, length } = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)), false, 'centripetal');
    return {
      geometry: new TubeGeometry(curve, 96, radius, 10, false),
      flowGeometry: new TubeGeometry(curve, 96, radius * 1.45, 10, false),
      length: curve.getLength(),
    };
  }, [points, radius]);

  const texture = useMemo(() => {
    const t = makeDashTexture();
    t.repeat.set(Math.max(1, Math.round(length * 9)), 1);
    return t;
  }, [length]);

  const flowMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: flowColor,
        map: texture,
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [flowColor, texture],
  );

  const flowMesh = useRef<Mesh>(null);
  const systemOf = useMemo(() => Object.fromEntries(drone.parts.map((p) => [p.id, p.system])), [drone]);

  useFrame((_, dt) => {
    const s = useStore.getState();
    const active =
      s.focusSystem === system ||
      (s.hoveredId !== null && systemOf[s.hoveredId] === system) ||
      (s.selectedId !== null && systemOf[s.selectedId] === system);
    flowMat.opacity = damp(flowMat.opacity, active ? 1 : 0, 6, dt);
    texture.offset.x -= dt * 1.6;
    if (flowMesh.current) flowMesh.current.visible = flowMat.opacity > 0.01;
  });

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh
        ref={flowMesh}
        geometry={flowGeometry}
        material={flowMat}
        renderOrder={5}
        userData={{ noAdopt: true }}
        raycast={() => {}}
      />
    </>
  );
}
