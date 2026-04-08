# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses [Semantic Versioning](https://semver.org/).

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
