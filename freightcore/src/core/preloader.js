import { gsap } from 'gsap';

export function initPreloader() {
  const el = document.getElementById('preloader');
  const counter = el.querySelector('.preloader__counter-value');
  const rule = el.querySelector('.preloader__rule');

  // Gate: fonts + a brief minimum so the brand reads
  const fontReady = document.fonts.ready;
  const minDelay = new Promise((r) => setTimeout(r, 800));

  document.body.classList.add('is-loading');
  document.body.setAttribute('aria-busy', 'true');

  // Animate the progress bar fill and counter in parallel
  const obj = { v: 0 };
  gsap.to(obj, {
    v: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate() {
      const pct = Math.round(obj.v);
      counter.textContent = String(pct).padStart(3, '0');
      rule.style.setProperty('--fill', `${pct}%`);
    },
  });

  return Promise.all([fontReady, minDelay]).then(() => dismiss(el));
}

function dismiss(el) {
  return new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete() {
        document.body.classList.remove('is-loading');
        document.body.removeAttribute('aria-busy');
        el.style.display = 'none';
        resolve();
      },
    });
  });
}
