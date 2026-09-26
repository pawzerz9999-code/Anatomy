import type { ComponentType } from 'react';
import { InterceptorModel, P1_SUN_SPEC, STING_SPEC, STRILA_SPEC } from './interceptor/InterceptorModel';
import { Shahed136Model } from './shahed136/Shahed136Model';

/** Code-built 3D models, keyed by drone id. */
export const MODELS: Record<string, ComponentType> = {
  'shahed-136': Shahed136Model,
  sting: () => <InterceptorModel spec={STING_SPEC} />,
  strila: () => <InterceptorModel spec={STRILA_SPEC} />,
  'p1-sun': () => <InterceptorModel spec={P1_SUN_SPEC} />,
};
