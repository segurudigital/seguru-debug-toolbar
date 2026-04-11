# Usage Guide

## How it works

The Seguru Debug Toolbar scans the page for any element with a `data-ref` attribute and attaches visual labels to each one. The toolbar appears as a compact bar in the corner of the page with two dropdown controls.

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

### Icons (mode 0 — default)

A small orange dot appears at the top-left of each `data-ref` element. Hover the dot to reveal a dark tooltip showing the full ref value. The tooltip also stays visible if the cursor moves from the dot onto the tooltip text. The dot is intentionally subtle so it doesn't interfere with visual review.

### Off (mode 1)

All labels are hidden. The page looks exactly as it would to an end user. Use this mode for screenshots, client presentations, or any time you need a clean view.

### Full (mode 2)

A persistent text label appears at the top-left of every `data-ref` element, showing the full ref value at all times. Labels use a dark background with white text for high contrast against any design. This mode is best for QA passes and cross-referencing against copy documents or wireframes.

---

## Presentation mode

Press **H** to instantly hide the toolbar and all labels from the page. Press **H** again to restore everything. This is separate from the Off label mode — Off hides labels but keeps the toolbar visible. Presentation mode hides both.

Use it before taking screenshots, recording demos, or presenting to a client on a shared screen when you don't want the toolbar visible.

---

## Depth control

The **Depth** dropdown controls what gets auto-labelled. Click it to select a level, or press **D** to cycle through them.

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

## Tree panel

The **Tree** button in the toolbar opens a floating panel listing all labeled elements in document order. Elements are indented based on nesting depth — a widget inside a section sits one level deeper than the section itself.

Each row shows the element context type (e.g. `section`, `h2`, `widget`) and the full ref value. Hover a row to highlight the corresponding element on the page with an orange outline. Click the copy button (⎘) on any row to copy the ref value.

The tree panel rebuilds automatically when you change depth or call `refresh()`. Use it at Block or Element depth where on-page labels overlap — the tree gives you a clean readable list without the visual noise.

---

## Adaptive label colours

Labels automatically detect whether they sit on a light or dark background. Elements with dark hero images or coloured backgrounds receive inverted label styling — light icons and white full-mode labels — so they stay legible without manual configuration.

---

## Click-to-copy

In Icons or Full mode, click any label element (the dot, the tooltip, or the full-text label) to copy the `data-ref` value to your clipboard. A green toast notification appears briefly in the bottom-right corner confirming what was copied.

This makes it easy to grab ref values for bug reports, feedback notes, or code searches. Click the label, paste it into your ticket or message, done.

---

## JavaScript API

The toolbar exposes a global object at `window.seguruDebugToolbar` with three methods:

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

### refresh()

Re-scans the DOM for any new `data-ref` elements and attaches labels to them. Already-labelled elements are skipped, so calling this multiple times is safe.

```js
// After loading new content via AJAX or SPA navigation
window.seguruDebugToolbar.refresh();
```

This is particularly useful in single-page applications (React, Vue, etc.) where content loads after the initial page render. Call `refresh()` after your route change or data fetch completes.

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

The toolbar does one DOM scan on page load (or when you call `refresh()`) and attaches three small `<span>` elements to each `data-ref` element. On a page with 50 sections, that's 150 extra spans — negligible. The injected `<style>` block handles all show/hide logic via CSS class toggles on `<body>`, so switching modes doesn't trigger any JavaScript DOM walks.

The minified file is ~27 KB. No network requests, no external dependencies, no runtime overhead beyond the initial scan.
