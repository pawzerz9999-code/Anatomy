import type { CSSProperties } from 'react';
import { CATEGORIES } from '../data/drones';
import { SYSTEM_BY_ID, SYSTEMS } from '../data/systems';
import { useStore } from '../state/store';
import type { DroneDef, PartDef, Spec } from '../types';
import { ChevronIcon, EyeIcon, FocusIcon } from './icons';

function SpecTable({ specs }: { specs: Spec[] }) {
  return (
    <dl className="specs">
      {specs.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PartInfo({ drone, part }: { drone: DroneDef; part: PartDef }) {
  const sys = SYSTEM_BY_ID[part.system];
  const hidden = useStore((s) => !!s.hiddenParts[part.id]);
  const isolatedId = useStore((s) => s.isolatedId);
  const { select, togglePart, isolate, focus } = useStore.getState();
  const index = drone.parts.indexOf(part);
  const prev = drone.parts[(index - 1 + drone.parts.length) % drone.parts.length];
  const next = drone.parts[(index + 1) % drone.parts.length];

  return (
    <article className="info part-info" style={{ '--sys': sys.color } as CSSProperties}>
      <nav className="info-nav">
        <button className="link" onClick={() => select(null)}>
          <ChevronIcon dir="left" /> {drone.name} overview
        </button>
        <span className="pager">
          <button className="icon-btn" aria-label={`Previous part: ${prev.name}`} onClick={() => select(prev.id)}>
            <ChevronIcon dir="left" />
          </button>
          {index + 1}/{drone.parts.length}
          <button className="icon-btn" aria-label={`Next part: ${next.name}`} onClick={() => select(next.id)}>
            <ChevronIcon dir="right" />
          </button>
        </span>
      </nav>
      <button className="system-chip" onClick={() => focus(part.system)} title={`X-ray focus on ${sys.name}`}>
        <span className="dot" /> {sys.name}
      </button>
      <h2>{part.name}</h2>
      <p className="lead">{part.summary}</p>
      <p>{part.details}</p>
      {part.funFact && (
        <aside className="fun-fact">
          <strong>Did you know?</strong> {part.funFact}
        </aside>
      )}
      {part.specs && <SpecTable specs={part.specs} />}
      <div className="actions">
        <button onClick={() => togglePart(part.id)}>
          <EyeIcon off={!hidden} /> {hidden ? 'Show' : 'Hide'}
        </button>
        <button onClick={() => isolate(isolatedId === part.id ? null : part.id)} aria-pressed={isolatedId === part.id}>
          {isolatedId === part.id ? 'Show everything' : 'Isolate'}
        </button>
        <button onClick={() => focus(part.system)}>
          <FocusIcon /> X-ray {sys.name.toLowerCase()}
        </button>
      </div>
    </article>
  );
}

function DroneOverview({ drone }: { drone: DroneDef }) {
  const category = CATEGORIES.find((c) => c.id === drone.category);
  const focus = useStore((s) => s.focus);
  const present = SYSTEMS.filter((s) => drone.parts.some((p) => p.system === s.id));
  return (
    <article className="info overview">
      {category && <span className="category">{category.name}</span>}
      <h2>{drone.name}</h2>
      {drone.aka && <p className="aka">Also known as {drone.aka}</p>}
      <p className="lead">{drone.tagline}</p>
      <p>{drone.overview}</p>
      <h3>Key facts</h3>
      <SpecTable specs={drone.specs} />
      <p className="note">Figures are approximate and based on public reporting.</p>
      <h3>Systems</h3>
      <ul className="system-list">
        {present.map((s) => (
          <li key={s.id} style={{ '--sys': s.color } as CSSProperties}>
            <button onClick={() => focus(s.id)}>
              <span className="dot" />
              <span>
                <strong>{s.name}</strong>
                <small>{s.description}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {drone.sections.map((sec) => (
        <details key={sec.title}>
          <summary>{sec.title}</summary>
          <p>{sec.body}</p>
        </details>
      ))}
      <aside className="how-to">
        <h3>How to explore</h3>
        <ul>
          <li><b>Drag</b> to spin · <b>scroll / pinch</b> to zoom · <b>right-drag</b> to pan</li>
          <li><b>X-ray lens</b>: move the pointer over the drone to look inside. <b>Shift + scroll</b> resizes it.</li>
          <li><b>Labels</b> names every part at once. <b>Explode</b> pulls it apart.</li>
          <li>Keys: <kbd>X</kbd> X-ray · <kbd>E</kbd> explode · <kbd>L</kbd> labels · <kbd>R</kbd> reset · <kbd>Esc</kbd> deselect</li>
        </ul>
      </aside>
    </article>
  );
}

export function InfoPanel({ drone }: { drone: DroneDef }) {
  const selectedId = useStore((s) => s.selectedId);
  const part = drone.parts.find((p) => p.id === selectedId);
  return part ? <PartInfo drone={drone} part={part} /> : <DroneOverview drone={drone} />;
}
