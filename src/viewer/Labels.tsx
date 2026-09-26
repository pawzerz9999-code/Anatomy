import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { SYSTEM_BY_ID } from '../data/systems';
import { useStore } from '../state/store';
import type { DroneDef } from '../types';
import { partAnchor, partRegistry } from './runtime';

/**
 * Labels are plain DOM elements laid over the canvas. The overlay (outside the
 * canvas) renders them, and <LabelsDriver> (inside the canvas) moves them every
 * frame, the same way anatomy apps draw callouts in two tidy columns.
 */
interface LabelEls {
  label: HTMLElement;
  line: SVGLineElement;
  dot: SVGCircleElement;
}

// Entries can be partial while React is attaching refs; the driver checks all three.
const labelEls = new Map<string, LabelEls>();
const hoverTag: { el: HTMLElement | null } = { el: null };

const tmp = new Vector3();
const ROW_GAP = 21;
const EDGE = 10;

interface Item {
  id: string;
  sx: number;
  sy: number;
  y: number;
}

/** Spread labels vertically so they never overlap, staying as close as possible to their part. */
function layoutColumn(items: Item[], top: number, bottom: number) {
  items.sort((a, b) => a.sy - b.sy);
  let prev = -Infinity;
  for (const it of items) {
    it.y = Math.max(it.sy, prev + ROW_GAP, top);
    prev = it.y;
  }
  let next = Infinity;
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].y = Math.min(items[i].y, next - ROW_GAP, bottom);
    next = items[i].y;
  }
}

export function LabelsDriver({ drone }: { drone: DroneDef }) {
  const { camera, size } = useThree();
  useFrame(() => {
    const s = useStore.getState();
    const W = size.width;
    const H = size.height;

    // Hover name tag.
    const tag = hoverTag.el;
    if (tag) {
      const reg = s.hoveredId && !s.labels ? partRegistry.get(s.hoveredId) : undefined;
      if (reg && reg.group.visible && partAnchor(s.hoveredId!, tmp)) {
        tmp.project(camera);
        const sx = (tmp.x * 0.5 + 0.5) * W;
        const sy = (1 - (tmp.y * 0.5 + 0.5)) * H;
        tag.style.opacity = '1';
        tag.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, calc(-100% - 10px))`;
      } else {
        tag.style.opacity = '0';
      }
    }

    if (!s.labels) return;
    tmp.set(0, 0, 0).project(camera);
    const cx = (tmp.x * 0.5 + 0.5) * W;
    const items: (Item & { width: number })[] = [];
    for (const p of drone.parts) {
      const els = labelEls.get(p.id);
      const reg = partRegistry.get(p.id);
      if (!els?.label || !els.line || !els.dot || !reg) continue;
      partAnchor(p.id, tmp)!.project(camera);
      const show = reg.group.visible && tmp.z < 1;
      els.label.style.display = show ? '' : 'none';
      els.line.style.display = show ? '' : 'none';
      els.dot.style.display = show ? '' : 'none';
      if (!show) continue;
      items.push({
        id: p.id,
        sx: (tmp.x * 0.5 + 0.5) * W,
        sy: (1 - (tmp.y * 0.5 + 0.5)) * H,
        y: 0,
        width: els.label.offsetWidth,
      });
    }
    // Split into two balanced columns: the left-most half of the parts go left.
    items.sort((a, b) => a.sx - b.sx);
    const half = Math.ceil(items.length / 2);
    const left = items.slice(0, half);
    const right = items.slice(half);
    layoutColumn(left, EDGE + 8, H - EDGE - 8);
    layoutColumn(right, EDGE + 8, H - EDGE - 8);

    // Put each column beside the model, but never off the edge of the canvas.
    const reach = Math.min(W * 0.3, 380);
    const maxLeft = Math.max(0, ...left.map((i) => i.width));
    const maxRight = Math.max(0, ...right.map((i) => i.width));
    const xL = Math.max(EDGE + maxLeft, Math.min(cx - reach, ...left.map((i) => i.sx - 24)));
    const xR = Math.min(W - EDGE - maxRight, Math.max(cx + reach, ...right.map((i) => i.sx + 24)));
    for (const [column, side] of [
      [left, -1],
      [right, 1],
    ] as const) {
      for (const it of column) {
        const els = labelEls.get(it.id)!;
        const x = side < 0 ? xL : xR;
        els.label.style.transform =
          side < 0 ? `translate(${x}px, ${it.y}px) translate(-100%, -50%)` : `translate(${x}px, ${it.y}px) translate(0, -50%)`;
        els.line.setAttribute('x1', String(x + (side < 0 ? 2 : -2)));
        els.line.setAttribute('y1', String(it.y));
        els.line.setAttribute('x2', String(it.sx));
        els.line.setAttribute('y2', String(it.sy));
        els.dot.setAttribute('cx', String(it.sx));
        els.dot.setAttribute('cy', String(it.sy));
      }
    }
  });
  return null;
}

/** The DOM half: the hover tag plus (when enabled) a callout for every part. */
export function LabelsOverlay({ drone }: { drone: DroneDef }) {
  const labels = useStore((s) => s.labels);
  const hoveredId = useStore((s) => s.hoveredId);
  const selectedId = useStore((s) => s.selectedId);
  const hovered = drone.parts.find((p) => p.id === hoveredId);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hoverTag.el = tagRef.current;
    return () => {
      hoverTag.el = null;
    };
  }, []);

  return (
    <div className="labels-overlay" aria-hidden={!labels}>
      <div ref={tagRef} className="hover-tag" style={{ opacity: 0 }}>
        {hovered && (
          <>
            <span className="swatch" style={{ background: SYSTEM_BY_ID[hovered.system].color }} />
            {hovered.name}
          </>
        )}
      </div>
      {labels && (
        <>
          <svg className="label-lines">
            {drone.parts.map((p) => (
              <g key={p.id} className={p.id === hoveredId || p.id === selectedId ? 'active' : ''}>
                <line
                  ref={(el) => registerEl(p.id, 'line', el)}
                  stroke={SYSTEM_BY_ID[p.system].color}
                />
                <circle ref={(el) => registerEl(p.id, 'dot', el)} r={3} fill={SYSTEM_BY_ID[p.system].color} />
              </g>
            ))}
          </svg>
          {drone.parts.map((p) => (
            <button
              key={p.id}
              ref={(el) => registerEl(p.id, 'label', el)}
              className={`callout${p.id === hoveredId || p.id === selectedId ? ' active' : ''}`}
              style={{ borderColor: SYSTEM_BY_ID[p.system].color }}
              onPointerEnter={() => useStore.getState().hover(p.id)}
              onPointerLeave={() => useStore.getState().hover(null)}
              onClick={() => useStore.getState().select(p.id)}
            >
              {p.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function registerEl(id: string, key: keyof LabelEls, el: Element | null) {
  const cur: Partial<LabelEls> = labelEls.get(id) ?? {};
  if (el) (cur as Record<string, Element>)[key] = el;
  else delete cur[key];
  if (cur.label || cur.line || cur.dot) labelEls.set(id, cur as LabelEls);
  else labelEls.delete(id);
}
