# Claude Code prompt — SDT update for data-ref v5.0 / Titan v3.0

**Created:** 2026-05-23
**Owner:** Samuel Clarke
**Project:** Seguru Debug Toolbar
**Target version:** SDT v2.4.0 (or v3.0.0 if scope grows)
**Related spec:** `Seguru-Ops/00_Core/Titan/Specifications/data-ref-spec.md` v5.0 (§12 in particular)

---

## Purpose

This prompt briefs a Claude Code session on the SDT updates required to support data-ref v5.0 and the Titan v3.0 launch. The data-ref spec has been updated; SDT needs to catch up.

Read this prompt end-to-end before opening files. Then read the spec sections it references. Don't write any code until you've confirmed the current SDT behavior matches what the prompt assumes.

---

## What changed in the data-ref spec (v5.0)

Three things, all additive to v4.0:

1. **Section data-ref grammar simplified.** Section refs are now just `<page-abbreviation>-<section>` (e.g., `mpt-v2-hero`, `mpt-v2-features`). The old `wrapper-01-01-hero` suffix is dropped.
2. **Block becomes a first-class data-ref level.** A block data-ref sits on the wrapping DOM element of every repeating unit in a block-bearing section. Grammar: `<page-abbreviation>-<section>-<block-type>-<NN>`. Example: `mpt-v2-features-card-01`, `mpt-v2-faq-item-03`. Reserved block-types: `card`, `row`, `item`, `tab`, `slide`, `step`, `cell`, `column`, `panel`, `quote`, `entry`.
3. **Element data-ref grammar unchanged** from v4.0.

The DOM hierarchy is now explicit:

```
<section data-ref="mpt-v2-features">
  <article data-ref="mpt-v2-features-card-01">
    <h3 data-ref="mpt-v2-features-heading-01-01-h3">...</h3>
    <p data-ref="mpt-v2-features-text-01-01-body">...</p>
  </article>
  <article data-ref="mpt-v2-features-card-02">
    <h3 data-ref="mpt-v2-features-heading-01-02-h3">...</h3>
    <p data-ref="mpt-v2-features-text-01-02-body">...</p>
  </article>
</section>
```

Read `Seguru-Ops/00_Core/Titan/Specifications/data-ref-spec.md` §0, §2.1, §2.1.1, §4.4, §8.4, and §12 before making any code changes.

---

## What SDT needs to do

SDT v2.3.1 already supports Sections / Blocks / Elements as auto-detection targets in the Target dropdown. That's the right vocabulary. What's missing is consuming **explicit `data-ref` attributes at each of those three levels** rather than only inferring them from DOM structure.

Three deliverables, in priority order:

### Deliverable 1 — Level-aware data-ref parsing

The toolbar should recognize three classes of data-ref by their grammar shape:

| Class | Grammar | Example | DOM placement |
|---|---|---|---|
| Section | `<page>-<section>` (2 segments) | `mpt-v2-features` | `<section>` wrapper |
| Block | `<page>-<section>-<block-type>-<NN>` (4 segments) | `mpt-v2-features-card-01` | Block wrapper (`<article>`, `<div>`, etc.) |
| Element | `<page>-<section>-<element>-<NN>-<instance>-<role>` (6 segments) | `mpt-v2-features-heading-01-01-h3` | Content element |

A parser should classify each data-ref by segment count + grammar pattern. The classifier should:

- Use the segment count as the first cut
- Validate the block-type against the reserved vocabulary (§4.4) for class=block
- Validate the element noun + role-token against §4.2 / §4.3 for class=element
- Fall back to "unclassified" and log a warning if the ref doesn't match any class (don't drop the pill — render it as unclassified so the operator can see the malformed ref)

Add this classifier in `src/parsers/` (or wherever data-ref parsing currently lives — verify by reading the source).

### Deliverable 2 — Level filter control

The existing Target dropdown auto-detects elements from DOM structure (Elementor containers, Bricks sections, HTML5 `<section>` tags). v5.0 adds a parallel mechanism: **honor explicit data-ref attributes** at each level.

Add a new toolbar control: **Level filter** (or add a fourth option to the existing Target dropdown — design decision; see `docs/design.md` for the current control architecture).

| Mode | Behavior |
|---|---|
| **Sections only** | Render pills only for elements with section-class data-refs (2-segment grammar) |
| **Sections + Blocks** | Render section + block pills (2- and 4-segment grammar) |
| **All levels** | Render section + block + element pills (2-, 4-, 6-segment grammar) |

Default mode: **All levels** (current behavior — show everything that has a data-ref). The new modes are filtering, not new detection.

When the Level filter narrows the visible set, the existing density affordances (depth-aware staggering, `+N` collapsed badges) keep working. They just have fewer pills to lay out.

### Deliverable 3 — Active-ref tree

When the operator hovers or focuses on any data-ref'd element, render a fixed-corner panel showing the full breadcrumb from section through block to element:

