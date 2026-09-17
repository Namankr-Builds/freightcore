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

  // Duplicate text inside the single track so CSS scroll is seamless
  const original = track.textContent;
  track.textContent = original + ' ' + original;

  // CSS animation handles the loop — no GSAP fighting Lenis
  track.style.display = 'inline-block';
  track.style.willChange = 'transform';
  track.style.animation = 'marquee-scroll 22s linear infinite';

  // Inject the keyframe once
  if (!document.getElementById('marquee-kf')) {
    const style = document.createElement('style');
    style.id = 'marquee-kf';
    style.textContent = `
      @keyframes marquee-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .site-footer__marquee-track { animation: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // Pause animation when footer is off-screen
  const marqueeEl = footer.querySelector('.site-footer__marquee');
  ScrollTrigger.create({
    trigger: footer,
    start: 'top bottom',
    end: 'bottom top',
    onEnter:      () => { track.style.animationPlayState = 'running'; },
    onLeave:      () => { track.style.animationPlayState = 'paused'; },
    onEnterBack:  () => { track.style.animationPlayState = 'running'; },
    onLeaveBack:  () => { track.style.animationPlayState = 'paused'; },
  });

  // --- Reduced-motion: no animation ---
  mm.add(BP.reduced, () => {
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
