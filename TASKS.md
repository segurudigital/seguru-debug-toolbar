# Tasks

**Project:** Seguru Debug Toolbar
**Current version:** 2.4.1

> **How this file works**
> TASKS.md is the canonical list of all open and recently-completed work, organised as **Sprints → Phases → subtasks**. Items are ticked off as they ship. At session end, completed items move from this file to **CHANGELOG.md** (the user-facing record) — only the most recent handoff note stays here as a starting point for the next session. **ROADMAP.md** is the forward view. Agent todo trackers (`TodoWrite`) mirror this file for the active session — they're never the source of truth on their own. All three docs (TASKS, CHANGELOG, ROADMAP) must be in sync at the start and end of every session.

---

## Handoff notes

**Last session:** 2026-05-23 (v2.4.1 QA follow-up)

**What was done:**

- QA focused on the `CHANGELOG.md` v2.4.0/v2.4.1 work: v5 grammar classifier, Level filter, active-ref tree, block group collapse, isolated Target depths, late rescan, and auto-ref default changes.
- Fixed auto-ref generated nodes being stamped as `sdt-ref-class-section` by adding an internal `data-sdt-auto-level` stamp and clearing stale `sdt-ref-class-*` classes on depth changes.
- Fixed v5 fixture pages so direct-open QA loads `src/seguru-debug-toolbar.js` and applies `seguruDebugConfig` before the toolbar script.
- Updated `test/demo.html` so the Auto-ref checkbox reflects the v2.4.1 default-off runtime state.
- Made toolbar chrome wrap within narrow viewports after the Level control addition.
- Synced version metadata to 2.4.1 across package, source, WordPress plugin files, AGENTS.md, README, TASKS, ROADMAP, and CHANGELOG.

**Where things were left:**

- `node --check src/seguru-debug-toolbar.js`, `npm run build`, `npm run build:wp`, `git diff --check`, and the local Playwright QA harness all pass.
- Build outputs are present: `dist/seguru-debug-toolbar.min.js` (~72.8 KB minified) and `dist/seguru-debug-toolbar-wp-v2.4.1.zip` (~32 KB compressed).
- Changes are not committed or pushed yet.

**Next session should:**

1. Review the v2.4.1 QA fix diff.
2. Commit/push or cut the GitHub release if this is ready to ship.

---

## Currently in flight

*v2.4.1 QA fixes completed and moved to handoff notes above + CHANGELOG.md [2.4.1]. No open sprint; next sprint not yet scoped.*

---

## Resolved decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-10 | Per-page override key is `seguruDebugConfig`, not a second `sdtConfig` | Avoids collision with the WP-injected `sdtConfig` |
| 2026-04-10 | Orange `#EA580C` for UI accent; Seguru blue `#00C0F3` reserved for the S mark badge | Brand handbook §10 — orange = functional, blue = brand mark only |
| 2026-04-10 | Tree panel position shares toastPosMap offset (64px above toolbar) | Keeps Tree adjacent to toolbar without overlapping toast |
| 2026-04-10 | Luminance threshold `0.40` for `sdt-on-dark` | Validated visually — anything below 40% relative luminance reads as dark enough to warrant white labels |
| 2026-04-11 | Tree panel search/filter deferred after Phase 5 | Header context, click-to-jump, and improved row rhythm solved the readability problem without adding UI weight |
| 2026-04-26 | WP plugin keeps `sdt_auto_ref` default at `'0'` (admin opt-in) even when the engine default changed in v2.3.0 | Safer for large WP sites — admins explicitly opt in via Settings → Debug Toolbar → Page Builders. Superseded by the v2.4.1 engine default-off decision below. |
| 2026-05-23 | SDT engine auto-ref defaults OFF again; when enabled, Target defaults to All | Keeps standard embeds and WordPress installs opt-in while still supporting full-coverage scans for explicit QA sessions. |
| 2026-04-26 | Public API: `setDepth()` / `getDepth()` keep their names even though the UI label is now "Target" | Back-compat — these methods are documented since v1.3.0 and used by external consumers |
| 2026-04-26 | User-pill avatar uses neutral slate (`#111827` light / `#71717A` dark), not Seguru blue | The badge stays the only Seguru-blue anchor in the toolbar; avatar reads as identity, not brand |
| 2026-04-26 | Esc is a global one-shot hide, not a 3-step cycle | Simpler mental model — one keystroke, page is clean |

---

## Blocked / waiting

None.
