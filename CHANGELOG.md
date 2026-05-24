# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [2.4.1] — 2026-05-23

Patch release fixing three regressions introduced in v2.4.0, plus an isolated-depth feature for the Target control and a breaking change to auto-ref defaults.

### Fixed

- **`clearAutoRefs()` subtree bug — nested manual refs permanently lost their labels after any T-key depth cycle.** The previous implementation used `querySelectorAll('sdt-ref-icon, sdt-ref-tooltip, …')` on each auto-ref element, which descended into children and removed label nodes belonging to nested manual `[data-ref]` elements. Those nested elements kept their `_sdtLabelled` MARKER, so `injectLabels()` treated them as already processed and never recreated the labels. Replaced the subtree query with a direct-child iteration (`el.childNodes`) that only removes label nodes that are immediate children of the auto-ref element being cleared.
- **Nav and mega menu `data-ref` elements missing on init.** Some WordPress themes (including the EC theme) stamp `data-ref` attributes onto header nav and mega menu elements after `DOMContentLoaded`, meaning they were invisible to the initial `injectLabels()` pass. Fixed by adding `lateRescan()`: an idempotent pass that runs on `window.load` (with `requestAnimationFrame` fallback when `readyState === 'complete'` at init time). The pass checks whether any unlabelled `[data-ref]` elements exist and, if so, runs `convertClassRefs()`, `autoRefSections()`, `injectLabels()`, `resolveLabelOverlaps()`, and `buildTreePanel()`. Fully idempotent — existing labels are never duplicated.
- **Auto-generated refs now receive the correct Level class.** Legacy auto-ref names like `page-01-h2` do not carry enough v5 grammar to classify as elements, so `injectLabels()` was stamping every auto-generated ref as `sdt-ref-class-section`. Auto-ref now stores an internal `data-sdt-auto-level` stamp (`section` / `block` / `element`) and uses that for Level filtering while keeping the public `data-ref` value unchanged.
- **v5 fixture pages load correctly when opened directly.** The fixture pages now set `seguruDebugConfig` before loading the toolbar and point at the existing source file rather than the non-existent `dist/seguru-debug-toolbar.js` dev bundle.
- **Demo auto-ref checkbox reflects the v2.4.1 default.** With no URL params, the Auto-ref checkbox is now unchecked to match the runtime default of Target Off.
- **Toolbar fits narrow mobile viewports with the Level control present.** Toolbar chrome now wraps within the viewport instead of overflowing off-screen on 375px-wide screens.

### Added

- **Isolated target depths** — each Target level now shows only its own depth's auto-ref elements, not an accumulated superset. Previously Blocks included all section selectors, and Elements included all section + block selectors. The selector lists are now split into `SELECTORS_SECTION`, `SELECTORS_BLOCK_ONLY`, and `SELECTORS_ELEMENT_ONLY`; each depth uses its own isolated list. `AUTO_REF_DEPTH_MAP` maps each depth key to its isolated selector list.
- **"All" target depth** — new `DEPTH_CYCLE` value `'all'` (displayed as "All — sections, blocks & elements") that shows all three levels simultaneously. Added to the depth dropdown above Elements and to the `T`-key cycle. `SELECTORS_ALL` is the concatenation of all three isolated lists. The default `autoRefDepth` when auto-ref is enabled is now `'all'` (was `'element'`).

### Changed

- **Auto-ref is now OFF by default (breaking).** Previously auto-ref was opt-out: it was enabled unless `sdtConfig.autoRef === '0'` or `false`. It is now opt-in: it is only enabled when `sdtConfig.autoRef === '1'` or `true`. Standard embeds that relied on auto-tagging need to explicitly set `seguruDebugConfig.autoRef = true`; WordPress sites enable it through Settings → Debug Toolbar → Page Builders. Pages that use manual `data-ref` attributes are unaffected.

---

## [2.4.0] — 2026-05-23

Support for data-ref v5.0 three-level grammar (section / block / element). Four deliverables: a grammar classifier baked into `injectLabels`, a Level filter dropdown, a hover-triggered active-ref context tree, and block group collapse for dense sections.

### Added

- **`classifyDataRef(ref)`** — tail-of-segments parser that classifies any data-ref string as `section` (2-segment semantic tail), `block` (block-type from §4.4 vocabulary + 2-digit NN tail), `element` (element noun from §4.2 + two 2-digit index segments + role token), or `unclassified` (malformed — rendered with a console warning but never dropped). Exported on the public API as `seguruDebugToolbar.classifyDataRef()`. `BLOCK_TYPES` and `ELEMENT_NOUNS` vocabularies follow data-ref spec §4.4 and §4.2 respectively.
- **Level filter dropdown** — third primary toolbar control. Three modes cycled by pressing **F**: "All" (default, existing behaviour), "Sec+Blk" (sections + blocks), "Sections" (sections only). Implemented via `body.sdt-filter-section` / `body.sdt-filter-section-block` CSS body-class pattern; each `[data-ref]` element receives `sdt-ref-class-{class}` from `injectLabels()` so filtering requires no DOM re-traversal. Public API: `setLevelFilter(value)` / `getLevelFilter()`. Config key: `levelFilter`. Emits `sdt:level-filter-change` event.
- **Active-ref tree panel** — fixed-corner overlay that appears on `sdt:dataref-hover` (fired by icon/label `mouseenter`). Displays the full data-ref breadcrumb chain from outermost `[data-ref]` ancestor down to the hovered element, each row showing grammar class + ref value, click-to-copy. Positioned at the opposite vertical edge from the toolbar (bottom-right toolbar → tree at top-right) so it never overlaps controls or the existing Tree panel. Pin button locks it open; Escape / `hide()` dismisses. Dismisses automatically with a 120ms grace period when unpinned.
- **Block group collapse badge** — when a section has more than 6 direct-child block-class refs and level filter is "All", those blocks are collapsed into a single orange `+N blocks` pill on the section element. Hovering the pill expands a popover listing each block's type and ref value, click-to-copy. Collapsed blocks are skipped by the overlap solver so they don't consume collision slots. Collapse does not activate when level filter is "Sec+Blk" or "Sections" (block pills are either individually visible or hidden by the filter — no redundant grouping).
- **`sdt-ref-class-{section|block|element|unclassified}`** body-classes stamped on every `[data-ref]` element by `injectLabels()`. Used by level filter CSS, block group collapse, and the active-ref tree classifier.
- **Test fixtures** in `test/fixtures/v5-data-ref/`: `non-block-bearing.html`, `block-bearing-small.html` (≤6 blocks, no collapse), `block-bearing-dense.html` (8 blocks, collapse), `mixed.html` (all patterns + v4.0 legacy refs + unclassified ref).

