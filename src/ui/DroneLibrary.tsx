import { useState } from 'react';
import { CATALOG, CATEGORIES } from '../data/drones';
import { useStore } from '../state/store';
import type { DroneCategory } from '../types';
import { CloseIcon } from './icons';

/** The library of drone types: live models plus the ones on the roadmap. */
export function DroneLibrary({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<DroneCategory | 'all'>('all');
  const droneId = useStore((s) => s.droneId);
  const setDrone = useStore((s) => s.setDrone);
  const entries = CATALOG.filter((d) => filter === 'all' || d.category === filter);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal library" role="dialog" aria-modal="true" aria-label="Drone library" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Drone library</h2>
          <button className="icon-btn" aria-label="Close library" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="chips" role="tablist" aria-label="Categories">
          <button role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={filter === c.id} onClick={() => setFilter(c.id)} title={c.description}>
              {c.name}
            </button>
          ))}
        </div>
        <ul className="cards">
          {entries.map((d) => {
            const cat = CATEGORIES.find((c) => c.id === d.category)!;
            const live = d.status === 'live';
            return (
              <li key={d.id}>
                <button
                  className={`card${d.id === droneId ? ' current' : ''}`}
                  disabled={!live}
                  onClick={() => {
                    if (!live) return;
                    if (d.id !== droneId) setDrone(d.id);
                    onClose();
                  }}
                >
                  <span className="card-cat">{cat.name}</span>
                  <strong>{d.name}</strong>
                  <span className="card-blurb">{d.blurb}</span>
                  <span className={`badge ${live ? 'live' : 'soon'}`}>{live ? (d.id === droneId ? 'Viewing' : 'Explore') : 'Coming soon'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
