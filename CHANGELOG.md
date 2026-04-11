# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

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
- **Badge colour** — Toolbar badge and `SEGURU_BLUE` constant updated to `#002FA7` (correct Seguru brand blue). Orange `#EA580C` remains the functional UI accent.
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