### Changed

- Toolbar primary cluster now shows Labels → Target → Level (three controls). Utility zone unchanged.
- `resolveLabelOverlaps()` runs `clearBlockGroupCollapse()` + conditional `applyBlockGroupCollapse()` at the top of each pass, before the placement loop. Block-group members skip collision detection.
- `refresh()` now calls `applyLevelFilter()` after `applyOutlineMode()`.
- `hide()` now calls `dismissActiveRefTree()` so a single Esc/hide clears every secondary surface.
- `applyDockPosition()` now applies `activeRefTreePosMap` to the active-ref tree element.
- docs/design.md updated with Level filter, active-ref tree, and updated IA diagram (v1.5).

### Backward Compatibility

v4.0 pages continue to work unchanged. Their refs match the element classifier pattern (element noun in segs[-4], two 2-digit indices in segs[-3..−2], role token in segs[-1]). Section wrapper refs of the form `page-section-wrapper-NN-NN-role` also classify as element since `wrapper` is in `ELEMENT_NOUNS`. Level filter "Sections only" on a v4.0 page correctly shows nothing (those pages have no section-class refs — graceful degradation per spec §12.5).

---

## [2.3.1] — 2026-05-21

Two related fixes for ref-label crowding on dense pages, both surfaced from an EC cowork session against `https://expeditioncentre.local/Pages/mulgo/mulgo-screen.html` and `home-screen.html`:

