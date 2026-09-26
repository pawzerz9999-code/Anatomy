import { useMemo, type CSSProperties } from 'react';
import { SYSTEMS } from '../data/systems';
import { useStore } from '../state/store';
import type { DroneDef } from '../types';
import { ChevronIcon, EyeIcon, SearchIcon } from './icons';

/** Parts grouped by body system, like the layer list in an anatomy app. Each system folds open. */
export function PartsTree({ drone }: { drone: DroneDef }) {
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const selectedId = useStore((s) => s.selectedId);
  const hoveredId = useStore((s) => s.hoveredId);
  const hiddenParts = useStore((s) => s.hiddenParts);
  const hiddenSystems = useStore((s) => s.hiddenSystems);
  const focusSystem = useStore((s) => s.focusSystem);
  const openSystems = useStore((s) => s.openSystems);
  const { select, hover, togglePart, toggleSystem, toggleOpen, focus } = useStore.getState();

  const q = search.trim().toLowerCase();
  const groups = useMemo(
    () =>
      SYSTEMS.map((sys) => ({
        sys,
        parts: drone.parts.filter(
          (p) => p.system === sys.id && (!q || p.name.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)),
        ),
      })).filter((g) => g.parts.length > 0),
    [drone, q],
  );

  return (
    <div className="parts-tree">
      <label className="search">
        <SearchIcon />
        <input
          type="search"
          placeholder={`Search ${drone.parts.length} parts`}
          aria-label="Search parts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {groups.length === 0 && <p className="empty">No parts match “{search}”.</p>}
      {groups.map(({ sys, parts }) => {
        const sysHidden = !!hiddenSystems[sys.id];
        const focused = focusSystem === sys.id;
        // While searching, every matching system is open.
        const open = !!q || !!openSystems[sys.id];
        return (
          <section
            key={sys.id}
            className={`system${focused ? ' focused' : ''}${sysHidden ? ' hidden' : ''}${open ? ' open' : ''}`}
            style={{ '--sys': sys.color } as CSSProperties}
          >
            <header>
              <button
                className="icon-btn expand"
                aria-label={`${sys.name} parts`}
                aria-expanded={open}
                onClick={() => toggleOpen(sys.id)}
              >
                <ChevronIcon dir={open ? 'down' : 'right'} />
              </button>
              <button
                className="system-name"
                onClick={() => focus(focused ? null : sys.id)}
                aria-pressed={focused}
                title={focused ? 'Stop X-ray' : `X-ray the ${sys.name.toLowerCase()}`}
              >
                <span className="dot" />
                {sys.name}
                <span className="count" aria-hidden>
                  {parts.length}
                </span>
              </button>
              <button
                className={`icon-btn eye${sysHidden ? ' off' : ''}`}
                aria-label={`${sysHidden ? 'Show' : 'Hide'} ${sys.name}`}
                aria-pressed={!sysHidden}
                onClick={() => toggleSystem(sys.id)}
              >
                <EyeIcon off={sysHidden} />
              </button>
            </header>
            {open && (
              <ul>
                {parts.map((p) => {
                  const hidden = !!hiddenParts[p.id];
                  return (
                    <li
                      key={p.id}
                      className={`${p.id === selectedId ? 'selected' : ''}${p.id === hoveredId ? ' hovered' : ''}${hidden ? ' hidden' : ''}`}
                      onPointerEnter={() => hover(p.id)}
                      onPointerLeave={() => hover(null)}
                    >
                      <button className="part-name" onClick={() => select(p.id === selectedId ? null : p.id)}>
                        {p.name}
                      </button>
                      <button
                        className={`icon-btn eye${hidden ? ' off' : ''}`}
                        aria-label={`${hidden ? 'Show' : 'Hide'} ${p.name}`}
                        aria-pressed={!hidden}
                        onClick={() => togglePart(p.id)}
                      >
                        <EyeIcon off={hidden} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
