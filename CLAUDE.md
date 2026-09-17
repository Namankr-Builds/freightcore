# FreightCore Logistics — project rules

Scroll-driven single-page site for a fictional enterprise freight brand. This file is the contract. Read it before writing code, and re-read it before starting any new section.

## What this is graded on

This is a hiring assignment with a published rubric. Weight the work accordingly:

| Area | Weight |
| --- | --- |
| GSAP ScrollTrigger implementation quality | 20% |
| Three.js/WebGL integration & performance (60fps, no jank) | 20% |
| AI-tool process & write-up quality | 20% |
| Code structure & clarity | 15% |
| Responsive behaviour across breakpoints | 15% |
| Deployment correctness | 10% |

Performance is not polish here. It is half the animation score. A simpler sequence at a locked 60fps beats an ambitious one that stutters.

## Stack — fixed

- **Vite** (vanilla template), **plain JavaScript with JSDoc** — no TypeScript, no framework
- **GSAP 3.13+** with ScrollTrigger and SplitText (all plugins are free now; install the standard `gsap` package, never `gsap-trial`)
- **Three.js r184+**
- **Lenis 1.3+** for smooth scroll
- **Plain CSS** with custom properties. No Tailwind, no CSS-in-JS, no preprocessor.

**Do not add a dependency without asking me first.** If you think you need one, say what it is and what it replaces, and wait.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Architecture rules

```
src/
  main.js            entry: boots scroll, preloader, animations; lazy-loads webgl
  core/
    scroll.js        Lenis instance + GSAP ticker sync. THE ONLY RAF LOOP.
    state.js         plain object holding scroll progress values
    preloader.js     gated on real asset promises
    breakpoints.js   shared gsap.matchMedia contexts
  animations/        one file per section, each exporting init()
  webgl/             dynamically imported; index.js is the only entry
  styles/            tokens.css, base.css, layout.css, sections/*.css
```

1. **One RAF loop for the whole app.** Lenis is driven by `gsap.ticker`; the Three.js render loop is driven by the same ticker. Never call `requestAnimationFrame` anywhere else.
2. **Scroll never touches Three.js directly.** ScrollTrigger writes numbers into `core/state.js`; the render loop reads them. This is what keeps the two systems debuggable in isolation.
3. **One canvas, one WebGLRenderer, one context.** `position: fixed`, behind the DOM, `aria-hidden="true"`.
4. **Every animation module exports `init()` and cleans up after itself.** No side effects at import time.
5. Three.js is `await import()`ed after first paint. It must never be in the critical bundle.

## Motion rules

- Animate **`transform` and `opacity` only**. Never `width`, `height`, `top`, `left`, `margin`.
- Eases: `power3.out` for entrances, `power2.inOut` for reversible state, `expo.out` for the hero only. Never bounce or elastic.
- Durations: 0.25s micro, 0.4s UI, 0.8s reveal, 1.2s hero.
- Stagger: 0.03 chars, 0.06 lines, 0.1 blocks. Cap at 12 items.
- Entrance triggers: `start: "top 80%"`, `toggleActions: "play none none none"`. Play once — never replay on scroll-up.
- Scrubbed triggers: `scrub: 1`. **Never `scrub: true`.**
- Pinned triggers: always `invalidateOnRefresh: true`.
- Call `ScrollTrigger.refresh()` after `document.fonts.ready` and after images decode.
- Set `ScrollTrigger.config({ ignoreMobileResize: true })` once at boot.
- Every breakpoint-dependent timeline lives inside `gsap.matchMedia()`. Never inside a bare `window.innerWidth` check.

Lenis sync, exactly:

```js
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## WebGL rules

- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; clamp to 1.5 on coarse pointers.
- Particle fields are a single `BufferGeometry` or an instanced mesh. Never N meshes.
- Dispose geometries, materials and textures on teardown.
- Stop the loop when `document.hidden` is true or the canvas leaves the viewport.
- Resize is debounced and updates both the camera aspect and the renderer size.
- No post-processing passes unless I ask. They are the fastest way to lose the frame budget.

## CSS rules

- All values come from `styles/tokens.css`. If a value is not a token, ask before hardcoding it.
- Fluid type via `clamp()`; the token value is the upper bound.
- Layout with grid and flex. 12 columns desktop, 6 tablet, 4 mobile. Max width 1440px.
- Depth is a 1px `--hairline` border. **There are no shadow tokens, deliberately.**
- Corners are square (`--radius-none`) except controls (`--radius-xs`).
- Mobile-first: base styles are mobile, `min-width` queries add up from there.

## Responsive rules

Breakpoints: `768px` (tablet), `1024px` (desktop), `1440px` (wide).

- Pinning and horizontal scroll exist **only** at `(min-width: 1024px)`. Below that, the same content stacks vertically with fade-ups.
- Under `(prefers-reduced-motion: reduce)`: no pinning, no scrubbing, all reveals set to final state, canvas renders one static frame and stops, counters print their final value.
- Test at 360px, 768px, 1024px and 1440px before calling anything done.

## Accessibility

- Semantic landmarks: `header`, `main`, `section`, `footer`. One `h1`.
- Focus outline is `--focus-ring`, 2px at 2px offset. Never remove it.
- Text meets 4.5:1 on its ground.
- The canvas is decorative. No information may exist only inside it.

## Performance budget

- LCP < 2.5s, CLS < 0.1, INP < 200ms
- Sustained 60fps through the pinned sequence on a mid-range Android
- Fonts: subset woff2, self-hosted in `public/fonts/`, `font-display: swap`, preloaded. No third-party font stylesheet.
- Images: AVIF or WebP, explicit `width`/`height` to protect CLS, `loading="lazy"` below the fold.

## Commit conventions

Conventional commits, one per meaningful unit of work. The repo history is being reviewed, so it must show the build progressing in layers — not one dump at the end.

```
feat(hero): scroll-mapped headline reveal
fix(scroll): refresh ScrollTrigger after fonts resolve
perf(webgl): clamp pixel ratio on coarse pointers
```

Commit after each working step. Never batch a whole phase into one commit.

## Definition of done, per section

1. Renders correctly with JavaScript disabled (content visible, unstyled motion states resolved)
2. Passes at all four test widths
3. Reduced-motion path verified
4. No console errors or warnings
5. No dropped frames in a Performance recording of that section's scroll range

## How to work with me

- Build **one phase at a time**. Do not scaffold ahead.
- Show me the plan before writing more than ~50 lines.
- If something in this file makes a task impossible, say so instead of quietly working around it.
- When you hit and fix a real bug, note it in `NOTES.md` — it feeds the required write-up.

## Do not

- Do not use `localStorage` or `sessionStorage`.
- Do not add blue-purple gradients, glassmorphism or drop shadows.
- Do not add a second accent colour.
- Do not bake text into the canvas.
- Do not install anything without asking.
- Do not refactor files I did not ask you to touch.
