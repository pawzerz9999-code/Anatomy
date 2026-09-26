export type Vec3 = [number, number, number];

/** Body "systems", like the skeletal / muscular / nervous systems in an anatomy app. */
export type SystemId =
  | 'airframe'
  | 'propulsion'
  | 'fuel'
  | 'flight-control'
  | 'navigation'
  | 'power'
  | 'payload';

export interface SystemDef {
  id: SystemId;
  name: string;
  color: string;
  description: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface PartDef {
  id: string;
  name: string;
  system: SystemId;
  /** Outer shell piece. X-ray makes it see-through and it can't be picked while X-ray is on. */
  skin?: boolean;
  /** Sits inside the shell. Selecting it turns X-ray on so it can be seen. */
  inside?: boolean;
  /**
   * How sure we are about this part:
   * - `reported`: its existence and rough location are described in public reporting or teardowns.
   * - `typical`: the drone must have one, but its exact design and position are not public,
   *   so the model shows a typical example.
   */
  evidence: 'reported' | 'typical';
  /** What it is made of, where that has been reported. */
  madeOf?: string;
  /** One plain-language line: what is it? */
  summary: string;
  /** A short paragraph: what does it do and why is it built that way? */
  details: string;
  funFact?: string;
  specs?: Spec[];
  /** Where the part moves (in metres) when the explode slider is at 100%. */
  explode: Vec3;
}

export interface InfoSection {
  title: string;
  body: string;
}

export interface SourceLink {
  title: string;
  url: string;
}

export type DroneCategory =
  | 'kamikaze'
  | 'interceptor'
  | 'multirotor'
  | 'fixed-wing'
  | 'vtol'
  | 'helicopter'
  | 'nano'
  | 'utility';

export interface SketchfabEmbed {
  modelId: string;
  title: string;
  author: string;
  authorUrl: string;
  url: string;
}

/** One station on the factory line: the parts fitted there, in order. */
export interface AssemblyStation {
  title: string;
  /** One or two plain-language sentences about what goes on here. */
  body: string;
  parts: string[];
}

export interface Stat {
  label: string;
  value: string;
  /** Where the figure comes from, or how it was worked out. */
  note: string;
}

/**
 * The factory view: the drone built station by station, sped up like a time-lapse.
 * The order is simplified for teaching: it shows how the parts fit together, not a
 * real factory's process.
 */
export interface AssemblyDef {
  stations: AssemblyStation[];
  /**
   * Where a part comes from before it is fitted, as an offset from its fitted place
   * (metres). It is lowered from above, then slides in along this offset. Parts not
   * listed are lowered straight down.
   */
  approach?: Record<string, Vec3>;
  /** What happens once every part is on: the final check, then leaving the line. */
  check: string;
  rollout: string;
  /** Parts that are not fitted at the factory, with the reason. */
  notFitted?: { id: string; note: string }[];
  /** Headline figures about how fast it is made. */
  stats: Stat[];
  /** Publicly reported facts about where and how it is made. */
  facts: InfoSection[];
  sources: SourceLink[];
}

export interface DroneDef {
  id: string;
  name: string;
  aka?: string;
  category: DroneCategory;
  tagline: string;
  overview: string;
  specs: Spec[];
  sections: InfoSection[];
  /** How later or foreign-built versions differ from the one modelled. */
  variants?: InfoSection;
  /** Public sources the model and text are based on. */
  sources: SourceLink[];
  parts: PartDef[];
  /** The 3D model: built in code now; a glTF file with a mesh-name → part-id map later. */
  model: { kind: 'procedural' } | { kind: 'gltf'; url: string; nodeMap: Record<string, string> };
  sketchfab?: SketchfabEmbed;
  /** The factory view, where there is one. */
  assembly?: AssemblyDef;
}

export interface CatalogEntry {
  id: string;
  name: string;
  category: DroneCategory;
  blurb: string;
  status: 'live' | 'soon';
}
