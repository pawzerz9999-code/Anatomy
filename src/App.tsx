import { useEffect, useState } from 'react';
import { CATEGORIES, DRONES } from './data/drones';
import { useFactory } from './factory/store';
import { FactoryView } from './factory/FactoryView';
import { useStore, type ViewMode, type XrayMode } from './state/store';
import { DroneLibrary } from './ui/DroneLibrary';
import { FactoryPanel } from './ui/FactoryPanel';
import { ChevronIcon, DroneIcon, LayersIcon } from './ui/icons';
import { InfoPanel } from './ui/InfoPanel';
import { PartsTree } from './ui/PartsTree';
import { RealisticView } from './ui/RealisticView';
import { FocusBanner, Toolbar } from './ui/Toolbar';
import { Viewer } from './viewer/Viewer';

const NEXT_XRAY: Record<XrayMode, XrayMode> = { off: 'lens', lens: 'full', full: 'off' };

const TABS: { id: ViewMode; label: string }[] = [
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'factory', label: 'Factory' },
  { id: 'realistic', label: 'Realistic' },
];

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useStore.getState();
      if (s.view === 'factory') {
        // Space plays / pauses the line (unless a button has focus: Space already presses it).
        if (e.key !== ' ' || t.closest('button, a, summary')) return;
        const f = useFactory.getState();
        f.setPlaying(!f.playing);
        e.preventDefault();
        return;
      }
      if (s.view !== 'anatomy') return;
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
          if (s.selectedId) s.select(null);
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
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const drone = DRONES[droneId];
  const category = CATEGORIES.find((c) => c.id === drone.category);
  useKeyboardShortcuts();

  return (
    <div className={`app${view === 'factory' ? ' wide-stage' : ''}`}>
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
        <div className="tabs" role="tablist" aria-label="View">
          {TABS.map((tab) => (
            <button key={tab.id} role="tab" aria-selected={view === tab.id} onClick={() => setView(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {view !== 'factory' && (
        <aside className="panel parts-panel" aria-label="Parts">
          <PartsTree drone={drone} />
        </aside>
      )}

      <main className="stage">
        {view === 'anatomy' && (
          <>
            <Viewer />
            <FocusBanner />
            <Toolbar />
          </>
        )}
        {view === 'factory' && <FactoryView drone={drone} />}
        {view === 'realistic' && <RealisticView drone={drone} />}
      </main>

      <aside className="panel info-panel" aria-label="Information">
        {view === 'factory' ? <FactoryPanel drone={drone} /> : <InfoPanel drone={drone} />}
      </aside>

      {libraryOpen && <DroneLibrary onClose={() => setLibraryOpen(false)} />}
    </div>
  );
}
