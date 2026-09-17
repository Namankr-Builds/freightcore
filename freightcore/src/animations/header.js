import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function init() {
  const header = document.querySelector('.site-header');

  ScrollTrigger.create({
    start: 'top+=80 top',
    onEnter: () => header.classList.add('is-scrolled'),
    onLeaveBack: () => header.classList.remove('is-scrolled'),
  });

  // Fade header in after preloader
  gsap.from(header, { opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 });
}
