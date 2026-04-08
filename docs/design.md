# Design — IA & UI Spec

**Version:** 1.0
**Last updated:** 2026-04-08

---

## Information Architecture

The toolbar has two jobs: show `data-ref` labels and connect back to Seguru as the maker. The IA keeps these separate so the branding never interferes with the tool's function.

### Content zones (left to right)

```
┌─────────────────────────────────────────────────────────┐
│  [S]  data-ref  │  Icons  │  Off  │  Full [L]  │  ⟶  │
│  ───            │  ─────────── controls ──────  │ link │
│  badge zone     │         functional zone       │      │
└─────────────────────────────────────────────────────────┘
```

**Badge zone** — The Seguru S mark (16px circle, always Seguru Primary Blue `#00C0F3`, white mark) sits at the far left. The "data-ref" label sits next to it. On hover over the S mark, a subtle tooltip reads "Powered by Seguru Digital". Clicking the S mark opens seguru.digital in a new tab. This follows the brand handbook's compact badge spec for plugin footer bars and tight UI spaces.

**Functional zone** — The three mode buttons (Icons, Off, Full) with dot indicators and the `[L]` keyboard shortcut hint. This is the working area and takes up most of the space. No branding competes here.

**Link indicator** — On hover over the S mark, a small external-link arrow appears to signal it's clickable. Subtle enough to not register as a UI element at rest.

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

### Mode buttons

No changes from current design. The functional zone stays identical.

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

1. **Mode buttons** — the thing you click most, biggest touch targets
2. **data-ref labels on the page** — the main output of the tool
3. **"data-ref" toolbar label** — orients you to what the toolbar does
4. **S mark** — brand anchor, passive, noticed but not demanding
5. **Hover tooltip** — only appears on interaction

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
S mark visible, "data-ref" label, three mode buttons. Current mode highlighted in orange. No tooltip.

### Hover on S mark
Tooltip fades in above the icon: "Powered by Seguru Digital". Cursor changes to pointer. A subtle external-link indicator (small arrow or underline on the tooltip text) signals it's a link.

### Click on S mark
Opens `https://seguru.digital` in a new tab. No other toolbar state changes.

### Dark mode
S mark stays `#00C0F3` (brand handbook: always Seguru Primary Blue regardless of context). Tooltip text switches to `#B1B3B6`. Everything else follows existing dark mode rules.
