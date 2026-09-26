import { useEffect, useMemo, useRef, type ComponentType } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Grid, Lightformer } from '@react-three/drei';
import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { SYSTEM_BY_ID } from '../data/systems';
import { useStore } from '../state/store';
import type { DroneDef, Vec3 } from '../types';
import { DroneContext, ModelModeContext, type ModelMode } from '../viewer/Part';
import { damp } from '../viewer/runtime';
import { factoryClock, factoryHud, useFactory } from './store';
import { clamp01, easeInOutCubic, newPose, partPose, phaseAt, type Schedule } from './timeline';

/*
 * The factory floor. The drone is built on a carrier at the head of a conveyor line
 * (drone axes as in the model: X = forwards, Y = up, Z = right wing). When it is
 * done, the conveyor moves it one slot along −Z, where the finished drones wait.
 */
const FLOOR_Y = -1.05;
/** Top of the conveyor belt; the carriers ride on it. */
const BELT_Y = -0.347;
/** Distance between drones on the line. */
const SLOT = 3.4;
/** Finished drones visible down the line. */
const QUEUE = 3;
const BELT_X = 0.15;
const BELT_WIDTH = 2.4;
const BELT_FROM = 1.5;
const BELT_TO = -16;
/** One stripe on the belt texture, in metres. */
const BELT_PERIOD = 0.5;
/** Underside of the crane rail. */
const RAIL_Y = 2.35;
const RAIL_HALF = 3.4;

const STEEL = '#3a4553';
const YELLOW = '#c8911f';

export const FACTORY_CAMERA: { position: Vec3; target: Vec3 } = {
  position: [4.7, 2.2, 4.9],
  target: [0, 0.05, -0.75],
};

/** Where the finished drone is while it moves down the line, and how far the line has moved (0..1). */
function rollout(schedule: Schedule, t: number) {
  const q = clamp01((t - schedule.checkEnd) / (schedule.cycle - schedule.checkEnd));
  return { shift: easeInOutCubic(q), lift: Math.sin(Math.PI * q) * 0.06 };
}

/** The final check: the scan arch's X position, and 0..1 how visible it is. */
function scan(schedule: Schedule, t: number) {
  const len = schedule.checkEnd - schedule.buildEnd;
  const q = (t - schedule.buildEnd) / len;
  if (q < 0 || q > 1) return { x: 2.3, on: 0, q };
  return { x: 2.3 - 4.5 * easeInOutCubic(clamp01(q / 0.75)), on: Math.min(1, q / 0.08, (1 - q) / 0.15), q };
}

/** Advances the time-lapse clock before anything reads it, and drives the HUD progress bar. */
function FactoryDriver({ schedule }: { schedule: Schedule }) {
  const ready = useRef(false);
  useFrame((_, dt) => {
    const f = useFactory.getState();
    // Clamp dt so a background tab doesn't skip a whole drone when it comes back.
    if (f.playing) factoryClock.time += Math.min(dt, 0.1) * f.speed;
    if (factoryClock.time >= schedule.cycle) {
      factoryClock.time %= schedule.cycle;
      f.finishOne();
    }
    const t = factoryClock.time;
    const phase = phaseAt(schedule, t);
    if (phase !== f.phase) f.setPhase(phase);
    schedule.phases.forEach((p, i) => {
      const el = factoryHud.fills[i];
      if (el) el.style.width = `${clamp01((t - p.start) / (p.end - p.start)) * 100}%`;
    });
    if (!ready.current) {
      ready.current = true;
      document.body.dataset.factoryReady = 'true';
    }
  });
  useEffect(
    () => () => {
      delete document.body.dataset.factoryReady;
    },
    [],
  );
  return null;
}

interface PartState {
  box: Box3;
  center: Vector3;
  mats: { mat: MeshStandardMaterial; emissive: Color; intensity: number }[];
  color: Color;
  glow: number;
}