```
mpt-v2-features                       ← section
  └─ mpt-v2-features-card-02          ← block
       └─ mpt-v2-features-heading-01-02-h3  ← element  (active, highlighted)
```

Requirements:

- Walk up the DOM from the active element, collecting every ancestor that carries a data-ref
- Order the chain top-down (section → block → element)
- Highlight the row corresponding to the active element
- Each row is click-to-copy (use the existing copy-with-toast pattern from v2.3.1)
- Each row is also click-to-pin (pinning keeps the tree visible until the operator clicks elsewhere or hits Escape)
- Place the panel in a corner that doesn't conflict with the existing Tree button panel — bottom-right by default; respect any user-configured anchor

Pinning state should persist across hovers (so the operator can hover other elements without losing their pinned tree). Clicking elsewhere on the page un-pins. Escape always closes.

### Deliverable 4 — Pill stacking refinements for v5.0 density

Titan v3.0 pages will have more data-refs than v4.0 pages (because every block now has its own ref). The existing density affordances need stress-testing:

- Test on a block-bearing section with 12+ cards
- Verify section pills never collapse (they're always individually visible)
- Verify block pills collapse into a single `+N blocks` pill if there are more than 6 blocks AND the level filter is "All levels"
- Verify element pills continue to use the v2.3.1 depth-aware staggering + `+N` collapsed badge
- Add an explicit "Sections + Blocks" mode that skips element rendering entirely — useful for high-level page QA

If the existing stacking algorithm doesn't handle the new density gracefully, refine it. See spec §12.4 for the required behavior.

---

## Out of scope

- Changes to the Outline control (no spec change there)
- Changes to the Labels control (no spec change)
- Changes to the keyboard shortcuts (the `D` visibility key, the Tree button shortcut, etc.)
- The existing Tree button panel — keep its current behavior; the new active-ref tree is a different surface (smaller, breadcrumb-focused, active-element-driven). Both can coexist.

---

## How to verify

For each deliverable:

1. Find or create a test fixture with the data-ref pattern the deliverable targets
2. Open the test fixture in a browser with the local SDT build attached
3. Confirm the toolbar shows the expected pills, panels, and behaviour
4. For the level filter: switch through all three modes and confirm visible pills change correctly
5. For the active-ref tree: hover a deeply-nested element and confirm the full chain appears

Test fixtures should live in `test/fixtures/v5-data-ref/` (create if it doesn't exist). At minimum:

- `non-block-bearing.html` — hero, intro, cta sections (section + element refs only)
- `block-bearing-small.html` — features section with 3 cards (section + 3 block refs + element refs)
- `block-bearing-dense.html` — cards section with 12+ cards (stress test for pill density)
- `mixed.html` — multiple section types on one page (regression test for level filter)

The existing test suite at `test/` already has v2.3.1 fixtures — don't break them. Add v5.0 fixtures alongside.

---

## What to update in the SDT project

- `src/` — add the level-aware parser (Deliverable 1), the level filter control (Deliverable 2), the active-ref tree panel (Deliverable 3), pill stacking refinements (Deliverable 4)
- `test/` — add v5.0 fixtures and assertions
- `README.md` — add a "v5.0 data-ref support" section explaining the level filter and active-ref tree
- `CHANGELOG.md` — add v2.4.0 (or v3.0.0) entry describing the changes
- `docs/design.md` — document the level filter and active-ref tree design choices
- `package.json` — bump version

Don't update SDT to require v5.0 data-refs. v4.0 pages must continue to work. The Level filter and active-ref tree should gracefully handle pages that have only v4.0-style data-refs (treat all refs as "element" class if they don't match section or block grammar).

---

## What to NOT do

- Don't rewrite the existing Tree button panel. Active-ref tree is a separate surface.
- Don't add new keyboard shortcuts that conflict with v2.3.1 bindings (`D`, `L`, `T`, Escape).
- Don't break the depth-aware staggering algorithm — refine it if needed but the existing behavior is well-tested.
- Don't auto-detect block scope from DOM structure. Block class is recognized only when an explicit data-ref with block grammar is present. (Auto-detection of block-like wrappers from DOM structure is a separate feature that already lives in the Target dropdown's "Blocks" option — don't conflate.)
- Don't strip v4.0-style data-refs. They remain valid. The Level filter classifies them as "element" by default.

---

## Coordination

Before opening this work:

- Confirm SDT is at v2.3.1 (or whatever the current shipped version is — check `package.json`)
- Read the SDT README's "What it does" section to confirm current Target dropdown options
- Read `docs/design.md` for the current control architecture
- Read `CHANGELOG.md` for what was last shipped
- Skim `src/` to locate parsers, controls, and the existing tree panel

If anything in this prompt contradicts what you find in the codebase, stop and flag the discrepancy before making changes.

---

## Final note

The data-ref spec at `Seguru-Ops/00_Core/Titan/Specifications/data-ref-spec.md` is the canonical contract. If this prompt and the spec disagree, the spec wins. This prompt is written from the spec; corrections in code should also be reflected back in the prompt and the spec via a kernel-level update.
