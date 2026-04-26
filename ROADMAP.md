# Roadmap

> **Scope** — ROADMAP.md is the forward-looking view: what's coming and roughly when. The canonical list of in-flight work lives in TASKS.md (Sprints → Phases → subtasks). The shipped record lives in CHANGELOG.md. Items marked `Released` here have already moved through TASKS.md and are documented in CHANGELOG.md.

---

## v2.3.0 — Released (this session)

**Goal:** Make SDT a better neighbour to other on-page tools (overlays, sidebars, devtools, review panels) by exposing a stable, namespaced public API plus a `sdt:*` event surface — without breaking any documented v2.2 behaviour.

### Public API surface

- [x] **Lifecycle** — `hide()` / `show()` / `toggle()` / `isVisible()`. Idempotent, pre-boot safe, fire `sdt:show` / `sdt:hide`.
- [x] **Configurable hotkey** — `init({ hotkey })`, `setHotkey()`, `data-hotkey`, default `H`. Esc cycles dropdowns → tree → toolbar. Hotkey ignored in inputs / contenteditable / with modifiers; tightened to `A`–`Z` only.
- [x] **Theme system** — `auto` / `light` / `dark` via `setTheme()` / `getTheme()`, `init({ theme })`, `data-theme`. Persisted to `localStorage`. Reacts to OS preference and host-toggled `html.dark` (via `MutationObserver`).
- [x] **Public events** — `sdt:ready`, `sdt:show`, `sdt:hide`, `sdt:theme-change`, `sdt:depth-change`, `sdt:outline-change`, `sdt:user-change`, `sdt:dataref-click` / `-hover` / `-leave`. CustomEvents on `window`, namespaced to avoid collisions.
- [x] **Identity hook** — `setUser()` / `getUser()` with snapshot/clone semantics, plus a Seguru-blue avatar + name + role pill in the toolbar chrome. Auth-agnostic by design.
- [x] **Configurable dock** — `dock` config + `setDock()` / `getDock()`, four corners plus a one-shot `'auto'` heuristic. `position` kept as alias.
- [x] **`init(opts)`** — runtime convenience for applying `{ hotkey, theme, dock, user }`.
- [x] **`version` static property** + `SDT_VERSION` constant used in `sdt:ready` payload.

### Docs

- [x] README sections: Programmatic control / Hotkey / Theme / Events / Identity / Dock — with config-precedence table + full API surface table.
- [x] `docs/integrations.md` covering theme sync, identity, and `sdt:dataref-click` integration patterns plus a generic Review Sidebar worked example.
- [x] Sanitised every prior client-identifying reference across docs and demos.

### Late-session keymap + defaults overhaul (Phase 9)

Per user spec received during the QA pass — these change behaviour from the v2.2.x line and are flagged as breaking in the CHANGELOG:

- [x] **Default visibility hotkey `H` → `D`** (configurable; back-compat via `setHotkey('H')` / `data-hotkey="H"`)
- [x] **`T` cycles Target depth** (was bound to `D`)
- [x] **`O` cycles Outline** (NEW fixed binding)
- [x] **Esc is a global one-shot hide** — closes any open dropdown + Tree + toolbar in a single press
- [x] **Auto-ref defaults ON** — Target boots at `Elements`. Pre-2.3 was opt-in via `autoRef: true`. Hosts that want the previous behaviour set `autoRef: false`.
- [x] **UI label `Depth` → `Target`** — public `setDepth()` / `getDepth()` API names kept for back-compat; only the user-facing label changed.
- [x] **S badge alignment + size** — symmetric padding, SVG bumped 16 → 20px so the brand mark reads with proper weight.
- [x] **User-pill avatar colour** — moved to neutral slate so the S badge stays the single Seguru-blue anchor in the toolbar.
- [x] **Demo `Dark mode` toggle** drives SDT via `setTheme()` directly (works regardless of pinned/persisted state); demo no longer forces `autoRef:'0'`.

### Open items (release prep)

