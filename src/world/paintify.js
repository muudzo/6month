import * as THREE from 'three';
import { PAINT_STYLES } from '../lib/config.js';
import { renderTargetType } from './gpu.js';

/** Working resolution for the painted version (long side, px). */
const PAINT_SIZE = 1024;

const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** Soft-weighted 4-sector Kuwahara: flattens detail into brush-like patches. */
const KUWAHARA_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uTexel;
  varying vec2 vUv;
  const int R = 5;

  void main() {
    vec3 m[4];
    vec3 s[4];
    for (int k = 0; k < 4; k++) { m[k] = vec3(0.0); s[k] = vec3(0.0); }
    for (int j = 0; j <= R; j++) {
      for (int i = 0; i <= R; i++) {
        float fi = float(i);
        float fj = float(j);
        vec3 c0 = texture2D(tMap, vUv + vec2(-fi, -fj) * uTexel).rgb;
        vec3 c1 = texture2D(tMap, vUv + vec2( fi, -fj) * uTexel).rgb;
        vec3 c2 = texture2D(tMap, vUv + vec2( fi,  fj) * uTexel).rgb;
        vec3 c3 = texture2D(tMap, vUv + vec2(-fi,  fj) * uTexel).rgb;
        m[0] += c0; s[0] += c0 * c0;
        m[1] += c1; s[1] += c1 * c1;
        m[2] += c2; s[2] += c2 * c2;
        m[3] += c3; s[3] += c3 * c3;
      }
    }
    float n = float((R + 1) * (R + 1));
    vec3 total = vec3(0.0);
    float weights = 0.0;
    for (int k = 0; k < 4; k++) {
      vec3 mean = m[k] / n;
      vec3 variance = abs(s[k] / n - mean * mean);
      float sigma = variance.r + variance.g + variance.b;
      float w = 1.0 / (1.0 + pow(sigma * 900.0, 4.0));
      total += mean * w;
      weights += w;
    }
    gl_FragColor = vec4(total / weights, 1.0);
  }
`;

/** Grading, canvas weave, brush ridges, craquelure and vignette, per style. */
const FINISH_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform vec2 uResolution;
  uniform int uStyle;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // Distance to the nearest Voronoi cell border: cracks in old varnish.
  float crackle(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    vec2 nearest = vec2(0.0);
    float best = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + hash2(n + g) - f;
      float d = dot(r, r);
      if (d < best) { best = d; nearest = r; }
    }
    float border = 8.0;
    for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + hash2(n + g) - f;
      if (dot(nearest - r, nearest - r) > 0.00001) border = min(border, dot(0.5 * (nearest + r), normalize(r - nearest)));
    }
    return border;
  }

  void main() {
    vec2 aspect = vec2(1.0, uResolution.y / uResolution.x);
    vec2 smear = vec2(noise(vUv * vec2(18.0, 60.0)), noise(vUv * vec2(60.0, 18.0) + 7.0)) - 0.5;
    vec3 linear = texture2D(tMap, vUv + smear * 0.004).rgb;
    vec3 g = pow(max(linear, 0.0), vec3(1.0 / 2.2));
    float l = dot(g, vec3(0.299, 0.587, 0.114));
    float vig = smoothstep(0.35, 0.95, length((vUv - 0.5) * vec2(1.0, 1.15)) * 1.3);
    float crackStrength = 0.38;
    float crackScale = 16.0;

    if (uStyle == 0) {
      g = mix(vec3(l), g, 0.62);
      g *= vec3(1.06, 0.97, 0.72);
      g = mix(vec3(0.09, 0.07, 0.035), vec3(0.98, 0.9, 0.7), g);
      g = mix(g, g * vec3(0.5, 0.46, 0.3), vig);
    } else if (uStyle == 1) {
      g = mix(vec3(l), g, 0.75);
      g = mix(g, vec3(1.0, 0.78, 0.36) * (0.35 + l * 0.9), 0.42);
      vec2 cell = floor(vUv * vec2(70.0, 70.0 * aspect.y));
      float h = hash(cell);
      float leaf = step(0.8, h) * smoothstep(0.3, 0.8, l);
      g = mix(g, vec3(1.0, 0.86, 0.45) * (0.9 + 0.2 * h), leaf * 0.55);
      g *= mix(1.0, 0.68, vig);
      crackStrength = 0.12;
      crackScale = 22.0;
    } else {
      g = mix(vec3(l), g, 1.3);
      g *= vec3(1.08, 0.98, 0.86);
      g = mix(g, g * vec3(0.82, 0.92, 1.2), 1.0 - smoothstep(0.0, 0.55, l));
      g *= mix(1.0, 0.74, vig);
      crackStrength = 0.18;
      crackScale = 12.0;
    }

    vec2 weave = vUv * uResolution * 0.5;
    g *= 0.95 + 0.05 * (0.5 + 0.5 * sin(weave.x * 3.14159) * sin(weave.y * 3.14159));
    float ridge = noise(vUv * vec2(220.0, 40.0)) * 0.5 + noise(vUv * vec2(40.0, 220.0)) * 0.5;
    g *= 0.94 + 0.12 * ridge;
    float crack = 1.0 - smoothstep(0.0, 0.03, crackle(vUv * crackScale * aspect));
    g *= 1.0 - crack * crackStrength;

    gl_FragColor = vec4(pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 0.94, 1.0);
  }
`;

