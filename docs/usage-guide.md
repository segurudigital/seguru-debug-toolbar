# Usage Guide

## How it works

The Seguru Debug Toolbar scans the page for any element with a `data-ref` attribute and attaches visual labels to each one. The toolbar appears as a compact bar in the corner of the page with three dropdown controls plus the Tree button.

The toolbar and toast render inside a **Shadow DOM** — completely isolated from page styles (Elementor, Bricks, theme CSS, etc.). Label elements in the page DOM use `all: initial` resets to prevent inherited styles from leaking in. No external CSS file needed.

---

## Adding data-ref to your markup

Any HTML element can have a `data-ref` attribute. The value should be a short, descriptive string that identifies that section or component.

```html
<section data-ref="home-01-hero">
  <!-- content -->
</section>

<div data-ref="home-02-features">
  <!-- content -->
</div>

<aside data-ref="sidebar-cta">
  <!-- content -->
</aside>
```

The toolbar picks these up automatically on page load. No registration step, no config file. If the element has `data-ref`, it gets a label.

---

## Label modes

The **Labels** dropdown on the toolbar controls how labels appear. Click it to select a mode, or press **L** to cycle through them (the shortcut is disabled when focus is in an input field, textarea, select, or contenteditable element).

### Icons (mode 0)

A small orange dot appears at the top-left of each `data-ref` element. Hover the dot to reveal a dark tooltip showing the full ref value. The tooltip also stays visible if the cursor moves from the dot onto the tooltip text. The dot is intentionally subtle so it doesn't interfere with visual review. When nearby labels would collide, the toolbar uses a depth-aware stagger, nudging deeper labels into a cleaner stepped stack and drawing a thin leader line back to the element corner so the reference stays visually anchored.

### Off (mode 1)

All labels are hidden. The page looks exactly as it would to an end user. Use this mode for screenshots, client presentations, or any time you need a clean view.

### Full (mode 2 — default)

A persistent text label appears at the top-left of every `data-ref` element, showing the full ref value at all times. Labels use a dark background with white text for high contrast against any design. This mode is best for QA passes and cross-referencing against copy documents or wireframes. If neighboring labels overlap, the toolbar automatically staggers them in a depth-aware stepped pattern and adds a leader line back to the original element corner. Long labels are clipped cleanly instead of sprawling across dense nested layouts.

---

## Presentation mode

