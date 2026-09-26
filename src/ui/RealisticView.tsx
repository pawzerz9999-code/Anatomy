import type { DroneDef } from '../types';

/**
 * The realistic model from Sketchfab, embedded with Sketchfab's official player.
 * The anatomy features (parts, X-ray, explode) live in the Anatomy tab.
 */
export function RealisticView({ drone }: { drone: DroneDef }) {
  const sf = drone.sketchfab;
  if (!sf) return <div className="realistic empty">No realistic model yet for {drone.name}.</div>;
  return (
    <div className="realistic">
      <iframe
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
