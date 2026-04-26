# WordPress Settings Page — IA & UI Spec

**Version:** 1.0
**Last updated:** 2026-04-08

---

## Location

**Menu:** Settings → Debug Toolbar

The page registers as a submenu item under the WordPress Settings menu using `add_options_page()`. This follows WordPress convention for plugin settings and puts it where administrators expect to find configuration options.

**URL:** `wp-admin/options-general.php?page=seguru-debug-toolbar`

**Capability:** `manage_options` (required to see the menu item and access the page).

---

## Information Architecture

The page has five content zones, stacked vertically. The first four are settings cards. The fifth is a reference panel. A footer badge anchors the bottom.

```
┌──────────────────────────────────────────────────┐
│  Debug Toolbar                          [Save]   │  ← page header
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─ Status ────────────────────────────────────┐ │
│  │  [toggle] Enable debug toolbar              │ │
│  │  description text                           │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ Display ───────────────────────────────────┐ │
│  │  Default mode:  (•) Icons  ( ) Off  ( ) Full│ │
│  │  Position:      (•) Bottom right  ...       │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ Access ────────────────────────────────────┐ │
│  │  Minimum role:  [Administrator ▾]           │ │
│  │  description text                           │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ Page Builders ─────────────────────────────┐ │
│  │  [toggle] Class-to-ref converter            │ │
│  │  description text                           │ │
│  │  [toggle] Auto-ref                          │ │
│  │  description text                           │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ How It Works ──────────────────────────────┐ │
│  │  quick reference panel (read-only)          │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  [Save Changes]                                  │
│                                                  │
│  ───────────────────────────────────────────     │
│  [S] Powered by Seguru Digital                   │  ← footer badge
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Settings Fields

### 1. Status

| Field | Type | Default | Option key |
|-------|------|---------|------------|
| Enable debug toolbar | Toggle (checkbox) | Off | `sdt_enabled` |

**Description:** "Load the toolbar on the front end for logged-in users who meet the access requirement below."

When disabled, no JS or CSS is loaded. The `data-ref` attributes stay in the markup (they're harmless and invisible), but the toolbar itself doesn't run.

### 2. Display

| Field | Type | Default | Option key |
|-------|------|---------|------------|
| Default mode | Radio group | Icons | `sdt_default_mode` |
| Position | Radio group | Bottom right | `sdt_position` |

**Default mode options:**

| Value | Label | Description |
|-------|-------|-------------|
| `0` | Icons | Small dot on each section. Hover to reveal the label. |
| `1` | Off | Toolbar loads but labels start hidden. Press L to show. |
| `2` | Full | All labels visible immediately. Best for QA sessions. |

**Position options:**

| Value | Label |
|-------|-------|
| `bottom-right` | Bottom right |
| `bottom-left` | Bottom left |
| `top-right` | Top right |
| `top-left` | Top left |

### 3. Access

| Field | Type | Default | Option key |
|-------|------|---------|------------|
| Minimum role | Dropdown (select) | Administrator | `sdt_min_role` |

**Options:**

| Value | Label | Capability checked |
|-------|-------|--------------------|
| `administrator` | Administrator | `manage_options` |
| `editor` | Editor | `edit_others_posts` |
| `author` | Author | `publish_posts` |

**Description:** "Users with this role or higher will see the toolbar on the front end when enabled. Regular visitors and lower roles never see it."

The dropdown maps to WordPress capabilities rather than role names directly. This handles custom roles correctly — if a shop manager has `edit_others_posts`, they'd see the toolbar when the minimum is set to Editor.

Author is the lowest we go. Subscriber and Customer roles shouldn't see dev tools.

### 4. Page Builders

| Field | Type | Default | Option key |
|-------|------|---------|------------|
| Class-to-ref converter | Toggle (checkbox) | Off | `sdt_class_converter` |
| Auto-ref | Toggle (checkbox) | Off | `sdt_auto_ref` |

**Class-to-ref converter description:** "Converts CSS classes prefixed with `dataref-` into `data-ref` attributes automatically. Add a class like `dataref-home-01-hero` in any page builder and the toolbar picks it up. Works with every builder, including free tiers that don't support custom HTML attributes."

**Auto-ref description:** "Automatically generates `data-ref` values based on the page slug and position. Elements that already have a `data-ref` (manual or from the class converter) keep their value. Use the **Target** dropdown on the front-end toolbar (or press **T**) to switch between Sections, Blocks, and Elements."

Target is controlled exclusively from the front-end toolbar — there is no wp-admin setting for it. This keeps the settings page simple while giving users real-time control on the page they're debugging. (Pre-2.3 builds called this "Depth" and bound it to **D**; the public API still uses `setDepth()` / `getDepth()` for back-compat.)

### 5. How It Works (reference panel)

A read-only card with usage instructions. Not a form — just static HTML styled as a WordPress admin card.

**Content:**

> **Keyboard shortcuts:** **L** cycles label modes (Icons → Off → Full). **T** cycles Target depth. **O** cycles Outline guides. **D** shows / hides the toolbar. **Esc** dismisses everything. Shortcuts pause when typing in form fields.
>
> **Click to copy:** Click any label to copy the `data-ref` value to your clipboard.
>
> **What are data-ref labels?** Every tagged section on your site has a `data-ref` attribute — a short code like `home-01-hero` that identifies that section. The toolbar makes these codes visible so you can reference them in bug reports, revision notes, or feedback.
>
> **Documentation:** [View full docs on GitHub →](https://github.com/segurudigital/seguru-debug-toolbar)

---

## UI Treatment

### Page wrapper

Uses the standard WordPress `wrap` class. No custom page chrome — follows the WordPress admin layout conventions per the brand handbook ("Don't fight the WordPress admin chrome — work with it").

### Settings cards

Each section uses a WordPress `postbox` / `card` pattern:

- White background card with 1px `#C3C4C7` border (WP admin default)
- Section title as an `<h2>` inside the card, not above it
- 16px padding inside
- 12px gap between cards

