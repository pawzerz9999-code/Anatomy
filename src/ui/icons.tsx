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
export const SolidIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z" fill="currentColor" fillOpacity={0.25} />
    <path d="M4 7.5 12 12l8-4.5M12 12v9" />
  </svg>
);
export const LensIcon = () => (
  <svg {...base} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" strokeDasharray="2 2.2" />
  </svg>
);
export const XrayIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z" />
    <path d="M4 7.5 12 12l8-4.5M12 12v9" strokeDasharray="2 2.2" />
  </svg>
);
export const ExplodeIcon = () => (
  <svg {...base} aria-hidden>
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M7 7 3 3m0 4V3h4M17 7l4-4m-4 0h4v4M7 17l-4 4m0-4v4h4M17 17l4 4m0-4v4h-4" />
  </svg>
);
export const TagIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);
export const SpinIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M17 7.6c2.5.8 4 2 4 3.4 0 2.8-4 5-9 5s-9-2.2-9-5c0-1.4 1-2.6 2.8-3.5" />
    <path d="m9 13.5 3 2.5-3 2.5" />
    <path d="M12 3v9" />
  </svg>
);
export const IsolateIcon = () => (
  <svg {...base} aria-hidden>
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
  </svg>
);
export const BulbIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" />
  </svg>
);
export const CheckIcon = () => (
  <svg {...base} aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const InfoIcon = () => (
  <svg {...base} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5v.01" />
  </svg>
);
export const PointerIcon = () => (
  <svg {...base} aria-hidden>
    <path d="M5 3.5 11 20l2.4-6.6L20 11Z" />
    <path d="m13.4 13.4 5.1 5.1" />
  </svg>
);
export const ZoomIcon = () => (
  <svg {...base} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8 11h6M11 8v6" />
  </svg>
);