/**
 * Moves the parts of the drone being built. Returns the ModelMode for it, plus the
 * parts' fitted boxes so the crane can find the one it is carrying.
 */
function useBuildAnimation(drone: DroneDef, schedule: Schedule, hidden: ReadonlySet<string>) {
  return useMemo(() => {
    const parts = new Map<string, PartState>();
    const pose = newPose();
    const toLocal = new Matrix4();

    const animate = (id: string, g: Group) => {
      let st = parts.get(id);
      if (!st) {
        // First frame: measure the part where the model puts it.
        g.position.set(0, 0, 0);
        g.scale.setScalar(1);
        g.updateWorldMatrix(true, true);
        const box = new Box3().setFromObject(g).applyMatrix4(toLocal.copy(g.matrixWorld).invert());
        const mats: PartState['mats'] = [];
        g.traverse((o) => {
          if (!(o instanceof Mesh) || o.userData.noAdopt) return;
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            if (m instanceof MeshStandardMaterial) mats.push({ mat: m, emissive: m.emissive.clone(), intensity: m.emissiveIntensity });
          }
        });
        const def = drone.parts.find((p) => p.id === id);
        st = { box, center: box.getCenter(new Vector3()), mats, color: new Color(def ? SYSTEM_BY_ID[def.system].color : '#ffffff'), glow: 0 };
        parts.set(id, st);
      }
      const slot = schedule.byId.get(id);
      if (!slot) {
        g.visible = false;
        return;
      }
      const t = factoryClock.time;
      partPose(slot, t, pose);
      g.visible = pose.visible;
      if (!pose.visible) return;
      // Scale about the part's own centre, not the drone's origin.
      const s = pose.scale;
      g.scale.setScalar(s);
      g.position.set(
        pose.offset[0] + st.center.x * (1 - s),
        pose.offset[1] + st.center.y * (1 - s),
        pose.offset[2] + st.center.z * (1 - s),
      );

      // Glow: the click into place, the final-check scan passing over it, or a hover in the panel.
      let glow = pose.glow;
      const sc = scan(schedule, t);
      if (sc.on > 0 && sc.x > st.box.min.x - 0.08 && sc.x < st.box.max.x + 0.08) glow = Math.max(glow, 0.6 * sc.on);
      if (useStore.getState().hoveredId === id) glow = Math.max(glow, 0.5);
      st.glow = glow;
      for (const a of st.mats) {
        if (glow > 0.01) {
          a.mat.emissive.copy(st.color);
          a.mat.emissiveIntensity = glow;
        } else {
          a.mat.emissive.copy(a.emissive);
          a.mat.emissiveIntensity = a.intensity;
        }
      }
    };

    const mode: ModelMode = {
      interactive: false,
      hidden,
      animate,
      // The propeller is run up during the final check.
      propSpeed: () => {
        const sc = scan(schedule, factoryClock.time);
        return sc.on > 0 && sc.q > 0.3 ? 45 : 0;
      },
    };
    return { mode, parts };
  }, [drone, schedule, hidden]);
}

