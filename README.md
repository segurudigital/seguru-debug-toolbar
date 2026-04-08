# Seguru Debug Toolbar

A tiny, zero-dependency JavaScript tool that turns `data-ref` attributes into a clickable visual overlay. Built for teams who use wireframes, design systems, or component libraries and need a fast way to identify, reference, and QA page sections.

**~12 KB minified. No CSS file. No build step required. Just drop in a script tag.**

Built and maintained by [Seguru Digital](https://seguru.digital), a strategy-first fractional CMO and CTO practice that also builds. We work across brand strategy, marketing, AI, and dev ops for SMBs in the U.S. and Australia. We use this daily across wireframes, WordPress sites, Shopify themes, and PWAs — and we're open-sourcing it because every dev and design team should have this in their toolkit.

---

## What it does

Add `data-ref` attributes to any HTML element. The toolbar gives you three viewing modes, cycled with the **L** key or the toolbar buttons:

| Mode | What you see |
|------|-------------|
| **Icons** | Small dot on each element. Hover to reveal the full label. |
| **Off** | Clean view. Nothing shown — good for screenshots and client presentations. |
| **Full** | Always-visible label on every element. Best for QA, cross-referencing copy docs, and revision feedback. |

Click any label to copy the `data-ref` value to your clipboard. A toast confirms the copy.

```html
<!-- Your markup -->
<section data-ref="home-01-hero">
  <h1>Welcome</h1>
</section>

<section data-ref="home-02-features">
  <h2>Features</h2>
</section>

<!-- That's it. The toolbar finds them automatically. -->
<script src="https://cdn.jsdelivr.net/npm/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js"></script>
```

---

## Why we built this

We got tired of the feedback loop between wireframes and live builds. A designer would say "the hero section needs more padding" and the developer would ask "which section is the hero?" — even though both were looking at the same screen.

`data-ref` attributes gave us a shared vocabulary. The toolbar made that vocabulary visible. Now a designer can say "home-01-hero needs more padding" and the developer copies that string straight from the page, searches the codebase, and finds the exact block. No guessing, no screenshots with red circles drawn on them.

We use it for wireframe QA, copy review, client revision rounds, and debugging block-based WordPress sites. Once we started using it on one project, we put it on everything.

---

## Install

**npm:**

```bash
npm install seguru-debug-toolbar
```

**CDN (jsDelivr auto-mirrors npm):**

```html
<script src="https://cdn.jsdelivr.net/npm/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js"></script>
```

**Manual:** Download `dist/seguru-debug-toolbar.min.js` and include it however you like.

---

## Quick start

### Script tag

```html
<script src="node_modules/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js"></script>
```

The toolbar auto-injects itself into the page. No CSS file needed, no init call needed.

### Bundler (Vite, Webpack, etc.)

```js
import 'seguru-debug-toolbar';
```

The IIFE runs on import and sets everything up.

### WordPress

An installable plugin and an mu-plugin are both included. See [WordPress Setup](docs/wordpress.md) for the full walkthrough.

Build the WordPress plugin zip:

```bash
npm run build:wp
# → dist/seguru-debug-toolbar-wp.zip
```

Upload the zip through wp-admin, activate, enable under Settings. Done.

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
| [Design](docs/design.md) | IA, UI spec, colour system, badge placement, and visual hierarchy |
| [WP Settings Page](docs/wp-settings-page.md) | IA and UI spec for the WordPress admin settings page |

---

## At a glance

- **Zero dependencies** — one self-contained JS file
- **Self-injecting CSS** — no external stylesheet to link
- **~12 KB minified** — won't slow anything down
- **Click-to-copy** — click any label, get the ref value on your clipboard
- **Keyboard shortcut** — press L to cycle modes (skips input fields)
- **Dark mode** — add `class="dark"` to `<html>` and the toolbar adapts
- **SPA-friendly** — call `refresh()` after dynamic content loads
- **WordPress plugin included** — installable zip or mu-plugin, admin-only, dedicated settings page
- **Class-to-ref converter** — add `dataref-` CSS classes in any page builder (including free tiers) and they become `data-ref` attributes
- **Auto-ref** — automatically labels page sections based on slug and position, zero manual tagging
- **Page builder support** — Elementor, Bricks, Oxygen, Breakdance, Gutenberg (docs for each)
- **Works everywhere** — static HTML, React, Vue, WordPress, Shopify, anything with a DOM

---

## Build from source

```bash
git clone https://github.com/seguru-digital/seguru-debug-toolbar.git
cd seguru-debug-toolbar
npm install
npm run build       # → dist/seguru-debug-toolbar.min.js
npm run build:wp    # → dist/seguru-debug-toolbar-wp.zip (WordPress plugin)
npm run dev         # → watch mode with auto-rebuild
```

---

## Contributing

Found a bug or want to add something? Open an issue or submit a PR. We're a small team so we'll review things as fast as we can.

If you're using this on your own projects, we'd love to hear about it — drop us a line at [hello@seguru.digital](mailto:hello@seguru.digital).

---

## License

MIT — free for personal and commercial use.

Made by [Seguru Digital](https://seguru.digital) — strategy-first fractional CMO & CTO who also builds. Brand strategy, marketing, AI, and dev ops for SMBs across the U.S. and Australia.
