# Design — IA & UI Spec

**Version:** 1.4
**Last updated:** 2026-04-11

**Brand authority:** Seguru-Brand-Handbook.md §10 (Product Brand: Seguru Debug Toolbar) — v4.2, April 2026. All colour decisions in this document are formally ratified there. When the handbook and this doc conflict, the handbook wins.

---

## Information Architecture

The toolbar has two jobs: show `data-ref` labels and connect back to Seguru as the maker. The IA keeps these separate so the branding never interferes with the tool's function.

### Content zones (left to right)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [S] [user?]  [Labels Icons ▾] [Target Off ▾]  │  [Outline Off ▾] [⊞ Tree] │
│      primary controls                  │  utility controls                │
└────────────────────────────────────────────────────────────────────────────┘
```

**Badge zone** — The Seguru S mark (20px circle, always Seguru Primary Blue `#00C0F3`, white mark, symmetric padding) sits at the far left. On hover, a tooltip reads "Powered by Seguru Digital". Clicking opens seguru.digital in a new tab. As of v2.3.0 the badge is paired with an optional **identity pill** to its right (avatar + name + role) rendered when the host calls `setUser()`. The pill avatar uses neutral slate so the S badge stays the only Seguru-blue mark in the chrome.

**Labels dropdown** — Controls how labels appear (Icons, Off, Full). Click to open, select an option to apply. Press **L** to cycle. In the refreshed UI, the control reads as a compact value-led pill instead of a separate label plus value cell.

**Target dropdown** — Controls auto-ref target depth (Off, Sections, Blocks, Elements). Click to open, select a level. Press **T** to cycle. It sits beside Labels as the second primary control because those two settings define the main working state of the product. (Pre-2.3 builds called this "Depth" and bound it to `D`; the public API still uses `setDepth()` / `getDepth()` for back-compat.)

**Outline dropdown** — Controls optional layout guides (Off, Sections, Blocks). Press **O** to cycle. `Sections` outlines top-level wrappers with a strong orange frame plus a subtle inset wash so the page skeleton reads quickly. `Blocks` keeps those section outlines and adds lighter dashed boundaries for inner containers and blocks, making overlap and spacing relationships visible without needing element-level labels. This lives in the utility zone because it is diagnostic rather than always-primary.

**Tree button** — Opens the floating element tree panel for list-based inspection, click-to-jump navigation, and copy actions. This also lives in the utility zone and should visually read as secondary to Labels and Target.

**Visibility hotkey** — Press **D** to show / hide the toolbar (default; configurable via `setHotkey()`). **Esc** is a global one-shot hide that closes any open dropdown, the Tree panel, and the toolbar in a single press.

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
| Background | `#00C0F3` (Seguru Primary Blue) | Brand handbook §16 |
| Mark | White S figure (inline SVG) | Brand handbook §16 |
| Margin | 0 left, 0 right (contained within the badge zone padding) | — |
| Cursor | Pointer | Clickable |
| Link target | `https://seguru.digital` (new tab) | Brand handbook §16: badge links to seguru.digital |
| Hover tooltip | "Powered by Seguru Digital" | Brand handbook §16: compact badge text |
| Border radius | 50% (circle) | Brand handbook §16 |

### "data-ref" label

| Property | Value | Source |
|----------|-------|--------|
| Font size | 0.625rem (10px) | Existing |
| Font weight | 600 | Existing |
| Text transform | Uppercase | Existing |
| Letter spacing | 0.3px | Existing |
| Color (light) | `#9CA3AF` | Existing |
| Right border | 1px solid `#E5E7EB` | Existing — divides badge zone from controls |

### Label overlap handling

When multiple visible labels would collide in the same viewport zone, labels are vertically staggered in 18px steps with a small depth-based horizontal inset so dense nested states form a clearer stepped stack instead of a purely mechanical vertical shove. A thin leader line is drawn back to the original element corner, and full-mode labels clip cleanly at long widths instead of sprawling across dense layouts.

### Outline guides

Section outlines are intentionally the loudest structural layer: solid orange, thicker stroke, and a faint inset wash to make the page skeleton legible at a glance. Block outlines must remain lighter, dashed, and more schematic so they reveal internal layout without competing with the section layer. On dark sections, both guide types switch to higher-contrast variants automatically; sections use the approved on-dark orange and blocks pick up a lighter guide treatment so they remain visible.

### Tree panel

The Tree panel should read like an inspection surface, not a raw debug list. The header carries the title plus compact context chips (`ref count`, `Target` *(formerly "Depth")*, `Outline`) and a short hint line. Rows use a stronger indentation rhythm via guide rails, orange context pills, and a warmer hover state. Hover previews the target element; clicking a row jumps the page to that element and briefly intensifies the highlight so the destination is obvious.

### Dropdown triggers

