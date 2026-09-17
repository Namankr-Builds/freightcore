import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections/header.css';
import './styles/sections/preloader.css';
import './styles/sections/hero.css';
import './styles/sections/network.css';
import './styles/sections/scale.css';
import './styles/sections/operations.css';
import './styles/sections/footer.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

import { initPreloader } from './core/preloader.js';
import { initScroll } from './core/scroll.js';

import { init as initHeader }     from './animations/header.js';
import { init as initHero }       from './animations/hero.js';
import { init as initNetwork }    from './animations/network.js';
import { init as initScale }      from './animations/scale.js';
import { init as initOperations } from './animations/operations.js';
import { init as initFooter }     from './animations/footer.js';

async function boot() {
  // 1. Preloader gates on fonts; scroll can start in parallel
  const preloaderDone = initPreloader();
  initScroll();

  // 2. Section animations register their ScrollTriggers immediately
  initHeader();
  initHero();
  initNetwork();
  initScale();
  initOperations();
  initFooter();

  // 3. Wait for preloader to dismiss, then lazy-load WebGL
  await preloaderDone;

  import('./webgl/index.js').then(({ init }) => init());
}

boot();
