import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls, Grid } from '@react-three/drei';
import {
  AdditiveBlending,
  Color,
  Euler,
  Group,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PointLight,
  Quaternion,
  Vector3,
} from 'three';
import { BOOSTER_MOUNT, BOOSTER_NOZZLE_EXIT, Shahed136Model, ShahedBooster } from '../models/shahed136/Shahed136Model';
import { ModelModeContext, type ModelMode } from '../viewer/Part';
import { damp } from '../viewer/runtime';

/*
 * The Shahed-136 on a five-drone truck launch rack, and a launch sequence: the
 * booster fires, the drone climbs off the rail, the booster drops away and the
 * engine takes over. Units are metres and seconds.
 */

export type LaunchPhase = 0 | 1 | 2 | 3;

/** Shared playback state, driven by the page's buttons and read every frame. */
export interface LaunchControl {
  playing: boolean;
  /** Seconds since ignition (only advances while playing). */
  t: number;
  timeScale: number;
  /** Bumped to restart the scene from the rack. */
  resetNonce: number;
}

const RAIL_ANGLE = (15 * Math.PI) / 180; // illustrative: "a slight upward angle", exact angle not published
const SLOTS = 5;
const SLOT_SPACING = 0.8;
const RAIL_START = new Vector3(-1.2, 1.55, 0);
const RAIL_LENGTH = 4.2;
const START_ALONG_RAIL = 1.9;
const RIDE_HEIGHT = 0.24;
export const BURN_TIME = 2.5; // reported as about 2–3 s
const BOOST_ACCEL = 16;
const CRUISE_ANGLE = (4 * Math.PI) / 180;

const railDir = new Vector3(Math.cos(RAIL_ANGLE), Math.sin(RAIL_ANGLE), 0);
const railNormal = new Vector3(-Math.sin(RAIL_ANGLE), Math.cos(RAIL_ANGLE), 0);

function slotPosition(i: number) {
  return RAIL_START.clone()
    .add(new Vector3(0, i * SLOT_SPACING, 0))
    .addScaledVector(railDir, START_ALONG_RAIL)
    .addScaledVector(railNormal, RIDE_HEIGHT);
}

export function phaseAt(t: number, playing: boolean): LaunchPhase {
  if (!playing && t === 0) return 0;
  if (t < BURN_TIME) return 1;
  if (t < BURN_TIME + 2) return 2;
  return 3;
}

const OLIVE = '#4b5335';
const OLIVE_DARK = '#353b26';

function Truck() {
  const wheels: [number, number][] = [];
  for (const x of [-2.6, 0.7, 2.0]) for (const z of [-1.0, 1.0]) wheels.push([x, z]);
  return (
    <group>
      <mesh position={[-0.2, 0.95, 0]}>
        <boxGeometry args={[7.0, 0.35, 2.1]} />
        <meshStandardMaterial color={OLIVE_DARK} roughness={0.8} />
      </mesh>
      {/* cab, at the back so the drones launch away from it */}
      <mesh position={[-2.75, 2.0, 0]}>
        <boxGeometry args={[1.8, 1.8, 2.3]} />
        <meshStandardMaterial color={OLIVE} roughness={0.75} />
      </mesh>
      <mesh position={[-3.66, 2.25, 0]}>
        <boxGeometry args={[0.04, 0.8, 2.0]} />
        <meshStandardMaterial color="#1d2530" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0.9, 1.2, 0]}>
        <boxGeometry args={[4.6, 0.15, 2.4]} />
        <meshStandardMaterial color={OLIVE} roughness={0.8} />
      </mesh>
      {wheels.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.5, z * 1.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.36, 28]} />
          <meshStandardMaterial color="#16181b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** Frame with five tiers of inclined launch rails. */
