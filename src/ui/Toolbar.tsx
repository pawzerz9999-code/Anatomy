import type { ComponentType } from 'react';
import { DRONES } from '../data/drones';
import { SYSTEM_BY_ID } from '../data/systems';
import { useStore, type XrayMode } from '../state/store';
import { CloseIcon, ExplodeIcon, EyeIcon, LensIcon, PointerIcon, ResetIcon, SolidIcon, SpinIcon, TagIcon, XrayIcon, ZoomIcon } from './icons';

const XRAY_MODES: { id: XrayMode; label: string; title: string; Icon: ComponentType }[] = [
  { id: 'off', label: 'Solid', title: 'Solid model (X)', Icon: SolidIcon },
  { id: 'lens', label: 'Lens', title: 'See inside where you point. Shift + scroll resizes it (X)', Icon: LensIcon },
  { id: 'full', label: 'X-ray', title: 'See through the whole shell (X)', Icon: XrayIcon },
];

/** Floating icon dock over the 3D view. */
export function Toolbar() {
  const explode = useStore((s) => s.explode);
  const xray = useStore((s) => s.xray);
  const labels = useStore((s) => s.labels);
  const autoRotate = useStore((s) => s.autoRotate);
  const s = useStore.getState();

  return (
    <div className="toolbar" role="toolbar" aria-label="View controls">
      <div className="segmented" role="radiogroup" aria-label="X-ray mode">
        {XRAY_MODES.map(({ id, label, title, Icon }) => (
          <button key={id} className="tool" role="radio" aria-checked={xray === id} title={title} onClick={() => s.setXray(id)}>
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <span className="divider" aria-hidden />
      <button className="tool" aria-pressed={explode > 0} title="Pull the parts apart (E)" onClick={() => s.setExplode(explode > 0 ? 0 : 1)}>
        <ExplodeIcon />
        <span>Explode</span>
      </button>
      <button className="tool" aria-pressed={labels} title="Name every part (L)" onClick={() => s.setLabels(!labels)}>
        <TagIcon />
        <span>Labels</span>
      </button>
      <button className="tool" aria-pressed={autoRotate} title="Turn the model slowly" onClick={() => s.setAutoRotate(!autoRotate)}>
        <SpinIcon />
        <span>Spin</span>
      </button>
      <button className="tool" title="Reset view (R)" onClick={() => s.resetView()}>
        <ResetIcon />
        <span>Reset</span>
      </button>
    </div>
  );
}

/** Small status pills at the top of the 3D view: system focus, hidden parts and hints. */
export function StageBanners() {
  const focusSystem = useStore((s) => s.focusSystem);
  const xray = useStore((s) => s.xray);
  const hint = useStore((s) => s.hint);
  const isolatedId = useStore((s) => s.isolatedId);
  const droneId = useStore((s) => s.droneId);
  const hiddenCount = useStore(
    (s) => Object.values(s.hiddenParts).filter(Boolean).length + Object.values(s.hiddenSystems).filter(Boolean).length,
  );
  const { focus, showAll } = useStore.getState();
  const sys = focusSystem ? SYSTEM_BY_ID[focusSystem] : null;
  const isolated = isolatedId ? DRONES[droneId].parts.find((p) => p.id === isolatedId) : undefined;

  return (
    <div className="stage-top">
      {sys && (
        <div className="banner" style={{ borderColor: sys.color }}>
          <span className="dot" style={{ background: sys.color }} />
          <strong>{sys.name}</strong>
          <button className="icon-btn" aria-label="Stop focusing" onClick={() => focus(null)}>
            <CloseIcon />
          </button>
        </div>
      )}
      {(isolated || hiddenCount > 0) && (
        <div className="banner">
          <EyeIcon off />
          {isolated ? <span>Only {isolated.name}</span> : <span>{hiddenCount} hidden</span>}
          <button className="pill-btn" onClick={() => showAll()}>
            Show all
          </button>
        </div>
      )}
      {!sys && xray === 'lens' && (
        <div className="banner subtle">
          <LensIcon /> Point at the drone to see inside
        </div>
      )}
      {hint && !sys && xray !== 'lens' && (
        <div className="banner subtle hint" role="note">
          <span>
            <SpinIcon /> Drag to spin
          </span>
          <span>
            <ZoomIcon /> <span className="touch-only">Pinch</span>
            <span className="mouse-only">Scroll</span> to zoom
          </span>
          <span>
            <PointerIcon /> <span className="touch-only">Tap</span>
            <span className="mouse-only">Click</span> a part
          </span>
        </div>
      )}
    </div>
  );
}
