import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Box3, Sphere } from 'three';
import { useStore } from '../state/store';
import type { Vec3 } from '../types';
import { useDrone } from './Part';
import { partRegistry, partTargetBox, runtime } from './runtime';

export const DEFAULT_CAMERA: { position: Vec3; target: Vec3 } = {
  position: [4.1, 2.1, 4.6],
  target: [0, -0.05, 0],
};

const MIN_FOCUS_RADIUS = 0.55;

/** Orbit / zoom / pan controls plus smooth "fly to" moves for selection and focus. */
export function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const command = useStore((s) => s.camera);
  const drone = useDrone();
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (command.kind === 'reset') {
      // Narrow (portrait) screens need the camera further back to fit the wingspan.
      const k = aspect < 1.25 ? Math.pow(1.25 / aspect, 0.6) : 1;
      const [tx, ty, tz] = DEFAULT_CAMERA.target;
      const [px, py, pz] = DEFAULT_CAMERA.position.map((v, i) => DEFAULT_CAMERA.target[i] + (v - DEFAULT_CAMERA.target[i]) * k);
      void c.setLookAt(px, py, pz, tx, ty, tz, command.nonce > 0);
      return;
    }
    const box = new Box3();
    const ids =
      command.kind === 'part'
        ? [command.id]
        : drone.parts.filter((p) => p.system === command.id).map((p) => p.id);
    for (const id of ids) {
      if (!partRegistry.get(id)?.group.visible && command.kind === 'system') continue;
      const b = partTargetBox(id, useStore.getState().explode);
      if (b) box.union(b);
    }
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new Sphere());
    // Leave some room around a whole system so you can see how it connects.
    sphere.radius = Math.max(sphere.radius * (command.kind === 'system' ? 1.3 : 1), MIN_FOCUS_RADIUS);
    void c.fitToSphere(sphere, true);
  }, [command, drone]); // eslint-disable-line react-hooks/exhaustive-deps -- aspect only matters at the moment of a reset

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    runtime.controls = c;
    // Any drag/zoom by the user stops the turntable.
    const stop = () => useStore.getState().setAutoRotate(false);
    c.addEventListener('controlstart', stop);
    return () => {
      c.removeEventListener('controlstart', stop);
      runtime.controls = null;
    };
  }, []);

  useFrame((_, dt) => {
    if (useStore.getState().autoRotate) ref.current?.rotate(dt * 0.2, 0, false);
  });

  return <CameraControls ref={ref} makeDefault minDistance={0.5} maxDistance={12} smoothTime={0.35} />;
}
