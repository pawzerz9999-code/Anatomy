import type { ComponentType } from 'react';
import { Shahed136Model } from './shahed136/Shahed136Model';

/** Code-built 3D models, keyed by drone id. Drones with a model file use <GltfModel> instead. */
export const MODELS: Record<string, ComponentType | undefined> = {
  'shahed-136': Shahed136Model,
};
