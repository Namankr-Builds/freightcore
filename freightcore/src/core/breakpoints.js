import { gsap } from 'gsap';

// Shared matchMedia instance — all breakpoint-dependent timelines register here.
export const mm = gsap.matchMedia();

export const BP = {
  mobile:  '(max-width: 767px)',
  tablet:  '(min-width: 768px)',
  desktop: '(min-width: 1024px)',
  wide:    '(min-width: 1440px)',
  reduced: '(prefers-reduced-motion: reduce)',
};