- [x] Manual browser smoke test against `test/demo.html` (passed §8 checklist, plus QA-surfaced fixes shipped)
- [ ] Re-run Playwright §8 verification against the new D/T/O/Esc keymap so the on-file record matches what's shipping
- [ ] Bump WordPress plugin headers + `SDT_VERSION` constant + rebuild WP zip
- [ ] Cut `v2.3.0` tag and publish GitHub release

---

## v2.0.0 — Released

**Goal:** Five UX improvements built on top of the v1.x feature set. No breaking changes.

### Features
- [x] **H key: presentation/screenshot hide** — Press H to hide toolbar + all labels. Press H again to restore. `body.sdt-presentation` class.
- [x] **Tooltip only on icon hover** — Tooltip no longer fires on whole-element hover. Only the ⓘ dot triggers it. Tooltip stays visible when cursor moves from icon onto tooltip text.
- [x] **Full mode contrast** — Full-mode labels use dark bg + white text instead of the previous near-invisible faint style.
- [x] **Adaptive label colours** — Labels detect effective background luminance and apply `sdt-on-dark` class for dark-background elements.
- [x] **Tree panel** — Floating side panel listing all labeled elements in document order with nesting indentation. Row hover highlights page element. Copy button per row. Toggle via toolbar Tree button.

### Audit fixes (backlog from v1.x)
- [x] Config merge: `wpConfig` (WP-injected) + `seguruDebugConfig` (per-page) dual-source
- [x] `getPageSlug()` handles `-wireframe-hf.html` suffix
- [x] Toast duration 1800ms (was 1400ms)
- [x] Badge colour aligned to `#00C0F3` (Seguru S mark blue)

---

## v2.1.0 — Released

- [x] **Outline guides** — Optional `Outline` dropdown with `Sections` and `Blocks` modes for spacing, overlap, and wrapper-boundary QA
- [x] **UI refresh** — Toolbar hierarchy cleanup, stronger interaction states, depth-aware label overlap handling, clearer outline distinction, and Tree inspection-panel polish
- [x] **`npm run build:wp` readme.txt** — Updated changelog and feature copy to reflect the 2.x release line
- [x] **test/demo.html** — Added H key, Outline, and Tree guidance to the interactive demo controls
- [x] **Depth stays front-end only** — Confirmed `Depth` remains a live toolbar control rather than a wp-admin setting, per the current settings-page design
- [ ] **Manual builder-page QA** — Validate the full Phase 1-5 refresh on a real builder page as a post-release verification pass
- [ ] **CI** — GitHub Actions: syntax check + esbuild build on every PR

---

## v2.2.0 — Distribution

Getting the package onto the standard install paths and making it look the part. Covers npm publish, CDN, WordPress.org submission, and the full graphics pack needed for all three.

### npm + CDN

- [x] **Publish to npm** — live at <https://www.npmjs.com/package/@segurudigital/seguru-debug-toolbar> as of v2.2.2 (2026-04-16). Automated via `release-assets.yml` → `publish-npm` job, gated on `NPM_TOKEN` repo secret, signed with `--provenance`.
- [x] **CDN availability (via npm)** — jsDelivr mirrors the npm package: `https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@<version>/dist/seguru-debug-toolbar.min.js`. This is the canonical CDN URL. The GitHub-direct form still works as a fallback: `https://cdn.jsdelivr.net/gh/segurudigital/seguru-debug-toolbar@v<version>/dist/seguru-debug-toolbar.min.js`.
- [x] **Update README install section** — now leads with npm install, then CDN (npm-backed), then manual, then WordPress. "npm is coming" note removed.

### WordPress.org submission

- [ ] **Submit plugin** — upload to WordPress.org plugin directory. Requires SVN commit with plugin files + assets folder. readme.txt is already in `build-wp-zip.sh`.
- [ ] **Update `build-wp-zip.sh` changelog** — update the `readme.txt` changelog section to reflect 2.x history before submission.
- [ ] **Update readme.txt description** — reflect v2 features (H key, Tree panel, depth control) in the `== Description ==` section.

### Graphics pack

