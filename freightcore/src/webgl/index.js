/**
 * WebGL: single particle field, scroll-driven.
 * Dynamically imported after first paint. One BufferGeometry, one RAF via gsap.ticker.
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { state } from '../core/state.js';

const PARTICLE_COUNT = 2200;
const COARSE = window.matchMedia('(pointer: coarse)').matches;
const DPR    = Math.min(devicePixelRatio, COARSE ? 1.5 : 2);

export function init() {
  const canvas = document.getElementById('gl');
  if (!canvas) return;

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ---- Scene / Camera ----
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);

  // ---- Particles ----
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const alphas    = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    sizes[i]  = Math.random() * 1.8 + 0.4;
    alphas[i] = Math.random() * 0.6 + 0.15;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1));
  geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas,    1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:    { value: 0 },
      uScroll:  { value: 0 },
      uColor:   { value: new THREE.Color(0xff4a1c) },
      uColorB:  { value: new THREE.Color(0x1b2836) },
    },
    vertexShader: /* glsl */`
      attribute float aSize;
      attribute float aAlpha;
      uniform float uTime;
      uniform float uScroll;
      varying float vAlpha;

      void main() {
        vAlpha = aAlpha;
        vec3 pos = position;
        // gentle drift
        pos.x += sin(uTime * 0.18 + pos.z * 0.4) * 0.4;
        pos.y += cos(uTime * 0.12 + pos.x * 0.3) * 0.3;
        // scroll parallax: layers closer to camera move faster
        pos.y -= uScroll * (0.5 + (pos.z + 15.0) / 30.0);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * (400.0 / -mv.z);
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform vec3 uColorB;
      uniform float uScroll;
      varying float vAlpha;

      void main() {
        float dist = length(gl_PointCoord - 0.5);
        if (dist > 0.5) discard;
        float soft = 1.0 - smoothstep(0.3, 0.5, dist);
        // accent particles fade in on hero scroll
        float accent = clamp(uScroll * 3.0, 0.0, 1.0);
        vec3 col = mix(uColorB, uColor, accent * vAlpha);
        gl_FragColor = vec4(col, soft * vAlpha * 0.85);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ---- Fog ----
  scene.fog = new THREE.FogExp2(0x0b0d10, 0.018);

  // ---- Resize (debounced) ----
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 150);
  }
  window.addEventListener('resize', onResize);

  // ---- Render via gsap.ticker (same RAF loop as scroll) ----
  let stopped = false;
  function tick(time) {
    if (stopped || document.hidden) return;
    mat.uniforms.uTime.value   = time;
    mat.uniforms.uScroll.value = state.heroProgress;

    // Camera: subtle scroll-driven Z pull
    camera.position.z = 18 - state.heroProgress * 4;
    camera.position.y = -state.opsProgress * 2;
    camera.rotation.z = state.networkProgress * 0.06;

    renderer.render(scene, camera);
  }
  gsap.ticker.add(tick);

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    stopped = document.hidden;
  });

  // ---- Teardown ----
  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', onResize);
    geo.dispose();
    mat.dispose();
    renderer.dispose();
  };
}
