import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleGeometry, CatmullRomCurve3, CylinderGeometry, Group, TubeGeometry, Vector3 } from 'three';
import { useStore } from '../../state/store';
import { FlowLine } from '../../viewer/FlowLine';
import { ExplodeGroup, Part } from '../../viewer/Part';
import { damp } from '../../viewer/runtime';
import type { Vec3 } from '../../types';
import { horizontalPlate, lathe, profile, propBlade, smoothstep, verticalPlate } from '../geometry';

/*
 * A stylised Shahed-136 built from code, about 3.5 m long with a 2.5 m span.
 * Axes: X = forwards (nose at +X), Y = up, Z = right wing.
 * Every <Part id> matches an entry in src/data/drones/shahed136.ts.
 */

// ── Shell ───────────────────────────────────────────────────────────────
const R = 0.215; // body radius
const NOSE = lathe(profile(1.38, 1.78, (t) => 0.205 * Math.sqrt(1 - t * t), 24));
const FORWARD = lathe(profile(0.86, 1.38, (t) => R - 0.01 * t, 4));
const CENTER = lathe(profile(-0.62, 0.86, () => R, 2));
const REAR = lathe(profile(-1.32, -0.62, (t) => 0.115 + (R - 0.115) * smoothstep(t), 18));

const WING_Y = -0.03;
const WING = horizontalPlate(
  [
    [1.12, 0],
    [-0.42, 1.22],
    [-1.02, 1.22],
    [-1.02, 0.52],
    [-1.2, 0.52],
    [-1.2, -0.52],
    [-1.02, -0.52],
    [-1.02, -1.22],
    [-0.42, -1.22],
  ],
  { thickness: 0.04, bevel: 0.014 },
);
const FIN = verticalPlate(
  [
    [-0.4, 0],
    [-0.86, 0.36],
    [-1.1, 0.37],
    [-1.06, 0],
    [-1.1, -0.21],
    [-0.92, -0.21],
    [-0.62, -0.02],
  ],
  { thickness: 0.018, bevel: 0.008 },
);
const FIN_Z = 1.245;

// ── Propulsion ──────────────────────────────────────────────────────────
const SPINNER = lathe(profile(-1.56, -1.34, (t) => 0.1 * Math.sqrt(1 - (1 - t) * (1 - t)), 14));
const BLADE = propBlade({ root: 0.05, tip: 0.4, chord: 0.075, thickness: 0.014 });
const ENGINE_X = -0.95;
const CYLINDER_XS = [-0.9, -1.0];

/** A cylinder whose axis points along X (three.js cylinders point along Y by default). */
function xCylinder(radiusFront: number, radiusBack: number, length: number, segments = 24) {
  return new CylinderGeometry(radiusFront, radiusBack, length, segments).rotateZ(-Math.PI / 2);
}
/** A cylinder whose axis points along Z. */
function zCylinder(radius: number, length: number, segments = 20) {
  return new CylinderGeometry(radius, radius, length, segments).rotateX(Math.PI / 2);
}

const SHAFT = xCylinder(0.014, 0.014, 0.28);
const ENGINE_CYL = zCylinder(0.034, 0.075);
const ENGINE_FIN = zCylinder(0.046, 0.006);
const ENGINE_HEAD = zCylinder(0.038, 0.016);

const EXHAUST = new TubeGeometry(
  new CatmullRomCurve3(
    ([
      [-0.93, -0.05, -0.06],
      [-0.97, -0.13, -0.08],
      [-1.08, -0.19, -0.08],
      [-1.28, -0.2, -0.07],
    ] as Vec3[]).map((p) => new Vector3(...p)),
  ),
  48,
  0.016,
  12,
  false,
);
const EXHAUST_TIP = xCylinder(0.022, 0.022, 0.04, 16);

const BOOSTER_BODY = xCylinder(0.07, 0.07, 0.6, 28);
const BOOSTER_NOSE = lathe(profile(0.3, 0.4, (t) => 0.07 * Math.sqrt(1 - t * t), 10), 28);
const BOOSTER_NOZZLE = xCylinder(0.05, 0.068, 0.1, 24);

