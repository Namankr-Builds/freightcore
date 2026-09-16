# Build notes

## Phase 2 — static skeleton

- Bug: `main { background: var(--surface-base) }` painted an opaque block across the
  whole page, so `.hero`'s `background: transparent` never actually revealed the
  `.column-rules` hairline layer or `#gl` canvas behind it — you were seeing `main`'s
  own background, not what was beneath it. Fix: only individual sections that want an
  opaque ground (`network`, `scale`, `operations`, footer) set `background`; `main`
  itself stays transparent so the hero can show the layers under it. Caught by
  screenshotting the hero at 1440px with the (JS-less) preloader removed for the
  check — the column rules were missing entirely.
