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

**Depth** (press **D** to cycle) — controls what gets auto-labelled (also switchable from the toolbar):



| Depth | What gets labelled |
|-------|-------------------|
| **Off** | Only your manual `data-ref` attributes and class-converter labels. |
| **Sections** | Top-level page sections (Elementor containers, Bricks sections, HTML5 `<section>` tags). |
| **Blocks** | Sections + inner containers, widgets, and content blocks. |
| **Elements** | Sections + all semantic HTML (headings, paragraphs, images, buttons, forms, etc.). |

**Outline** — controls visual guide outlines for spacing and overlap QA:

| Outline | What you see |
|---------|--------------|
| **Off** | No guide outlines. |
| **Sections** | Strong orange section frames with a subtle inset wash to make the page skeleton easier to read. |
| **Blocks** | Section frames plus lighter dashed guides for inner blocks and containers. |

Click any label to copy the `data-ref` value to your clipboard. A toast confirms the copy.

When nearby labels would overlap, the toolbar uses depth-aware staggering and a thin leader line back to the element corner so the reference still reads clearly.

Press **H** to hide the toolbar and all labels (presentation mode). Press **H** again to restore.

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

**CDN (recommended — zero install, auto-updates):**

Load directly from jsDelivr, which serves any GitHub release unchanged. No build, no download, no npm dependency:

```html
<!-- Track the 2.x line — receives minor + patch updates automatically -->
<script src="https://cdn.jsdelivr.net/gh/seguru-digital/seguru-debug-toolbar@v2/dist/seguru-debug-toolbar.min.js" defer></script>

<!-- Or pin to an exact version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/gh/seguru-digital/seguru-debug-toolbar@v2.2.0/dist/seguru-debug-toolbar.min.js" defer></script>

<!-- Or always the latest release (use in wireframes / staging only) -->
<script src="https://cdn.jsdelivr.net/gh/seguru-digital/seguru-debug-toolbar@latest/dist/seguru-debug-toolbar.min.js" defer></script>
```

Pinning by major (`@v2`) is the sweet spot — stay current on bug fixes, avoid breaking changes. Pin to an exact tag for client production sites where you want a manual upgrade step.

**Manual (any project):**

Download `dist/seguru-debug-toolbar.min.js` from this repo and drop it in your project. Include it with a script tag:

```html
<script src="path/to/seguru-debug-toolbar.min.js"></script>
```

The toolbar auto-injects itself. No CSS file, no init call needed.

**WordPress:**

Build the installable plugin zip:

```bash
npm run build:wp
# → dist/seguru-debug-toolbar-wp-vX.Y.Z.zip
```

Upload via wp-admin → Plugins → Add New → Upload, activate, configure under Settings → Debug Toolbar. An mu-plugin drop-in is also included in `wordpress/seguru-debug-toolbar.php`.

The installable plugin checks the GitHub releases API every 6 hours. When a newer version is tagged, WordPress shows a standard "Update available" notice on the Plugins screen — click **Update Now** and the new zip is pulled and installed like any wp.org plugin. No separate update service or subscription needed.

> **npm is coming.** The package will be published to npm once v2.2.0 is tagged. Until then, CDN or manual install. See [Roadmap](ROADMAP.md) for status.

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
- **Dropdown controls** — Labels, Depth, and Outline as compact front-end menus
- **Outline guides** — optional section/block outlines with stronger section framing, lighter block guides, and dark-surface-aware contrast
- **Collision-aware labels** — overlapping labels use depth-aware staggering and keep a visible leader line to their target
- **Keyboard shortcuts** — L cycles label modes, D cycles depth, H toggles presentation mode (skips input fields)
- **Presentation mode** — H key hides toolbar + all labels for clean screenshots and client demos
- **Tree panel** — floating element tree with nesting, context chips, hover-to-highlight, row click-to-jump, and per-row copy
- **Adaptive label colours** — labels automatically invert on dark-background sections
- **Dark mode** — add `class="dark"` to `<html>` and the toolbar adapts
- **SPA-friendly** — call `refresh()` after dynamic content loads
- **WordPress plugin included** — installable zip or mu-plugin, admin-only, dedicated settings page
- **Class-to-ref converter** — add `dataref-` CSS classes in any page builder (including free tiers) and they become `data-ref` attributes
- **Auto-ref with depth control** — three depth levels (Sections/Blocks/Elements) switchable from the toolbar, zero manual tagging
- **Smart element context** — auto-ref names include widget types (e.g. `home-03-heading` instead of `home-03-div`)
- **Page builder support** — modern Elementor, Bricks, Oxygen, Breakdance, Gutenberg
- **Works everywhere** — static HTML, React, Vue, WordPress, Shopify, anything with a DOM

---

## Build from source

```bash
git clone https://github.com/seguru-digital/seguru-debug-toolbar.git
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
