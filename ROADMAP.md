# Roadmap

---

## v2.0.0 — In progress

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
- [x] Badge colour aligned to `#002FA7` (Seguru blue)

---

## v2.1.0 — Planned

- [ ] **`npm run build:wp` readme.txt** — Update changelog section to reflect 2.x history
- [ ] **test/demo.html** — Add H key toggle and Tree panel to the interactive demo controls
- [ ] **WordPress `autoRefDepth` setting** — Expose depth as a WP admin setting (radio group, same as Front-end toolbar)
- [ ] **CI** — GitHub Actions: syntax check + esbuild build on every PR

---

## v2.2.0 — Distribution

Getting the package onto the standard install paths and making it look the part. Covers npm publish, CDN, WordPress.org submission, and the full graphics pack needed for all three.

### npm + CDN

- [ ] **Publish to npm** — `npm publish` under `seguru-digital` org once v2.0.0 is tagged and tested. Package name: `seguru-debug-toolbar`.
- [ ] **CDN availability** — jsDelivr mirrors npm automatically after publish. Canonical CDN URL: `https://cdn.jsdelivr.net/npm/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js`
- [ ] **Update README install section** — replace manual download instructions with npm + CDN options once the package is live.

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
| `assets/readme-toolbar-anatomy.png` | 900 × 200px | Annotated toolbar diagram (badge zone, Labels dropdown, Depth dropdown, Tree button) |
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
