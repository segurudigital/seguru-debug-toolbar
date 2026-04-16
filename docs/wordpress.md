# WordPress Setup

The package includes two WordPress integration options: a standard installable plugin (best for client handoff) and a lightweight mu-plugin (best for developers).

---

## Option A: Installable Plugin (recommended for clients)

The easiest path. Build the zip, hand it to the client, done.

**Build the zip:**

```bash
npm run build:wp
# → dist/seguru-debug-toolbar-wp.zip
```

**Install:**

1. Go to **wp-admin → Plugins → Add New → Upload Plugin**
2. Upload `seguru-debug-toolbar-wp.zip`
3. Click **Activate**
4. Go to **Settings → Debug Toolbar** and enable the toolbar

An activation notice reminds the user to enable the setting. The toolbar loads on the front end for administrators only.

This is the right option when you're handing the toolbar to a client so they can flag issues on their site and report section references back to you or their theme/plugin developer.

### Automatic updates from GitHub

The installable plugin includes a self-update checker. Every 6 hours (and on demand when an admin visits **Dashboard → Updates**) the plugin queries the GitHub releases API for newer tagged versions. When a newer release is found, WordPress shows a standard "Update available" notice on the Plugins screen — click **Update Now** and the new zip is pulled and installed, same flow as any wp.org plugin.

- Only the installable plugin updates this way. The mu-plugin drop-in is intentionally not self-updating — replace it manually when you want to bump versions.
- The checker fetches `https://api.github.com/repos/segurudigital/seguru-debug-toolbar/releases/latest` and downloads the `seguru-debug-toolbar-wp-v<version>.zip` asset. Both requests go direct to GitHub and the CDN — no Seguru-hosted update service sits in the path.
- Cache: release metadata is cached for 6 hours per site. A transient `sdt_github_release` holds the response. To force a recheck, delete that transient (`wp transient delete sdt_github_release`) or visit **Dashboard → Updates** and click **Check again**.
- The plugin shows WordPress's standard "View details" modal with the GitHub release notes. The "Update Now" button runs the normal WP plugin upgrader, so rollback via your usual backup strategy still applies.

---

## Option B: mu-plugin (for developers)

If you prefer a drop-in that loads automatically without an activation step.

**Step 1:** Copy the mu-plugin file into your WordPress install:

```
wp-content/mu-plugins/seguru-debug-toolbar.php
```

If the `mu-plugins` folder doesn't exist, create it. WordPress loads mu-plugins automatically.

**Step 2:** Create a subfolder and copy the minified JS into it:

```
wp-content/mu-plugins/seguru-debug-toolbar/seguru-debug-toolbar.min.js
```

**Step 3:** Go to **wp-admin → Settings → Debug Toolbar**. Enable the toolbar.

---

## Option C: npm in your theme

If your WordPress theme already uses npm:

```bash
cd wp-content/themes/your-theme
npm install @segurudigital/seguru-debug-toolbar
```

The mu-plugin auto-detects the JS file at `your-theme/node_modules/@segurudigital/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js` if it can't find the manual install path.

---

## Settings page

The plugin adds its own settings page at **Settings → Debug Toolbar** with five sections:

**Status** — Enable or disable the toolbar. When off, no JS loads at all.

**Display** — Choose the default mode (Icons, Off, or Full) and the toolbar position (any corner of the screen). Users can still cycle modes with the L key on the front end.

**Access** — Pick the minimum role required to see the toolbar: Administrator (default), Editor, or Author. Users below the selected role never see it. Anonymous visitors never see it regardless.

**Page Builders** — Two toggles that speed up `data-ref` rollout across page builders:

