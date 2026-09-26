import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Grid, Lightformer } from '@react-three/drei';
import { DRONES } from '../data/drones';
import { MODELS } from '../models';
import { useStore } from '../state/store';
import { CameraRig, DEFAULT_CAMERA } from './CameraRig';
import { LabelsDriver, LabelsOverlay } from './Labels';
import { DroneContext } from './Part';
import { damp, runtime } from './runtime';
import { xrayUniforms } from './xray';

const DEFAULT_FLOOR_Y = -1.25;

/** Updates the per-frame shared values (explode, X-ray uniforms) before the parts read them. */
function SceneDriver() {
  const ready = useRef(false);
  useFrame((state, dt) => {
    const s = useStore.getState();
    runtime.explode = damp(runtime.explode, s.explode, 7, dt);
    runtime.dpr = state.gl.getPixelRatio();
    runtime.lensPx = s.lensRadius * runtime.dpr;
    xrayUniforms.uPointer.value.set(runtime.pointerPx.x, runtime.pointerPx.y);
    xrayUniforms.uRadius.value = runtime.lensPx;
    xrayUniforms.uLens.value = damp(xrayUniforms.uLens.value, s.xray === 'lens' && runtime.pointerInside ? 1 : 0, 12, dt);
    xrayUniforms.uFull.value = damp(xrayUniforms.uFull.value, s.xray === 'full' ? 1 : 0, 6, dt);
    if (!ready.current) {
      ready.current = true;
      document.body.dataset.sceneReady = 'true';
    }
  });
  return null;
}

/** Lights, reflections, soft shadow and a floor grid, scaled to the drone's size. */
function Studio({ floorY }: { floorY: number }) {
  const k = floorY / DEFAULT_FLOOR_Y;
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.7} />
      <directionalLight position={[-5, 2, -4]} intensity={0.6} color="#9ecbff" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={1} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={0.5} color="#7dd3fc" position={[0, -3, 3]} scale={[8, 2, 1]} />
      </Environment>
      <ContactShadows position={[0, floorY + 0.005 * k, 0]} opacity={0.5} scale={9 * k} blur={2.6} far={3 * k} resolution={512} />
      <Grid
        position={[0, floorY, 0]}
        args={[30, 30]}
        cellSize={0.25 * k}
        cellThickness={0.6}
        cellColor="#1c2a3a"
        sectionSize={1 * k}
        sectionThickness={1}
        sectionColor="#2b4058"
        fadeDistance={16 * k}
        fadeStrength={1.6}
        infiniteGrid
      />
    </>
  );
}

export function Viewer() {
  const droneId = useStore((s) => s.droneId);
  const drone = DRONES[droneId];
  const Model = MODELS[droneId];
  const wrap = useRef<HTMLDivElement>(null);

  // Track the pointer for the X-ray lens, and Shift + wheel to resize it.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const canvas = el.querySelector('canvas');
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      runtime.pointerInside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      runtime.pointerPx.x = (e.clientX - r.left) * runtime.dpr;
      runtime.pointerPx.y = (r.bottom - e.clientY) * runtime.dpr;
    };
    const leave = () => {
      runtime.pointerInside = false;
    };
    const wheel = (e: WheelEvent) => {
      const s = useStore.getState();
      if (!e.shiftKey || s.xray !== 'lens') return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY || e.deltaX;
      s.setLensRadius(Math.min(260, Math.max(50, s.lensRadius - Math.sign(delta) * 10)));
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', move);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('wheel', wheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', move);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('wheel', wheel, { capture: true });
    };
  }, []);

  return (
    <div className="viewer" ref={wrap}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: DEFAULT_CAMERA.position, fov: 40, near: 0.05, far: 100 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onPointerMissed={() => useStore.getState().select(null)}
      >
        <SceneDriver />
        <Studio floorY={drone.view?.floorY ?? DEFAULT_FLOOR_Y} />
        <DroneContext.Provider value={drone}>
          <Model />
          <LabelsDriver drone={drone} />
          <CameraRig />
        </DroneContext.Provider>
      </Canvas>
      <LabelsOverlay drone={drone} />
    </div>
  );
}
