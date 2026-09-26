import { GUIDES, GUIDE_BY_ID } from '../data/guides';
import { useStore } from '../state/store';
import { CloseIcon } from './icons';

/** Learn guides that apply across drones: airframe materials & radar, engines & propulsion. */
export function GuidesModal() {
  const guideId = useStore((s) => s.guide);
  const openGuide = useStore((s) => s.openGuide);
  if (!guideId) return null;
  const guide = GUIDE_BY_ID[guideId];
  return (
    <div className="modal-backdrop" onClick={() => openGuide(null)}>
      <div className="modal guide" role="dialog" aria-modal="true" aria-label={guide.title} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Learn</h2>
          <button className="icon-btn" aria-label="Close guide" onClick={() => openGuide(null)}>
            <CloseIcon />
          </button>
        </header>
        <div className="chips" role="tablist" aria-label="Guides">
          {GUIDES.map((g) => (
            <button key={g.id} role="tab" aria-selected={g.id === guideId} onClick={() => openGuide(g.id)}>
              {g.title}
            </button>
          ))}
        </div>
        <article className="guide-body">
          <h3 className="guide-title">{guide.title}</h3>
          <p className="lead">{guide.intro}</p>
          {guide.sections.map((sec) => (
            <section key={sec.title}>
              <h4>{sec.title}</h4>
              {sec.body && <p>{sec.body}</p>}
              {sec.bullets && (
                <ul>
                  {sec.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {sec.table && (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {sec.table.columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) => (i === 0 ? <th key={i}>{cell}</th> : <td key={i}>{cell}</td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {sec.note && <p className="guide-note">{sec.note}</p>}
            </section>
          ))}
          <h4>Sources</h4>
          <ul className="sources">
            {guide.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.title}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
