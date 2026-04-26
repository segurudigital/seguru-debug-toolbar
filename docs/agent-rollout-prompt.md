# AI-Agent Rollout Prompt

This document contains a **copy-paste prompt** for any LLM-based coding agent (Claude Code, Claude web, ChatGPT, OpenAI Codex, Cursor, Aider, Windsurf, etc.) that instructs the agent to roll out the Seguru Debug Toolbar across a target project — wireframes, static sites, React/Vue apps, WordPress themes, Shopify themes, and production builds — to the standard we expect.

The goal: the agent installs the toolbar, adds `data-ref` attributes to every meaningful element using our naming convention, and ensures those refs travel from wireframe through to production unchanged.

---

## How to use

1. Paste everything inside the fenced block below as a single system/first-user message in your agent session.
2. Tell the agent what project it's working on (the stack, the page, the output target).
3. Let it work. Review the diff. Ask for corrections in the agent's native language.

The prompt is designed to be self-contained — the agent does not need to read this repo to apply it. All canonical rules are baked into the prompt itself.

---

## The prompt (copy everything below this line)

```
You are rolling out the Seguru Debug Toolbar into the current project. Follow these rules exactly — they are the standard for every Seguru-built wireframe, website, and app. Do not improvise naming or behavior.

## What the toolbar is

A ~42 KB zero-dependency script that visualizes `data-ref` attributes on any HTML element. Used for wireframe QA, design review, client revision rounds, bug reporting, and AI-assisted feedback loops. Source + docs: https://github.com/segurudigital/seguru-debug-toolbar

## Non-negotiables

1. Every meaningful element gets a `data-ref`. Sections, containers, headings, paragraphs, images, buttons, forms, list items at minimum. Navigation links, icons, badges, and interactive widgets too. The bar is "would a designer, developer, or client ever refer to this element in feedback?" — if yes, tag it.
2. `data-ref` values NEVER change between wireframe and production. A section tagged `home-01-hero-standard` in the wireframe keeps that exact ref in the staging build, the live WordPress/Shopify/React output, and every rebuild after that. Refs are the shared vocabulary between stakeholders — renaming them breaks every feedback loop upstream.
3. Lowercase, hyphens only. No camelCase, no underscores, no spaces, no trailing slashes.
4. Be specific enough to be unique. Every `data-ref` on a given page must be distinct.
5. Don't edit the toolbar script. It is a compiled artefact. Just install it and move on.

## Naming convention

### Websites (marketing sites, landing pages, brochure sites)

Format: `[page-slug]-[section-number]-[pattern-slug]`

- `page-slug` — matches the URL path. Homepage is `home`. For nested pages use the final segment (`about-team` for `/about/team` only when needed to disambiguate; otherwise just `team`).
- `section-number` — two digits, zero-padded, reflecting original IA order: `01`, `02`, `03`. Numbers are stable identifiers, not indexes — if sections get reordered later, the refs stay put. Insert between two sections with `02a` rather than renumbering.
- `pattern-slug` — what UI pattern the section uses: `hero-standard`, `hero-split`, `features-grid`, `testimonials`, `cta-banner`, `form`, `team-grid`, `logo-wall`, `pricing-table`, `faq-accordion`, `footer`. Use `tbd` only if the pattern isn't decided yet during IA phase.

For elements below the section level (headings, paragraphs, buttons, images, form fields, list items), append a short descriptor:

- `home-01-hero-standard` — the section itself
- `home-01-hero-standard-heading` — the H1
- `home-01-hero-standard-subheading` — the H2/lede
- `home-01-hero-standard-cta-primary` — the main button
- `home-01-hero-standard-cta-secondary` — the secondary button
- `home-01-hero-standard-image` — the hero image
- `home-01-hero-standard-eyebrow` — small text above heading
- `home-02-features-grid-item-01` through `-item-06` — individual feature cards

Keep descriptors short and semantic. Prefer `cta-primary` over `button-1`. Prefer `heading` over `h1` (the tag level may change later; the role won't).

### Web apps, admin panels, multi-surface products

Format: `[product]-[surface]-[screen-slug]-[element]`

- `product` — short org-specific product code: `os`, `data`, `atlas`, `builds`, etc. One word, lowercase.
- `surface` — platform: `pwa`, `app`, `wp-admin`, `wp-frontend`, `shopify-admin`, `shopify-storefront`, `mobile`.
- `screen-slug` — screen identifier. Include enough hierarchy to be unambiguous: `admin-settings-users-roles` rather than bare `roles`.
- `element` — optional, same rules as above for sub-section elements.

Examples:
- `data-pwa-dashboard` — screen-level
- `data-pwa-dashboard-metrics-card-01` — a specific metric card on that screen
- `os-app-workshop-kanban-column-inprogress` — the "in progress" column on the kanban
- `builds-wp-admin-build-manager-table-header` — the table header on the build manager

### Components in a design system

Format: `ds-[component]-[variant]-[state]`

- `ds-button-primary-default`
- `ds-button-primary-hover`
- `ds-input-text-error`
- `ds-card-feature-dark`

Only add these in component libraries or Storybook-style galleries, not production pages.

## What to tag — concrete checklist

Go section by section. For each section, add refs in this order:

1. The section/container itself (`home-01-hero-standard`)
2. Major wrappers inside (heading group, media, CTA group)
3. Text nodes: `h1`–`h6`, lede paragraphs, body paragraphs, small print, eyebrow text
4. Interactive elements: every `button`, `a` styled as button, form input, select, textarea
5. Images, icons, video containers, SVG graphics
6. List items when the list is content (feature cards, testimonials, team members — not bullet points inside a paragraph)
7. Navigation items (header nav links, footer link groups, social icons)
8. Dynamic state containers (loading spinners, empty states, error messages) — use the section ref + state suffix: `home-03-pricing-loading`

Skip: decorative-only spans, utility wrappers added purely for layout, repeat text inside the same semantic role (e.g. each `<p>` inside a single body copy block doesn't each need its own — tag the wrapper).

## Installing the toolbar

Pick the path that matches the target project:

### Static HTML / wireframes / any HTML file (recommended: CDN)

Use jsDelivr's npm-backed path — no download step, updates by changing the version pin:

```html
<!-- Track the 2.x line (auto-updates on minor/patch releases) -->
<script src="https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@2/dist/seguru-debug-toolbar.min.js" defer></script>

