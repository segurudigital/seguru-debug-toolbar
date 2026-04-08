# Usage Guide

## How it works

The Seguru Debug Toolbar scans the page for any element with a `data-ref` attribute and attaches visual labels to each one. The toolbar itself appears as a small bar in the bottom-right corner of the page.

All styling is injected by the script — there is no external CSS file to link. The toolbar, labels, and toast are all created as DOM elements with inline class names and a single injected `<style>` block.

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

## Three modes

The toolbar cycles through three modes. You can switch using the toolbar buttons or by pressing **L** on your keyboard (the shortcut is disabled when focus is in an input field, textarea, select, or contenteditable element).

### Icons (mode 0 — default)

A small orange dot appears at the top-left of each `data-ref` element. Hover over the dot (or anywhere on the element) to reveal a dark tooltip showing the full ref value. The dot is intentionally subtle so it doesn't interfere with visual review.

### Off (mode 1)

All labels are hidden. The page looks exactly as it would to an end user. Use this mode for screenshots, client presentations, or any time you need a clean view.

### Full (mode 2)

A persistent text label appears at the top-left of every `data-ref` element, showing the full ref value at all times. The labels use a light background and muted text so they're readable without being too distracting. This mode is best for QA passes and cross-referencing against copy documents or wireframes.

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

The minified file is under 10 KB. No network requests, no external dependencies, no runtime overhead beyond the initial scan.
