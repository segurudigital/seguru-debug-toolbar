# Tasks

**Project:** Seguru Debug Toolbar
**Version target:** 2.2.3

---

## Handoff notes

**Last session:** 2026-04-16 (eleven sessions)

**What was done (session 1):**
- Implemented all v2 features: H key presentation mode, tooltip hover fix, Full mode contrast, adaptive bg luminance labels, Tree panel
- Fixed audit mismatches: config dual-source merge (wpConfig + seguruDebugConfig), getPageSlug() -wireframe-hf.html suffix, toast duration 1800ms, and initial badge colour audit work
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

**What was done (session 4):**
- Committed and pushed the release-prep snapshot to `main` (`cd83594`, `chore(release): prepare v2.0.0 release`)
- Added optional outline guides to the toolbar via a new `Outline` dropdown with `Off`, `Sections`, and `Blocks` modes
- Added `setOutline()` / `getOutline()` to the public API and made `refresh()` reapply outlines after rescans
- Synced the toolbar S mark back to the approved `docs/DESIGN.md` badge colour (`#00C0F3`) so runtime, docs, and the WordPress settings footer all match
- Added label collision management: overlapping visible labels now stagger vertically and draw a leader line back to the target element corner
- Updated README, usage docs, design spec, roadmap, changelog, and handoff notes for the outline control, badge sync, and overlap handling

**What was done (session 5):**
- Turned the UI refresh direction into a concrete phased checklist in this file
- Started Phase 1 and refactored the toolbar hierarchy to use compact value-led controls instead of separate mini labels
- Split the toolbar into primary controls (`Labels`, `Depth`) and utility controls (`Outline`, `Tree`) so the bar reads with clearer hierarchy
- Reduced visual clutter by moving from segmented table-like cells to pill-style controls, while keeping the current feature set and Shadow DOM architecture
- Updated the design spec to reflect the Phase 1 toolbar structure

**What was done (session 6):**
- Completed Phase 2 of the UI refresh in the toolbar layer
- Strengthened active states beyond orange text alone with tinted pills, border treatment, and open-state focus halos
- Made utility controls (`Outline`, `Tree`) visually diagnostic when enabled via stronger diagnostic-state styling
- Standardized hover, open, selected, and keyboard focus states across toolbar controls, dropdown options, tree actions, and the badge
- Updated task tracking and design notes for the Phase 2 interaction pass

**What was done (session 7):**
- Completed Phase 3 of the UI refresh in the on-page label layer
- Refined overlap placement so nested labels use a depth-aware stepped stack instead of a purely vertical shove
- Added depth-based horizontal inset and lift so dense label groups read more clearly across nested builders and block layouts
- Improved full-mode readability in dense layouts by clipping long labels cleanly instead of letting them sprawl
- Updated README, usage docs, design notes, changelog, and handoff tracking for the Phase 3 pass

**What was done (session 8):**
- Completed Phase 4 and Phase 5 of the UI refresh
- Strengthened section vs block outline distinction with a more structural section treatment, lighter block guides, and dark-surface-aware outline variants
- Refreshed the Tree panel into a clearer inspection surface with contextual header chips, improved row spacing and indentation rhythm, and stronger hover/focus affordances
- Added row click / keyboard jump-to-element behavior with a temporary page highlight so the Tree works as a navigation tool instead of just a list
- Updated the design spec, usage docs, changelog, and handoff tracking for the outline and Tree refresh

**What was done (session 9):**
- Ran a scripted browser QA pass against `test/demo.html` using a temporary Playwright harness
- Verified 28 checks across keyboard flows (`L`, `D`, `H`, `Escape`), outline modes, dark-background outline contrast, Tree hover/copy/jump behavior, and `refresh()` rebuilding
- Captured temporary QA screenshots for the outline and Tree states to sanity-check the visual pass
- Synced handoff/planning state so TASKS and ROADMAP reflect the completed Phase 1-5 refresh and the remaining manual QA / commit work

**What was done (session 10):**
- Bumped the project version from `2.0.0` to `2.1.0` across package metadata and both WordPress plugin entry points
- Moved the outline / label / Tree refresh work from `Unreleased` into the `2.1.0` changelog release heading
- Synced release-facing docs and packaging copy, including README install notes, usage-guide build size references, and the WordPress `readme.txt` template in `scripts/build-wp-zip.sh`
- Rebuilt the JS bundle and WordPress zip for the `2.1.0` release snapshot
- Committed and pushed the release update to `main`

