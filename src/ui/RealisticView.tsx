import { useState } from 'react';
import type { DroneDef } from '../types';

/**
 * Realistic models from Sketchfab, embedded with Sketchfab's official player.
 * The anatomy features (parts, X-ray, explode) live in the Anatomy tab.
 */
export function RealisticView({ drone }: { drone: DroneDef }) {
  const [index, setIndex] = useState(0);
  const models = drone.sketchfab;
  if (models.length === 0) return <div className="realistic empty">No realistic model yet for {drone.name}.</div>;
  const sf = models[Math.min(index, models.length - 1)];
  return (
    <div className="realistic">
      {models.length > 1 && (
        <div className="model-switch" role="tablist" aria-label="Realistic models">
          {models.map((m, i) => (
            <button key={m.modelId} role="tab" aria-selected={m === sf} onClick={() => setIndex(i)}>
              {m.title} <small>by {m.author}</small>
            </button>
          ))}
        </div>
      )}
      <iframe
        key={sf.modelId}
        title={sf.title}
        src={`https://sketchfab.com/models/${sf.modelId}/embed?autostart=1&ui_theme=dark&dnt=1`}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      <p className="credit">
        <a href={sf.url} target="_blank" rel="noopener noreferrer nofollow">
          {sf.title}
        </a>{' '}
        by{' '}
        <a href={sf.authorUrl} target="_blank" rel="noopener noreferrer nofollow">
          {sf.author}
        </a>{' '}
        on Sketchfab. Switch to <b>Anatomy</b> to explore the parts.
      </p>
    </div>
  );
}
