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
  specs: Spec[];
  sections: InfoSection[];
  parts: PartDef[];
  /** The 3D model: built in code now; a glTF file with a mesh-name → part-id map later. */
  model: { kind: 'procedural' } | { kind: 'gltf'; url: string; nodeMap: Record<string, string> };
  sketchfab?: SketchfabEmbed;
}

export interface CatalogEntry {
  id: string;
  name: string;
  category: DroneCategory;
  blurb: string;
  status: 'live' | 'soon';
}
