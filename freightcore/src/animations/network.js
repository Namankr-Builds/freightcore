import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mm, BP } from '../core/breakpoints.js';
import { state } from '../core/state.js';

export function init() {
  const section  = document.querySelector('.network');
  const heading  = section.querySelector('.section-heading');
  const eyebrow  = section.querySelector('.eyebrow');
  const idx      = section.querySelector('.section-index');
  const panels   = gsap.utils.toArray('.network__panel');

  // --- Reduced-motion ---
  mm.add(BP.reduced, () => {
    gsap.set([idx, eyebrow, heading, ...panels], { opacity: 1, y: 0, x: 0 });
  });

  // --- Full motion ---
  mm.add(`not ${BP.reduced}`, () => {
    // Header reveal
    gsap.set([idx, eyebrow, heading], { opacity: 0, y: 32 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([idx, eyebrow, heading], {
          opacity: 1, y: 0,
          duration: 0.8, ease: 'power3.out',
          stagger: 0.06,
        });
      },
    });

    // Mobile / tablet: stacked fade-ups
    mm.add(`(max-width: 1023px)`, () => {
      gsap.set(panels, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: section.querySelector('.network__panels'),
        start: 'top 80%',
        toggleActions: 'play none none none',
        onEnter: () => {
          gsap.to(panels, {
            opacity: 1, y: 0,
            duration: 0.8, ease: 'power3.out',
            stagger: 0.1,
          });
        },
      });
    });

    // Desktop: pinned horizontal scroll
    mm.add(BP.desktop, () => {
      // Build a horizontal strip inside the section
      const panelList = section.querySelector('.network__panels');
      const panelCount = panels.length;

      gsap.set(panelList, {
        display: 'flex',
        flexWrap: 'nowrap',
        width: `${panelCount * 100}vw`,
        gap: 0,
      });
      panels.forEach((p) => gsap.set(p, { width: '25vw', flexShrink: 0 }));

      gsap.set(panels, { opacity: 0, x: 60 });

      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          invalidateOnRefresh: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${window.innerWidth * (panelCount - 1)}`,
          onUpdate: (self) => { state.networkProgress = self.progress; },
        },
      });

      // Horizontal movement
      pinTl.to(panelList, {
        x: () => -(window.innerWidth * (panelCount - 1)),
        ease: 'none',
        duration: panelCount - 1,
      });

      // Each panel fades in as it enters
      panels.forEach((p, i) => {
        pinTl.to(p, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }, i * 0.8);
      });

      return () => {
        gsap.set(panelList, { clearProps: 'all' });
        panels.forEach((p) => gsap.set(p, { clearProps: 'all' }));
      };
    });
  });
}
