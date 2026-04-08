# data-ref Naming Conventions

The toolbar works with any string you put in a `data-ref` attribute. You could use `banana-42` and it would show up fine. But a consistent naming convention turns `data-ref` from a label into a shared language between designers, developers, copywriters, and clients.

These are the patterns we use at Seguru Digital. Adapt them to whatever fits your team.

---

## Website builds

**Format:** `[page-slug]-[section-number]-[pattern-slug]`

The page slug matches the URL. The section number gives you ordering. The pattern slug tells you what kind of section it is.

### Examples

| data-ref | What it maps to |
|----------|----------------|
| `home-01-hero-standard` | Homepage, first section, standard hero pattern |
| `home-02-features-grid` | Homepage, second section, feature grid |
| `about-01-hero-split` | About page, first section, split-layout hero |
| `about-03-team-grid` | About page, third section, team grid |
| `services-05-testimonials` | Services page, fifth section, testimonials |
| `contact-02-form` | Contact page, second section, form block |

### Why section numbers matter

Section numbers give you a stable reference even when sections get rearranged during design. If the client asks to move the testimonials above the CTA, the ref values stay the same — you just move the blocks. The number reflects the original IA order, not the current visual order.

If you add a new section between 02 and 03, use `02a` or just renumber. The numbers are identifiers, not indexes.

### Pattern slugs

The pattern slug at the end is optional but helpful. It tells you what UI pattern that section uses, which is useful when multiple sections share the same pattern (e.g. two different testimonial sections that use different layouts).

If you don't have a pattern picked yet during the IA phase, use `tbd`: `home-03-tbd`. Replace it once the pattern is decided.

---

## Web apps and software builds

**Format:** `[product]-[surface]-[screen-slug]`

This format works for multi-surface products where the same data or feature appears across different platforms (web app, admin panel, storefront, mobile, etc.).

### Product codes

The product code is a short identifier for the product or system. Keep it to one word.

| Code | Product |
|------|---------|
| `data` | Data management layer |
| `os` | Operating system / main app |
| `builds` | Build pipeline |
| `atlas` | WordPress theme |

Use whatever product names make sense for your org.

### Surface codes

The surface code tells you which platform or interface the screen belongs to.

| Code | Surface |
|------|---------|
| `pwa` | Progressive web app |
| `app` | Main web application |
| `wp-admin` | WordPress admin panel |
| `wp-frontend` | WordPress front end |
| `shopify-admin` | Shopify admin |
| `shopify-storefront` | Shopify storefront |
| `mobile` | Native mobile app |

### Examples

| data-ref | What it maps to |
|----------|----------------|
| `data-pwa-dashboard` | Data product, PWA surface, dashboard screen |
| `os-app-workshop-kanban` | OS product, main app, workshop kanban board |
| `builds-wp-admin-build-manager` | Builds product, WP admin, build manager screen |
| `builds-shopify-storefront-gallery` | Builds product, Shopify storefront, gallery page |
| `os-app-admin-settings-users-roles` | OS product, main app, admin settings users/roles |

### Screen slugs

Keep screen slugs descriptive but short. Use hyphens to separate words. If the screen has a clear hierarchy (e.g. Settings → Users → Roles), include enough of the path to be unambiguous: `admin-settings-users-roles` rather than just `roles`.

---

## General rules

**Lowercase and hyphens only.** No camelCase, no underscores, no spaces. This keeps the values URL-safe, CSS-selector-safe, and easy to search with grep.

**Be specific enough to be unique.** Every `data-ref` value on a page should be different. If two sections share a value, the toolbar still works but you lose the ability to identify which one someone is referring to.

**Keep it human-readable.** Someone should be able to read `about-03-team-grid` and know roughly where on the site that is without needing a lookup table.

**Don't put data-ref on everything.** Focus on section-level elements — the major blocks of a page. You don't need a `data-ref` on every button and paragraph. The goal is to identify sections for cross-referencing, not to label every DOM node.

---

## Using data-ref in your workflow

Once you have a naming convention, `data-ref` values become the glue between your documents:

**Wireframes:** Each section in the wireframe has a `data-ref`. The toolbar makes them visible for review.

**Page briefs and copy docs:** Reference sections by their `data-ref` value. "Section `home-02-features-grid` needs a shorter headline" is unambiguous.

**Bug reports and revision notes:** Click-to-copy the ref value from the toolbar, paste it into your ticket. The developer can grep the codebase for that exact string.

**QA checklists:** List the sections to check by `data-ref`. Walk through the page with the toolbar in Full mode and tick them off.

**Block markup (WordPress, Shopify):** The `data-ref` attributes persist in the HTML output. They're invisible to end users and add zero performance overhead, so you can leave them in production.
