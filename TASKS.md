# Tasks

**Project:** Seguru Debug Toolbar
**Version target:** 2.0.0

---

## Handoff notes

**Last session:** 2026-04-10 (three sessions)

**What was done (session 1):**
- Implemented all v2 features: H key presentation mode, tooltip hover fix, Full mode contrast, adaptive bg luminance labels, Tree panel
- Fixed audit mismatches: config dual-source merge (wpConfig + seguruDebugConfig), getPageSlug() -wireframe-hf.html suffix, toast duration 1800ms, ACCENT/badge colour aligned to #002FA7
- Removed internal planning docs from `docs/endpoint-feedback/` (sanitized for public repo)
- Created AGENTS.md, TASKS.md, ROADMAP.md
- Rebuilt dist: `dist/seguru-debug-toolbar.min.js` (~26.7 KB)
- Updated CHANGELOG.md and README.md for v2

**What was done (session 2):**
- Added Seguru Debug Toolbar as a formally defined product in Seguru-Brand-Handbook.md §10 (v4.2)
- Brand definition covers: colour palette, colour separation rules, SDT design tokens, UI specs, button system, tone guidance, S mark placement, WP plugin identity, open-source positioning, and application rules across all distribution contexts
- Updated docs/DESIGN.md v1.0 → v1.1: corrected §15 badge refs to §16 (handbook renumbering), added SDT token table, added on-dark orange variant spec, added brand handbook relationship section
- Updated AGENTS.md: added brand authority section and brand/colour cross-reference to docs table

**What was done (session 3):**
- Completed the remaining v2.0.0 release-prep tasks: bumped versions to `2.0.0`, updated both WordPress plugin headers/constants, refreshed `scripts/build-wp-zip.sh` readme content/changelog, updated `test/demo.html`, and built `dist/seguru-debug-toolbar-wp-v2.0.0.zip`
- QA audit surfaced ES5/runtime compatibility regressions in `src/seguru-debug-toolbar.js` (`WeakSet`, `NodeList.forEach`, `Array.from`, `Element.closest`, two-arg `classList.toggle`)
- Replaced those APIs with loop/helper equivalents and added clipboard fallback on `navigator.clipboard.writeText()` rejection
- Rebuilt dist after the compatibility cleanup: `dist/seguru-debug-toolbar.min.js` (~27.1 KB)

**Where things were left:**
- Source, dist, package metadata, and WordPress files are now aligned on `2.0.0`
- WordPress package build succeeds and outputs `dist/seguru-debug-toolbar-wp-v2.0.0.zip`
- Demo page now documents `L`, `D`, `H`, Tree, and uses `window.seguruDebugConfig`
- No git commit, tag, or push has been made yet

**Next session should:**
1. Review the final diff and decide whether the release should include the ES5/runtime compatibility cleanup as part of `2.0.0`
2. Commit: `chore(deploy): bump version to 2.0.0`
3. Tag: `git tag -a v2.0.0 -m "v2.0.0: H key, tooltip fix, Full contrast, adaptive labels, Tree panel"`
4. Push with tags

---

## Sprint: v2.0.0

### Source changes
- [x] Config dual-source merge (wpConfig + seguruDebugConfig)
- [x] getPageSlug() -wireframe-hf.html suffix
- [x] Toast duration 1800ms
- [x] ACCENT/badge colour #002FA7 (Seguru blue)
- [x] Feature 1 — H key presentation mode
- [x] Feature 2 — Tooltip only on direct icon hover
- [x] Feature 3 — Full mode label contrast
- [x] Feature 4 — Adaptive label colours (luminance detection)
- [x] Feature 5 — Tree panel

### Repo hygiene
- [x] Remove docs/endpoint-feedback/ (internal planning docs)
- [x] Create AGENTS.md
- [x] Create TASKS.md
- [x] Create ROADMAP.md
- [x] Update CHANGELOG.md
- [x] Update README.md
- [x] Define product in Seguru-Brand-Handbook.md §10 (v4.2)
- [x] Update docs/DESIGN.md with SDT tokens, on-dark variant, brand handbook cross-refs
- [x] Update AGENTS.md with brand authority section
- [x] Bump version to 2.0.0 everywhere
- [x] Update WordPress PHP version headers
- [x] Update build-wp-zip.sh readme.txt
- [x] Update test/demo.html with new features
- [x] npm run build:wp
- [ ] Git tag and push

---

## Resolved decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-10 | Config key for per-page override is `seguruDebugConfig` not a second `sdtConfig` | Avoids collision with the WP-injected `sdtConfig` key; cleaner in wireframe usage |
| 2026-04-10 | ACCENT colour kept as orange (#EA580C) for UI, SEGURU_BLUE (#002FA7) for badge | Orange is the functional accent (active states, copy feedback), blue is brand-only |
| 2026-04-10 | Tree panel position shares toastPosMap offset (64px above toolbar) | Keeps tree panel adjacent to toolbar without overlapping toast |
| 2026-04-10 | Luminance threshold 0.40 for sdt-on-dark | Midpoint; validated visually — anything below 40% relative luminance is dark enough to warrant white labels |

---

## Blocked / waiting

None.
