import type { CSSProperties, ReactNode } from 'react';
import { CATEGORIES } from '../data/drones';
import { SYSTEM_BY_ID, SYSTEMS } from '../data/systems';
import { useStore } from '../state/store';
import type { DroneDef, PartDef, Spec } from '../types';
import { BulbIcon, CheckIcon, ChevronIcon, EyeIcon, FocusIcon, InfoIcon, IsolateIcon } from './icons';

/** "≈ 185 km/h" → a small "≈", a big "185" and a small "km/h", so tiles stay on one line. */
function Value({ value }: { value: string }) {
  const approx = value.startsWith('≈');
  const rest = approx ? value.slice(1).trim() : value;
  const m = /^([\d.,]+) (\S+)$/.exec(rest);
  return (
    <>
      {approx && (
        <small className="approx" title="Approximate">
          ≈
        </small>
      )}
      {m ? (
        <>
          {m[1]}
          <small className="unit">{m[2]}</small>
        </>
      ) : (
        rest
      )}
    </>
  );
}

/** Specs as a grid of tiles: the value big, its label small underneath (CSS swaps the order). */
function Tiles({ specs, big = false }: { specs: Spec[]; big?: boolean }) {
  return (
    <dl className={`tiles${big ? ' big' : ''}`}>
      {specs.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd>
            <Value value={s.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

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

function More({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details>
      <summary>
        {title}
        <ChevronIcon />
      </summary>
      <div className="more-body">{children}</div>
    </details>
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
  const isolated = isolatedId === part.id;

  return (
    <article className="info part-info" style={{ '--sys': sys.color } as CSSProperties}>
      <nav className="info-nav">
        <button className="link" onClick={() => select(null)}>
          <ChevronIcon dir="left" /> {drone.name}
        </button>
        <span className="pager">
          <button className="icon-btn" aria-label={`Previous part: ${prev.name}`} title={prev.name} onClick={() => select(prev.id)}>
            <ChevronIcon dir="left" />
          </button>
          {index + 1} / {drone.parts.length}
          <button className="icon-btn" aria-label={`Next part: ${next.name}`} title={next.name} onClick={() => select(next.id)}>
            <ChevronIcon dir="right" />
          </button>
        </span>
      </nav>
      <div className="badges">
        <button className="system-chip" onClick={() => focus(part.system)} title={`X-ray the ${sys.name.toLowerCase()}`}>
          <span className="dot" /> {sys.name}
        </button>
        {part.evidence === 'reported' ? (
          <span className="evidence reported" title="This part is described in public reporting or teardowns">
            <CheckIcon /> Documented
          </span>
        ) : (
          <span className="evidence typical" title="The exact design has not been published, so this shows a typical example">
            <InfoIcon /> Typical example
          </span>
        )}
      </div>
      <h2>{part.name}</h2>
      <p className="lead">{part.summary}</p>
      {part.specs && <Tiles specs={part.specs} />}
      {part.funFact && (
        <aside className="fun-fact">
          <BulbIcon />
          <p>{part.funFact}</p>
        </aside>
      )}
      <div className="actions">
        <button onClick={() => togglePart(part.id)} title={hidden ? 'Show this part' : 'Hide this part'}>
          <EyeIcon off={!hidden} /> {hidden ? 'Show' : 'Hide'}
        </button>
        <button onClick={() => isolate(isolated ? null : part.id)} aria-pressed={isolated} title="Show only this part">
          <IsolateIcon /> {isolated ? 'Show all' : 'Only this'}
        </button>
        <button onClick={() => focus(part.system)} title={`X-ray the ${sys.name.toLowerCase()}`}>
          <FocusIcon /> X-ray system
        </button>
      </div>
      <div className="more">
        <More title="How it works">
          <p>{part.details}</p>
          {part.madeOf && (
            <p className="made-of">
              <strong>Made of:</strong> {part.madeOf}
            </p>
          )}
        </More>
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
      <p className="lead">{drone.tagline}</p>
      {drone.aka && <p className="aka">Also called {drone.aka}</p>}
      <Tiles specs={drone.stats} big />
      <p className="note">≈ approximate, from public reports</p>

      {/* On phones the parts list is far below, so offer the systems here too. */}
      <div className="system-grid-wrap">
        <h3>Tap a system to X-ray it</h3>
        <ul className="system-grid">
          {present.map((s) => (
            <li key={s.id} style={{ '--sys': s.color } as CSSProperties}>
              <button onClick={() => focus(s.id)} title={s.description}>
                <span className="dot" />
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <h3>Learn more</h3>
      <div className="more">
        <More title={`About the ${drone.name}`}>
          <p>{drone.overview}</p>
        </More>
        {[...drone.sections, ...(drone.variants ? [drone.variants] : [])].map((sec) => (
          <More key={sec.title} title={sec.title}>
            <p>{sec.body}</p>
          </More>
        ))}
        <More title="All key facts">
          <SpecTable specs={drone.specs} />
        </More>
        <More title="Sources">
          <ul className="sources">
            {drone.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="note">
            Each part is marked <b>Documented</b> (described in public reporting) or <b>Typical example</b> (the exact
            design has not been published).
          </p>
        </More>
      </div>
    </article>
  );
}

export function InfoPanel({ drone }: { drone: DroneDef }) {
  const selectedId = useStore((s) => s.selectedId);
  const part = drone.parts.find((p) => p.id === selectedId);
  return part ? <PartInfo drone={drone} part={part} /> : <DroneOverview drone={drone} />;
}
