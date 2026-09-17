import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mm, BP } from '../core/breakpoints.js';

// Parse "2.4M", "99.2%", "14,200" → number, suffix
function parseStatValue(text) {
  const clean = text.trim();
  const match = clean.match(/^([\d,.]+)(\D*)$/);
  if (!match) return { num: 0, suffix: '' };
  return {
    num: parseFloat(match[1].replace(/,/g, '')),
    suffix: match[2],
    hasComma: match[1].includes(','),
    original: clean,
  };
}

function formatNum(n, parsed) {
  if (parsed.hasComma) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + parsed.suffix;
  }
  const decimals = parsed.num % 1 !== 0 ? 1 : 0;
  return n.toFixed(decimals) + parsed.suffix;
}

export function init() {
  const section  = document.querySelector('.scale');
  const heading  = section.querySelector('.section-heading');
  const eyebrow  = section.querySelector('.eyebrow');
  const idx      = section.querySelector('.section-index');
  const stats    = gsap.utils.toArray('.scale__stat');
  const supporting = section.querySelector('.scale__supporting');

  mm.add(BP.reduced, () => {
    gsap.set([idx, eyebrow, heading, ...stats, supporting], { opacity: 1, y: 0 });
  });

  mm.add(`not ${BP.reduced}`, () => {
    gsap.set([idx, eyebrow, heading], { opacity: 0, y: 32 });
    gsap.set([...stats, supporting], { opacity: 0, y: 24 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to([idx, eyebrow, heading], {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06,
        });

        // Staggered stat reveal + counter
        stats.forEach((stat, i) => {
          const valueEl = stat.querySelector('.scale__stat-value');
          const parsed  = parseStatValue(valueEl.textContent);
          const obj     = { n: 0 };

          gsap.to(stat, {
            opacity: 1, y: 0,
            duration: 0.8, ease: 'power3.out',
            delay: i * 0.1,
          });

          gsap.to(obj, {
            n: parsed.num,
            duration: 1.6,
            ease: 'power2.out',
            delay: i * 0.1 + 0.2,
            onUpdate: () => { valueEl.textContent = formatNum(obj.n, parsed); },
          });
        });

        gsap.to(supporting, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 });
      },
    });
  });
}