**What was done (session 11):**
- Ran a post-release QA pass against the `2.2.2` repo state: syntax/build checks, WP zip build inspection, npm pack dry-run, and a release-flow/docs audit
- Fixed `release-assets.yml` so manual `workflow_dispatch` retries resolve the requested tag in the `publish-npm` job as well as the asset-upload job
- Corrected the npm install docs in `README.md` and `docs/agent-rollout-prompt.md` so bundled-app consumers no longer get sent to a nonexistent `/seguru-debug-toolbar.min.js` path without a copy step
- Corrected `docs/wordpress.md` to reference the real versioned WP zip filename produced by `npm run build:wp`
- Synced agent-context docs (`AGENTS.md`, this file) to the current 2.2.x release line and scoped npm package name
- Bumped the project version to `2.2.3`, updated release notes, rebuilt the JS bundle and WP zip, and prepared the patch for commit/push

**Where things were left:**
- `main` has the `2.2.2` distribution work plus the queued `2.2.3` patch for release-flow/docs fixes
- Source, docs, package metadata, and WordPress plugin entry points are aligned on `2.2.3`
- Local QA passes: `node --check`, `npm run build`, `npm run build:wp`, zip contents inspection, and `npm pack --dry-run`
- WordPress package build succeeds and outputs `dist/seguru-debug-toolbar-wp-v2.2.3.zip`
- Manual browser QA on a real builder page is still pending

**Next session should:**
1. Create and push the `v2.2.3` tag and publish the GitHub release so the workflow ships the patch
2. Do the final human visual QA on a real builder page, with special attention to dark hero sections, nested full-label stacks, and Tree jump behavior
3. Decide whether to remove `continue-on-error: true` from `publish-npm` after a few more green releases

---

## Sprint: v2.1.0

### Source changes
- [x] Config dual-source merge (wpConfig + seguruDebugConfig)
- [x] getPageSlug() -wireframe-hf.html suffix
- [x] Toast duration 1800ms
- [x] Badge colour synced to `#00C0F3` (Seguru S mark blue)
- [x] Feature 1 — H key presentation mode
- [x] Feature 2 — Tooltip only on direct icon hover
- [x] Feature 3 — Full mode label contrast
- [x] Feature 4 — Adaptive label colours (luminance detection)
- [x] Feature 5 — Tree panel
- [x] Feature 6 — Outline guides (Off / Sections / Blocks)

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
- [x] Bump version to 2.1.0 everywhere
- [x] Update WordPress PHP version headers
- [x] Update build-wp-zip.sh readme.txt
- [x] Update test/demo.html with new features
- [x] npm run build:wp
- [ ] Git tag `v2.1.0`

---

## UI Refresh Plan

**Goal:** Reduce toolbar cognitive load, improve hierarchy, and make dense inspection states readable without changing the product architecture.

### Phase 1 — Toolbar hierarchy cleanup
- [x] Replace mini static labels with value-led controls (`Labels: Icons`, `Depth: Blocks`, etc.)
- [x] Split the toolbar into primary controls and utility controls
- [x] Reduce heavy separators / table-like segmentation
- [x] Integrate the badge more cleanly into the toolbar chrome

### Phase 2 — Active-state polish
- [x] Strengthen active state beyond orange text alone
- [x] Make utility modes (`Outline`, `Tree`) visibly diagnostic when enabled
- [x] Standardize hover, focus, and selected states across all controls

### Phase 3 — On-page label refinement
- [x] Add collision management for overlapping visible labels
- [x] Add leader lines so offset labels still point clearly to targets
- [x] Refine stagger behavior so dense states feel more intentional and less mechanical
- [x] Improve full-mode readability in heavily nested pages

### Phase 4 — Outline visual design
- [x] Strengthen section vs block distinction visually
- [x] Explore subtle section fills to improve nesting comprehension
- [x] Validate dark-background outline behavior

### Phase 5 — Tree panel refresh
- [x] Improve Tree panel header hierarchy and context
- [x] Improve row spacing, indentation rhythm, and hover affordance
- [x] Add row click-to-jump behavior
- [x] Decide whether filtering/search is needed after visual polish

---

## Resolved decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-10 | Config key for per-page override is `seguruDebugConfig` not a second `sdtConfig` | Avoids collision with the WP-injected `sdtConfig` key; cleaner in wireframe usage |
| 2026-04-10 | ACCENT colour kept as orange (#EA580C) for UI, with the Seguru S mark blue (`#00C0F3`) reserved for the badge | Orange is the functional accent (active states, copy feedback), while the badge must match the approved Seguru mark treatment in `docs/DESIGN.md` |
| 2026-04-10 | Tree panel position shares toastPosMap offset (64px above toolbar) | Keeps tree panel adjacent to toolbar without overlapping toast |
| 2026-04-10 | Luminance threshold 0.40 for sdt-on-dark | Midpoint; validated visually — anything below 40% relative luminance is dark enough to warrant white labels |
| 2026-04-11 | Tree panel search/filter deferred after Phase 5 | Header context, click-to-jump, and improved row rhythm solve the immediate readability problem without adding UI weight yet |

---

## Blocked / waiting

None.