The toolbar loads in **presentation mode by default** — the script runs, labels are prepared in the DOM, but nothing is visible. Press **D** to reveal the toolbar and labels. Press **D** again to hide them. (The visibility hotkey is [configurable](../README.md#keyboard) — `D` is just the default; pre-2.3 builds used `H`.)

This default keeps screenshots, Chrome debug captures (including AI-agent browsing sessions), and client demos clean without any extra step. Anyone who wants the toolbar can bring it up with one keypress.

To restore legacy "visible on load" behaviour per-page, set `window.seguruDebugConfig = { startHidden: false }` before the script tag. In the WordPress plugin, turn off **Start hidden** under Settings → Debug Toolbar.

Presentation mode is separate from the Off label mode — Off hides labels but keeps the toolbar visible. Presentation mode hides both.

---

## Target control

The **Target** dropdown controls what gets auto-labelled. Click it to select a level, or press **T** to cycle through them. The default is **Elements** — the densest view, useful for full-coverage QA and for AI agents reading the page to generate feedback against every meaningful element. (Pre-2.3 builds called this "Depth" and bound it to `D`; the public API methods `setDepth()` / `getDepth()` keep their names for back-compat.)

### Off

Only manual `data-ref` attributes and class-converter labels are shown. No auto-ref scanning.

### Sections

Auto-ref scans for top-level page sections — Elementor containers (`.e-con`), Bricks sections, Oxygen sections, Breakdance sections, and HTML5 `<section>` tags. Best for high-level QA.

### Blocks

Everything in Sections, plus inner containers, columns, widgets, and content blocks. Shows Elementor widgets, Bricks elements, Gutenberg blocks, etc. Useful for layout debugging.

### Elements

Everything in Sections, plus all semantic HTML — headings (`h1`–`h6`), paragraphs, images, buttons, forms, tables, lists, and builder widgets. The densest view, useful for pinpointing specific elements during debugging.

Auto-generated ref names include element context: `home-03-heading` for an Elementor heading widget, `home-05-h2` for a bare `<h2>`, `home-07-cover` for a Gutenberg cover block.

---

## Outline guides

The **Outline** dropdown adds guide outlines to help you inspect section boundaries, overlapping wrappers, and spacing relationships without turning on dense labels everywhere. Click it to select a mode, or press **O** to cycle through them.

### Off

No guide outlines are shown.

### Sections

Top-level page sections get a stronger orange frame with a subtle inset wash near the top edge. This is the cleanest view when you want to understand the page skeleton or confirm where one section ends and the next begins.

### Blocks

Sections keep the stronger structural frame, and inner blocks/containers get a lighter dashed outline. This is the most useful mode for layout debugging because nested wrappers become visible without the noise of full element-level labels.

On dark hero sections and dark containers, outline contrast is adjusted automatically so the guides still read clearly without overpowering the design.

---

## Tree panel

The **Tree** button in the toolbar opens a floating panel listing all labeled elements in document order. Elements are indented based on nesting depth, and the header shows the current ref count, depth setting, and outline mode so you can keep orientation while inspecting.

Each row shows the element context type (e.g. `section`, `h2`, `widget`) and the full ref value. Hover or focus a row to highlight the corresponding element on the page with an orange outline. Click a row to jump the page to that element and flash a stronger temporary highlight. Click the copy button (⎘) on any row to copy the ref value without jumping.

The tree panel rebuilds automatically when you change depth or call `refresh()`. Use it at Block or Element depth when even collision-managed on-page labels become too dense — the tree gives you a clean readable list without the visual noise.

---

## Adaptive label colours

Labels automatically detect whether they sit on a light or dark background. Elements with dark hero images or coloured backgrounds receive inverted label styling — light icons and white full-mode labels — so they stay legible without manual configuration.

---

## Click-to-copy

In Icons or Full mode, click any label element (the dot, the tooltip, or the full-text label) to copy the `data-ref` value to your clipboard. A green toast notification appears briefly in the bottom-right corner confirming what was copied.

This makes it easy to grab ref values for bug reports, feedback notes, or code searches. Click the label, paste it into your ticket or message, done.

---

## JavaScript API

The toolbar exposes a global object at `window.seguruDebugToolbar` with seven methods:

### setState(mode)

Set the toolbar to a specific mode.

```js
window.seguruDebugToolbar.setState(0); // Icons
window.seguruDebugToolbar.setState(1); // Off
window.seguruDebugToolbar.setState(2); // Full
```

### getState()

Returns the current mode as a number (0, 1, or 2).

```js
var mode = window.seguruDebugToolbar.getState();
console.log(mode); // 0
```

### setDepth(depth)

Set the auto-ref depth level. Accepts `'off'`, `'section'`, `'block'`, or `'element'`.

```js
window.seguruDebugToolbar.setDepth('element');  // Label everything
window.seguruDebugToolbar.setDepth('section');  // Just sections
window.seguruDebugToolbar.setDepth('off');      // Manual labels only
```

Switching depth clears previous auto-ref labels and rescans at the new level.

### getDepth()

Returns the current depth level as a string (`'off'`, `'section'`, `'block'`, or `'element'`).

```js
var depth = window.seguruDebugToolbar.getDepth();
console.log(depth); // "section"
```

### setOutline(mode)

Set the outline guide mode. Accepts `'off'`, `'section'`, or `'block'`.

```js
window.seguruDebugToolbar.setOutline('section');
window.seguruDebugToolbar.setOutline('block');
window.seguruDebugToolbar.setOutline('off');
```

### getOutline()

Returns the current outline mode as a string (`'off'`, `'section'`, or `'block'`).

```js
var outline = window.seguruDebugToolbar.getOutline();
console.log(outline); // "block"
```

### refresh()

Re-scans the DOM for any new `data-ref` elements and attaches labels to them. Already-labelled elements are skipped, so calling this multiple times is safe.

```js
// After loading new content via AJAX or SPA navigation
window.seguruDebugToolbar.refresh();
```

This is particularly useful in single-page applications (React, Vue, etc.) where content loads after the initial page render. Call `refresh()` after your route change or data fetch completes. If outline guides are enabled, `refresh()` reapplies them after the rescan.

---

## Dark mode

The toolbar responds to a `dark` class on the `<html>` element:

```html
<html class="dark">
```

When dark mode is active, the toolbar switches to a dark background with lighter borders. The label colours stay the same (orange accent) so they remain visible against both light and dark layouts.

If your project uses a different dark mode mechanism (e.g. a `data-theme="dark"` attribute or a `prefers-color-scheme` media query), you can toggle the `dark` class on `<html>` to match your setup.

---

## Positioning and z-index

The toolbar sits at `position: fixed; bottom: 20px; right: 20px` with a z-index of `99999`. The toast notification sits just above it at z-index `100000`. The label elements use z-index `90` and `91`.

If you have other fixed-position UI at the bottom-right of the page (cookie banners, chat widgets, etc.), the toolbar should stack above most of them. If you run into a conflict, the simplest fix is to adjust the z-index on the competing element.

---

## Static position handling

The toolbar injects absolutely-positioned label elements into each `data-ref` element. If a `data-ref` element has `position: static` (the CSS default), the toolbar automatically sets it to `position: relative` so the labels appear in the right place. This is a non-destructive change — it doesn't affect layout for elements that were already static.

---

## Browser support

The toolbar uses standard DOM APIs (querySelector, classList, createElement) and works in all modern browsers. The clipboard API (`navigator.clipboard.writeText`) is used where available, with a `document.execCommand('copy')` fallback for older browsers.

No polyfills needed. No transpilation needed. The source file is plain ES5-compatible JavaScript wrapped in an IIFE.

---

## Performance

The toolbar does one DOM scan on page load (or when you call `refresh()`) and attaches four small `<span>` elements to each `data-ref` element. On a page with 50 sections, that's 200 extra spans — still negligible. The injected `<style>` block handles most show/hide logic via CSS class toggles on `<body>`, with a lightweight depth-aware collision pass used to keep overlapping visible labels readable when needed.

The minified file is ~42 KB. No network requests, no external dependencies, no runtime overhead beyond the initial scan.
