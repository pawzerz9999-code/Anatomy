import type { CSSProperties } from 'react';
import { SYSTEM_BY_ID } from '../data/systems';
import { useFactory } from '../factory/store';
import { scheduleFor } from '../factory/timeline';
import { useStore } from '../state/store';
import type { DroneDef } from '../types';

/** The info panel in the Factory tab: the stations, how fast it is made, and sources. */
export function FactoryPanel({ drone }: { drone: DroneDef }) {
  const phase = useFactory((s) => s.phase);
  const hoveredId = useStore((s) => s.hoveredId);
  const { seek, setPlaying } = useFactory.getState();
  const { hover } = useStore.getState();
  const assembly = drone.assembly;
  if (!assembly) return <article className="info">No factory view yet for {drone.name}.</article>;
  const schedule = scheduleFor(assembly);
  const partName = (id: string) => drone.parts.find((p) => p.id === id)?.name ?? id;

  return (
    <article className="info factory-info">
      <span className="category factory-tag">Factory</span>
      <h2>How it's put together</h2>
      <p className="lead">
        Watch a {drone.name} come together on an assembly line, sped up like a time-lapse. Each part glows in its
        system's colour as it clicks into place.
      </p>
      <p className="note">
        The order is simplified for teaching: it shows how the parts fit together, not the real factory's process.
      </p>

      <h3>The line</h3>
      <ol className="station-list">
        {schedule.phases.map((p, i) => {
          const station = p.kind === 'station' ? assembly.stations[i] : undefined;
          return (
            <li key={i} className={i === phase ? 'current' : i < phase ? 'done' : ''}>
              <button className="station-head" onClick={() => seek(p.start)} aria-current={i === phase ? 'step' : undefined}>
                <span className="num">{station ? i + 1 : p.kind === 'check' ? '✓' : '→'}</span>
                <span>
                  <strong>{p.title}</strong>
                  <small>{p.body}</small>
                </span>
              </button>
              {station && (
                <ul className="part-chips">
                  {station.parts.map((id) => {
                    const part = drone.parts.find((q) => q.id === id);
                    const slot = schedule.byId.get(id);
                    return (
                      <li key={id} style={{ '--sys': part ? SYSTEM_BY_ID[part.system].color : undefined } as CSSProperties}>
                        <button
                          className={hoveredId === id ? 'active' : ''}
                          title="Watch this part go in"
                          onPointerEnter={() => hover(id)}
                          onPointerLeave={() => hover(null)}
                          onClick={() => {
                            if (!slot) return;
                            seek(slot.start - 0.1);
                            setPlaying(true);
                          }}
                        >
                          <span className="dot" />
                          {partName(id)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      {assembly.notFitted?.map((n) => (
        <p key={n.id} className="note not-fitted">
          <strong>Not fitted here: {partName(n.id)}.</strong> {n.note}
        </p>
      ))}

      <h3>How fast are they made?</h3>
      <div className="stat-tiles">
        {assembly.stats.map((s) => (
          <div key={s.label} className="stat">
            <strong className="stat-value">{s.value}</strong>
            <span>
              <span className="stat-label">{s.label}</span>
              <small>{s.note}</small>
            </span>
          </div>
        ))}
      </div>
      <p className="note">Figures are estimates from public reporting.</p>

      {assembly.facts.map((sec) => (
        <details key={sec.title}>
          <summary>{sec.title}</summary>
          <p>{sec.body}</p>
        </details>
      ))}

      <h3>Sources</h3>
      <ul className="sources">
        {assembly.sources.map((src) => (
          <li key={src.url}>
            <a href={src.url} target="_blank" rel="noopener noreferrer">
              {src.title}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