<!-- Pin to an exact version for client production sites -->
<script src="https://cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@2.2.3/dist/seguru-debug-toolbar.min.js" defer></script>
```

Default: pin by major version (`@2`). Use the exact version for production where a manual upgrade step is required. Only use the unpinned path in internal wireframes or staging where a breaking-change risk is acceptable.

Alternatively, download `dist/seguru-debug-toolbar.min.js` from a GitHub release and drop it next to your HTML:

```html
<script src="seguru-debug-toolbar.min.js" defer></script>
```

### React / Next / Vue / Svelte

Install from npm first:

```bash
npm install --save-dev @segurudigital/seguru-debug-toolbar
```

Then bundle the source in a dev-only client entrypoint, or copy `node_modules/@segurudigital/seguru-debug-toolbar/dist/seguru-debug-toolbar.min.js` into `public/` before using a `/seguru-debug-toolbar.min.js` script tag:

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

Make sure it only loads in dev / preview / staging, never production-public. Example gate:

```jsx
{process.env.NODE_ENV !== 'production' && (
  <DebugToolbar />
)}
```

Or for staging gating, wrap by domain/host rather than NODE_ENV.

### WordPress

Upload the WordPress plugin zip from the releases page (`seguru-debug-toolbar-wp-vX.Y.Z.zip`), activate, and configure under Settings → Debug Toolbar. The plugin only loads for logged-in users meeting the configured role (default: administrator) — regular site visitors never see it.

### Shopify

Drop the minified file into `assets/` and add to `layout/theme.liquid`:

```liquid
{% if customer and customer.tags contains 'staff' %}
  <script src="{{ 'seguru-debug-toolbar.min.js' | asset_url }}" defer></script>
{% endif %}
```

## Default behaviour (as of v2.3.0)

On page load the toolbar is **hidden** — the script runs, labels are prepared, but nothing is visible. Press **D** to reveal the toolbar + labels. This keeps screenshots, Chrome debug captures, AI-agent browsing sessions, and client demos clean by default. (The visibility hotkey is configurable via `setHotkey()` / `init({ hotkey })` / `data-hotkey="…"`. Pre-2.3 builds used `H` as the default.)

When revealed, default settings are:
- **Labels:** Full (every `data-ref` shows its value as a persistent label)
- **Target:** Elements (densest auto-ref scan; "Target" is the v2.3 rename of "Depth", the JS API still uses `setDepth()` / `getDepth()`)
- **Outline:** Off
- **Theme:** Auto (follows OS `prefers-color-scheme` plus the host's `html.dark` class)
- **Dock:** Bottom-right

Keyboard shortcuts (all ignored when focus is in input/textarea/select/contenteditable, and ignored when modifier keys are held):
- **D** — show / hide the toolbar (configurable visibility hotkey)
- **L** — cycle label modes: Off → Icons → Full
- **T** — cycle Target depth: Off → Sections → Blocks → Elements
- **O** — cycle Outline guides: Off → Sections → Blocks
- **Esc** — global one-shot hide (closes any open dropdown, the Tree panel, and the toolbar in a single press)

Clicking any label copies the `data-ref` value to clipboard. A green toast confirms the copy.

## Per-page overrides

If a specific page needs different defaults (e.g. the toolbar visible on load for a demo), set this before the script tag:

```html
<script>
  window.seguruDebugConfig = {
    startHidden: false,       // default true — set false to load visible
    defaultMode: 2,           // 0=Icons, 1=Off, 2=Full
    autoRefDepth: 'element',  // 'off' | 'section' | 'block' | 'element'
    outlineMode: 'off',       // 'off' | 'section' | 'block'
    autoRef: false,           // default true (auto-ref ON) — set false to disable
    hotkey: 'V',              // default 'D' — single letter A-Z, or false to disable
    theme: 'auto',            // 'auto' | 'light' | 'dark'
    dock: 'bottom-right',     // bottom-right | bottom-left | top-right | top-left | auto
    user: { name: 'Reviewer', role: 'qa' }   // optional identity pill
  };
