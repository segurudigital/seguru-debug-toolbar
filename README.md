# Seguru Debug Toolbar

A tiny, zero-dependency JavaScript tool that turns `data-ref` attributes into a clickable visual overlay. Built for teams who use wireframes, design systems, or component libraries and need a fast way to identify, reference, and QA page sections.

**~42 KB minified. No CSS file. No build step required. Just drop in a script tag.**

Built and maintained by [Seguru Digital](https://seguru.digital), a strategy-first fractional CMO and CTO practice that also builds. We work across brand strategy, marketing, AI, and dev ops for SMBs in the U.S. and Australia. We use this daily across wireframes, WordPress sites, Shopify themes, and PWAs — and we're open-sourcing it because every dev and design team should have this in their toolkit.

---

## What it does

Add `data-ref` attributes to any HTML element. The toolbar gives you three dropdown controls plus the Tree button:

**Labels** (press **L** to cycle) — controls how labels appear:

| Mode | What you see |
|------|-------------|
| **Icons** | Small dot on each element. Hover to reveal the full label. |
| **Off** | Clean view. Nothing shown — good for screenshots and client presentations. |
| **Full** | Always-visible label on every element. Best for QA, cross-referencing copy docs, and revision feedback. |

**Target** (press **T** to cycle) — controls what gets auto-labelled (also switchable from the toolbar):



| Target | What gets labelled |
|--------|--------------------|
| **Off** | Only your manual `data-ref` attributes and class-converter labels. |
| **Sections** | Top-level page sections (Elementor containers, Bricks sections, HTML5 `<section>` tags). |
| **Blocks** | Sections + inner containers, widgets, and content blocks. |
| **Elements** *(default)* | Sections + all semantic HTML (headings, paragraphs, images, buttons, forms, etc.). |

**Outline** — controls visual guide outlines for spacing and overlap QA:

| Outline | What you see |
|---------|--------------|
| **Off** | No guide outlines. |
| **Sections** | Strong orange section frames with a subtle inset wash to make the page skeleton easier to read. |
| **Blocks** | Section frames plus lighter dashed guides for inner blocks and containers. |

Click any label to copy the `data-ref` value to your clipboard. A toast confirms the copy.

When nearby labels would overlap, the toolbar uses depth-aware staggering and a thin leader line back to the element corner so the reference still reads clearly.

Press **D** to hide the toolbar and all labels (presentation mode). Press **D** again to restore. (The visibility key is [configurable](#keyboard) — `D` is just the default.) **Esc** dismisses everything in one keystroke regardless of state.

The **Tree** button opens a side panel listing every labeled element in document order with nesting indentation. Hover a row to highlight the element on the page. Click the copy button to grab the ref.

```html
<!-- Your markup -->
<section data-ref="home-01-hero">
  <h1>Welcome</h1>
</section>

<section data-ref="home-02-features">
  <h2>Features</h2>
</section>

<!-- That's it. The toolbar finds them automatically. -->
<script src="seguru-debug-toolbar.min.js"></script>
```

---

## Why we built this

We got tired of the feedback loop between wireframes and live builds. A designer would say "the hero section needs more padding" and the developer would ask "which section is the hero?" — even though both were looking at the same screen.

`data-ref` attributes gave us a shared vocabulary. The toolbar made that vocabulary visible. Now a designer can say "home-01-hero needs more padding" and the developer copies that string straight from the page, searches the codebase, and finds the exact block. No guessing, no screenshots with red circles drawn on them.

We use it for wireframe QA, copy review, client revision rounds, and debugging block-based WordPress sites. Once we started using it on one project, we put it on everything.

---

## Install

Current version: **v2.3.0** — see [CHANGELOG.md](CHANGELOG.md) for release notes.

**npm (React, Next, Vue, Svelte, any bundled app):**

```bash
npm install --save-dev @segurudigital/seguru-debug-toolbar
```

Then either bundle the source in a dev-only client entrypoint, or copy `dist/seguru-debug-toolbar.min.js` into `public/` and load that file explicitly. Bundling is the simplest path in React/Next/Vue apps:

```jsx
'use client';

import { useEffect } from 'react';

export function DebugToolbar() {
  useEffect(function () {
    if (process.env.NODE_ENV !== 'production') {
      import('@segurudigital/seguru-debug-toolbar/src/seguru-debug-toolbar.js');
    }
  }, []);

  return null;
}
```

Render `<DebugToolbar />` once in your app shell or layout. If you prefer a script tag instead, first copy `node_modules/@segurudigital/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js` into your public web root, then load `/seguru-debug-toolbar.min.js`.

**CDN (static HTML, wireframes, WordPress themes, Shopify themes):**

Load directly from jsDelivr — mirrors the npm package automatically, no download step:

```html
<!-- Track the 2.x line — receives minor + patch updates automatically -->
<script src="https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@2/dist/seguru-debug-toolbar.min.js" defer></script>

<!-- Or pin to an exact version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@2.2.3/dist/seguru-debug-toolbar.min.js" defer></script>

<!-- Or always the latest release (use in wireframes / staging only) -->
<script src="https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js" defer></script>
```

Pinning by major (`@2`) is the sweet spot — stay current on bug fixes, avoid breaking changes. Pin to an exact version for client production sites where you want a manual upgrade step.

**Manual download:**

Grab `seguru-debug-toolbar.min.js` from the [latest release](https://github.com/segurudigital/seguru-debug-toolbar/releases/latest) and drop it in your project:

```html
<script src="path/to/seguru-debug-toolbar.min.js" defer></script>
```

The toolbar auto-injects itself. No CSS file, no init call needed.

**WordPress:**

Download `seguru-debug-toolbar-wp-vX.Y.Z.zip` from the [latest release](https://github.com/segurudigital/seguru-debug-toolbar/releases/latest). Upload via **wp-admin → Plugins → Add New → Upload**, activate, configure under **Settings → Debug Toolbar**. An mu-plugin drop-in is also included in [wordpress/seguru-debug-toolbar.php](wordpress/seguru-debug-toolbar.php).

The installable plugin self-updates from GitHub releases — every 6 hours it checks for newer versions and surfaces a standard "Update available" notice on the Plugins screen. One click installs the new zip via the native WP upgrader. No separate update service or subscription needed.

---

## Programmatic control

The toolbar exposes a small, namespaced API on `window.seguruDebugToolbar`. Everything is callable any time after the script tag loads — methods invoked before SDT has finished booting are deferred and applied during init.

```js
const sdt = window.seguruDebugToolbar;

sdt.hide();        // dismiss the toolbar (no-op if already hidden)
sdt.show();        // reveal the toolbar (no-op if already visible)
sdt.toggle();      // flip the current state
sdt.isVisible();   // → true | false
```

`hide()` / `show()` / `toggle()` are the canonical lifecycle API and fire `sdt:hide` / `sdt:show` events (see [Events](#events)). The lower-level `setState(0|1|2)` is still supported for changing the label mode without touching toolbar visibility.

You can also pass configuration after script load:

```js
sdt.init({
  hotkey: 'D',          // see Hotkey
  theme: 'auto',        // 'auto' | 'light' | 'dark'
  dock: 'bottom-left',  // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  user: { name: 'Jane Reviewer', role: 'reviewer' }
});
```

Or, on hosts that prefer pre-load configuration, the same keys can be set on `window.seguruDebugConfig` before the script tag, or as `data-*` attributes on the script tag itself:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@2/dist/seguru-debug-toolbar.min.js"
  data-hotkey="D"
  data-theme="auto"
  data-dock="bottom-left"
  defer></script>
```

Configuration sources are resolved in this order (highest priority wins):

| Priority | Source | Use case |
|----------|--------|----------|
| 1 | `seguruDebugToolbar.init({...})` after script load | Reactive — change config at runtime, e.g. when host theme flips |
| 2 | `seguruDebugToolbar.setTheme()` / `setHotkey()` / `setDock()` / `setUser()` | Targeted runtime changes |
| 3 | `window.seguruDebugConfig` set before the script tag | Per-page config in static HTML / wireframes |
| 4 | `window.sdtConfig` (WordPress `wp_localize_script`) | WordPress plugin settings |
| 5 | `data-*` attributes on the `<script>` tag | Lightweight CDN drop-ins |
| 6 | Built-in defaults | Fallback |

The full API surface (callable any time after the script tag loads):

| Method | Purpose |
|--------|---------|
| `version` *(string)* | Bundled SDT version |
| `init(opts)` | Apply `{ hotkey, theme, dock, user }` |
| `hide()` / `show()` / `toggle()` / `isVisible()` | Lifecycle |
| `setState(0\|1\|2)` / `getState()` | Label mode (Icons / Off / Full) |
| `setDepth(value)` / `getDepth()` | Auto-ref Target depth (legacy method names — UI label is "Target") |
| `setOutline(value)` / `getOutline()` | Outline guides |
| `setHotkey(letter\|false)` / `getHotkey()` | Visibility hotkey |
| `setTheme(value)` / `getTheme()` | Theme system |
| `setDock(value)` / `getDock()` | Dock corner |
| `setUser(obj\|null)` / `getUser()` | Identity pill |
| `toggleTree()` | Open / close the element-tree side panel |
| `refresh()` | Re-scan for new `[data-ref]` elements (SPAs / dynamic content) |

---

## Keyboard

The full keymap, all bound at the document level:

| Key | Action |
|-----|--------|
| `D` | Show / hide the toolbar (configurable — see below) |
| `L` | Cycle **Labels** mode: Off → Icons → Full |
| `T` | Cycle **Target** depth: Off → Sections → Blocks → Elements |
| `O` | Cycle **Outline** mode: Off → Sections → Blocks |
| `Esc` | **Global hide** — closes any open dropdown, the Tree panel, and dismisses the toolbar in one press |

`L`, `T`, and `O` are fixed. `D` is the visibility hotkey and is configurable:

```js
sdt.init({ hotkey: 'V' });   // rebind to V
sdt.setHotkey('Z');          // rebind at runtime
sdt.setHotkey(false);        // disable the binding entirely
sdt.getHotkey();             // → 'V' | 'Z' | false | 'D' (default)
```

Accepts a single letter `A`–`Z` (case-insensitive) or `false` to disable. Anything else is rejected with a console warning and the binding falls back to `D`.

All bindings ignore key events while the user is typing in `<input>`, `<textarea>`, `<select>`, or `contenteditable` elements, and ignore key events when Cmd / Ctrl / Alt / Meta / Shift are held — so the toolbar never competes with form input or app-level shortcuts.

> **Note** — picking `L`, `T`, or `O` as the visibility hotkey overrides the built-in cycle on that key, since the visibility binding takes priority. If you need both, pick a different letter (e.g. `V` for "view") for the visibility hotkey.

---

## Theme

The toolbar follows a three-mode theme system. **Default: `auto`** — follows OS preference plus the host's `html.dark` class.

```js
sdt.setTheme('auto');    // follow OS + html.dark
sdt.setTheme('light');   // pin to light
sdt.setTheme('dark');    // pin to dark

sdt.getTheme();          // → 'light' | 'dark'  (the resolved theme)
```

The chosen value is persisted to `localStorage` under the key `seguru-debug-toolbar:theme`, so the next page load picks up where the user left off.

You can also configure the initial value:

```js
sdt.init({ theme: 'dark' });
// or via data attribute: <script ... data-theme="dark"></script>
```

When the OS appearance changes and the toolbar is in `auto` mode, the toolbar updates automatically and fires an `sdt:theme-change` event so other tools can sync.

Internally, the toolbar applies the `sdt-theme-dark` class on its shadow host. The legacy `:host-context(html.dark)` selectors are kept too, so existing hosts that toggle `html.dark` continue to work without changes. A `MutationObserver` watches `<html>` for class changes so `getTheme()` stays in sync when the host toggles dark mode dynamically.

> **Scope** — `setTheme()` controls the toolbar chrome only (the floating toolbar, dropdowns, Tree panel, toast). On-page `[data-ref]` labels use per-element background luminance detection and adapt automatically to the surface they sit on, regardless of the toolbar theme. This is intentional: a label on a dark hero section should always read clearly even on a light-themed page.

---

## Events

The toolbar dispatches `CustomEvent`s on `window` with the `sdt:` prefix. Listening is friction-free for any code on the page:

```js
window.addEventListener('sdt:ready',           (e) => { /* SDT booted */ });
window.addEventListener('sdt:show',            (e) => { /* toolbar revealed */ });
window.addEventListener('sdt:hide',            (e) => { /* toolbar dismissed */ });
window.addEventListener('sdt:theme-change',    (e) => { /* e.detail = { theme, mode } */ });
window.addEventListener('sdt:depth-change',    (e) => { /* e.detail = { depth } */ });
window.addEventListener('sdt:outline-change',  (e) => { /* e.detail = { outline } */ });
window.addEventListener('sdt:user-change',     (e) => { /* e.detail = { user } */ });
window.addEventListener('sdt:dataref-click',   (e) => { /* e.detail = { dataRef, element, current } */ });
window.addEventListener('sdt:dataref-hover',   (e) => { /* e.detail = { dataRef, element, current } */ });
window.addEventListener('sdt:dataref-leave',   (e) => { /* e.detail = { dataRef, element, current } */ });
```

| Event | When it fires | `detail` |
|-------|---------------|----------|
| `sdt:ready` | SDT has booted and the API is callable | `{ version }` |
| `sdt:show` | Toolbar revealed (`show()`, `toggle()`, or hotkey) | `{}` |
| `sdt:hide` | Toolbar dismissed (`hide()`, `toggle()`, hotkey, or Esc) | `{}` |
| `sdt:theme-change` | Resolved theme changed — including OS-driven flips while in `auto` | `{ theme, mode }` where `theme ∈ {'light','dark'}` and `mode` is the requested mode |
| `sdt:depth-change` | `setDepth()` called | `{ depth }` where `depth ∈ {'off','section','block','element'}` |
| `sdt:outline-change` | `setOutline()` called | `{ outline }` where `outline ∈ {'off','section','block'}` |
| `sdt:user-change` | `setUser()` called | `{ user }` (cloned snapshot, not the raw object you handed in) |
| `sdt:dataref-click` | User clicked an SDT label / icon for a `[data-ref]` element | `{ dataRef, element, current }` |
| `sdt:dataref-hover` | Mouse entered an SDT label / icon for a `[data-ref]` element | `{ dataRef, element, current }` |
| `sdt:dataref-leave` | Mouse left an SDT label / icon for a `[data-ref]` element | `{ dataRef, element, current }` |

`element` is the host page element carrying the `data-ref` attribute. `current` is the SDT label / icon that the user actually interacted with. Events bubble on `window` only — they don't propagate through the host page DOM.

---

## Identity

Hosts that have a notion of "the user signed in to this preview" (reviewer identity, internal vs external role, contact info) can surface that context in the toolbar chrome.

```js
sdt.setUser({
  name:  'Jane Reviewer',
  role:  'reviewer',     // freeform — 'reviewer', 'internal', 'qa', etc
  id:    'jr',           // host-defined token / id
  email: 'jane@example.com' // optional
});

sdt.setUser(null);  // clear

sdt.getUser();      // → null | the object above
```

When set, SDT renders a small avatar + name pill in the toolbar (with the role under the name). Calling `setUser(null)` removes it. SDT never reads cookies or auth tokens itself — hosts call `setUser()` from their own auth code so SDT stays auth-agnostic.

A `sdt:user-change` event fires on every `setUser()` call.

---

## Dock position

The toolbar docks in one of four corners. **Default: `bottom-right`** (unchanged from previous versions).

```js
sdt.init({ dock: 'bottom-left' });
sdt.setDock('top-right');   // change at runtime
sdt.setDock('auto');        // pick the freest corner
sdt.getDock();              // → 'bottom-right' (always a resolved corner)
```

Accepts `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'`, or `'auto'`. The legacy `position` config key is still honoured as an alias.

`'auto'` runs a one-shot heuristic when SDT boots: it inspects fixed and sticky elements ≥100×100px on the page and picks the corner with no overlap, preferring `bottom-right` → `bottom-left` → `top-right` → `top-left`. The choice is sticky (no resize re-evaluation); call `setDock('auto')` again to recompute.

If your host page already has a fixed sidebar, panel, or peer tool in one corner, set `dock` to a specific free corner (or use `'auto'`) so SDT doesn't collide. Toast notifications and the Tree panel automatically follow the dock position. Open dropdowns close on dock change to avoid stale positioning.

---

## Client handoff

Give the toolbar to your clients so they can report issues with precision instead of vague descriptions. Instead of "something looks wrong on the homepage," they click the label and tell you "home-03-testimonials has a layout issue on mobile."

Build the WordPress plugin zip (`npm run build:wp`), send it to the client, and ask them to install it. They log in as an admin, press **L** to turn on labels, click the one that's broken, and paste the ref value into their email or ticket. You search your codebase for that exact string and find the block in seconds.

The toolbar only loads for administrators, so regular site visitors never see it.

---

## Documentation

| Doc | What's in it |
|-----|-------------|
| [Usage Guide](docs/usage-guide.md) | Modes, keyboard shortcuts, click-to-copy, JS API, dark mode, SPA support |
| [WordPress Setup](docs/wordpress.md) | Installable plugin, mu-plugin, capability gating, Gutenberg blocks, client handoff |
| [Page Builders](docs/page-builders.md) | Built-in class converter, auto-ref, plus manual setup for Elementor, Bricks, Oxygen, Breakdance, Gutenberg |
| [Naming Conventions](docs/naming-conventions.md) | `data-ref` patterns for websites, web apps, and multi-surface products |
| [AI-Agent Rollout Prompt](docs/agent-rollout-prompt.md) | Copy-paste prompt for Claude Code / ChatGPT / Codex / Cursor to roll out the toolbar + `data-ref` tagging into any project |
| [Design](docs/DESIGN.md) | IA, UI spec, colour system, badge placement, and visual hierarchy |
| [WP Settings Page](docs/wp-settings-page.md) | IA and UI spec for the WordPress admin settings page |

---

## At a glance

- **Zero dependencies** — one self-contained JS file
- **Shadow DOM isolation** — toolbar renders in a shadow root, immune to page/builder CSS
- **~42 KB minified** — still lightweight enough for front-end QA use
- **Click-to-copy** — click any label, get the ref value on your clipboard
- **Dropdown controls** — Labels, Target, and Outline as compact front-end menus
- **Outline guides** — optional section/block outlines with stronger section framing, lighter block guides, and dark-surface-aware contrast
- **Collision-aware labels** — overlapping labels use depth-aware staggering and keep a visible leader line to their target
- **Keyboard shortcuts** — L cycles Labels, T cycles Target, O cycles Outline, D toggles toolbar visibility (configurable), Esc dismisses everything (skips input fields and modifier-key combos)
- **Presentation mode** — H key hides toolbar + all labels for clean screenshots and client demos
- **Tree panel** — floating element tree with nesting, context chips, hover-to-highlight, row click-to-jump, and per-row copy
- **Adaptive label colours** — labels automatically invert on dark-background sections
- **Dark mode** — add `class="dark"` to `<html>` and the toolbar adapts
- **SPA-friendly** — call `refresh()` after dynamic content loads
- **WordPress plugin included** — installable zip or mu-plugin, admin-only, dedicated settings page
- **Class-to-ref converter** — add `dataref-` CSS classes in any page builder (including free tiers) and they become `data-ref` attributes
- **Auto-ref with Target control** — three target levels (Sections / Blocks / Elements) switchable from the toolbar or with the **T** key, zero manual tagging. Defaults to Elements out of the box.
- **Smart element context** — auto-ref names include widget types (e.g. `home-03-heading` instead of `home-03-div`)
- **Page builder support** — modern Elementor, Bricks, Oxygen, Breakdance, Gutenberg
- **Works everywhere** — static HTML, React, Vue, WordPress, Shopify, anything with a DOM

---

## Build from source

```bash
git clone https://github.com/segurudigital/seguru-debug-toolbar.git
cd seguru-debug-toolbar
npm install                  # installs esbuild (dev dependency only)
npm run build                # → dist/seguru-debug-toolbar.min.js
npm run build:wp             # → dist/seguru-debug-toolbar-wp-vX.Y.Z.zip
npm run dev                  # watch mode with auto-rebuild
```

---

## Support

We open-source the tools we build for our own workflow. If they save you time, consider supporting us at [buymeacoffee.com/segurudigital](https://buymeacoffee.com/segurudigital) — it keeps the tools free and funds pro-bono work for nonprofits.

---

## Contributing

Found a bug or want to add something? Open an issue or submit a PR. We're a small team so we'll review things as fast as we can.

If you're using this on your own projects, we'd love to hear about it — drop us a line at [hello@seguru.digital](mailto:hello@seguru.digital).

---

## License

MIT — free for personal and commercial use.

Made by [Seguru Digital](https://seguru.digital) — strategy-first fractional CMO & CTO who also builds. Brand strategy, marketing, AI, and dev ops for SMBs across the U.S. and Australia.
