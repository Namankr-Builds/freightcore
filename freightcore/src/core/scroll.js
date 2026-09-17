import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './state.js';

gsap.registerPlugin(ScrollTrigger);

export let lenis;

export function initScroll() {
  lenis = new Lenis({ lerp: 0.08, syncTouch: true });

  lenis.on('scroll', ({ scroll }) => {
    state.scrollY = scroll;
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.config({ ignoreMobileResize: true });

  // Refresh after fonts and images settle
  Promise.all([
    document.fonts.ready,
    ...Array.from(document.images).map(
      (img) => img.decode().catch(() => {})
    ),
  ]).then(() => ScrollTrigger.refresh());

  return lenis;
}
