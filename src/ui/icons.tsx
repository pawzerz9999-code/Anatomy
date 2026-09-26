/** Tiny inline icons (stroke = currentColor) so the UI needs no icon library. */
const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const EyeIcon = ({ off = false }: { off?: boolean }) => (
  <svg {...base} aria-hidden>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
export const SearchIcon = () => (
  <svg {...base} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const CloseIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const ChevronIcon = ({ dir = 'down' }: { dir?: 'down' | 'left' | 'right' }) => (
  <svg {...base} aria-hidden style={{ transform: dir === 'left' ? 'rotate(90deg)' : dir === 'right' ? 'rotate(-90deg)' : undefined }}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const FocusIcon = () => (
  <svg {...base} aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
  </svg>
);
export const ResetIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
export const LayersIcon = () => (
  <svg {...base} aria-hidden>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);
export const DroneIcon = () => (
  <svg {...base} viewBox="0 0 64 64" strokeWidth={4} aria-hidden>
    <path d="M32 8 L52 46 L32 39 L12 46 Z" />
    <circle cx="32" cy="52" r="3" fill="currentColor" />
  </svg>
);
export const PlayIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" />
  </svg>
);
export const PauseIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M8 5v14M16 5v14" strokeWidth={3} />
  </svg>
);
