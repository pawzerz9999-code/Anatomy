import type { CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import { SYSTEM_BY_ID } from '../data/systems';
import { MODELS } from '../models';
import type { DroneDef } from '../types';
import { PauseIcon, PlayIcon, ResetIcon } from '../ui/icons';
import { FACTORY_CAMERA, FactoryScene } from './FactoryScene';
import { factoryHud, SPEEDS, useFactory } from './store';
import { scheduleFor, type Schedule } from './timeline';

/** The Factory tab: the drone built station by station on an assembly line, as a time-lapse. */
export function FactoryView({ drone }: { drone: DroneDef }) {
  const Model = MODELS[drone.id];
  if (!drone.assembly || !Model) return <div className="realistic empty">No factory view yet for {drone.name}.</div>;
  const schedule = scheduleFor(drone.assembly);
  return (
    <div className="factory">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: FACTORY_CAMERA.position, fov: 40, near: 0.05, far: 100 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <FactoryScene drone={drone} schedule={schedule} Model={Model} />
      </Canvas>
      <FactoryHud drone={drone} schedule={schedule} />
    </div>
  );
}

function FactoryHud({ drone, schedule }: { drone: DroneDef; schedule: Schedule }) {
  const phase = useFactory((s) => s.phase);
  const playing = useFactory((s) => s.playing);
  const speed = useFactory((s) => s.speed);
  const built = useFactory((s) => s.built);
  const { setPlaying, setSpeed, seek } = useFactory.getState();
  const stations = drone.assembly!.stations;
  const current = schedule.phases[phase];
  const parts =
    current.kind === 'station'
      ? stations[phase].parts.flatMap((id) => drone.parts.find((p) => p.id === id) ?? [])
      : [];
  const kicker =
    current.kind === 'station' ? `Station ${phase + 1} of ${stations.length}` : current.kind === 'check' ? 'Quality check' : 'Next one';

  return (
    <>
      <div className="station-card">
        <span className="kicker">{kicker}</span>
        <strong className="station-title">{current.title}</strong>
        <p>{current.body}</p>
        {parts.length > 0 && (
          <ul className="fitting">
            {parts.map((p) => (
              <li key={p.id} style={{ '--sys': SYSTEM_BY_ID[p.system].color } as CSSProperties}>
                <span className="dot" />
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="built-card">
        <span>
          Built<span className="long"> while you watched</span>
        </span>
        <strong data-testid="built-count">{built}</strong>
      </div>

      <div className="factory-controls" role="toolbar" aria-label="Factory controls">
        <div className="group">
          <button
            className="play"
            aria-label={playing ? 'Pause' : 'Play'}
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="icon-btn" aria-label="Start this drone again" title="Start this drone again" onClick={() => seek(0)}>
            <ResetIcon />
          </button>
        </div>
        <ol className="line-progress" aria-label="Assembly line">
          {schedule.phases.map((p, i) => (
            <li key={i} style={{ flexGrow: p.end - p.start }}>
              <button
                className={i === phase ? 'current' : ''}
                aria-current={i === phase ? 'step' : undefined}
                aria-label={p.kind === 'station' ? `Go to station ${i + 1}: ${p.title}` : `Go to: ${p.title}`}
                title={p.title}
                onClick={() => seek(p.start)}
              >
                <span
                  className="fill"
                  ref={(el) => {
                    factoryHud.fills[i] = el;
                  }}
                />
              </button>
            </li>
          ))}
        </ol>
        <div className="group">
          <span className="group-label">Speed</span>
          <div className="segmented" role="radiogroup" aria-label="Speed">
            {SPEEDS.map((s) => (
              <button key={s} role="radio" aria-checked={speed === s} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
