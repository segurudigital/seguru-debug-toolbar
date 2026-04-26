# Integrations

The Seguru Debug Toolbar is designed to be a good neighbour to other on-page tools — overlays, sidebars, devtools panels, on-page editors, review and feedback tools. It exposes enough public surface that hosts can sync the toolbar's appearance with their own systems and listen for user interactions, without SDT taking a dependency on any specific consumer.

This guide covers three common integration patterns. Each one is generic — the [Review Sidebar example](#example--composing-all-three-in-a-review-sidebar) at the end shows one concrete shape of all three composed together, but the patterns work the same way against any host.

For the full API reference (every method, every event, every config key) see the [README](../README.md). This doc is about *how to compose* SDT with a host's existing systems.

---

## 1. Theme sync with a host theme system

Most hosts already have their own theme system — light / dark mode in the host app, OS preference detection, a custom palette. By default, SDT's `theme: 'auto'` picks up `prefers-color-scheme` and the host's `html.dark` class, so for many hosts there is nothing to do.

If your host has a different signal — a Redux store, a `data-theme` attribute on a wrapper, a Firebase remote config flag — drive SDT explicitly:

```js
// Pseudocode — replace the source signal with whatever your host already has.
function syncSDTTheme() {
  const sdt = window.seguruDebugToolbar;
  if (!sdt) return;
  const hostTheme = getHostTheme();    // 'light' | 'dark' | 'auto'
  sdt.setTheme(hostTheme);
}

// Initial sync (deferred until SDT is ready)
window.addEventListener('sdt:ready', syncSDTTheme);
// And again every time the host's theme changes
hostThemeStore.subscribe(syncSDTTheme);
```

If you'd rather have SDT *follow* the OS but inform the rest of your tools when it flips, listen for `sdt:theme-change`:

```js
window.addEventListener('sdt:theme-change', (e) => {
  // e.detail.theme === 'light' | 'dark'
  // e.detail.mode  === 'auto' | 'light' | 'dark'  (whatever was last set)
  document.documentElement.setAttribute('data-theme', e.detail.theme);
});
```

The toolbar persists the chosen value under `localStorage.getItem('seguru-debug-toolbar:theme')`, so a user's manual override survives a reload.

---

## 2. Identity from a host auth system

SDT can render a small "logged in as <Name>" pill in its chrome — useful when a preview is shown to a specific reviewer, internal user, or QA tester. SDT itself never reads cookies or auth tokens; the host calls `setUser()` from its own auth code.

```js
// Pseudocode — replace the source with your host's auth state.
function syncSDTUser() {
  const sdt = window.seguruDebugToolbar;
  if (!sdt) return;
  const session = getHostSession();
  if (session && session.user) {
    sdt.setUser({
      name:  session.user.displayName,
      role:  session.user.role,         // freeform: 'reviewer', 'internal', 'qa', etc
      id:    session.user.id,           // host-defined token
      email: session.user.email          // optional
    });
  } else {
    sdt.setUser(null);
  }
}

window.addEventListener('sdt:ready', syncSDTUser);
hostAuthStore.subscribe(syncSDTUser);
```

This works the same against any auth provider — Firebase auth state, a Supabase session, a Cognito user pool, a custom signed cookie. SDT stays auth-agnostic; whatever object you hand to `setUser()` is what gets rendered.

If other tools on the page want to react when the user changes (e.g. swapping out a reviewer-specific UI), they can listen for `sdt:user-change`:

```js
window.addEventListener('sdt:user-change', (e) => {
  // e.detail.user — the same object passed to setUser(), or null if cleared
  reviewerSidebar.setUser(e.detail.user);
});
```

---

## 3. Listening for `sdt:dataref-click` to wire a custom review or feedback panel

`sdt:dataref-click` fires every time a user clicks an SDT label, icon, or tooltip for a `[data-ref]` element. The event carries:

- `dataRef` — the value of the clicked element's `data-ref` attribute
- `element` — the host page element that the label was attached to
- `current` — the SDT label / icon / tooltip the user actually clicked

This is the primary hook for building a feedback / review / QA tool that uses the same `data-ref` vocabulary the toolbar already surfaces:

```js
window.addEventListener('sdt:dataref-click', (e) => {
  const { dataRef, element } = e.detail;

  // Add a feedback row keyed on the data-ref. Idempotent — if the same ref
  // is already in the list, focus it instead of duplicating.
  if (feedbackList.has(dataRef)) {
    feedbackList.focus(dataRef);
  } else {
    feedbackList.add({
      dataRef,
      capturedAt: new Date().toISOString(),
      // Optional: snapshot the visible text of the targeted element
      preview: element.textContent.trim().slice(0, 120)
    });
  }
});
```

A few practical notes:

- **Use the canonical `dataRef`, not the element reference, as the row key.** `data-ref` values are stable across reloads and code changes (that's the whole point of the toolbar). The DOM `element` reference changes every navigation.
- **Don't `preventDefault()` the underlying click.** SDT's own click handler runs first (it copies the ref to clipboard); the event you're listening to is fired *after* that, and it doesn't bubble through the host DOM.
- **Hover analogue:** `sdt:dataref-hover` fires on icon / full-label `mouseenter`. Useful for previewing a feedback row before commitment.

---

## Example — composing all three in a Review Sidebar

A typical "review sidebar" host — a preview page with a docked side panel where reviewers leave per-element feedback — composes all three patterns:

1. **Theme sync** — the host's own light/dark toggle calls `seguruDebugToolbar.setTheme()` so SDT's chrome stays in step with the rest of the host UI.
2. **Identity** — after the host's auth code resolves the current reviewer (from a session cookie, a token, an SSO callback — whatever the host already uses), it calls `seguruDebugToolbar.setUser({ name, role, id })` so the reviewer sees their identity in SDT's chrome alongside the host's own affordances.
3. **`sdt:dataref-click` → feedback row** — the host listens for `sdt:dataref-click` and auto-adds a feedback row keyed on the clicked `data-ref`. Reviewers click any element on the preview, get a row, type their note, and the host posts it back keyed on a stable identifier.

The host can also call `seguruDebugToolbar.hide()` from its own Esc fallback when a modal is open, so SDT cooperatively dismisses instead of competing for the corner. If the host already has a fixed sidebar on one side, it should pass `dock: 'bottom-left'` (or the opposite of its sidebar) so SDT doesn't collide.

None of these integrations live in SDT itself — they all live in the host codebase, against the public `seguruDebugToolbar` API and the `sdt:` event surface. Every host can compose them against its own systems.