// ── Fuel system ─────────────────────────────────────────────────────────
const TANK = new CapsuleGeometry(0.16, 0.68, 8, 32).rotateZ(Math.PI / 2);
const FUEL_PATH: Vec3[] = [
  [-0.4, -0.135, 0.03],
  [-0.5, -0.15, 0.05],
  [-0.6, -0.15, 0.06],
  [-0.72, -0.13, 0.07],
  [-0.82, -0.1, 0.07],
  [-0.87, -0.06, 0.05],
];
const FILTER = xCylinder(0.024, 0.024, 0.06, 20);
const PUMP = xCylinder(0.03, 0.03, 0.07, 20);

// ── Payload ─────────────────────────────────────────────────────────────
// Shown only as a plain block: no internal detail.
const WARHEAD = lathe(
  [
    [0.9, 0],
    [0.9, 0.17],
    [1.3, 0.17],
    [1.4, 0.13],
    [1.45, 0],
  ],
  40,
);

// ── Materials (colours) ─────────────────────────────────────────────────
const SKIN = '#a4adb7';
const SKIN_DARK = '#8f99a4';
const METAL = '#5b6470';
const DARK_METAL = '#3a414b';

function Skin({ color = SKIN }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />;
}

function Mat({ color, rough = 0.5, metal = 0.3 }: { color: string; rough?: number; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} />;
}

