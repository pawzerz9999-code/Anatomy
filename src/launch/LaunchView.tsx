import { useRef, useState, type ComponentType } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../state/store';
import type { DroneDef } from '../types';
import { DroneContext } from '../viewer/Part';
import { LAUNCH_CAMERA, ShahedLaunchScene, type LaunchControl, type LaunchPhase } from './ShahedLaunch';

type LaunchSceneComponent = ComponentType<{ control: LaunchControl; onPhase: (p: LaunchPhase) => void }>;

/** Drones that have a launch scene. */
export const LAUNCH_SCENES: Record<string, LaunchSceneComponent> = {
  'shahed-136': ShahedLaunchScene,
};

export function hasLaunch(drone: DroneDef) {
  return !!drone.launch && !!LAUNCH_SCENES[drone.id];
}

/** The launch tab: the 3D scene, a caption for the current step and playback controls. */
export function LaunchView({ drone }: { drone: DroneDef }) {
  const Scene = LAUNCH_SCENES[drone.id];
  const control = useRef<LaunchControl>({ playing: false, t: 0, timeScale: 1, resetNonce: 0 });
  const phase = useStore((s) => s.launchPhase);
  const setPhase = useStore((s) => s.setLaunchPhase);
  const [started, setStarted] = useState(false);
  const [slow, setSlow] = useState(false);
  const step = drone.launch!.steps[phase];

  const launch = () => {
    control.current.playing = true;
    setStarted(true);
  };
  const reset = () => {
    control.current.playing = false;
    control.current.t = 0;
    control.current.resetNonce++;
    setStarted(false);
  };
  const toggleSlow = () => {
    control.current.timeScale = slow ? 1 : 0.35;
    setSlow(!slow);
  };

  return (
    <div className="launch-view">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: LAUNCH_CAMERA.position.toArray(), fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <DroneContext.Provider value={drone}>
          <Scene control={control.current} onPhase={setPhase} />
        </DroneContext.Provider>
      </Canvas>
      <div className="launch-caption" aria-live="polite">
        <span className="step-no">
          Step {phase + 1} of {drone.launch!.steps.length}
        </span>
        <strong>{step.title}</strong>
        <p>{step.body}</p>
      </div>
      <div className="toolbar launch-controls" role="toolbar" aria-label="Launch controls">
        <div className="group toggles">
          {!started ? (
            <button className="primary" onClick={launch}>
              ▶ Launch
            </button>
          ) : (
            <button onClick={reset}>↺ Back to the rack</button>
          )}
          <button aria-pressed={slow} onClick={toggleSlow}>
            Slow motion
          </button>
        </div>
      </div>
    </div>
  );
}

/** Left panel in the launch tab: the steps, with the current one highlighted. */
export function LaunchSteps({ drone }: { drone: DroneDef }) {
  const phase = useStore((s) => s.launchPhase);
  return (
    <div className="launch-steps">
      <h3>Launch sequence</h3>
      <ol>
        {drone.launch!.steps.map((s, i) => (
          <li key={s.title} className={i === phase ? 'current' : i < phase ? 'done' : ''}>
            <strong>{s.title}</strong>
            <span>{s.body}</span>
          </li>
        ))}
      </ol>
      <p className="note">
        The rail angle, timing and camera are illustrative. The steps follow public reporting.
      </p>
    </div>
  );
}

/** Right panel in the launch tab: the booster and the launch rack. */
export function LaunchInfo({ drone }: { drone: DroneDef }) {
  return (
    <article className="info overview">
      <span className="category">Launch</span>
      <h2>{drone.name} launch</h2>
      {drone.launch!.about.map((sec) => (
        <section key={sec.title}>
          <h3>{sec.title}</h3>
          <p>{sec.body}</p>
        </section>
      ))}
      <button className="guide-link" onClick={() => useStore.getState().openGuide('engines')}>
        Learn more: Engines & propulsion →
      </button>
    </article>
  );
}
