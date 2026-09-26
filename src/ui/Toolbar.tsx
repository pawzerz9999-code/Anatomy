import { SYSTEM_BY_ID } from '../data/systems';
import { useStore, type XrayMode } from '../state/store';
import { CloseIcon, ResetIcon } from './icons';

const XRAY_MODES: { id: XrayMode; label: string; title: string }[] = [
  { id: 'off', label: 'Off', title: 'Solid model' },
  { id: 'lens', label: 'Lens', title: 'See-through circle that follows your pointer' },
  { id: 'full', label: 'Full', title: 'Make the whole shell see-through' },
];

/** Floating controls over the 3D view. */
export function Toolbar() {
  const explode = useStore((s) => s.explode);
  const xray = useStore((s) => s.xray);
  const lensRadius = useStore((s) => s.lensRadius);
  const labels = useStore((s) => s.labels);
  const autoRotate = useStore((s) => s.autoRotate);
  const spinProp = useStore((s) => s.spinProp);
  const isolatedId = useStore((s) => s.isolatedId);
  const hiddenCount = useStore(
    (s) => Object.values(s.hiddenParts).filter(Boolean).length + Object.values(s.hiddenSystems).filter(Boolean).length,
  );
  const s = useStore.getState();

  return (
    <div className="toolbar" role="toolbar" aria-label="View controls">
      <div className="group">
        <span className="group-label">X-ray</span>
        <div className="segmented" role="radiogroup" aria-label="X-ray mode">
          {XRAY_MODES.map((m) => (
            <button key={m.id} role="radio" aria-checked={xray === m.id} title={m.title} onClick={() => s.setXray(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        {xray === 'lens' && (
          <input
            className="lens-size"
            type="range"
            min={50}
            max={260}
            value={lensRadius}
            aria-label="Lens size"
            title="Lens size (or Shift + scroll)"
            onChange={(e) => s.setLensRadius(Number(e.target.value))}
          />
        )}
      </div>
      <div className="group">
        <label className="group-label" htmlFor="explode">
          Explode
        </label>
        <input
          id="explode"
          type="range"
          min={0}
          max={100}
          value={Math.round(explode * 100)}
          onChange={(e) => s.setExplode(Number(e.target.value) / 100)}
        />
      </div>
      <div className="group toggles">
        <button aria-pressed={labels} onClick={() => s.setLabels(!labels)}>
          Labels
        </button>
        <button aria-pressed={autoRotate} onClick={() => s.setAutoRotate(!autoRotate)}>
          Turntable
        </button>
        <button aria-pressed={spinProp} onClick={() => s.setSpinProp(!spinProp)}>
          Propeller
        </button>
        {(isolatedId || hiddenCount > 0) && <button onClick={() => s.showAll()}>Show all</button>}
        <button className="icon-text" onClick={() => s.resetView()} title="Reset view (R)">
          <ResetIcon /> Reset
        </button>
      </div>
    </div>
  );
}

/** Banner shown while one system is in X-ray focus. */
export function FocusBanner() {
  const focusSystem = useStore((s) => s.focusSystem);
  const focus = useStore((s) => s.focus);
  const xray = useStore((s) => s.xray);
  if (!focusSystem) {
    return xray === 'lens' ? (
      <div className="banner subtle">Move your pointer over the drone to look inside · Shift + scroll resizes the lens</div>
    ) : null;
  }
  const sys = SYSTEM_BY_ID[focusSystem];
  return (
    <div className="banner" style={{ borderColor: sys.color }}>
      <span className="dot" style={{ background: sys.color }} />
      X-ray focus: <strong>{sys.name}</strong>
      <button className="icon-btn" aria-label="Stop focusing" onClick={() => focus(null)}>
        <CloseIcon />
      </button>
    </div>
  );
}
