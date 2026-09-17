# FreightCore — build notes (AI process write-up)

## Phase 1 — Design system & static layout
- Established full token set in `tokens.css` (colour, type, spacing, motion). All values come from here; nothing is hardcoded.
- Built mobile-first 4/6/12-column grid in `layout.css`. Max-width 1440px, `min-width` queries up.
- Wrote the complete HTML skeleton with semantic landmarks (`header`, `main`, `section`, `footer`, one `h1`).

## Phase 2 — Visual identity
- Hero: `display-xl` Archivo heading, `expo.out` easing reserved for hero only per spec.
- Header: fixed, 1px hairline bottom, transparent → frosted blur on scroll (`is-scrolled`).
- Ghost (secondary) button treatment: `transparent` fill, `--hairline` border, signal on hover.
- Preloader: hidden by default (no-JS safe), shown only when `body.is-loading`, removed from DOM on resolve.

## Phase 3 — Core infrastructure
**Bug caught:** `preloader__rule::after` used hardcoded `width: 0%`; JS sets `--fill` via `style.setProperty`. Fixed by switching `::after` to `width: var(--fill, 0%)`.

- One RAF loop: `gsap.ticker` drives both Lenis and Three.js. `requestAnimationFrame` is never called directly.
- `core/state.js` is a plain object. ScrollTrigger writes `heroProgress`, `networkProgress`, `opsProgress`; the WebGL tick reads them. This keeps the two systems debuggable in isolation — a core requirement.
- `gsap.matchMedia` contexts used for every breakpoint-dependent animation; bare `window.innerWidth` checks are absent.

## Phase 4 — GSAP ScrollTrigger animations
- **Hero:** `SplitText` on `h1`, words clip-reveal with `expo.out` 1.2s. Eyebrow, sub, actions stagger in behind.
- **Network:** Mobile stacks fade-up. Desktop (≥1024px): true pinned horizontal scroll with a 4-panel `flex` strip. `invalidateOnRefresh: true` on pin. `scrub: 1` (never `true`).
- **Scale:** Counter animation via `gsap.to` on a plain object, `onUpdate` formats the value preserving commas/decimals.
- **Operations:** Block fade-ups + scrubbed `opsProgress` feed to WebGL camera.
- **Footer:** Infinite marquee via GSAP (two cloned tracks, `modifiers.x` for seamless wrap). Paused when footer out of view.
- All entrance triggers: `start: "top 80%"`, `toggleActions: "play none none none"` — play once, never replay.

## Phase 5 — Three.js WebGL
- Single `BufferGeometry` with 2200 particles. `ShaderMaterial` — vertex drift via sin/cos, scroll parallax by layer depth.
- Fragment: additive blending, soft circular discard, accent colour fades in as hero scrolls.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))` on coarse pointers, `2` otherwise.
- Camera Z, Y, and Z-rotation are scroll-driven via `state` — no direct scroll listener in WebGL.
- Visibility API stops the tick when `document.hidden`.
- Three.js is `await import()`-ed after the preloader dismisses — never in the critical bundle.

## Decisions & trade-offs
- Particle count (2200): balanced visual density against GPU budget for mid-range Android target. Instanced mesh was considered but a single `Points` geometry is cheaper at this count.
- No post-processing: bloom was tempting but would have blown the 60fps budget on integrated GPUs.
- Marquee uses two DOM nodes + GSAP `modifiers` rather than CSS `animation` because Lenis smooth-scroll can desync pure CSS animations on some browsers.