const fitWithin = (width, height, max) => {
  const scale = Math.min(1, max / Math.max(width, height));
  return { w: Math.round(width * scale), h: Math.round(height * scale) };
};

const renderPass = (renderer, material, target) => {
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
  renderer.setRenderTarget(target);
  renderer.render(scene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  quad.geometry.dispose();
  material.dispose();
};

/**
 * Turn a photo into an oil painting on the GPU (runs once per masterpiece).
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Texture} photo sRGB photo texture
 * @param {{ width: number, height: number, style: string }} options
 * @returns {THREE.Texture} the painted texture, or the photo if the GPU refuses
 */
export function paintify(renderer, photo, { width, height, style }) {
  const { w, h } = fitWithin(width, height, PAINT_SIZE);
  const previousTarget = renderer.getRenderTarget();
  const options = { type: renderTargetType(renderer), depthBuffer: false };
  const flattened = new THREE.WebGLRenderTarget(w, h, options);
  const painted = new THREE.WebGLRenderTarget(w, h, {
    ...options,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  try {
    renderPass(renderer, new THREE.ShaderMaterial({
      uniforms: { tMap: { value: photo }, uTexel: { value: new THREE.Vector2(1 / w, 1 / h) } },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: KUWAHARA_FRAGMENT,
    }), flattened);
    renderPass(renderer, new THREE.ShaderMaterial({
      uniforms: {
        tMap: { value: flattened.texture },
        uResolution: { value: new THREE.Vector2(w, h) },
        uStyle: { value: Math.max(0, PAINT_STYLES.indexOf(style)) },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: FINISH_FRAGMENT,
    }), painted);
    return painted.texture;
  } catch (error) {
    console.warn('Oil painting filter unavailable, showing the photo instead.', error);
    painted.dispose();
    return photo;
  } finally {
    renderer.setRenderTarget(previousTarget);
    flattened.dispose();
  }
}

/**
 * Material that shows the painting, with a draggable "restoration" wipe
 * revealing the original photo underneath (uReveal 0..1 from the left).
 */
export function masterpieceMaterial(photo, painting) {
  return new THREE.ShaderMaterial({
    uniforms: {
      tPhoto: { value: photo },
      tPaint: { value: painting },
      uReveal: { value: 0 },
      uGlow: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tPhoto;
      uniform sampler2D tPaint;
      uniform float uReveal;
      uniform float uGlow;
      varying vec2 vUv;
      void main() {
        float edge = vUv.x - uReveal;
        vec3 color = edge < 0.0 ? texture2D(tPhoto, vUv).rgb : texture2D(tPaint, vUv).rgb;
        float seam = (1.0 - smoothstep(0.0, 0.004, abs(edge))) * step(0.002, uReveal) * step(uReveal, 0.998);
        color = mix(color, vec3(1.0, 0.78, 0.38), seam);
        gl_FragColor = vec4(color * (1.0 + uGlow * 0.08), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
