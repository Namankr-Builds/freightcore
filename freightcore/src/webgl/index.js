/**
 * WebGL: single particle field, scroll-driven.
 * Dynamically imported after first paint. One BufferGeometry, one RAF via gsap.ticker.
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { state } from '../core/state.js';

const PARTICLE_COUNT = 1800;
const COARSE = window.matchMedia('(pointer: coarse)').matches;
const DPR    = Math.min(devicePixelRatio, COARSE ? 1.5 : 2);

export function init() {
  const canvas = document.getElementById('gl');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 22);

  // Particles spread across a large volume so they're never clumped
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const alphas    = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    sizes[i]  = Math.random() * 1.2 + 0.3;   // small: 0.3–1.5
    alphas[i] = Math.random() * 0.45 + 0.08; // subtle: 0.08–0.53
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1));
  geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas,    1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uScroll: { value: 0 },
      uColor:  { value: new THREE.Color(0xff4a1c) },
      uBase:   { value: new THREE.Color(0x1b2836) },
    },
    vertexShader: /* glsl */`
      attribute float aSize;
      attribute float aAlpha;
      uniform float uTime;
      varying float vAlpha;

      void main() {
        vAlpha = aAlpha;
        vec3 pos = position;
        pos.x += sin(uTime * 0.14 + pos.z * 0.3) * 0.5;
        pos.y += cos(uTime * 0.10 + pos.x * 0.25) * 0.4;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        // clamp prevents enormous particles when very close
        float sz = aSize * clamp(300.0 / -mv.z, 0.5, 12.0);
        gl_PointSize = sz;
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform vec3 uBase;
      uniform float uScroll;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float soft = 1.0 - smoothstep(0.25, 0.5, d);

        // accent maxes out at 0.22 — keeps particles dim and atmospheric
        float accent = clamp(uScroll * 2.0, 0.0, 0.22);
        vec3 col = mix(uBase, uColor, accent);

        gl_FragColor = vec4(col, soft * vAlpha * 0.7);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  scene.fog = new THREE.FogExp2(0x0b0d10, 0.012);

  // Resize — debounced
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

  // Tick via shared gsap.ticker
  let stopped = false;
  function tick(time) {
    if (stopped || document.hidden) return;
    mat.uniforms.uTime.value   = time;
    mat.uniforms.uScroll.value = state.heroProgress;

    // Gentle camera drift from scroll state
    camera.position.z = 22 - state.heroProgress * 3;
    camera.position.y = -state.opsProgress * 1.5;
    camera.rotation.z = state.networkProgress * 0.04;

    renderer.render(scene, camera);
  }
  gsap.ticker.add(tick);

  document.addEventListener('visibilitychange', () => { stopped = document.hidden; });

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', onResize);
    geo.dispose();
    mat.dispose();
    renderer.dispose();
  };
}
