import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Mesh } from 'three';
import type { GltfModelDef } from '../types';
import { Part, useDrone } from '../viewer/Part';
import { patchSkinMaterial } from '../viewer/xray';
import { splitIntoParts } from './gltf';

const noRaycast = () => {};

export const modelUrl = (model: GltfModelDef) => import.meta.env.BASE_URL + model.url;

/**
 * A drone model loaded from a .glb / .gltf file. `nodeMap` sorts its nodes into
 * parts, and each part is wrapped in <Part>, so picking, X-ray, explode and labels
 * work the same as on a code-built model.
 */
export function GltfModel({ model }: { model: GltfModelDef }) {
  const drone = useDrone();
  // Meshopt compression is decoded by a bundled decoder; Draco would need a download.
  const gltf = useGLTF(modelUrl(model), false, true);
  const split = useMemo(() => {
    const result = splitIntoParts(gltf.scene, model);
    // Leftover meshes act like shell that can't be picked: they turn to glass in X-ray
    // and let clicks through to the parts behind them.
    result.rest.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      o.raycast = noRaycast;
      o.renderOrder = 10;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) patchSkinMaterial(m);
    });
    const missing = drone.parts.filter((p) => !result.parts.has(p.id)).map((p) => p.id);
    if (missing.length) console.warn(`[GltfModel] ${model.url} has no nodes for: ${missing.join(', ')}`);
    return result;
  }, [gltf.scene, model, drone]);

  return (
    <group name={`model:${drone.id}`}>
      {drone.parts
        .filter((p) => split.parts.has(p.id))
        .map((p) => (
          <Part key={p.id} id={p.id}>
            {split.parts.get(p.id)!.map((o) => (
              <primitive key={o.uuid} object={o} />
            ))}
          </Part>
        ))}
      <primitive object={split.rest} />
    </group>
  );
}
