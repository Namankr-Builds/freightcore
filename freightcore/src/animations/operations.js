import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mm, BP } from '../core/breakpoints.js';
import { state } from '../core/state.js';

export function init() {
  const section  = document.querySelector('.operations');
  const heading  = section.querySelector('.section-heading');
  const eyebrow  = section.querySelector('.eyebrow');
  const idx      = section.querySelector('.section-index');
  const blocks   = gsap.utils.toArray('.operations__block');

  mm.add(BP.reduced, () => {
    gsap.set([idx, eyebrow, heading, ...blocks], { opacity: 1, y: 0 });
  });

  mm.add(`not ${BP.reduced}`, () => {
    gsap.set([idx, eyebrow, heading], { opacity: 0, y: 32 });
    gsap.set(blocks, { opacity: 0, y: 40 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([idx, eyebrow, heading], {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06,
        });
        gsap.to(blocks, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          stagger: 0.1, delay: 0.2,
        });
      },
    });

    // Scrubbed progress for WebGL camera
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 1,
      onUpdate: (self) => { state.opsProgress = self.progress; },
    });
  });
}