### Toggle (Enable)

WordPress-native checkbox. No custom toggle component — matches the rest of wp-admin. The label text does the work.

### Radio groups (Mode, Position)

Standard `<fieldset>` with `<input type="radio">` elements, stacked vertically. Each option has a label. No custom radio styling.

### Dropdown (Role)

WordPress-native `<select>` element. No Select2 or custom dropdown.

### Save button

Standard WordPress `submit` button via `submit_button()`. Appears at the bottom of the form, above the footer badge.

### Footer badge

The "Powered by Seguru Digital" compact badge per brand handbook §15:

- Seguru S mark icon (16px, `#00C0F3` background, white mark)
- "Powered by Seguru Digital" text in system font, 400 weight
- Text colour: `#6C6E71` (muted)
- Links to `https://seguru.digital` (opens new tab)
- Positioned below the save button, separated by a subtle `1px solid #E5E7EB` top border
- 16px top padding

---

## Option Storage

All settings use the WordPress Options API with a single option group `sdt_settings`:

| Option key | Type | Default | Sanitization |
|------------|------|---------|-------------|
| `sdt_enabled` | string | `'0'` | `'1'` or `'0'` |
| `sdt_default_mode` | string | `'0'` | Must be `'0'`, `'1'`, or `'2'` |
| `sdt_position` | string | `'bottom-right'` | Must match allowed position values |
| `sdt_min_role` | string | `'administrator'` | Must match allowed role values |
| `sdt_class_converter` | string | `'0'` | `'1'` or `'0'` |
| `sdt_auto_ref` | string | `'0'` | `'1'` or `'0'` |

Settings are registered individually via `register_setting()` with sanitize callbacks. The settings group is `sdt_settings` so they all save together on one form submit.

---

## Data Flow

When the front end loads:

1. Check `sdt_enabled` — if `'0'`, stop. No JS loaded.
2. Check current user's role against `sdt_min_role` — if below threshold, stop.
3. Enqueue `seguru-debug-toolbar.min.js` in the footer.
4. Pass `sdt_default_mode`, `sdt_position`, `sdt_class_converter`, and `sdt_auto_ref` to the JS via `wp_localize_script()` as `window.sdtConfig`.
5. The toolbar JS reads `window.sdtConfig` on init (if present) and applies the default mode, position, and feature flags. Depth is controlled dynamically via the front-end toolbar dropdown or D key. Falls back to its built-in defaults (Icons, bottom-right, both features off) when the config object is missing (non-WordPress contexts).
6. The toolbar renders inside a Shadow DOM for complete CSS isolation from page builders and theme styles.

---

## Activation Flow

1. User uploads and activates the plugin
2. Admin notice appears: "Seguru Debug Toolbar is installed. [Configure it under Settings → Debug Toolbar.](link)"
3. User clicks through to the settings page
4. Toggles enable on, picks their preferences, saves
5. Visits the front end and sees the toolbar
