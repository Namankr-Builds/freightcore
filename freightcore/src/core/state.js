// Shared scroll-progress values. ScrollTrigger writes here; the WebGL render loop reads.
export const state = {
  scrollY: 0,          // raw lenis scroll position
  heroProgress: 0,     // 0→1 as hero leaves viewport
  networkProgress: 0,  // 0→1 pinned network sequence
  opsProgress: 0,      // 0→1 operations scrub
};