/** The pallet and saddles each drone rides on. */
function Carrier() {
  return (
    <group>
      <mesh position={[0.25, BELT_Y + 0.02, 0]}>
        <boxGeometry args={[2.2, 0.04, 0.5]} />
        <meshStandardMaterial color="#2a323c" roughness={0.7} metalness={0.4} />
      </mesh>
      {[-0.35, 0.85].map((x) => (
        <mesh key={x} position={[x, -0.262, 0]}>
          <boxGeometry args={[0.14, 0.09, 0.36]} />
          <meshStandardMaterial color={YELLOW} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function BuildLine({ drone, schedule, Model }: { drone: DroneDef; schedule: Schedule; Model: ComponentType }) {
  const hidden = useMemo(() => new Set(drone.assembly?.notFitted?.map((p) => p.id) ?? []), [drone]);
  const { mode, parts } = useBuildAnimation(drone, schedule, hidden);
  const queueMode = useMemo<ModelMode>(() => ({ interactive: false, hidden, propSpeed: () => 0 }), [hidden]);
  const jig = useRef<Group>(null);
  const queue = useRef<Group>(null);
  const beltTex = useMemo(() => makeBeltTexture(), []);

  useFrame(() => {
    const t = factoryClock.time;
    const r = rollout(schedule, t);
    jig.current?.position.set(0, r.lift, -SLOT * r.shift);
    queue.current?.position.set(0, 0, -SLOT * r.shift);
    // The belt moves with the drones on it.
    const travel = (useFactory.getState().built + r.shift) * SLOT;
    beltTex.offset.y = -((travel / BELT_PERIOD) % 1);
  });

  return (
    <>
      <group ref={jig}>
        <Carrier />
        <ModelModeContext.Provider value={mode}>
          <Model />
        </ModelModeContext.Provider>
      </group>
      <group ref={queue}>
        {Array.from({ length: QUEUE }, (_, i) => (
          <group key={i} position={[0, 0, -SLOT * (i + 1)]}>
            <Carrier />
            <ModelModeContext.Provider value={queueMode}>
              <Model />
            </ModelModeContext.Provider>
          </group>
        ))}
      </group>
      <Conveyor texture={beltTex} />
      <Gantry schedule={schedule} parts={parts} />
      <ScanArch schedule={schedule} />
    </>
  );
}

function Conveyor({ texture }: { texture: CanvasTexture }) {
  const length = BELT_FROM - BELT_TO;
  const midZ = (BELT_FROM + BELT_TO) / 2;
  const legs = [];
  for (let z = BELT_FROM - 0.4; z > BELT_TO; z -= 2.2) legs.push(z);
  return (
    <group>
      <mesh position={[BELT_X, BELT_Y - 0.05, midZ]}>
        <boxGeometry args={[BELT_WIDTH + 0.12, 0.1, length]} />
        <meshStandardMaterial color="#1b222b" roughness={0.8} metalness={0.4} />
      </mesh>
      <mesh position={[BELT_X, BELT_Y + 0.001, midZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BELT_WIDTH, length]} />
        <meshStandardMaterial map={texture} color="#9aa6b4" roughness={0.9} metalness={0.1} />
      </mesh>
      {legs.flatMap((z) =>
        [-1, 1].map((side) => (
          <mesh key={`${z}${side}`} position={[BELT_X + side * (BELT_WIDTH / 2 - 0.1), (FLOOR_Y + BELT_Y - 0.1) / 2, z]}>
            <boxGeometry args={[0.08, BELT_Y - 0.1 - FLOOR_Y, 0.08]} />
            <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.5} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Overhead crane: a rail hung from the roof, with a trolley that lowers each part on a cable. */
function Gantry({ schedule, parts }: { schedule: Schedule; parts: Map<string, PartState> }) {
  const trolley = useRef<Group>(null);
  const cable = useRef<Mesh>(null);
  const hook = useRef<Mesh>(null);
  const state = useRef({ x: 0, y: RAIL_Y - 0.3 });
  const pose = useMemo(() => newPose(), []);

  useFrame((_, dt) => {
    const t = factoryClock.time;
    // The part being lowered right now, if any (the latest one to start).
    let target: { x: number; y: number } | null = null;
    for (let i = schedule.slots.length - 1; i >= 0; i--) {
      const slot = schedule.slots[i];
      if (t < slot.start || t >= slot.end) continue;
      const p = parts.get(slot.id);
      if (!p) break;
      partPose(slot, t, pose);
      target = { x: p.center.x + pose.offset[0], y: p.center.y + (p.box.max.y - p.center.y) * pose.scale + pose.offset[1] };
      break;
    }
    const s = state.current;
    const limit = RAIL_HALF - 0.2;
    s.x = damp(s.x, target ? Math.max(-limit, Math.min(limit, target.x)) : 0, target ? 22 : 3, dt);
    s.y = damp(s.y, target ? target.y + 0.03 : RAIL_Y - 0.3, target ? 30 : 4, dt);
    trolley.current?.position.set(s.x, RAIL_Y - 0.06, 0);
    const top = RAIL_Y - 0.11;
    const len = Math.max(0.02, top - s.y);
    if (cable.current) {
      cable.current.position.set(s.x, top - len / 2, 0);
      cable.current.scale.set(1, len, 1);
    }
    hook.current?.position.set(s.x, s.y, 0);
  });

  return (
    <group>
      <mesh position={[0, RAIL_Y + 0.08, 0]}>
        <boxGeometry args={[RAIL_HALF * 2, 0.16, 0.16]} />
        <meshStandardMaterial color={YELLOW} roughness={0.55} metalness={0.4} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (RAIL_HALF - 0.3), RAIL_Y + 2, 0]}>
          <boxGeometry args={[0.06, 3.8, 0.06]} />
          <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.5} />
        </mesh>
      ))}
      <group ref={trolley}>
        <mesh>
          <boxGeometry args={[0.3, 0.1, 0.26]} />
          <meshStandardMaterial color="#27303a" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>
      <mesh ref={cable}>
        <cylinderGeometry args={[0.007, 0.007, 1, 6]} />
        <meshStandardMaterial color="#aeb7c2" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh ref={hook} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.03, 0.009, 8, 20]} />
        <meshStandardMaterial color="#d6dde5" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

/** The final check: an arch that sweeps along the finished drone. */
function ScanArch({ schedule }: { schedule: Schedule }) {
  const ref = useRef<Group>(null);
  const glass = useMemo(
    () =>
      new MeshBasicMaterial({ color: '#5eead4', transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
    [],
  );
  const frame = useMemo(() => new MeshBasicMaterial({ color: '#5eead4', transparent: true, opacity: 0 }), []);
  useFrame(() => {
    const sc = scan(schedule, factoryClock.time);
    if (!ref.current) return;
    ref.current.visible = sc.on > 0;
    ref.current.position.x = sc.x;
    glass.opacity = 0.14 * sc.on;
    frame.opacity = sc.on;
  });
  const H = 0.95;
  const W = 3.2;
  const y0 = BELT_Y;
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, y0 + H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={glass}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[0, y0 + H / 2, (sz * W) / 2]} material={frame}>
          <boxGeometry args={[0.04, H, 0.04]} />
        </mesh>
      ))}
      <mesh position={[0, y0 + H, 0]} material={frame}>
        <boxGeometry args={[0.04, 0.04, W + 0.04]} />
      </mesh>
    </group>
  );
}

/** Shelves of part crates, tagged in the system colours. */
function PartsRack({ position }: { position: Vec3 }) {
  const colors = Object.values(SYSTEM_BY_ID).map((s) => s.color);
  const shelves = [0.05, 0.75, 1.45];
  return (
    <group position={position}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.35, 0.95, sz * 1.4]}>
            <boxGeometry args={[0.06, 1.9, 0.06]} />
            <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.5} />
          </mesh>
        )),
      )}
      {shelves.map((y, i) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.04, 2.9]} />
            <meshStandardMaterial color="#2a333e" roughness={0.7} metalness={0.4} />
          </mesh>
          {[-1.05, -0.35, 0.35, 1.05].map((z, j) => {
            const c = colors[(i * 4 + j) % colors.length];
            return (
              <group key={z} position={[0, 0.2, z]}>
                <mesh>
                  <boxGeometry args={[0.55, 0.36, 0.55]} />
                  <meshStandardMaterial color="#232b35" roughness={0.8} metalness={0.2} />
                </mesh>
                <mesh position={[0.28, 0.08, 0]}>
                  <boxGeometry args={[0.005, 0.05, 0.3]} />
                  <meshStandardMaterial color={c} roughness={0.7} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/** Yellow-and-black safety border on the floor. */
function HazardBorder({ x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number }) {
  const strips = useMemo(() => {
    const w = 0.12;
    const y = FLOOR_Y + 0.003;
    return [
      { pos: [(x0 + x1) / 2, y, z0] as Vec3, length: x1 - x0, rot: 0 },
      { pos: [(x0 + x1) / 2, y, z1] as Vec3, length: x1 - x0, rot: 0 },
      { pos: [x0, y, (z0 + z1) / 2] as Vec3, length: z1 - z0, rot: Math.PI / 2 },
      { pos: [x1, y, (z0 + z1) / 2] as Vec3, length: z1 - z0, rot: Math.PI / 2 },
    ].map((s) => ({ ...s, width: w, texture: makeHazardTexture(s.length / 0.5) }));
  }, [x0, x1, z0, z1]);
  return (
    <>
      {strips.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[-Math.PI / 2, 0, s.rot]}>
          <planeGeometry args={[s.length, s.width]} />
          <meshStandardMaterial map={s.texture} roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

function makeBeltTexture() {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#1a2129';
  ctx.fillRect(0, 0, 16, 64);
  ctx.fillStyle = '#2c3642';
  ctx.fillRect(0, 0, 16, 6);
  const tex = new CanvasTexture(c);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(1, (BELT_FROM - BELT_TO) / BELT_PERIOD);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeHazardTexture(repeat: number) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 16;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#16191d';
  ctx.fillRect(0, 0, 64, 16);
  ctx.fillStyle = '#d4a017';
  for (let x = -16; x < 64; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x + 16, 0);
    ctx.lineTo(x + 32, 0);
    ctx.lineTo(x + 16, 16);
    ctx.fill();
  }
  const tex = new CanvasTexture(c);
  tex.wrapS = RepeatWrapping;
  tex.repeat.set(repeat, 1);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function FactoryCamera() {
  const ref = useRef<CameraControls>(null);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    // Narrow (portrait) screens need the camera further back, and centred on the drone being built.
    const k = aspect < 1.4 ? Math.pow(1.4 / aspect, 0.45) : 1;
    const { position: p } = FACTORY_CAMERA;
    const t: Vec3 = aspect < 1 ? [0, 0.05, -0.3] : FACTORY_CAMERA.target;
    void ref.current?.setLookAt(
      t[0] + (p[0] - t[0]) * k,
      t[1] + (p[1] - t[1]) * k,
      t[2] + (p[2] - t[2]) * k,
      t[0],
      t[1],
      t[2],
      false,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- only frame the shot once
  return <CameraControls ref={ref} makeDefault minDistance={1.5} maxDistance={18} maxPolarAngle={Math.PI * 0.47} smoothTime={0.35} />;
}

export function FactoryScene({ drone, schedule, Model }: { drone: DroneDef; schedule: Schedule; Model: ComponentType }) {
  return (
    <>
      <FactoryDriver schedule={schedule} />
      <fog attach="fog" args={['#0a1017', 10, 24]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 7, 3]} intensity={1.6} />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} color="#9ecbff" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={1} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
      </Environment>
      <mesh position={[0, FLOOR_Y - 0.001, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0c1218" roughness={0.95} metalness={0} />
      </mesh>
      <Grid
        position={[0, FLOOR_Y, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#18232f"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#243344"
        fadeDistance={22}
        fadeStrength={1.4}
        infiniteGrid
      />
      <HazardBorder x0={-2.75} x1={2.75} z0={-2.25} z1={2.25} />
      <PartsRack position={[-4.8, FLOOR_Y, -2.2]} />
      <PartsRack position={[-4.8, FLOOR_Y, -5.6]} />
      <DroneContext.Provider value={drone}>
        <BuildLine drone={drone} schedule={schedule} Model={Model} />
      </DroneContext.Provider>
      <FactoryCamera />
    </>
  );
}
