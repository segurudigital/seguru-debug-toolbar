# Design — IA & UI Spec

**Version:** 1.0
**Last updated:** 2026-04-08

---

## Information Architecture

The toolbar has two jobs: show `data-ref` labels and connect back to Seguru as the maker. The IA keeps these separate so the branding never interferes with the tool's function.

### Content zones (left to right)

```
┌───────────────────────────────────────────────────────────────┐
│  [S]  │  Labels  [Icons ▾]  │  Depth  [Off ▾]  │             │
│  ───  │  ─── dropdown ────  │  ─── dropdown ──  │             │
│ badge │     label mode      │   auto-ref depth  │             │
└───────────────────────────────────────────────────────────────┘
```

**Badge zone** — The Seguru S mark (16px circle, always Seguru Primary Blue `#00C0F3`, white mark) sits at the far left. On hover, a tooltip reads "Powered by Seguru Digital". Clicking opens seguru.digital in a new tab.

**Labels dropdown** — Controls how labels appear (Icons, Off, Full). Click to open, select an option to apply. Press L to cycle. Replaces the previous row of mode buttons.

**Depth dropdown** — Controls auto-ref depth (Off, Sections, Blocks, Elements). Click to open, select a level. Press D to cycle. Dropdowns are position-aware — they flip above/below and left/right based on available viewport space.

### Why the S mark goes on the left

The brand handbook says the badge "always appears at the bottom of product UIs" and "never competing with the product's primary navigation or content." Placing it at the left edge of the toolbar puts it in the lowest-priority reading position (users scan left-to-right, and the actionable controls are what they reach for). The S mark is small, passive, and out of the way until you want it.

---

## UI Specifications

### Toolbar bar

| Property | Value | Source |
|----------|-------|--------|
| Position | Fixed, bottom 20px, right 20px | Existing |
| Background (light) | `#FFFFFF` | Existing |
| Background (dark) | `#27272A` | Existing |
| Border | 1px solid `#E5E7EB` (light) / `#3F3F46` (dark) | Existing |
| Border radius | 6px | Existing |
| Shadow | `0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)` | Existing |
| Font | System UI stack | Existing |
| Height | Auto (content-driven, roughly 36px) | Existing |
| z-index | 99999 | Existing |

### S mark icon (badge zone)

| Property | Value | Source |
|----------|-------|--------|
| Size | 16px diameter circle | Brand handbook: compact badge icon = 16px |
| Background | `#00C0F3` (Seguru Primary Blue) | Brand handbook §15 |
| Mark | White S figure (inline SVG) | Brand handbook §15 |
| Margin | 0 left, 0 right (contained within the badge zone padding) | — |
| Cursor | Pointer | Clickable |
| Link target | `https://seguru.digital` (new tab) | Brand handbook: badge links to seguru.digital |
| Hover tooltip | "Powered by Seguru Digital" | Brand handbook: compact badge text |
| Border radius | 50% (circle) | Brand handbook |

### "data-ref" label

| Property | Value | Source |
|----------|-------|--------|
| Font size | 0.625rem (10px) | Existing |
| Font weight | 600 | Existing |
| Text transform | Uppercase | Existing |
| Letter spacing | 0.3px | Existing |
| Color (light) | `#9CA3AF` | Existing |
| Right border | 1px solid `#E5E7EB` | Existing — divides badge zone from controls |

### Dropdown triggers

Each dropdown shows the current selection as a compact button with a caret (▾). Clicking opens a popover above or below the toolbar (depending on position). Options show a dot indicator, label, and description. The active option is highlighted in orange. A hint at the bottom shows the keyboard shortcut.

### Tooltip (S mark hover)

| Property | Value | Source |
|----------|-------|--------|
| Text | "Powered by Seguru Digital" | Brand handbook: compact badge variant |
| Font family | Open Sans, 400 | Brand handbook §15 badge spec |
| Font size | 11px | Proportional to toolbar size |
| Text color (light bg) | `#6C6E71` | Brand handbook: muted text |
| Text color (dark bg) | `#B1B3B6` | Brand handbook: dark variant |
| Background | `rgba(17, 24, 39, 0.85)` | Matches existing tooltip style |
| Border radius | 4px | Brand handbook: badge border radius |
| Position | Above the S mark, centered | Doesn't overlap toolbar controls |
| Animation | Fade in 0.15s, translate up 4px | Consistent with label tooltip animation |

---

## Visual hierarchy (priority order)

1. **Dropdown triggers** — the thing you click most, showing current selection
2. **data-ref labels on the page** — the main output of the tool
3. **"Labels" / "Depth" toolbar labels** — orient you to what each dropdown does
4. **S mark** — brand anchor, passive, noticed but not demanding
5. **Dropdown menus + hover tooltip** — only appear on interaction

The S mark should feel like it belongs there — part of the furniture, not a sticker slapped on top. At 16px on a ~36px tall bar, it's proportional. The blue circle provides just enough color contrast against the neutral toolbar to be identifiable as the Seguru mark without pulling focus from the orange accent used on the actual data-ref labels.

---

## Colour separation

The toolbar uses two colour families that never overlap:

**Orange** (`#EA580C` / rgba 234,88,12) — all functional elements. Mode button active states, label dots, ref icon backgrounds, ref tooltips, full-mode labels. This is the working colour.

**Blue** (`#00C0F3`) — Seguru badge only. The S mark circle. Nothing else in the toolbar uses this blue. Per the brand handbook, the Seguru endorsement always uses the core brand colours, even inside a product context.

This separation means the badge reads as a brand element instantly, without needing text to explain it.

---

## States

### Toolbar at rest
S mark visible, two dropdown triggers showing current Labels mode and Depth level. Active selection shown in orange text. No dropdowns open, no tooltip.

### Hover on S mark
Tooltip fades in above the icon: "Powered by Seguru Digital". Cursor changes to pointer. A subtle external-link indicator (small arrow or underline on the tooltip text) signals it's a link.

### Click on S mark
Opens `https://seguru.digital` in a new tab. No other toolbar state changes.

### Dark mode
S mark stays `#00C0F3` (brand handbook: always Seguru Primary Blue regardless of context). Tooltip text switches to `#B1B3B6`. Everything else follows existing dark mode rules.