Each dropdown shows the current selection as a compact pill with two text weights: a muted uppercase key (`Labels`, `Target`, `Outline`) and a stronger value (`Icons`, `Blocks`, `Off`). Clicking opens a popover above or below the toolbar (depending on position). Options show a dot indicator, label, and description. A selected control uses a tinted pill treatment; an open control gets an explicit focus halo and rotated caret so its state is visible even before the menu items are read. A hint at the bottom shows the keyboard shortcut.

Utility controls (`Outline`, `Tree`) use the same interaction model, but when active they shift into a more obviously diagnostic treatment so they feel intentionally secondary but clearly enabled.

### Tooltip (S mark hover)

| Property | Value | Source |
|----------|-------|--------|
| Text | "Powered by Seguru Digital" | Brand handbook §16: compact badge variant |
| Font family | Open Sans, 400 | Brand handbook §16 badge spec |
| Font size | 11px | Proportional to toolbar size |
| Text color (light bg) | `#FFF7ED` | Matches implemented dark tooltip treatment |
| Text color (dark bg) | `#B1B3B6` | Brand handbook §6: dark variant |
| Background | `rgba(17, 24, 39, 0.85)` | Matches existing tooltip style |
| Border radius | 4px | Brand handbook: badge border radius |
| Position | Above the S mark, centered | Doesn't overlap toolbar controls |
| Animation | Fade in 0.15s, translate up 4px | Consistent with label tooltip animation |

---

## Visual hierarchy (priority order)

1. **Primary dropdown triggers** — Labels and Target, the thing you click most
2. **data-ref labels on the page** — the main output of the tool
3. **Utility controls** — Outline and Tree, available but visually secondary
4. **S mark** — brand anchor, passive, noticed but not demanding
5. **Dropdown menus + hover tooltip** — only appear on interaction

The S mark should feel like it belongs there — part of the furniture, not a sticker slapped on top. At 16px on a ~36px tall bar, it's proportional. The blue circle provides just enough color contrast against the neutral toolbar to be identifiable as the Seguru mark without pulling focus from the orange accent used on the actual data-ref labels.

---

## Colour separation

The toolbar uses two colour families that never overlap. This rule is formally documented in the brand handbook at §10.

**Orange** (`#EA580C` / `--color-sdt-primary`) — all functional elements. Label dots, ref icon backgrounds, full-mode label text, tree panel row hover highlight, active selection indicator, toast border. This is the working colour.

**Blue** (`#00C0F3`) — Seguru badge only. The S mark circle. Nothing else in the toolbar uses this blue. Per the brand handbook §10, the Seguru endorsement always uses the core brand colours, even inside a product context. This never changes, even in dark mode.

This separation means the badge reads as a brand element instantly, without needing text to explain it.

### SDT Design Tokens (formally defined in brand handbook §20)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-sdt-primary` | `#EA580C` | All functional orange elements |
| `--color-sdt-dark` | `#111827` | Dark mode toolbar bg, tooltip overlays, tree panel |
| `--color-sdt-wash` | `#F9FAFB` | Product page alt section backgrounds |

### On-dark orange variant

When a label sits over a dark-background element (detected via WCAG relative luminance — threshold 0.40), the `sdt-on-dark` class is applied. The orange label dot shifts to `#F97316` (one step lighter in the orange scale) to maintain contrast. The ref icon also lightens accordingly.

This is the only approved variation of the SDT Orange. Do not use any other orange shade.

---

## States

### Toolbar at rest
S mark visible at the left, optional user pill, followed by the primary control pair (`Labels`, `Target`), then a quieter utility pair (`Outline`, `Tree`). Active controls use a tinted pill treatment rather than relying on text color alone. No dropdowns open, no tooltip.

### Hover on S mark
Tooltip fades in above the icon: "Powered by Seguru Digital". Cursor changes to pointer. A subtle external-link indicator (small arrow or underline on the tooltip text) signals it's a link.

### Click on S mark
Opens `https://seguru.digital` in a new tab. No other toolbar state changes.

### Dark mode
S mark stays `#00C0F3` (brand handbook §10: always Seguru Primary Blue regardless of context — this is a hard rule). Toolbar BG shifts to `#27272A`. Border shifts to `#3F3F46`. SDT Orange (`#EA580C`) stays the same — it passes contrast on the dark toolbar background. Tooltip text switches to `#B1B3B6`. Tree panel background uses `--color-sdt-dark` (`#111827`).

---

## Relationship to brand handbook

This document is the implementation-level spec. The brand handbook (§10 Product Brand: Seguru Debug Toolbar) is the brand-level authority. They should always agree. If you find a conflict:

1. The handbook wins on: colour values, S mark rules, badge behaviour, tone, positioning
2. This doc wins on: pixel dimensions, z-index, exact CSS values, shadow DOM behaviour
3. When in doubt, raise it and update both
