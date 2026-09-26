import { useEffect, useState } from 'react';
import { CATEGORIES, DRONES } from './data/drones';
import { hasLaunch, LaunchInfo, LaunchSteps, LaunchView } from './launch/LaunchView';
import { useStore, type XrayMode } from './state/store';
import { DroneLibrary } from './ui/DroneLibrary';
import { GuidesModal } from './ui/GuidesModal';
import { ChevronIcon, DroneIcon, LayersIcon } from './ui/icons';
import { InfoPanel } from './ui/InfoPanel';
import { PartsTree } from './ui/PartsTree';
import { RealisticView } from './ui/RealisticView';
import { FocusBanner, Toolbar } from './ui/Toolbar';
import { Viewer } from './viewer/Viewer';

const NEXT_XRAY: Record<XrayMode, XrayMode> = { off: 'lens', lens: 'full', full: 'off' };

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useStore.getState();
      switch (e.key.toLowerCase()) {
        case 'x':
          s.setXray(NEXT_XRAY[s.xray]);
          break;
        case 'e':
          s.setExplode(s.explode > 0.5 ? 0 : 1);
          break;
        case 'l':
          s.setLabels(!s.labels);
          break;
        case 'r':
          s.resetView();
          break;
        case 'escape':
          if (s.guide) s.openGuide(null);
          else if (s.selectedId) s.select(null);
          else if (s.focusSystem) s.focus(null);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export default function App() {
  const droneId = useStore((s) => s.droneId);
  const requestedView = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const drone = DRONES[droneId];
  const launchable = hasLaunch(drone);
  // Not every drone has a launch scene: fall back to the anatomy view.
  const view = requestedView === 'launch' && !launchable ? 'anatomy' : requestedView;
  const category = CATEGORIES.find((c) => c.id === drone.category);
  useKeyboardShortcuts();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <DroneIcon />
          <span>
            Drone <b>Anatomy</b>
          </span>
        </div>
        <button className="drone-picker" onClick={() => setLibraryOpen(true)} aria-haspopup="dialog">
          <LayersIcon />
          <span className="picker-text">
            <strong>{drone.name}</strong>
            <small>{category?.name}</small>
          </span>
          <ChevronIcon />
        </button>
        <button className="learn-btn" onClick={() => useStore.getState().openGuide('materials')}>
          Learn
        </button>
        <div className="tabs" role="tablist" aria-label="View">
          <button role="tab" aria-selected={view === 'anatomy'} onClick={() => setView('anatomy')}>
            Anatomy
          </button>
          {launchable && (
            <button role="tab" aria-selected={view === 'launch'} onClick={() => setView('launch')}>
              Launch
            </button>
          )}
          <button role="tab" aria-selected={view === 'realistic'} onClick={() => setView('realistic')}>
            Realistic
          </button>
        </div>
      </header>

      <aside className="panel parts-panel" aria-label={view === 'launch' ? 'Launch steps' : 'Parts'}>
        {view === 'launch' ? <LaunchSteps drone={drone} /> : <PartsTree drone={drone} />}
      </aside>

      <main className="stage">
        {view === 'anatomy' && (
          <>
            <Viewer />
            <FocusBanner />
            <Toolbar />
          </>
        )}
        {view === 'launch' && <LaunchView key={drone.id} drone={drone} />}
        {view === 'realistic' && <RealisticView key={drone.id} drone={drone} />}
      </main>

      <aside className="panel info-panel" aria-label="Information">
        {view === 'launch' ? <LaunchInfo drone={drone} /> : <InfoPanel drone={drone} />}
      </aside>

      {libraryOpen && <DroneLibrary onClose={() => setLibraryOpen(false)} />}
      <GuidesModal />
    </div>
  );
}
