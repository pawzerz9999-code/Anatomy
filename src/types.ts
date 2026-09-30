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
  /** Where the part moves (in metres) when the drone is fully exploded. */
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

export interface DroneDef {
  id: string;
  name: string;
  aka?: string;
  category: DroneCategory;
  tagline: string;
  overview: string;
  /** A handful of headline numbers, shown as big tiles. Keep values short. */
  stats: Spec[];
  /** The full list of key facts. */
  specs: Spec[];
  sections: InfoSection[];
  /** How later or foreign-built versions differ from the one modelled. */
  variants?: InfoSection;
  /** Public sources the model and text are based on. */
  sources: SourceLink[];
  parts: PartDef[];
  /** The 3D model: built in code, or loaded from a glTF / GLB file. */
  model: { kind: 'procedural' } | GltfModelDef;
  sketchfab?: SketchfabEmbed;
}

/** A model loaded from a .glb / .gltf file, with its nodes sorted into parts. */
export interface GltfModelDef {
  kind: 'gltf';
  /** Path under `public/`, e.g. `models/shahed-136.glb`. */
  url: string;
  /**
   * Node name → part id. A node's whole subtree goes to that part. A key written as
   * `/pattern/flags` is a regular expression, e.g. `/^Propeller/i`.
   */
  nodeMap: Record<string, string>;
  /** Part that gets every mesh not matched by `nodeMap`. Without it, those meshes are shown but can't be picked. */
  fallbackPart?: string;
  /** Rotation in radians (XYZ) that turns the file into our axes: nose towards +X, up +Y. */
  rotation?: Vec3;
  /** The model is scaled so its longest side is this long, in metres. */
  length: number;
}

export interface CatalogEntry {
  id: string;
  name: string;
  category: DroneCategory;
  blurb: string;
  status: 'live' | 'soon';
}