1. **Click-intercept hotfix** for labels overlaying mega menus, dropdowns, and any other container hidden with `opacity:0` / `visibility:hidden` / `display:none`. Reproduced in a 200ms opacity ease-out close transition on `.ec-mega-menu` panels. Two-layer defence — a structural belt that defaults labels to `pointer-events: none` (opt-in via the new `.sdt-visible-host` class) and a timing brace that eager-hides descendant labels the moment an ancestor's class/style mutates, before the next rAF tick can read a mid-transition opacity value.
2. **Cluster collapse** for the residual case where N labels would still pile at the same anchor after the overlap solver exhausts its lift attempts (typically tightly nested refs — e.g. an article with `h3 + summary + p` all data-ref'd). The unplaceable labels are hidden and surfaced via a single orange "+N" badge next to the placed label; hovering the badge expands a popover listing each clustered ref, click-to-copy with the same semantics as a normal label.

### Fixed

- **Labels can no longer intercept clicks while their host ancestor is hidden or fading.** Before this release, an SDT `.sdt-ref-icon` inside an `opacity:0` mega menu (or any `display:none` / `visibility:hidden` container) was still laid out at its real position with `pointer-events: auto`. Because opacity cascades visually but the icon's own `pointer-events:auto` overrode the parent's `pointer-events:none`, invisible icons silently captured clicks meant for the visible page beneath. On dense pages with hidden mega menus, this also presented as "label stacking" — dozens of invisible icons clustered at the menu's would-be position.
- **No more close-transition race.** On the close path (e.g. a mega menu fading 1 → 0 over 200ms), the `MutationObserver` introduced in this release fires on the class removal, but the next rAF tick reads `getComputedStyle(...).opacity` at the *animated* mid-transition value (~0.94 at +16ms). The old `parseFloat(opacity) === 0` check treated that as visible and kept labels hit-testable for ~16–200ms while the panel faded out. The new mid-transition guard treats opacity ∈ (0, 1) as untrusted whenever an ancestor's `transition-property` covers `opacity` / `visibility` / `all` with a non-zero `transition-duration`, and the eager-hide-on-mutation pass closes the same window structurally.
- **Hidden labels no longer push visible ones around in the overlap solver.** `resolveLabelOverlaps()` now skips refs flagged hidden so their would-be positions don't consume collision slots.
- **No more piles of stacked labels on dense pages.** Previously the offset solver tried 6 vertical lifts × 18px = 108px max, then gave up — leaving the unplaceable label piled on top of the winner. On nested-ref structures (e.g. `<article data-ref> > <h3 data-ref> + <p data-ref>` where all three sit at the same top-left) this produced a wall of overlapping labels even with the depth indent applied. The solver now collapses unplaceable labels into a clickable `+N` badge instead (see Added below).

### Added

- **`.sdt-visible-host` class** — pointer-events gate. `.sdt-ref-icon` and `.sdt-ref-full-label` now default to `pointer-events: none`; they opt back in to `pointer-events: auto` only when `applyLabelVisibilityState()` has confirmed the host is effectively visible and adds this class. This is the structural belt: even if a future regression breaks the reactive `.sdt-ref-hidden` toggle, labels can never intercept clicks unless explicitly marked safe. Paired with the timing brace below.
- **Cluster collapse with `+N` hover popover.** When the overlap solver exhausts all `LABEL_OFFSET_LIMIT` lift attempts and a label still collides, the label is hidden (`.sdt-ref-clustered`) and stashed on the placed owner's `_sdtCluster` list. After all placements are known, owners with non-empty clusters get a small orange `+N` badge appended next to their active label. Hovering the badge expands a popover listing each clustered ref as `tag · data-ref-value`; clicking a row copies the ref value to clipboard and fires the standard `sdt:dataref-click` event (same semantics as a normal label click). Badge respects `body.sdt-hide` / `body.sdt-presentation` (hidden alongside labels) and switches to a light-on-dark variant via the same `sdt-on-dark` luminance class as the labels.
- **`.sdt-ref-hidden` class** — display gate, toggled on icon / tooltip / full-label / link when the host fails `isEffectivelyVisible()`. Composes with the existing `body.sdt-hide` / `body.sdt-full` / `body.sdt-presentation` rules via `display: none !important`.
- **Live visibility tracking** — a `MutationObserver` watches `style` / `class` / `hidden` attribute mutations across `document.body` (debounced via `requestAnimationFrame`), plus a `transitionend` listener for `opacity` / `visibility` / `display` transitions. Labels appear the moment a mega menu opens and disappear when it closes, with no host integration required. Mutations on SDT's own label nodes are filtered to prevent feedback loops when `.sdt-ref-hidden` / `.sdt-visible-host` are toggled.

### Internal

- `isEffectivelyVisible(el)` walks ancestors checking `display`, `visibility`, and `opacity`. Stops at `<html>` to avoid measuring the document itself. Treats `opacity === 0` as hidden unconditionally; treats `opacity ∈ (0, 1)` as hidden only when an ancestor's transition involves opacity/visibility/all with non-zero duration (the transitionend listener will re-evaluate once settled).
- `isOpacityTransitioning(cs)` — paired helper that reads `transitionProperty` and `transitionDuration` (parsed as comma-separated lists per spec, with the first duration filling shorter lists) and returns true when an opacity transition is configured.
- `eagerHideDescendantLabels(node)` runs synchronously from the MutationObserver before `scheduleVisibilityRecheck()`. Adds `.sdt-ref-hidden` and removes `.sdt-visible-host` on every labelled `[data-ref]` descendant of the mutated node, clearing the cached `_sdtVisible` flag so the next rAF re-evaluates. Worst case is a 1-frame flicker for labels that turn out to still be visible.
- New CSS rules `.sdt-ref-icon.sdt-visible-host` / `.sdt-ref-full-label.sdt-visible-host` set `pointer-events: auto`; base `.sdt-ref-icon` / `.sdt-ref-full-label` now default `pointer-events: none`. The pointer-events change is the only behavioural delta to the label CSS in this release.
- `resolveLabelOverlaps()` now tracks `{ rect, owner }` per placed slot instead of just rects, so unplaceable labels can be attached to the colliding owner's cluster via `addToCluster()`. `renderClusterBadgeIfNeeded()` runs in a second pass after all placements are settled. `clearClusters()` runs at the top of each `resolveLabelOverlaps()` call to wipe `.sdt-ref-clustered` from previously-clustered labels, remove existing `.sdt-cluster-badge` nodes, and reset per-owner `_sdtCluster` / `_sdtClusterBadge` references — so mode/depth/visibility transitions rebuild cleanly with no stale badges.
- Badge styling: orange pill (`rgba(234,88,12,0.18)` bg, `#EA580C` text) on light surfaces; white-on-dark variant via the existing `sdt-on-dark` luminance branch. Popover is `display:none` by default, `display:flex` on `:hover` of the badge or popover (so cursor can move from badge → popover without dismissing).

### Verification

Click-intercept probe — `home-screen.html`, 345 refs, `elementsFromPoint` at a 60×60 grid (168 sample points) across the nav-panel area. Numbers are v2.3.0 → v2.3.1:

- Steady state, panel closed: 17 → 1 intercepts (all from real visible nav content)
- Opened state: 26 → varies (real visible content)
- **Close t=50ms (opacity ≈ 0.86): 26 → 2 — 15 mega-menu race intercepts eliminated**
- Close t=150ms (opacity ≈ 0.01): 20 → 1
- Close t=250ms (opacity = 0, settled): 17 → 1

Cluster-collapse probe — `mulgo-screen.html`, 411 labels, depth=element, label-mode=Full:

- v2.3.0: 314 visible labels, **45 overlapping pairs**, worst refs participate in 4 overlaps each
- v2.3.1: 273 visible labels + 41 clustered into 21 `+N` badges, **0 overlapping pairs**
- Icons mode (`L=0`): 235 visible + 79 clustered into 40 badges
- L cycle (Full → Off → Icons): badge count 21 → 0 → 40, zero stale badges across transitions
- T cycle (Section → Element): badge count 35 → 41, zero duplicates per owner
- Popover row click copies the clustered ref value to clipboard (verified via `navigator.clipboard.writeText` shim)

Demo page (`test/demo.html`): click-to-copy verified on a visible icon (`test-demo.html-18-button` → toast "Copied:" fires). Label-mode cycling (L), depth cycling (T), and outline cycling (O) unchanged. WP build (`npm run build:wp`) produces `dist/seguru-debug-toolbar-wp-v2.3.1.zip` (28 KB compressed).

---

## [2.3.0] — 2026-04-26

Public-API improvements that make SDT a better neighbour to other on-page tools (overlays, sidebars, devtools, review panels). All additions are non-breaking — every documented method from earlier versions (`setState` / `getState` / `setDepth` / `getDepth` / `setOutline` / `getOutline` / `refresh` / `toggleTree`) keeps the same signature and behaviour.

### Added

- **Lifecycle methods on `window.seguruDebugToolbar`** — `hide()`, `show()`, `toggle()`, and `isVisible()`. Idempotent, safe to call before SDT has finished booting (the desired state is applied during init), and emit `sdt:show` / `sdt:hide` events. `setState({ hidden: ... })` is no longer the recommended path; the new methods are canonical and the lower-level `setState` stays for label-mode control.
- **Configurable visibility hotkey** — `init({ hotkey: 'D' })`, `setHotkey('Z')`, or `data-hotkey="D"` on the script tag. Default remains `H` for backwards compatibility. Pass `false` to disable the binding entirely. Hotkey is ignored in inputs / textarea / select / contenteditable, and ignored when Cmd / Ctrl / Alt / Meta / Shift are held. Tightened to `A`–`Z` only — anything else falls back to `H` with a console warning.
- **Esc cycles toward "everything closed"** — open dropdown → close dropdown; else open Tree panel → close Tree; else toolbar visible → hide it. Bound unconditionally with the same focus + modifier guards as the visibility hotkey.
- **Theme system** — `setTheme('auto' | 'light' | 'dark')`, `getTheme()`, `init({ theme: 'dark' })`, `data-theme="dark"`. `auto` (default) follows OS `prefers-color-scheme` plus the host's `html.dark` class and listens to `matchMedia` change events so the toolbar updates as the OS appearance flips. A `MutationObserver` watches `<html>` for class changes so `getTheme()` stays in sync when the host toggles dark mode dynamically. The chosen value is persisted under the `seguru-debug-toolbar:theme` localStorage key. Internally the toolbar applies `sdt-theme-dark` on its shadow host; the legacy `:host-context(html.dark)` selectors are kept in parallel so existing hosts that toggle `html.dark` continue to work without changes.
- **Public events on `window`** — `sdt:ready`, `sdt:show`, `sdt:hide`, `sdt:theme-change`, `sdt:depth-change`, `sdt:outline-change`, `sdt:user-change`, `sdt:dataref-click`, `sdt:dataref-hover`, `sdt:dataref-leave`. All dispatched as `CustomEvent`s on `window`, with an `sdt:` prefix to avoid collisions. `dataref-*` events carry `{ dataRef, element, current }` so consumer tools (review sidebars, feedback panels, QA tools) can wire SDT into their own UX without SDT taking a dependency on them.
- **Identity hook** — `setUser({ name, role, id, email })` / `setUser(null)` / `getUser()`, plus `init({ user })`. When set, the toolbar renders a small Seguru-blue avatar + name + role pill in its chrome. The pill uses `role="status"` (no `aria-live` over-announce) and the avatar is `aria-hidden` (decorative — the name carries meaning to screen readers). `setUser()` snapshots the documented public fields only; `getUser()` returns a fresh clone every call so external mutation can't reach SDT's stored state. SDT never reads cookies or auth tokens itself; hosts call `setUser()` from their own auth code.
- **Configurable dock position** — `init({ dock: 'bottom-left' })`, `setDock('top-right')`, `getDock()`, or `data-dock="bottom-left"`. Accepts `bottom-right`, `bottom-left`, `top-right`, `top-left`, or `'auto'`. The legacy `position` config key is still honoured as an alias. `'auto'` runs a one-shot heuristic at boot: it inspects fixed and sticky elements ≥100×100px and picks the corner with no overlap (preference: bottom-right → bottom-left → top-right → top-left). Dock can be changed at runtime — toast and Tree panel positions follow, and any open dropdown closes automatically to avoid stale positioning.
- **`init(opts)` method** — runtime convenience for applying `{ hotkey, theme, dock, user }` after script load. Returns the API object for chaining.
- **`seguruDebugToolbar.version` static property** — exposes the bundled SDT version. The same value is emitted in the `sdt:ready` event payload via a single `SDT_VERSION` constant so the two never drift.
- **Dynamic mode-dropdown hint** — the "Press L to cycle · H to hide all" hint inside the Labels dropdown now reflects the currently bound visibility hotkey, so rebinding via `setHotkey('Z')` updates the hint text in place instead of leaving stale copy.
- **`docs/integrations.md`** — generic integration guide covering theme-sync with a host theme system, identity from a host auth system, and listening for `sdt:dataref-click` to wire SDT into a custom review or feedback panel. Includes a worked example of all three composed into a review-sidebar-style host.

### Changed

- **Dock / toast / tree panel positioning** — applied via inline styles instead of being baked into the static shadow CSS, so `setDock()` can update the corner at runtime. Visual output is unchanged.
- **User pill visual hierarchy** — avatar now uses Seguru blue (`#00C0F3`, matches the badge) instead of the orange UI accent so the identity affordance reads as identity, not as another active control. A subtle left divider separates the pill from the badge when both are present, and the role text is rendered at 10px in normal case for legibility (was 9px uppercase).
- **README** — six new sections (Programmatic control, Hotkey, Theme, Events, Identity, Dock position) covering the additions above. Adds a config-precedence table, a full public-API surface table (now includes `toggleTree()`, previously undocumented), and a scope note clarifying that the theme system controls toolbar chrome only — on-page `[data-ref]` labels keep their per-element luminance detection so they always read clearly against the surface they sit on.
- **Bundle size** — ~51.2 KB minified (up from ~42 KB) for the additional API surface, theme management, event bus, user pill chrome, html-class observer, and dock-auto heuristic.

### Fixed

- **User pill no longer leaks stale identity after `setUser(null)`** — `renderUser()` was leaving the previous user's avatar initial, name, and role inside the pill spans when the pill was hidden. Visually the pill is `display:none` so users never saw it, but `role="status"` content can be surfaced by some assistive-tech flows even when hidden, so a previous reviewer's name could leak after sign-out. Spans are now wiped to empty strings on clear. Surfaced by the Playwright browser QA pass.
- **S badge alignment + size** — the badge had asymmetric padding (`0 8px 0 4px`), so the 16px SVG sat offset-left within its 28px click area; the offset was visible whenever a user hovered the badge. Padding is now symmetric (`0 6px`) and the SVG bumps to 20px so the brand mark reads with proper weight next to the 18px user-pill avatar. Surfaced by the user QA pass.
- **User pill avatar colour clash with the badge** — the avatar was Seguru blue (matching the badge), so the two cyan circles read as duplicated when sat side-by-side. Avatar moves to a neutral dark slate (`#111827`) in light mode and zinc (`#71717A`) in dark mode so the S badge remains the single Seguru-blue anchor in the toolbar.
- **Demo `Dark mode` button is now reliable** — previously it only toggled `html.dark`, so it was a no-op once SDT had been pinned to a specific theme via `setTheme()` (or via persisted localStorage from a prior session). The button now also calls `seguruDebugToolbar.setTheme()` directly so the toggle works regardless of pinned/persisted state. The demo also drops its `autoRef:'0'` override when no URL param is set, so the new SDT default (Target=Elements) flows through cleanly.

### WordPress

- **WP plugin bumped to 2.3.0** — both the installable plugin (`wordpress/seguru-debug-toolbar/seguru-debug-toolbar.php`) and the mu-plugin drop-in (`wordpress/seguru-debug-toolbar.php`); `SDT_VERSION` constant updated. The self-update hook on existing 2.2.x installs picks up 2.3.0 automatically within ~6 hours.
- **WP plugin keeps auto-ref opt-in** — the SDT engine now defaults `autoRef` to ON for static / npm / CDN consumers, but the WordPress plugin's `sdt_auto_ref` setting stays at `'0'` by default so a fresh activation doesn't unexpectedly DOM-walk a large WP site. Admins explicitly enable it under Settings → Debug Toolbar → Page Builders, same as before.
- **Settings-page UI text updated** — "Start hidden (press H to reveal)" → "press D to reveal"; the auto-ref description now points at the **Target** dropdown and the **T** key. Added a "Keyboard shortcuts" card under How It Works covering L / T / O / D / Esc.
- **`build-wp-zip.sh` readme.txt template** — feature bullets updated for the new keymap and the public API additions (events, identity hook, dock auto), bundle size note refreshed (~52 KB), and a 2.3.0 changelog block added so plugin-directory listings stay current.
- **`docs/usage-guide.md` and `docs/wp-settings-page.md`** — Depth → Target rename applied, key-map references aligned, and a back-compat note added so readers know `setDepth()` / `getDepth()` API method names haven't moved.

### Internal

- **Browser QA harness** — three QA test pages added under `test/` (`qa-preboot-hide.html`, `qa-hotkey-disabled.html`, `qa-dock.html`) covering scenarios that need different boot config than the main `test/demo.html`. Designed to be driven by Playwright MCP for the full §8 smoke checklist.
- **`AGENTS.md` updated** with an explicit canonical-task-tracking workflow: TASKS.md is the source of truth for open work (Sprints → Phases → subtasks), CHANGELOG.md records what shipped, ROADMAP.md is the forward view, and agent todo trackers mirror TASKS.md only — never the source of truth on their own. All three docs must be in sync at the start and end of every session.

### ⚠️ Breaking — keymap + defaults

These are the only behavioural breaks in 2.3.0. Anything not listed here is additive.

- **Default visibility hotkey changed from `H` to `D`** (for "Debug"). The hotkey is configurable, so hosts that prefer the old key can set `init({ hotkey: 'H' })`, `data-hotkey="H"`, or `setHotkey('H')`.
- **`D` no longer cycles Target depth** (it's now the visibility hotkey). The Target cycle moved to **`T`**.
- **New fixed key `O`** cycles Outline (Off → Sections → Blocks). Previously Outline was toolbar-only, no key binding.
- **Esc is now a global one-shot hide** — it closes any open dropdown, the Tree panel, and dismisses the toolbar in a single press. Previously Esc only closed open dropdowns.
- **Auto-ref defaults to ON** — Target boots at Elements out of the box. Pre-2.3.x required `autoRef: true` to enable. Hosts that want the previous opt-in behaviour can set `seguruDebugConfig.autoRef = false` (or `'0'`).
- **Toolbar UI label `Depth` renamed to `Target`** — the public API methods `setDepth()` / `getDepth()` keep their names so existing consumers don't break; only the user-facing label changed.

### Migration

- All additions are additive. No public method, config key, or event surface from 2.2.x has changed shape. Existing consumers that use `setState({ hidden: true })` to dismiss the toolbar continue to work; `hide()` is the new canonical equivalent.
- Hosts that toggle `html.dark` for dark mode keep working without any code changes — the legacy selectors are still active alongside the new theme system.
- If you've trained users to press `H`, the simplest migration is `seguruDebugToolbar.setHotkey('H')` after page load (or `data-hotkey="H"` on the script tag).

---

## [2.2.3] — 2026-04-16

### Fixed

- **Manual npm re-run path in `release-assets.yml`** — `workflow_dispatch` retries now resolve the tag input in the `publish-npm` job, so rerunning `gh workflow run release-assets.yml -f tag=v2.2.3` checks out the correct ref before publish instead of failing on an empty tag.
- **README npm install guidance** — the bundled-app example no longer points at a nonexistent `/seguru-debug-toolbar.min.js` path immediately after `npm install`. The docs now show a dev-only source import and explicitly note that a public-root script tag requires copying the built file into `public/` first.
- **WordPress install docs** — `docs/wordpress.md` now points at the real versioned build artifact (`seguru-debug-toolbar-wp-vX.Y.Z.zip`) so local build/install instructions match `npm run build:wp`.

### Changed

- **AI-agent rollout prompt** — switched the recommended CDN example to the canonical npm-backed jsDelivr URL and added the scoped npm install path plus the corrected React/Next bundled-app pattern.
- **Agent handoff docs** — `AGENTS.md` and `TASKS.md` now reflect the current 2.2.x release line and scoped npm package name.

---

## [2.2.2] — 2026-04-16

### Changed

- **npm package renamed to `@segurudigital/seguru-debug-toolbar`** — scoped to the `segurudigital` npm org. Install: `npm install @segurudigital/seguru-debug-toolbar`. Previously the unscoped `seguru-debug-toolbar` name was planned but never published. The scoped name signals org ownership, guarantees the namespace is available, and is the canonical install going forward.
- **WordPress mu-plugin drop-in** — `node_modules/` auto-detect now checks the scoped path (`@segurudigital/seguru-debug-toolbar/dist/...`) first, falling back to the unscoped path for compatibility with any local installs that predate the rename.
- **ROADMAP** — npm + CDN checklist updated: GitHub-direct jsDelivr is live, npm publish automation is wired via the release workflow, and the npm-backed jsDelivr URL is flagged for a README swap after first successful publish.

### Fixed

- **Release workflow zip selection** — `release-assets.yml` now derives the WordPress zip path directly from `package.json` instead of globbing `dist/` and picking alphabetically, which was attaching stale historical zips (e.g. `v1.3.0`) to new releases.
- **Portable `sed` in the WP zip build script** — BSD-vs-GNU `sed -i` divergence fixed by switching to `perl -i -pe`. Enables the GitHub Actions Linux runner to build the WP zip.

### Added

- **First live npm publish** — the `publish-npm` job in the release workflow ships `@segurudigital/seguru-debug-toolbar` to npmjs.org with `--provenance` signing on every release. Gated on the `NPM_TOKEN` repo secret.

---

## [2.2.1] — 2026-04-16

### Fixed

- **Canonical GitHub org slug** — every reference to `seguru-digital/seguru-debug-toolbar` (with hyphen) corrected to `segurudigital/seguru-debug-toolbar` (no hyphen — the real GitHub account). The 2.2.0 release shipped with the wrong slug baked into the WordPress self-update hook (`SDT_GITHUB_REPO`) and all jsDelivr install snippets, meaning self-update calls 404-ed silently and CDN URLs didn't resolve. Install 2.2.1 manually on any site running 2.2.0 — subsequent releases self-update correctly.
- **Portable `sed` in the WP zip build script** — `sed -i ''` is BSD-only and fails on GitHub Actions ubuntu runners. Replaced with `perl -i -pe` which behaves the same on macOS and Linux. (Landed post-2.2.0 but documenting here for completeness.)

### Added

- **npm publish automation** — `release-assets.yml` now has a `publish-npm` job that publishes the package to npmjs.org after the GitHub release assets upload. Uses `--provenance` for signed package attestation. Gated on `NPM_TOKEN` repo secret. Runs `continue-on-error: true` initially so a misconfigured token doesn't block the GitHub release. See AGENTS.md "npm publish setup" for the one-time token generation steps.
- **npm package metadata** — `package.json` now includes `homepage`, `bugs`, `publishConfig`, and `unpkg`/`jsdelivr` entry points. `.npmignore` prevents WordPress bits, docs, and build tooling from shipping to npm consumers. The tarball is 6 files, ~35 KB.

---

## [2.2.0] — 2026-04-16

### Added

- **GitHub-based self-update for the WordPress plugin** — the installable plugin now queries the GitHub releases API every 6 hours and surfaces a standard "Update available" notice on the Plugins and Dashboard → Updates screens. One click installs the new zip via the normal WP upgrader. No separate update server or subscription required. Response cached in the `sdt_github_release` transient; clear it to force a recheck.
- **jsDelivr install path** — documented CDN install via `cdn.jsdelivr.net/gh/segurudigital/seguru-debug-toolbar@<tag>` with pinning guidance (`@v2` for auto-minor, `@vX.Y.Z` for production, `@latest` for wireframes only).
- **AI-agent rollout prompt** — `docs/agent-rollout-prompt.md` — pasteable, self-contained prompt for Claude Code, ChatGPT, Codex, Cursor, and any other LLM-based agent. Instructs the agent to install the toolbar, apply the Seguru naming convention for `data-ref`, and keep refs stable from wireframe through to production.
- **`startHidden` config key** — `window.seguruDebugConfig.startHidden` (default `true`) controls whether the toolbar loads visible or hidden. Override to `false` to restore pre-2.2.0 behaviour per-page.
- **WordPress admin toggle: "Start hidden"** — new checkbox under Display (default on) maps to `sdt_start_hidden` option and feeds through to the JS as `startHidden`.
- **Release workflow** — `.github/workflows/release-assets.yml` attaches `seguru-debug-toolbar.min.js` and `seguru-debug-toolbar-wp-v<version>.zip` to every published GitHub release, verifies `package.json` matches the release tag, and supports manual re-runs via `workflow_dispatch`.

### Changed

- **Default Labels mode is now Full (mode 2)** — was Icons. Labels show persistent text on every `data-ref` element out of the box. Press `L` to cycle.
- **Default Depth is now Elements** — was Sections. Auto-ref scans the densest level by default so every meaningful element is tagged without a manual step.
- **Default presentation mode is ON** — the toolbar loads hidden on every page. Press `H` to reveal. Keeps screenshots, Chrome debug captures (including AI-agent browsing sessions), and client demos clean by default without a per-page opt-out.
- **WordPress admin — "Default mode" radio order** — Full now appears first and is marked `(default)`. Icons and Off follow.
- **Docs refreshed** — `docs/usage-guide.md` Presentation mode section, Depth section, and Full mode description all reflect the new defaults. `docs/wordpress.md` gets a new "Automatic updates from GitHub" subsection. `README.md` Install section leads with the CDN snippet.
- **Agent context (`AGENTS.md`)** — new "Release flow" section documents the three-step cut-a-release process; new entries in "What to read when" for the rollout prompt.

### Migration notes

- **Existing WordPress installs on v2.1.0 will not receive the update notice automatically** — the self-update hook is new in 2.2.0, so the first upgrade requires one manual zip upload per site. All subsequent releases update in-place.
- **Clients used to the toolbar appearing on load will need to press H** the first time they visit a page after the upgrade. If this is undesirable for a specific site, an admin can untick "Start hidden" under Settings → Debug Toolbar.
- **Per-page overrides are backwards-compatible** — `window.seguruDebugConfig` still accepts the same keys as before. The new `startHidden` key is additive.

---

## [2.1.0] — 2026-04-11

### Added

- **Outline guides** — New `Outline` dropdown with `Off`, `Sections`, and `Blocks` modes. Section mode adds solid orange boundaries to top-level sections. Block mode keeps those and adds lighter dashed guides for inner containers and blocks to make spacing and overlap issues easier to inspect.
- `setOutline(mode)` / `getOutline()` — public API helpers for controlling the new outline guide layer.
- **Label leader lines** — When visible labels collide, the toolbar now staggers them downward and draws a thin leader line back to the original element corner.

### Changed

- **Badge colour sync** — Toolbar S mark now uses `#00C0F3` to match `docs/DESIGN.md`, the WordPress settings footer badge, and the approved Seguru badge treatment across the repo.
- **`refresh()`** — Reapplies outline guides after the DOM rescan.
- **Toolbar interaction states** — Active controls now use tinted pill styling, open dropdowns get a clearer focus halo and caret rotation, and diagnostic utility controls (`Outline`, `Tree`) are more visibly distinct when enabled.
- **Dense label layout** — Overlap handling now uses a depth-aware stepped stack with small horizontal insets for nested refs, and long full-mode labels truncate cleanly to stay readable on crowded pages.
- **Outline guide contrast** — Section outlines now read as the stronger structural layer, block guides stay lighter and more schematic, and both adapt more clearly on dark sections.
- **Tree panel UX** — The panel now surfaces ref count, current depth, and outline state in the header, uses clearer indentation and hover rhythm, and supports click-to-jump navigation with a temporary page highlight.

## [2.0.0] — 2026-04-10

### Added

- **H key: presentation / screenshot mode** — Press `H` to hide the toolbar and all labels instantly. Press `H` again to restore. Useful for clean screenshots and client presentations. Adds `body.sdt-presentation` class.
- **Tree panel** — Floating side panel (inside shadow DOM) listing all labeled elements in document order with nesting indentation. Each row shows context type, ref value, and a copy button. Hover a row to highlight the corresponding element on the page. Toggle via the **Tree** button in the toolbar or programmatically via `toggleTree()`. Rebuilds automatically when depth changes or `refresh()` is called.
- **Adaptive label colours** — Labels detect the effective background luminance of their parent element. Elements on dark backgrounds receive a `sdt-on-dark` class with inverted styling (light icon, white full-label). Threshold: relative luminance < 0.40.
- `getEffectiveBgLuminance(el)` — internal WCAG luminance helper, walks DOM to find first non-transparent background.
- **Dual-source config merge** — `sdtConfig` (WordPress-injected via `wp_localize_script`) and `seguruDebugConfig` (per-page override, useful in wireframes) are now merged. `seguruDebugConfig` values win over `sdtConfig` values. Both fall back to defaults.
- AGENTS.md, TASKS.md, ROADMAP.md — agent context files for AI-assisted development sessions.

### Changed

- **Tooltip hover** — Tooltip in Icons mode now only appears when hovering the ⓘ icon dot, not the whole parent element. A second CSS rule keeps the tooltip visible when the cursor moves from the icon onto the tooltip text.
- **Full mode label contrast** — Full-mode labels updated from near-invisible faint style (`rgba(0,0,0,0.06)` bg) to high-contrast dark background (`rgba(17,24,39,0.82)`) with `#FFF7ED` text, matching the tooltip style used in Icons mode. Hover state uses orange accent.
- **Toast duration** — Increased from 1400ms to 1800ms.
- **Badge colour** — Toolbar badge aligned to the Seguru S mark treatment while orange `#EA580C` remains the functional UI accent.
- **`getPageSlug()`** — Now strips `-wireframe-hf.html` suffix in addition to `-wireframe-lf.html` and `-wireframe.html`.
- **Public API `refresh()`** — Now also rebuilds the tree panel if it is open.

---

## [1.3.0] — 2026-04-08

### Added

- **Dropdown toolbar UI** — Labels and Depth controls are now compact dropdown menus instead of a wide row of buttons. Toolbar layout: `[S] | Labels [Icons ▾] | Depth [Off ▾]`.
- **Depth control in toolbar** — switch auto-ref depth from the front-end without going back to wp-admin. Four levels: Off, Sections, Blocks, Elements.
- **Position-aware dropdowns** — menus flip above/below and left/right based on available viewport space.
- **Smart element context in auto-ref names** — widget types extracted from builder classes: `home-03-heading` (Elementor), `home-04-text-basic` (Bricks), `home-05-headline` (Oxygen), `home-06-cover` (Gutenberg), `home-07-h2` (plain HTML).
- **D keyboard shortcut** — cycles through depth levels (Off → Sections → Blocks → Elements).
- **Escape key** — closes open dropdowns.
- `setDepth()` and `getDepth()` added to public API.
- Builder widget selectors at Block and Element depth: `[class*="elementor-widget-"]`, `[class*="brxe-"]`, Oxygen `ct-*`, `[class*="breakdance-"]`, `[class*="wp-block-"]`.

### Changed

- **Shadow DOM isolation** — toolbar and toast render inside a shadow root, preventing Elementor Pro and other page builder CSS from leaking in.
- Labels in the page DOM use `all: initial` resets to override inherited builder styles.
- Dark mode uses `:host-context(html.dark)` to read the class from outside the shadow boundary.
- Block depth now allows nesting (no domination check) — only Section depth excludes nested elements.
- Only modern Elementor supported (`.e-con` flexbox containers). Legacy `.elementor-section` and `.elementor-column` selectors removed.
- Element depth inherits from Section (not Block) to skip generic wrapper divs and show semantic content.
- Minimum PHP requirement updated to 8.1.
- ~18 KB minified (up from ~12 KB).
- All documentation updated to reflect new toolbar UI, depth controls, and Shadow DOM architecture.

---

## [1.2.0] — 2026-04-08

### Added

- **Auto-ref depth setting** — three levels control how deep auto-ref scans the page:
  - **Section** — top-level page sections only (default, existing behaviour)
  - **Block** — sections + inner containers, columns, widgets, Gutenberg blocks
  - **Element** — everything: headings, paragraphs, buttons, images, lists, and more
- Element depth skips the nesting exclusion check so nested elements all get labels. Useful for debugging specific components.
- New WP setting: auto-ref depth radio group under the Page Builders card.
- New `sdtConfig.autoRefDepth` property (`'section'` | `'block'` | `'element'`).

### Changed

- **Shadow DOM isolation** — toolbar and toast now render inside a shadow root, preventing Elementor Pro and other page builder CSS from leaking in.
- Labels in the page DOM use `all: initial` resets to override inherited builder styles.
- Dark mode uses `:host-context(html.dark)` to read the class from outside the shadow boundary.
- Minimum PHP requirement updated to 8.1.

---

## [1.1.1] — 2026-04-08

### Fixed

- Auto-ref dedup used className strings, causing sections with identical classes to be skipped. Now uses WeakSet for proper element identity checks.
- Toolbar buttons now reflect the configured default mode on first render instead of always highlighting Icons.
- Toast notification positioned correctly when toolbar is placed in top-right or top-left corners.
- WordPress settings page missing from admin menu (stale plugin zip contained truncated PHP).
- `wordpress.md` install instructions referenced "Settings → General" instead of "Settings → Debug Toolbar".

### Changed

- Minimum PHP requirement updated from 7.4 to 8.1.
- WordPress plugin zip filename now includes version number (`seguru-debug-toolbar-wp-v1.1.1.zip`).
- Build script reads version from `package.json` and injects it into `readme.txt` dynamically.

---

## [1.1.0] — 2026-04-08

### Added

- **Class-to-ref converter** — Converts CSS classes prefixed with `dataref-` into `data-ref` attributes on page load. Works with every page builder including free tiers. Enabled via WP settings or `sdtConfig.classConverter`.
- **Auto-ref** — Automatically generates `data-ref` values for major section elements based on page slug and position. Detects Elementor, Bricks, Oxygen, Breakdance, and HTML5 `<section>` tags. Enabled via WP settings or `sdtConfig.autoRef`.
- **Page Builders settings card** in the WP admin settings page with toggles for both features.
- WP-CLI support for the two new options: `sdt_class_converter` and `sdt_auto_ref`.
- Breakdance builder detection in auto-ref selectors.
- Interactive demo page (`test/demo.html`) with feature flag toggles and test sections for class converter, auto-ref, and mixed scenarios.

### Changed

- `refresh()` API now re-runs both the class converter and auto-ref before scanning for labels.
- `page-builders.md` rewritten to lead with built-in features (class converter, auto-ref) instead of manual-only instructions.
- `wordpress.md` updated with Page Builders settings section and WP-CLI commands for new options.
- `wp-settings-page.md` IA diagram and option storage table updated with new fields.
- README features list updated with class converter and auto-ref.

---

## [1.0.0] — 2026-04-08

### Added

- Initial release.
- Visual overlay for `data-ref` attributes with three modes: Icons, Off, Full.
- Keyboard shortcut (L) to cycle modes.
- Click-to-copy with toast notification.
- Seguru S mark badge with "Powered by Seguru Digital" tooltip.
- Dark mode support via `html.dark` class.
- Configurable toolbar position (four corners).
- `refresh()` API for SPA and dynamic content.
- WordPress installable plugin with dedicated settings page (Settings → Debug Toolbar).
- WordPress mu-plugin alternative for developers.
- Role-based access control (Administrator, Editor, Author).
- `window.sdtConfig` bridge for WordPress settings.
- Build script for WordPress plugin zip (`npm run build:wp`).
- Documentation: usage guide, WordPress setup, page builders, naming conventions, design spec, WP settings page spec.
- MIT license.
