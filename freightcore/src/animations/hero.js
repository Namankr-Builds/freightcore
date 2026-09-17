import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { mm, BP } from '../core/breakpoints.js';
import { state } from '../core/state.js';

gsap.registerPlugin(SplitText);

export function init() {
  const section   = document.querySelector('.hero');
  const eyebrow   = section.querySelector('.eyebrow');
  const heading   = section.querySelector('.hero__heading');
  const sub       = section.querySelector('.hero__sub');
  const actions   = section.querySelector('.hero__actions');
  const scrollCue = section.querySelector('.hero__scroll-cue');

  // --- Reduced-motion: just show everything ---
  mm.add(BP.reduced, () => {
    [eyebrow, heading, sub, actions, scrollCue].forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
  });

  // --- Full motion ---
  mm.add(`not ${BP.reduced}`, () => {
    const split = new SplitText(heading, { type: 'lines,words' });
    gsap.set(split.words, { y: '110%', opacity: 0 });
    gsap.set([eyebrow, sub, actions, scrollCue], { opacity: 0, y: 24 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' })
      .to(split.words, {
        y: '0%',
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.03,
      }, '-=0.1')
      .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.7')
      .to(actions, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
      .to(scrollCue, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3');

    // Scroll cue fade out on scroll
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        state.heroProgress = self.progress;
        gsap.set(scrollCue, { opacity: Math.max(0, 1 - self.progress * 4) });
      },
    });

    return () => split.revert();
  });
}
