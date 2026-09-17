import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mm, BP } from '../core/breakpoints.js';
import { state } from '../core/state.js';

export function init() {
  const section = document.querySelector('.network');
  const heading = section.querySelector('.section-heading');
  const eyebrow = section.querySelector('.eyebrow');
  const idx     = section.querySelector('.section-index');
  const panels  = gsap.utils.toArray('.network__panel');

  // --- Reduced-motion: all visible immediately ---
  mm.add(BP.reduced, () => {
    gsap.set([idx, eyebrow, heading, ...panels], { opacity: 1, y: 0, x: 0 });
  });

  // --- Mobile / tablet (< 1024px), full motion: stacked fade-ups ---
  mm.add('(max-width: 1023px) and (not (prefers-reduced-motion: reduce))', () => {
    gsap.set([idx, eyebrow, heading], { opacity: 0, y: 32 });
    gsap.set(panels, { opacity: 0, y: 40 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([idx, eyebrow, heading], {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06,
        });
        gsap.to(panels, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.2,
        });
      },
    });
  });

  // --- Desktop (≥ 1024px), full motion: pinned horizontal scroll ---
  mm.add('(min-width: 1024px) and (not (prefers-reduced-motion: reduce))', () => {
    const panelList = section.querySelector('.network__panels');

    // Header reveal (non-scrubbed, plays once)
    gsap.set([idx, eyebrow, heading], { opacity: 0, y: 32 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([idx, eyebrow, heading], {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06,
        });
      },
    });

    // Pin the section; scrub panels left
    const panelCount = panels.length;
    const getScrollDist = () => window.innerWidth * (panelCount - 1);

    gsap.set(panelList, {
      display: 'flex',
      flexWrap: 'nowrap',
      width: () => `${panelCount * 100}vw`,
    });
    panels.forEach((p) => gsap.set(p, { width: '25vw', flexShrink: 0, opacity: 1 }));

    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${getScrollDist()}`,
        onUpdate: (self) => { state.networkProgress = self.progress; },
      },
    });

    pinTl.to(panelList, {
      x: () => -getScrollDist(),
      ease: 'none',
    });

    return () => {
      gsap.set(panelList, { clearProps: 'all' });
      panels.forEach((p) => gsap.set(p, { clearProps: 'all' }));
    };
  });
}