function Rack() {
  const top = RAIL_START.y + (SLOTS - 1) * SLOT_SPACING + RAIL_LENGTH * Math.sin(RAIL_ANGLE) + 0.3;
  const posts: [number, number][] = [
    [-1.3, -1.35],
    [-1.3, 1.35],
    [3.1, -1.35],
    [3.1, 1.35],
  ];
  return (
    <group>
      {posts.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (1.25 + top) / 2, z]}>
          <boxGeometry args={[0.1, top - 1.25, 0.1]} />
          <meshStandardMaterial color="#5a6147" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: SLOTS }, (_, i) =>
        [-0.26, 0.26].map((z) => {
          const start = RAIL_START.clone().add(new Vector3(0, i * SLOT_SPACING, z));
          const mid = start.clone().addScaledVector(railDir, RAIL_LENGTH / 2);
          return (
            <mesh key={`${i}${z}`} position={mid} rotation={[0, 0, RAIL_ANGLE]}>
              <boxGeometry args={[RAIL_LENGTH, 0.05, 0.06]} />
              <meshStandardMaterial color="#8d9296" roughness={0.4} metalness={0.8} />
            </mesh>
          );
        }),
      )}
      {Array.from({ length: SLOTS }, (_, i) => (
        <mesh key={i} position={[-1.3, RAIL_START.y + i * SLOT_SPACING - 0.1, 0]}>
          <boxGeometry args={[0.1, 0.08, 2.7]} />
          <meshStandardMaterial color="#5a6147" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Rocket flame: two additive cones that flicker. */
function Flame({ flameRef }: { flameRef: RefObject<Group | null> }) {
  return (
    <group ref={flameRef} position={BOOSTER_NOZZLE_EXIT} visible={false}>
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.085, 0.7, 20, 1, true]} />
        <meshBasicMaterial color="#ff9a3c" transparent opacity={0.85} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.045, 0.4, 16, 1, true]} />
        <meshBasicMaterial color="#fff2c2" transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

const SMOKE_COUNT = 110;
const SMOKE_LIFE = 4;
const puffGeometry = new IcosahedronGeometry(1, 1);

interface Puff {
  mesh: Mesh;
  mat: MeshLambertMaterial;
  vel: Vector3;
  age: number;
  alive: boolean;
}

const tmpM = new Matrix4();
const tmpV = new Vector3();
const tmpQ = new Quaternion();
const mountMatrix = new Matrix4().compose(
  new Vector3(...BOOSTER_MOUNT.position),
  new Quaternion().setFromEuler(new Euler(0, 0, BOOSTER_MOUNT.tilt)),
  new Vector3(1, 1, 1),
);

export const LAUNCH_CAMERA = { position: new Vector3(-8.5, 4.2, 10.5), target: new Vector3(1.2, 3.2, 0) };

export function ShahedLaunchScene({ control, onPhase }: { control: LaunchControl; onPhase: (p: LaunchPhase) => void }) {
  const drone = useRef<Group>(null);
  const boosterAttached = useRef<Group>(null);
  const boosterFree = useRef<Group>(null);
  const flame = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const controls = useRef<CameraControls>(null);

  const sim = useRef({
    phase: 0 as LaunchPhase,
    along: 0,
    speed: 0,
    gamma: RAIL_ANGLE,
    pos: slotPosition(SLOTS - 1),
    boosterVel: new Vector3(),
    boosterSpin: new Vector3(),
    boosterLanded: false,
    separated: false,
    spawnTimer: 0,
    resetNonce: -1,
    following: false,
  });

  const puffs = useMemo<Puff[]>(
    () =>
      Array.from({ length: SMOKE_COUNT }, () => {
        const mat = new MeshLambertMaterial({ color: new Color('#b9bdc2'), transparent: true, opacity: 0, depthWrite: false });
        const mesh = new Mesh(puffGeometry, mat);
        mesh.visible = false;
        return { mesh, mat, vel: new Vector3(), age: 0, alive: false };
      }),
    [],
  );

  // Launched drone: booster drawn separately; propeller spins once the engine is running.
  const launchedMode = useMemo<ModelMode>(
    () => ({ interactive: false, hidden: new Set(['booster']), propSpeed: () => 16 }),
    [],
  );
  const parkedMode = useMemo<ModelMode>(() => ({ interactive: false, propSpeed: () => 0 }), []);

  function resetScene(animate: boolean) {
    const s = sim.current;
    s.phase = 0;
    s.along = 0;
    s.speed = 0;
    s.gamma = RAIL_ANGLE;
    s.pos.copy(slotPosition(SLOTS - 1));
    s.separated = false;
    s.boosterLanded = false;
    s.following = false;
    s.spawnTimer = 0;
    for (const p of puffs) {
      p.alive = false;
      p.mesh.visible = false;
    }
    if (boosterAttached.current) boosterAttached.current.visible = true;
    if (boosterFree.current) boosterFree.current.visible = false;
    void controls.current?.setLookAt(
      ...LAUNCH_CAMERA.position.toArray(),
      ...LAUNCH_CAMERA.target.toArray(),
      animate,
    );
    onPhase(0);
  }

  useFrame((_, rawDt) => {
    const s = sim.current;
    if (s.resetNonce !== control.resetNonce) {
      resetScene(s.resetNonce >= 0);
      s.resetNonce = control.resetNonce;
      document.body.dataset.launchReady = 'true';
    }
    const dt = Math.min(rawDt, 0.05) * control.timeScale;
    if (control.playing) control.t += dt;
    const t = control.t;

    const phase = phaseAt(t, control.playing);
    if (phase !== s.phase) {
      s.phase = phase;
      onPhase(phase);
    }

    // ── Drone motion ──
    if (control.playing) {
      if (t < BURN_TIME) {
        s.speed += BOOST_ACCEL * dt;
        s.gamma = RAIL_ANGLE;
      } else {
        s.gamma = damp(s.gamma, CRUISE_ANGLE, 0.6, dt);
      }
      s.pos.x += Math.cos(s.gamma) * s.speed * dt;
      s.pos.y += Math.sin(s.gamma) * s.speed * dt;
    }
    const d = drone.current!;
    d.position.copy(s.pos);
    d.rotation.set(0, 0, s.gamma);
    d.updateMatrixWorld();

    // ── Flame and light while the booster burns ──
    const burning = control.playing && t < BURN_TIME;
    if (flame.current) {
      flame.current.visible = burning;
      const f = 0.85 + Math.random() * 0.35;
      flame.current.scale.set(f, 0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2);
    }
    if (light.current) light.current.intensity = burning ? 30 + Math.random() * 15 : 0;

    // ── Booster separation and fall ──
    if (control.playing && t >= BURN_TIME && !s.separated) {
      s.separated = true;
      const free = boosterFree.current!;
      tmpM.multiplyMatrices(d.matrixWorld, mountMatrix);
      tmpM.decompose(free.position, free.quaternion, tmpV);
      free.visible = true;
      boosterAttached.current!.visible = false;
      s.boosterVel.set(Math.cos(s.gamma), Math.sin(s.gamma), 0).multiplyScalar(s.speed * 0.9).add(new Vector3(0, -1.5, 0));
      s.boosterSpin.set(0.8, 0.3, -1.6);
    }
    if (s.separated && !s.boosterLanded) {
      const free = boosterFree.current!;
      s.boosterVel.y -= 9.81 * dt;
      s.boosterVel.multiplyScalar(1 - 0.35 * dt);
      free.position.addScaledVector(s.boosterVel, dt);
      tmpQ.setFromEuler(new Euler(s.boosterSpin.x * dt, s.boosterSpin.y * dt, s.boosterSpin.z * dt));
      free.quaternion.multiply(tmpQ);
      if (free.position.y <= 0.08) {
        free.position.y = 0.08;
        s.boosterLanded = true;
      }
    }

    // ── Smoke trail ──
    if (burning) {
      s.spawnTimer -= dt;
      while (s.spawnTimer <= 0) {
        s.spawnTimer += 0.025;
        const p = puffs.find((q) => !q.alive);
        if (!p) break;
        p.alive = true;
        p.age = 0;
        tmpV.set(...BOOSTER_NOZZLE_EXIT).applyMatrix4(mountMatrix).applyMatrix4(d.matrixWorld);
        p.mesh.position.copy(tmpV);
        p.vel.set(-Math.cos(s.gamma), -Math.sin(s.gamma), 0).multiplyScalar(3 + Math.random() * 2);
        p.vel.add(new Vector3((Math.random() - 0.5) * 1.5, Math.random() * 0.8, (Math.random() - 0.5) * 1.5));
        p.mesh.visible = true;
      }
    }
    for (const p of puffs) {
      if (!p.alive) continue;
      p.age += dt;
      if (p.age > SMOKE_LIFE) {
        p.alive = false;
        p.mesh.visible = false;
        continue;
      }
      const k = p.age / SMOKE_LIFE;
      p.vel.multiplyScalar(1 - 1.2 * dt);
      p.vel.y += 0.25 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.scale.setScalar(0.25 + 1.8 * Math.sqrt(k));
      p.mat.opacity = 0.55 * (1 - k);
    }

    // ── Camera: follow the drone once it leaves the rack ──
    const c = controls.current;
    if (c && control.playing && t > 0.3) {
      if (!s.following) s.following = true;
      const target = s.pos.clone().add(new Vector3(1.5, 0, 0));
      const cam = s.pos.clone().add(new Vector3(-5.5, 1.6, 6.5));
      const cur = c.getPosition(new Vector3());
      const tgt = c.getTarget(new Vector3());
      const lambda = 3;
      cur.set(damp(cur.x, cam.x, lambda, dt), damp(cur.y, cam.y, lambda, dt), damp(cur.z, cam.z, lambda, dt));
      tgt.set(damp(tgt.x, target.x, lambda * 2, dt), damp(tgt.y, target.y, lambda * 2, dt), damp(tgt.z, target.z, lambda * 2, dt));
      void c.setLookAt(cur.x, cur.y, cur.z, tgt.x, tgt.y, tgt.z, false);
    }
  });

  return (
    <>
      <color attach="background" args={['#1a2330']} />
      <fog attach="fog" args={['#1a2330', 60, 320]} />
      <hemisphereLight args={['#c9d6e8', '#3b3a2c', 0.9]} />
      <directionalLight position={[20, 30, 10]} intensity={1.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#2f3326" roughness={1} />
      </mesh>
      <Grid
        position={[0, 0.01, 0]}
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#3b4231"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#4d5640"
        fadeDistance={220}
        fadeStrength={1.2}
        infiniteGrid
      />

      <Truck />
      <Rack />

      {/* Four parked drones in the lower slots, boosters fitted. */}
      <ModelModeContext.Provider value={parkedMode}>
        {Array.from({ length: SLOTS - 1 }, (_, i) => (
          <group key={i} position={slotPosition(i)} rotation={[0, 0, RAIL_ANGLE]}>
            <Shahed136Model />
          </group>
        ))}
      </ModelModeContext.Provider>

      {/* The drone being launched, with its booster, flame and light. */}
      <group ref={drone}>
        <ModelModeContext.Provider value={launchedMode}>
          <Shahed136Model />
        </ModelModeContext.Provider>
        <group ref={boosterAttached} position={BOOSTER_MOUNT.position} rotation={[0, 0, BOOSTER_MOUNT.tilt]}>
          <ShahedBooster />
          <Flame flameRef={flame} />
          <pointLight ref={light} position={[-0.6, 0, 0]} color="#ffb060" intensity={0} distance={12} decay={1.5} />
        </group>
      </group>

      {/* The booster after it drops away. */}
      <group ref={boosterFree} visible={false}>
        <ShahedBooster />
      </group>

      <group>
        {puffs.map((p, i) => (
          <primitive key={i} object={p.mesh} />
        ))}
      </group>

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={3}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  );
}
