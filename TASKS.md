# Tasks

**Project:** Seguru Debug Toolbar
**Current version:** 2.3.1

> **How this file works**
> TASKS.md is the canonical list of all open and recently-completed work, organised as **Sprints → Phases → subtasks**. Items are ticked off as they ship. At session end, completed items move from this file to **CHANGELOG.md** (the user-facing record) — only the most recent handoff note stays here as a starting point for the next session. **ROADMAP.md** is the forward view. Agent todo trackers (`TodoWrite`) mirror this file for the active session — they're never the source of truth on their own. All three docs (TASKS, CHANGELOG, ROADMAP) must be in sync at the start and end of every session.

---

## Handoff notes

**Last session:** 2026-05-21 (v2.3.1 hotfix cut)

**What was done:**

- Origin: EC cowork session reported labels intercepting clicks under closed `.ec-mega-menu` panels on `https://expeditioncentre.local/Pages/home/home-screen.html`. Steady-state probe with the latest dev build showed 0 intercepts, but the transition-window probe (sampling `elementsFromPoint` at t=0/50/150/250ms during a panel close) reproduced the bug: at t=50ms, opacity≈0.86 and 15 mega-menu labels were still hit-testable while the panel faded toward 0.
- Root cause: `getComputedStyle(...).opacity` reads the *animated* mid-transition value, so the old `parseFloat(opacity) === 0` check was too permissive. The reactive `MutationObserver` → rAF path was reading opacity at +16ms, finding ~0.94 on close, and re-marking the host visible until `transitionend` fired ~184ms later.
- Two-layer defence shipped:
  - **Structural belt (Option A)** — `.sdt-ref-icon` and `.sdt-ref-full-label` now default `pointer-events: none`. A new `.sdt-visible-host` class is the opt-in for `pointer-events: auto`, added by `applyLabelVisibilityState()` only when the host passes `isEffectivelyVisible()`. Labels can never intercept clicks unless explicitly marked safe.
  - **Timing brace (Option B)** — `eagerHideDescendantLabels(node)` runs synchronously from the MutationObserver before rAF, adding `.sdt-ref-hidden` and removing `.sdt-visible-host` on every labelled `[data-ref]` descendant of the mutated node. Closes the ~16ms window between mutation and rAF where labels would otherwise still be `pointer-events: auto`.
- `isEffectivelyVisible()` extended with a mid-transition guard: opacity ∈ (0, 1) is treated as hidden whenever an ancestor's `transition-property` covers opacity/visibility/all with non-zero `transition-duration`. The `transitionend` listener re-evaluates once settled.
- Verification probe on home-screen.html: close t=50ms intercepts dropped from 26 → 2 (the residual 2 are real visible nav items, not mega-menu race). Demo (`test/demo.html`) click-to-copy and L/T/O cycling all still work. WP zip built clean (`dist/seguru-debug-toolbar-wp-v2.3.1.zip`).
- **Cluster-collapse follow-up** (same session, bundled into v2.3.1 since it wasn't pushed yet): after the click-intercept fix landed, the residual "wall of stacked labels" on dense pages (visible in the mulgo-screen.html screenshot — 45 overlapping pairs in Full-labels mode at depth=element) traced to the overlap solver exhausting its 6 vertical lift attempts and piling unplaceable labels on top of the winner. Shipped a cluster-collapse fallback: when collisions can't be resolved, the unplaceable label gets `.sdt-ref-clustered` (display:none) and is added to the placed owner's `_sdtCluster` list. A second pass renders a single orange `+N` badge next to each owner with cluster members; hovering expands a popover with one click-to-copy row per clustered ref (firing the standard `sdt:dataref-click` event). Verified on mulgo-screen.html: overlap count 45 → 0 in Full-labels mode (41 labels collapsed into 21 badges); icons mode 79 collapsed into 40 badges; L/T cycling rebuilds badges cleanly with no stale state.
- Bumped versions in all 5 locations (package.json, src header, mu-plugin, installable-plugin header + `SDT_VERSION`, AGENTS.md). Built `dist/seguru-debug-toolbar.min.js` (~57.9 KB).

**Where things were left:**

- v2.3.1 is fully released across all three channels:
  - **GitHub release** [`v2.3.1`](https://github.com/segurudigital/seguru-debug-toolbar/releases/tag/v2.3.1) with both assets attached (`seguru-debug-toolbar.min.js` ~58 KB minified, `seguru-debug-toolbar-wp-v2.3.1.zip` ~28 KB compressed).
  - **npm** `@segurudigital/seguru-debug-toolbar@2.3.1` — `latest` dist-tag now points here. First publish failed with a 404 (expired NPM_TOKEN); fixed mid-session by user regenerating the token + a manual workflow re-run (`gh workflow run release-assets.yml -f tag=v2.3.1`).
  - **jsDelivr** confirmed serving 2.3.1 via `cdn.jsdelivr.net/npm/@segurudigital/seguru-debug-toolbar@2.3.1/dist/seguru-debug-toolbar.min.js` (HTTP 200) and the floating `@2` tag.
- Docs landed in commit `fd869ce` (README + docs/design.md + docs/usage-guide.md + docs/agent-rollout-prompt.md) covering the new behaviour: hidden-ancestor suppression, mid-transition guard, `+N` cluster badge.
- WordPress self-update hook on existing 2.3.0 installs picks up 2.3.1 within ~6 hours of release.

**Next session should:**

1. Pick the next sprint scope — see ROADMAP.md "Backlog" for candidates.
2. Decide whether to remove `continue-on-error: true` from the `publish-npm` job. It saved this release (let the GitHub side ship while npm was blocked on the expired token), so the current reflex is to keep it. Revisit only if token rotation gets formalised on a schedule.
3. If anyone retests on the EC home-screen.html or mulgo-screen.html sites, retire the local `seguru-debug-toolbar-local.js` workaround — they should now load `@2` from jsDelivr and get 2.3.1 automatically.

---

## Currently in flight

*v2.3.1 hotfix shipped this session (all phases ticked, moved to handoff notes above + CHANGELOG.md [2.3.1]). No open sprint; next sprint not yet scoped.*

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