/** Spins the propeller when "spin propeller" is on. */
function SpinningProp({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const speed = useRef(0);
  useFrame((_, dt) => {
    speed.current = damp(speed.current, useStore.getState().spinProp ? 16 : 0, 2, dt);
    if (ref.current) ref.current.rotation.x += speed.current * dt;
  });
  return <group ref={ref}>{children}</group>;
}

const FLIGHT_CONTROL_PARTS = new Set(['elevons', 'servos', 'flight-computer']);

/** Elevon hinge: wiggles the flap to show how it moves when flight control is in focus. */
function ElevonHinge({ side, children }: { side: 1 | -1; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const amount = useRef(0);
  useFrame((state, dt) => {
    const s = useStore.getState();
    const active =
      s.focusSystem === 'flight-control' ||
      FLIGHT_CONTROL_PARTS.has(s.selectedId ?? '') ||
      FLIGHT_CONTROL_PARTS.has(s.hoveredId ?? '');
    amount.current = damp(amount.current, active ? 1 : 0, 4, dt);
    // Opposite deflection left/right = roll; this is how the drone banks into a turn.
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.2) * 0.32 * side * amount.current;
  });
  return <group ref={ref}>{children}</group>;
}

export function Shahed136Model() {
  return (
    <group>
      {/* ── Airframe ─────────────────────────────── */}
      <Part id="nose-cone">
        <mesh geometry={NOSE}>
          <Skin />
        </mesh>
      </Part>
      <Part id="forward-fuselage">
        <mesh geometry={FORWARD}>
          <Skin />
        </mesh>
      </Part>
      <Part id="center-fuselage">
        <mesh geometry={CENTER}>
          <Skin />
        </mesh>
      </Part>
      <Part id="rear-fuselage">
        <mesh geometry={REAR}>
          <Skin color={SKIN_DARK} />
        </mesh>
      </Part>
      <Part id="wing">
        <mesh geometry={WING} position={[0, WING_Y, 0]}>
          <Skin />
        </mesh>
      </Part>
      <Part id="wingtip-fins">
        {([1, -1] as const).map((side) => (
          <ExplodeGroup key={side} offset={[0, 0, 0.35 * side]} position={[0, WING_Y, FIN_Z * side]}>
            <mesh geometry={FIN}>
              <Skin color={SKIN_DARK} />
            </mesh>
          </ExplodeGroup>
        ))}
      </Part>

      {/* ── Propulsion ───────────────────────────── */}
      <Part id="engine">
        <group position={[ENGINE_X, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.26, 0.11, 0.11]} />
            <Mat color={DARK_METAL} rough={0.45} metal={0.6} />
          </mesh>
          {CYLINDER_XS.map((cx) =>
            ([1, -1] as const).map((side) => (
              <group key={`${cx}${side}`} position={[cx - ENGINE_X, 0, 0]}>
                <mesh geometry={ENGINE_CYL} position={[0, 0, 0.093 * side]}>
                  <Mat color={METAL} rough={0.4} metal={0.7} />
                </mesh>
                {[0.075, 0.095, 0.115].map((z) => (
                  <mesh key={z} geometry={ENGINE_FIN} position={[0, 0, z * side]}>
                    <Mat color={METAL} rough={0.4} metal={0.7} />
                  </mesh>
                ))}
                <mesh geometry={ENGINE_HEAD} position={[0, 0, 0.138 * side]}>
                  <Mat color="#9ca3af" rough={0.35} metal={0.8} />
                </mesh>
              </group>
            )),
          )}
        </group>
        <mesh geometry={SHAFT} position={[-1.22, 0, 0]}>
          <Mat color="#c0c6cd" rough={0.25} metal={0.9} />
        </mesh>
      </Part>

      <Part id="propeller">
        <group position={[-1.42, 0, 0]}>
          <SpinningProp>
            <mesh geometry={SPINNER} position={[1.42, 0, 0]} userData={{ anchor: true }}>
              <Mat color="#d1d5db" rough={0.4} metal={0.3} />
            </mesh>
            <mesh geometry={BLADE}>
              <Mat color="#2b2f36" rough={0.55} metal={0.1} />
            </mesh>
            <mesh geometry={BLADE} rotation={[Math.PI, 0, 0]}>
              <Mat color="#2b2f36" rough={0.55} metal={0.1} />
            </mesh>
          </SpinningProp>
        </group>
      </Part>

      <Part id="exhaust">
        <mesh geometry={EXHAUST}>
          <Mat color="#6b5b4f" rough={0.6} metal={0.6} />
        </mesh>
        <mesh geometry={EXHAUST_TIP} position={[-1.29, -0.2, -0.07]}>
          <Mat color="#3f3833" rough={0.6} metal={0.6} />
        </mesh>
      </Part>

      <Part id="booster">
        <group position={[-0.68, -0.37, 0]} rotation={[0, 0, 0.12]}>
          <mesh geometry={BOOSTER_BODY}>
            <Mat color="#7b838d" rough={0.6} metal={0.3} />
          </mesh>
          <mesh geometry={BOOSTER_NOSE}>
            <Mat color="#7b838d" rough={0.6} metal={0.3} />
          </mesh>
          <mesh geometry={BOOSTER_NOZZLE} position={[-0.35, 0, 0]}>
            <Mat color={DARK_METAL} rough={0.5} metal={0.7} />
          </mesh>
          <mesh position={[0.14, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.071, 0.006, 8, 32]} />
            <Mat color="#f59e0b" rough={0.5} metal={0.2} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.22, 0.1, 0.04]} />
            <Mat color={METAL} rough={0.5} metal={0.5} />
          </mesh>
        </group>
      </Part>

      {/* ── Fuel system ──────────────────────────── */}
      <Part id="fuel-tank">
        <mesh geometry={TANK}>
          <Mat color="#c79a2e" rough={0.45} metal={0.35} />
        </mesh>
      </Part>
      <Part id="filler-cap">
        <mesh position={[0.18, 0.185, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.07, 16]} />
          <Mat color={METAL} rough={0.4} metal={0.7} />
        </mesh>
        <mesh position={[0.18, 0.226, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.022, 24]} />
          <Mat color="#e0b73a" rough={0.35} metal={0.5} />
        </mesh>
      </Part>
      <Part id="fuel-filter">
        <mesh geometry={FILTER} position={[-0.6, -0.15, 0.06]}>
          <Mat color="#d8c27a" rough={0.5} metal={0.2} />
        </mesh>
      </Part>
      <Part id="fuel-pump">
        <mesh geometry={PUMP} position={[-0.72, -0.13, 0.07]}>
          <Mat color={METAL} rough={0.4} metal={0.7} />
        </mesh>
        <mesh position={[-0.72, -0.09, 0.07]}>
          <boxGeometry args={[0.045, 0.03, 0.035]} />
          <Mat color="#b88a1f" rough={0.5} metal={0.3} />
        </mesh>
      </Part>
      <Part id="fuel-lines">
        <FlowLine points={FUEL_PATH} radius={0.012} color="#d4a72c" flowColor="#fef08a" system="fuel" />
      </Part>

      {/* ── Flight control ───────────────────────── */}
      <Part id="elevons">
        {([1, -1] as const).map((side) => (
          <ExplodeGroup key={side} offset={[0, 0, 0.25 * side]} position={[-1.04, WING_Y, 0.87 * side]}>
            <ElevonHinge side={side}>
              <mesh position={[-0.078, 0, 0]}>
                <boxGeometry args={[0.155, 0.026, 0.66]} />
                <Mat color="#8a939e" rough={0.65} metal={0.1} />
              </mesh>
            </ElevonHinge>
          </ExplodeGroup>
        ))}
      </Part>
      <Part id="servos">
        {([1, -1] as const).map((side) => (
          <ExplodeGroup key={side} offset={[0, 0, 0.2 * side]} position={[-0.95, WING_Y, 0.8 * side]}>
            <mesh>
              <boxGeometry args={[0.07, 0.03, 0.045]} />
              <Mat color="#155e63" rough={0.5} metal={0.2} />
            </mesh>
            <mesh position={[-0.06, 0.008, 0.02 * side]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.004, 0.004, 0.09, 8]} />
              <Mat color="#d1d5db" rough={0.3} metal={0.9} />
            </mesh>
          </ExplodeGroup>
        ))}
      </Part>
      <Part id="flight-computer">
        <group position={[0.7, 0.095, 0]}>
          <mesh>
            <boxGeometry args={[0.16, 0.05, 0.2]} />
            <Mat color="#12524d" rough={0.5} metal={0.3} />
          </mesh>
          {[-0.06, -0.02, 0.02, 0.06].map((z) => (
            <mesh key={z} position={[0, 0.032, z]}>
              <boxGeometry args={[0.13, 0.014, 0.008]} />
              <Mat color="#9ca3af" rough={0.35} metal={0.8} />
            </mesh>
          ))}
          <mesh position={[-0.085, 0, 0.05]}>
            <boxGeometry args={[0.012, 0.024, 0.05]} />
            <Mat color="#e5e7eb" rough={0.4} metal={0.3} />
          </mesh>
        </group>
      </Part>

      {/* ── Navigation ───────────────────────────── */}
      <Part id="gnss-antenna">
        <group position={[-0.38, R, 0]}>
          <mesh position={[0, 0.006, 0]}>
            <cylinderGeometry args={[0.07, 0.074, 0.014, 32]} />
            <Mat color="#cfd6dd" rough={0.5} metal={0.2} />
          </mesh>
          <mesh position={[0, 0.012, 0]} scale={[1, 0.38, 1]}>
            <sphereGeometry args={[0.058, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color="#eef2f5" rough={0.35} metal={0.1} />
          </mesh>
        </group>
      </Part>
      <Part id="ins">
        <group position={[0.77, -0.075, 0.06]}>
          <mesh>
            <boxGeometry args={[0.08, 0.07, 0.08]} />
            <Mat color="#1e3a5f" rough={0.45} metal={0.4} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 20]} />
            <Mat color="#93c5fd" rough={0.3} metal={0.5} />
          </mesh>
        </group>
      </Part>

      {/* ── Power ────────────────────────────────── */}
      <Part id="generator">
        <mesh position={[-0.77, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.07, 28]} />
          <Mat color="#4c3f7a" rough={0.45} metal={0.5} />
        </mesh>
        <mesh position={[-0.73, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.012, 24]} />
          <Mat color="#c0c6cd" rough={0.3} metal={0.9} />
        </mesh>
      </Part>
      <Part id="battery">
        <group position={[0.62, -0.075, -0.05]}>
          <mesh>
            <boxGeometry args={[0.13, 0.07, 0.1]} />
            <Mat color="#3b3363" rough={0.55} metal={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.051]}>
            <boxGeometry args={[0.1, 0.02, 0.002]} />
            <Mat color="#c4b5fd" rough={0.5} metal={0.1} />
          </mesh>
        </group>
      </Part>

      {/* ── Payload ──────────────────────────────── */}
      <Part id="warhead">
        <mesh geometry={WARHEAD}>
          <Mat color="#7f3b3b" rough={0.6} metal={0.25} />
        </mesh>
      </Part>
    </group>
  );
}