- **Class-to-ref converter** — Converts CSS classes prefixed with `dataref-` into `data-ref` attributes on page load. Works with every page builder (including free tiers) because they all support CSS classes. Add `dataref-home-01-hero` as a class and it becomes `data-ref="home-01-hero"`.
- **Auto-ref** — Automatically generates `data-ref` values for major section elements based on page slug and position. Detects Elementor, Bricks, Oxygen, Breakdance, and standard `<section>` tags. Sections with existing `data-ref` values (manual or from the class converter) keep their names.

See [page-builders.md](page-builders.md) for the full guide.

**How It Works** — A built-in reference panel explaining modes, keyboard shortcuts, click-to-copy, and how to report issues using section codes. Written for clients, not developers — so if you hand the plugin to a client, they can learn how to use it without leaving wp-admin.

The settings page also shows a "Powered by Seguru Digital" badge in the footer with the current version number.

---

## WP-CLI

You can manage all settings from the command line:

```bash
# Enable / disable
wp option update sdt_enabled 1
wp option update sdt_enabled 0

# Set default mode (0=Icons, 1=Off, 2=Full)
wp option update sdt_default_mode 2

# Set position
wp option update sdt_position bottom-left

# Set minimum role
wp option update sdt_min_role editor

# Page builder features
wp option update sdt_class_converter 1
wp option update sdt_auto_ref 1

# Check current values
wp option get sdt_enabled
wp option get sdt_default_mode
wp option get sdt_position
wp option get sdt_min_role
wp option get sdt_class_converter
wp option get sdt_auto_ref
```

---

## Page builder support

The toolbar works with any page builder. The built-in class converter and auto-ref features (see the Page Builders section on the settings page) make rollout fast across Elementor, Bricks, Oxygen, Breakdance, and Gutenberg — including free tiers. Step-by-step instructions for each builder are in [page-builders.md](page-builders.md).

---

## Adding data-ref to Gutenberg blocks

`data-ref` attributes go on the wrapper element of each block or section. In the block editor, the easiest way to do this is through the **Additional CSS class(es)** field or via custom block attributes.

### Using a Group block wrapper

Wrap your section content in a Group block and add the `data-ref` as a custom HTML attribute. Most block-based themes support this through the Advanced panel or via a custom attribute plugin.

The rendered output looks like this:

```html
<div class="wp-block-group section-hero" data-ref="home-01-hero">
  <!-- block content -->
</div>
```

### Using block JSON directly

If you're building custom blocks or editing block markup directly, add `data-ref` to the block's attributes:

```json
{
  "blockName": "core/group",
  "attrs": {
    "className": "section-hero",
    "data-ref": "home-01-hero"
  }
}
```

### In theme templates (PHP)

For hardcoded template sections:

```php
<section data-ref="home-01-hero" class="hero">
  <?php // template content ?>
</section>
```

The `data-ref` attributes are invisible to end users and have zero performance impact. They stay in the markup whether the toolbar is enabled or not — the toolbar just makes them visible.

---

## Multisite

The mu-plugin works on multisite installs. The setting is per-site (stored in each site's `wp_options` table), so you can enable the toolbar on your staging site without it appearing on production. If you want a network-wide toggle, you'd need to modify the plugin to use `get_site_option` instead.

---

## Troubleshooting

**Toolbar doesn't appear:** Check that the toolbar is enabled under Settings → Debug Toolbar. Make sure you're logged in with a role that meets the minimum access requirement. View source or check the Network tab to confirm the JS file is being loaded.

**JS file not found:** Make sure the file exists at one of the two expected paths. The mu-plugin checks for the file using `file_exists()` before enqueueing — if the file isn't there, it silently skips loading. Check the path case (Linux servers are case-sensitive).

**Toolbar appears but no labels:** Your page needs elements with `data-ref` attributes. View source and search for `data-ref` to confirm they're in the HTML.

**Conflicts with other fixed-position elements:** The toolbar uses z-index `99999`. If a chat widget or cookie banner is covering it, bump that element's z-index down or move the toolbar by adjusting its CSS position (you can do this with a small snippet in your theme's custom CSS).