All assets live in `assets/` at the repo root. The build script should copy `assets/` into the WordPress zip and the npm package should include it in `"files"`.

**WordPress.org — required by the plugin directory:**

| File | Size | Purpose |
|------|------|---------|
| `assets/wp-banner-772x250.png` | 772 × 250px | Plugin directory banner (standard) |
| `assets/wp-banner-1544x500.png` | 1544 × 500px | Plugin directory banner (@2x / retina) |
| `assets/wp-icon-128x128.png` | 128 × 128px | Plugin directory icon (standard) |
| `assets/wp-icon-256x256.png` | 256 × 256px | Plugin directory icon (@2x / retina) |
| `assets/screenshot-1.png` | 1200 × 675px | Toolbar in Icons mode — dots on sections, one hover tooltip visible |
| `assets/screenshot-2.png` | 1200 × 675px | Full mode — all labels visible across a multi-section page |
| `assets/screenshot-3.png` | 1200 × 675px | Tree panel open with block-depth labels and indented rows |
| `assets/screenshot-4.png` | 1200 × 675px | wp-admin Settings → Debug Toolbar page |
| `assets/screenshot-5.png` | 1200 × 675px | Dark mode — toolbar and labels on a dark-background site |

Screenshots reference in `readme.txt` must match the order and count above. The current `readme.txt` inside `build-wp-zip.sh` lists 4 screenshots — update to 5 once the dark mode shot is added.

**GitHub README / docs polish:**

| File | Size | Purpose |
|------|------|---------|
| `assets/readme-hero.png` | 1400 × 700px | Hero image for README.md — toolbar + labelled page at a glance |
| `assets/readme-toolbar-anatomy.png` | 900 × 200px | Annotated toolbar diagram (badge zone, optional user pill, Labels dropdown, Target dropdown, Outline dropdown, Tree button) |
| `assets/readme-tree-panel.png` | 600 × 500px | Tree panel with indented rows, hover highlight active |
| `assets/readme-dark-mode.png` | 900 × 500px | Dark mode variant side-by-side or overlay |

**Design spec for all assets:**

- Colour palette: orange `#EA580C` (`--color-sdt-primary`, labels, active states), Seguru S mark `#00C0F3` (S mark circle only — never orange), neutral toolbar `#fff` / `#E5E7EB` borders
- Dark accents: `#111827` (`--color-sdt-dark`) for dark toolbar mode, tree panel, and tooltip overlays
- Font: system UI (screenshots can use Inter or SF Pro as a stand-in)
- Toolbar border-radius: 6px; shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Banner background: dark navy `#0F172A` or off-white `#F8FAFC` — avoid pure black or pure white
- All assets exported at 2× then downsampled to 1× for standard sizes; keep @2x versions as the source
- Detailed visual spec is in `docs/DESIGN.md`
- Brand authority for colour decisions: `Seguru-Brand-Handbook.md §10` (v4.2, April 2026)

**Build script update needed:**

`scripts/build-wp-zip.sh` already creates `assets/` in the temp dir. Add a copy step after the JS copy:

```bash
# Copy WordPress.org assets if present
if [ -d "$ROOT_DIR/assets" ]; then
  cp "$ROOT_DIR/assets"/wp-banner-*.png "$TMP_DIR/seguru-debug-toolbar/assets/" 2>/dev/null || true
  cp "$ROOT_DIR/assets"/wp-icon-*.png   "$TMP_DIR/seguru-debug-toolbar/assets/" 2>/dev/null || true
  cp "$ROOT_DIR/assets"/screenshot-*.png "$TMP_DIR/seguru-debug-toolbar/assets/" 2>/dev/null || true
fi
```

**`package.json` update needed:**

Add `"assets/"` to the `"files"` array so npm includes the graphics in the published package.

---

## Backlog

- [ ] Shopify section support — detect `.shopify-section` wrappers in auto-ref
- [ ] Custom selector config — allow `sdtConfig.extraSelectors` array for project-specific section patterns
- [ ] `clearManualLabels()` — companion to `clearAutoRefs()` for full page reset on theme/config change
