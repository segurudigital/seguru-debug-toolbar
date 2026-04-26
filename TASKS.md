# Tasks

**Project:** Seguru Debug Toolbar
**Current version:** 2.3.0

> **How this file works**
> TASKS.md is the canonical list of all open and recently-completed work, organised as **Sprints → Phases → subtasks**. Items are ticked off as they ship. At session end, completed items move from this file to **CHANGELOG.md** (the user-facing record) — only the most recent handoff note stays here as a starting point for the next session. **ROADMAP.md** is the forward view. Agent todo trackers (`TodoWrite`) mirror this file for the active session — they're never the source of truth on their own. All three docs (TASKS, CHANGELOG, ROADMAP) must be in sync at the start and end of every session.

---

## Handoff notes

**Last session:** 2026-04-26 (v2.3.0 cut)

**What was done:**

- Designed + implemented the v2.3.0 public-API surface: lifecycle (`hide`/`show`/`toggle`/`isVisible`), configurable visibility hotkey + Esc global hide, three-mode theme system (`auto`/`light`/`dark`) with localStorage persistence + `<html>` MutationObserver, public `sdt:*` event bus, identity hook (`setUser`/`getUser`), configurable dock corner with one-shot `'auto'` heuristic, `init(opts)` and `seguruDebugToolbar.version`.
- Late-session keymap + defaults overhaul (per user spec): default visibility hotkey `H` → `D`, `T` cycles Target depth, `O` cycles Outline (NEW), Esc is a global one-shot hide, auto-ref defaults ON (Target boots at Elements), UI label `Depth` → `Target` (public `setDepth`/`getDepth` API names kept).
- UI fixes surfaced by Playwright QA: stale pill content on `setUser(null)` cleared, S badge centered + bumped 16 → 20px (was offset-left in click target), user-pill avatar moved to neutral slate so the S badge stays the only Seguru-blue mark.
- WordPress sync: installable plugin + mu-plugin headers + `SDT_VERSION` constant bumped to 2.3.0, settings-page UI text updated (H → D, Depth → Target), new "Keyboard shortcuts" card under How It Works covering L/T/O/D/Esc, `build-wp-zip.sh` readme.txt template refreshed, `dist/seguru-debug-toolbar-wp-v2.3.0.zip` built.
- WP plugin keeps `sdt_auto_ref` default at `'0'` (admin opt-in) even though SDT engine now defaults auto-ref ON — safer for big WP sites; decision logged in CHANGELOG.
- Doc sync across the board: README, CHANGELOG, ROADMAP, AGENTS, docs/usage-guide.md, docs/wp-settings-page.md, docs/page-builders.md, docs/agent-rollout-prompt.md, docs/DESIGN.md, docs/integrations.md.
- Browser smoke test via Playwright MCP — full §8 checklist (12 items) plus three supplementary QA pages (`qa-preboot-hide.html`, `qa-hotkey-disabled.html`, `qa-dock.html`) covering scenarios that need different boot config; `dock: 'auto'` heuristic verified against synthetic blocking sidebars; new D/T/O/Esc keymap re-verified after the rename.
- Released: branch `feature/public-api-improvements`, PR opened, merged, tag `v2.3.0` pushed, GitHub release published. CI workflow attaches JS bundle + WP zip + npm publish to the release.

**Where things were left:**

- `main` is on v2.3.0 with everything committed, tagged, and released. CI workflow handles the asset upload + npm publish.
- Source: `dist/seguru-debug-toolbar.min.js` (~51.4 KB), `dist/seguru-debug-toolbar-wp-v2.3.0.zip` (~28 KB compressed).
- All v2.3.0 work has been moved out of TASKS.md into CHANGELOG.md per the workflow rules. See CHANGELOG.md `[2.3.0] — 2026-04-26` for the full set.
- Self-update hook on existing 2.2.x WordPress installs picks up 2.3.0 within ~6 hours.

**Next session should:**

1. Validate npm + jsDelivr published correctly (the `publish-npm` job runs on release; check <https://www.npmjs.com/package/@segurudigital/seguru-debug-toolbar> shows 2.3.0 once the workflow completes).
2. Decide whether to remove `continue-on-error: true` from the `publish-npm` job now that several green publishes have landed (open question from session 11).
3. Pick the next sprint scope — see ROADMAP.md "Backlog" for candidates.

---

## Currently in flight

*No open sprint. v2.3.0 just shipped; next sprint not yet scoped.*

---

## Resolved decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-10 | Per-page override key is `seguruDebugConfig`, not a second `sdtConfig` | Avoids collision with the WP-injected `sdtConfig` |
| 2026-04-10 | Orange `#EA580C` for UI accent; Seguru blue `#00C0F3` reserved for the S mark badge | Brand handbook §10 — orange = functional, blue = brand mark only |
| 2026-04-10 | Tree panel position shares toastPosMap offset (64px above toolbar) | Keeps Tree adjacent to toolbar without overlapping toast |
| 2026-04-10 | Luminance threshold `0.40` for `sdt-on-dark` | Validated visually — anything below 40% relative luminance reads as dark enough to warrant white labels |
| 2026-04-11 | Tree panel search/filter deferred after Phase 5 | Header context, click-to-jump, and improved row rhythm solved the readability problem without adding UI weight |
| 2026-04-26 | WP plugin keeps `sdt_auto_ref` default at `'0'` (admin opt-in) even though SDT engine defaults auto-ref ON in v2.3.0 | Safer for large WP sites — admins explicitly opt in via Settings → Debug Toolbar → Page Builders. Wireframes/CDN/npm consumers benefit from the default-on; WP installs benefit from the explicit opt-in. |
| 2026-04-26 | Public API: `setDepth()` / `getDepth()` keep their names even though the UI label is now "Target" | Back-compat — these methods are documented since v1.3.0 and used by external consumers |
| 2026-04-26 | User-pill avatar uses neutral slate (`#111827` light / `#71717A` dark), not Seguru blue | The badge stays the only Seguru-blue anchor in the toolbar; avatar reads as identity, not brand |
| 2026-04-26 | Esc is a global one-shot hide, not a 3-step cycle | Simpler mental model — one keystroke, page is clean |

---

## Blocked / waiting

None.
