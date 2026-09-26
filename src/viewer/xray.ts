import { Color, DoubleSide, Material, MeshStandardMaterial, Vector2 } from 'three';

/**
 * Uniforms shared by every "skin" (outer shell) material. Each patched material
 * points at these same objects, so updating a value here updates all of them.
 */
export const xrayUniforms = {
  uPointer: { value: new Vector2(-9999, -9999) },
  uRadius: { value: 100 },
  /** 0..1 strength of the hover lens. */
  uLens: { value: 0 },
  /** 0..1 strength of full X-ray (glassy ghost shell). */
  uFull: { value: 0 },
  uGhostColor: { value: new Color('#7dd3fc') },
};

const FRAGMENT_UNIFORMS = /* glsl */ `
uniform vec2 uPointer;
uniform float uRadius;
uniform float uLens;
uniform float uFull;
uniform vec3 uGhostColor;
`;

const FRAGMENT_XRAY = /* glsl */ `
{
  // Full X-ray: a faint glassy shell that is brighter at grazing angles (Fresnel),
  // like the outline of a body in a medical X-ray.
  vec3 xrN = normalize(normal);
  vec3 xrV = normalize(vViewPosition);
  float fres = pow(1.0 - abs(dot(xrN, xrV)), 2.5);
  float ghostA = 0.04 + 0.42 * fres;
  vec3 ghostC = mix(gl_FragColor.rgb * 0.3, uGhostColor, 0.3 + 0.7 * fres);

  vec3 col = mix(gl_FragColor.rgb, ghostC, uFull);
  float a = mix(gl_FragColor.a, ghostA, uFull);

  // Hover lens: a see-through circle around the pointer with a glowing rim.
  float d = distance(gl_FragCoord.xy, uPointer);
  float inside = 1.0 - smoothstep(uRadius * 0.9, uRadius, d);
  float rim = smoothstep(uRadius * 0.84, uRadius * 0.96, d) * (1.0 - smoothstep(uRadius * 0.96, uRadius * 1.03, d));
  col = mix(col, ghostC, inside * uLens * 0.85);
  a = mix(a, min(a, ghostA), inside * uLens);
  col += uGhostColor * rim * uLens * 0.9;
  a = max(a, rim * uLens * 0.85);

  gl_FragColor = vec4(col, a);
}
`;

/** Turn a normal material into an X-ray-capable shell material. */
export function patchSkinMaterial(mat: Material) {
  if (!(mat instanceof MeshStandardMaterial) || mat.userData.xrayPatched) return;
  mat.userData.xrayPatched = true;
  mat.transparent = true;
  mat.side = DoubleSide;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, xrayUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_UNIFORMS}`)
      .replace('#include <dithering_fragment>', `${FRAGMENT_XRAY}\n#include <dithering_fragment>`);
  };
  mat.customProgramCacheKey = () => 'drone-anatomy-xray-skin';
  mat.needsUpdate = true;
}
