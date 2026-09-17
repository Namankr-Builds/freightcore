import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mm, BP } from '../core/breakpoints.js';

export function init() {
  const footer   = document.querySelector('.site-footer');
  const track    = footer.querySelector('.site-footer__marquee-track');
  const ctaHead  = footer.querySelector('.site-footer__cta-heading');
  const ctaBtn   = footer.querySelector('.site-footer__cta .button');
  const cols     = footer.querySelector('.site-footer__columns');
  const locs     = footer.querySelector('.site-footer__locations');
  const baseline = footer.querySelector('.site-footer__baseline');

  // --- Marquee: duplicate track for seamless loop ---
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);

  // CSS-only infinite marquee via GSAP
  const marqueeWidth = track.scrollWidth;
  gsap.set(track, { x: 0 });
  gsap.set(clone, { x: marqueeWidth });

  const marquee = gsap.timeline({ repeat: -1, paused: true });
  marquee.to([track, clone], {
    x: `-=${marqueeWidth}`,
    duration: 20,
    ease: 'none',
    modifiers: {
      x: gsap.utils.unitize((v) => parseFloat(v) % marqueeWidth),
    },
  });

  ScrollTrigger.create({
    trigger: footer,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => marquee.play(),
    onLeave: () => marquee.pause(),
    onEnterBack: () => marquee.play(),
    onLeaveBack: () => marquee.pause(),
  });

  // --- Reduced-motion ---
  mm.add(BP.reduced, () => {
    marquee.pause();
    gsap.set([ctaHead, ctaBtn, cols, locs, baseline], { opacity: 1, y: 0 });
  });

  // --- Full-motion reveals ---
  mm.add(`not ${BP.reduced}`, () => {
    gsap.set([ctaHead, ctaBtn, cols, locs, baseline], { opacity: 0, y: 24 });

    ScrollTrigger.create({
      trigger: footer.querySelector('.site-footer__cta'),
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([ctaHead, ctaBtn], {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        });
      },
    });

    ScrollTrigger.create({
      trigger: cols,
      start: 'top 85%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([cols, locs, baseline], {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        });
      },
    });
  });
}
