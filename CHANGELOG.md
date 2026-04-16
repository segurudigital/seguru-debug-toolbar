# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

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