</script>
<script src="seguru-debug-toolbar.min.js" defer></script>
```

## JavaScript API

```js
window.seguruDebugToolbar.setState(0|1|2);                              // label mode
window.seguruDebugToolbar.setDepth('off'|'section'|'block'|'element');  // Target
window.seguruDebugToolbar.setOutline('off'|'section'|'block');
window.seguruDebugToolbar.hide(); window.seguruDebugToolbar.show(); window.seguruDebugToolbar.toggle();
window.seguruDebugToolbar.setHotkey('D'|false);
window.seguruDebugToolbar.setTheme('auto'|'light'|'dark');
window.seguruDebugToolbar.setDock('bottom-right'|'bottom-left'|'top-right'|'top-left'|'auto');
window.seguruDebugToolbar.setUser({ name, role, id, email }|null);
window.seguruDebugToolbar.refresh();  // rescan DOM after SPA navigation or async content
```

A `sdt:*` event bus on `window` reports lifecycle, theme, and `dataref-click` interactions for review-tool integrations — see the README "Events" section.

Call `refresh()` after route changes, after `fetch()`-loaded content mounts, and after any DOM mutation that injects new `data-ref` elements.

## Wireframe → production continuity

This is the whole point: refs added in the wireframe must survive every transform to the production build. Enforce these:

1. **Don't rename refs across environments.** If a designer tags `about-02-team-grid` in the wireframe HTML, that exact string must appear in the production template, the CMS output, the component prop, and the rendered live HTML. No environment-prefixing (`staging-about-02-team-grid`), no auto-incrementing (`about-02-team-grid-v2`).
2. **Don't strip `data-ref` attributes during build.** Some HTML minifiers remove unknown attributes — configure them to preserve `data-ref`. For Next.js, React, Vue, Svelte: pass through as normal HTML attributes (they are already preserved by default).
3. **Don't let the CMS rewrite them.** If the production CMS supports custom HTML attributes, use that. If it doesn't (many free-tier page builders), use the **class-to-ref converter**: put `dataref-about-02-team-grid` as a CSS class in the builder, and the toolbar converts it to `data-ref` at runtime.
4. **Don't tag component instances at the library level.** A generic `<Button>` component shouldn't hardcode a `data-ref`. Accept it as a prop (`data-ref="home-01-hero-standard-cta-primary"`) so each usage gets its own unique ref.

## Acceptance criteria

Before reporting the rollout as done, verify every item:

- [ ] The toolbar script is loaded on the target page(s) and only for authorised users/environments
- [ ] Loading the page with H unpressed shows a clean view (toolbar hidden)
- [ ] Pressing H reveals the toolbar bottom-right with Labels=Full, Depth=Elements
- [ ] Every section has a unique `data-ref` following the naming convention
- [ ] Every heading, paragraph, button, image, form field, nav item, and list item inside content lists has a `data-ref`
- [ ] No two elements on the same page share a `data-ref`
- [ ] All refs are lowercase, hyphen-separated, no trailing whitespace
- [ ] Clicking the Tree button in the toolbar lists every tagged element in document order with no "(untagged)" gaps in visible sections
- [ ] Refs present in the wireframe source are unchanged in the built output (check with `grep -r "data-ref=" dist/` or equivalent)

## Output format

After completing the rollout, reply with:

1. A one-paragraph summary of what was tagged (pages touched, rough ref count)
2. A bulleted list of any ambiguous sections where you had to guess the pattern-slug — flag these for human review
3. The list of files modified

Do not paste the full diff unless explicitly asked — the human will review via their VCS.
```

---

## Notes on the prompt

- The prompt assumes the latest toolbar defaults (as of v2.2.0): hidden on load, Full labels, Elements depth. Update the version reference if you ship a new default scheme.
- It intentionally does not include the full `data-ref` tree for the toolbar's own source — agents just need to know how to install and use it, not modify it.
- The "Wireframe → production continuity" section is the load-bearing part for the user's goal of clean feedback loops. Keep it strict.
- For agents that struggle with long prompts, the two most critical paragraphs are **Non-negotiables** and **Wireframe → production continuity** — those alone are enough for a capable agent to get 80% of the work right.
