import { useContext, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { CylinderGeometry, Group } from 'three';
import { useStore } from '../../state/store';
import { ExplodeGroup, ModelModeContext, Part } from '../../viewer/Part';
import { damp } from '../../viewer/runtime';
import { lathe, profile, propBlade } from '../geometry';

/*
 * A stylised high-speed interceptor quad, built from code. These drones take off
 * standing on their tail, then fly nose-first with four motors pulling forward.
 * Axes: X = forwards (nose at +X), Y = up, Z = right. Sizes in metres.
 * Part ids match `interceptorParts()` in src/data/drones/interceptors.ts.
 */

export interface InterceptorSpec {
  /** Body length and radius. */
  length: number;
  radius: number;
  /** Rounded "bullet" nose, or a long pointed "rocket" nose. */
  nose: 'bullet' | 'rocket';
  /** X position of the motor arms, and how far the motors sit from the body axis. */
  armX: number;
  armReach: number;
  propRadius: number;
  blades: 2 | 3;
  bodyColor: string;
  accentColor: string;
  /** X positions of seams between swappable body modules. */
  seams?: number[];
  aiModule?: boolean;
}

export const STING_SPEC: InterceptorSpec = {
  length: 0.42,
  radius: 0.05,
  nose: 'bullet',
  armX: -0.12,
  armReach: 0.125,
  propRadius: 0.064,
  blades: 3,
  bodyColor: '#3b4036',
  accentColor: '#d4d4a8',
};

export const P1_SUN_SPEC: InterceptorSpec = {
  length: 0.44,
  radius: 0.052,
  nose: 'bullet',
  armX: -0.13,
  armReach: 0.128,
  propRadius: 0.064,
  blades: 3,
  bodyColor: '#b3a078',
  accentColor: '#3f3a30',
  seams: [0.09, -0.06],
  aiModule: true,
};

export const STRILA_SPEC: InterceptorSpec = {
  length: 0.62,
  radius: 0.045,
  nose: 'rocket',
  armX: -0.2,
  armReach: 0.125,
  propRadius: 0.066,
  blades: 2,
  bodyColor: '#2f3640',
  accentColor: '#f97316',
};

/** Arms in an X, seen from behind: 45°, 135°, 225°, 315°. */
const ARM_ANGLES = [45, 135, 225, 315].map((d) => (d * Math.PI) / 180);

function Mat({ color, rough = 0.5, metal = 0.3 }: { color: string; rough?: number; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} />;
}

/** Spins a propeller around the X axis (direction alternates between neighbours). */
function Spin({ dir, children }: { dir: 1 | -1; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const speed = useRef(0);
  const mode = useContext(ModelModeContext);
  useFrame((_, dt) => {
    const target = mode.propSpeed ? mode.propSpeed() : useStore.getState().spinProp ? 30 : 0;
    speed.current = damp(speed.current, target, 2, dt);
    if (ref.current) ref.current.rotation.x += speed.current * dir * dt;
  });
  return <group ref={ref}>{children}</group>;
}

export function InterceptorModel({ spec }: { spec: InterceptorSpec }) {
  const { length: L, radius: R, armX, armReach, propRadius } = spec;
  const geo = useMemo(() => {
    const tail = -L / 2;
    const noseStart = spec.nose === 'bullet' ? L / 2 - R * 1.3 : L / 2 - R * 3.2;
    const body = lathe(
      [
        [tail, R * 0.45],
        ...profile(tail + 0.005, tail + 0.05, (t) => R * (0.55 + 0.45 * Math.sin((t * Math.PI) / 2)), 6),
        [noseStart, R],
        ...profile(
          noseStart,
          L / 2,
          spec.nose === 'bullet'
            ? (t) => R * Math.sqrt(Math.max(0, 1 - t * t))
            : (t) => R * Math.pow(Math.max(0, 1 - Math.pow(t, 1.6)), 0.75),
          16,
        ).slice(1),
      ],
      40,
    );
    const blade = propBlade({ root: 0.008, tip: propRadius, chord: 0.02, thickness: 0.003 });
    const motor = new CylinderGeometry(0.02, 0.02, 0.03, 24).rotateZ(-Math.PI / 2);
    const hub = new CylinderGeometry(0.007, 0.009, 0.014, 16).rotateZ(-Math.PI / 2);
    return { body, blade, motor, hub, tail, noseStart };
  }, [L, R, propRadius, spec.nose]);

  const propX = armX + 0.024;
  const motorPos = (a: number): [number, number, number] => [armX, armReach * Math.cos(a), armReach * Math.sin(a)];

  return (
    <group>
      {/* ── Airframe ─────────────────────────────── */}
      <Part id="body">
        <mesh geometry={geo.body}>
          <meshStandardMaterial color={spec.bodyColor} roughness={0.8} metalness={0.05} />
        </mesh>
        {spec.seams?.map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[R * 1.005, 0.0022, 6, 40]} />
            <meshStandardMaterial color={spec.accentColor} roughness={0.8} metalness={0.05} />
          </mesh>
        ))}
      </Part>
      <Part id="arms">
        {ARM_ANGLES.map((a) => (
          <group key={a} position={[armX, 0, 0]} rotation={[a, 0, 0]}>
            {/* rotation about X turns local +Y towards this arm's direction */}
            <mesh position={[0, (R * 0.8 + armReach) / 2, 0]}>
              <boxGeometry args={[0.012, armReach - R * 0.8, 0.02]} />
              <Mat color="#1f2328" rough={0.6} metal={0.2} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Propulsion ───────────────────────────── */}
      <Part id="motors">
        {ARM_ANGLES.map((a) => (
          <mesh key={a} geometry={geo.motor} position={motorPos(a)}>
            <Mat color="#9aa1a9" rough={0.35} metal={0.8} />
          </mesh>
        ))}
      </Part>
      <Part id="propellers">
        {ARM_ANGLES.map((a, i) => (
          <group key={a} position={[propX, armReach * Math.cos(a), armReach * Math.sin(a)]}>
            <mesh geometry={geo.hub} userData={{ anchor: i === 0 }}>
              <Mat color="#d1d5db" rough={0.4} metal={0.6} />
            </mesh>
            <Spin dir={i % 2 === 0 ? 1 : -1}>
              {Array.from({ length: spec.blades }, (_, b) => (
                <mesh key={b} geometry={geo.blade} rotation={[(b * 2 * Math.PI) / spec.blades, 0, 0]}>
                  <Mat color="#111418" rough={0.5} metal={0.1} />
                </mesh>
              ))}
            </Spin>
          </group>
        ))}
      </Part>
      <Part id="esc">
        <mesh position={[armX - 0.012, 0, 0]}>
          <boxGeometry args={[0.005, 0.036, 0.036]} />
          <Mat color="#1d4ed8" rough={0.5} metal={0.2} />
        </mesh>
      </Part>

      {/* ── Power ────────────────────────────────── */}
      <Part id="battery">
        <mesh position={[armX + 0.1, -0.004, 0]}>
          <boxGeometry args={[0.13, 0.05, 0.05]} />
          <Mat color="#374151" rough={0.6} metal={0.2} />
        </mesh>
      </Part>

      {/* ── Flight control ───────────────────────── */}
      <Part id="flight-controller">
        <mesh position={[armX + 0.012, 0, 0]}>
          <boxGeometry args={[0.005, 0.036, 0.036]} />
          <Mat color="#15803d" rough={0.5} metal={0.2} />
        </mesh>
        {[-0.013, 0.013].map((y) =>
          [-0.013, 0.013].map((z) => (
            <mesh key={`${y}${z}`} position={[armX, y, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.002, 0.002, 0.024, 6]} />
              <Mat color="#d4d4d8" rough={0.3} metal={0.9} />
            </mesh>
          )),
        )}
      </Part>
      {spec.aiModule && (
        <Part id="ai-module">
          <mesh position={[geo.noseStart - 0.1, -0.03, 0]}>
            <boxGeometry args={[0.05, 0.012, 0.04]} />
            <Mat color="#7c3aed" rough={0.5} metal={0.3} />
          </mesh>
        </Part>
      )}

      {/* ── Cameras & radio ──────────────────────── */}
      <Part id="camera">
        <group position={[L / 2 - 0.012, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.022, 0.03, 24]} />
            <Mat color="#111827" rough={0.4} metal={0.5} />
          </mesh>
          <mesh position={[0.016, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.004, 24]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.1} metalness={0.9} emissive="#1d4ed8" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </Part>
      <Part id="vtx">
        <mesh position={[geo.noseStart - 0.06, 0.028, 0]}>
          <boxGeometry args={[0.03, 0.012, 0.028]} />
          <Mat color="#be185d" rough={0.5} metal={0.3} />
        </mesh>
        {/* stubby video antenna out of the tail */}
        <mesh position={[geo.tail - 0.02, 0.018, 0]} rotation={[0, 0, Math.PI / 2 - 0.4]}>
          <cylinderGeometry args={[0.004, 0.004, 0.05, 8]} />
          <Mat color="#111827" rough={0.6} metal={0.1} />
        </mesh>
      </Part>
      <Part id="receiver">
        <mesh position={[geo.tail + 0.035, 0, 0]}>
          <boxGeometry args={[0.02, 0.012, 0.02]} />
          <Mat color="#9d174d" rough={0.5} metal={0.3} />
        </mesh>
        {/* two thin whip antennas in a V out of the tail */}
        {([1, -1] as const).map((side) => (
          <ExplodeGroup key={side} offset={[0, 0, 0.02 * side]} position={[geo.tail - 0.03, -0.01, 0.018 * side]}>
            <mesh rotation={[0.5 * side, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.0015, 0.0015, 0.07, 6]} />
              <Mat color={spec.accentColor} rough={0.5} metal={0.1} />
            </mesh>
          </ExplodeGroup>
        ))}
      </Part>

      {/* ── Payload ──────────────────────────────── */}
      {/* Shown only as a plain block: no internal detail. */}
      <Part id="payload">
        <mesh position={[geo.noseStart - 0.035, -0.004, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[R * 0.72, R * 0.72, 0.06, 28]} />
          <Mat color="#7f3b3b" rough={0.6} metal={0.25} />
        </mesh>
      </Part>
    </group>
  );
}
