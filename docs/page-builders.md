# Page Builder Support

The debug toolbar works with any page builder that outputs HTML. It scans the DOM for `data-ref` attributes after page load, so it doesn't matter how those attributes got into the markup — Gutenberg, Elementor, Bricks, Oxygen, hand-coded PHP, or anything else.

The plugin includes two features that make rolling out `data-ref` across page builders much faster: a **class-to-ref converter** and **auto-ref**. Both are off by default and can be turned on under **Settings → Debug Toolbar → Page Builders**.

---

## Built-in: Class-to-Ref Converter

Every page builder — including free tiers — lets you add CSS classes to any element. The class converter turns that into a `data-ref` pipeline with zero code.

**How it works:**

1. Turn on "Enable class-to-ref converter" in Settings → Debug Toolbar → Page Builders
2. In your page builder, add a CSS class like `dataref-home-01-hero` to a section
3. The toolbar automatically strips the `dataref-` prefix and sets `data-ref="home-01-hero"` on page load

That's it. No code snippets, no functions.php edits, no Pro tier required. If the builder lets you type a CSS class (and they all do), you can use `data-ref`.

**Rules:**

- If an element already has an explicit `data-ref` attribute, the class converter skips it — manual values always win
- If an element has multiple `dataref-` classes, the first one wins
- The conversion happens client-side before the toolbar scans, so labels appear immediately

**Where to add the class in each builder:**

| Builder | Where to type the CSS class |
|---------|----------------------------|
| Elementor (Free or Pro) | Advanced tab → CSS Classes |
| Bricks Builder | Style → CSS Classes |
| Oxygen Builder | Advanced → CSS Classes |
| Breakdance | Settings → CSS Classes |
| Gutenberg | Block → Advanced → Additional CSS class(es) |

---

## Built-in: Auto-Ref

Auto-ref automatically generates `data-ref` values for major section elements on every page. No manual tagging needed at all.

**How it works:**

1. Turn on "Enable auto-ref" in Settings → Debug Toolbar → Page Builders
2. The toolbar detects section-level elements on the page and assigns refs based on the page slug and position
3. A page at `/about-us` with three sections gets `about-us-01`, `about-us-02`, `about-us-03`

**What it detects:**

| Builder | Elements targeted |
|---------|------------------|
| Elementor | `.elementor-section`, top-level `.e-con` containers |
| Bricks | `section.brxe-section`, top-level `.brxe-container` |
| Oxygen | `.ct-section` |
| Breakdance | `.breakdance-section` |
| Generic HTML5 | `<section>` tags that are direct children of `body`, `main`, `[role="main"]`, `#content`, `.site-content`, or `.page-content` |

**Priority order:**

1. Manual `data-ref` attributes (from the builder's custom attributes field) always win
2. Class converter values (`dataref-` classes) come second
3. Auto-ref fills in everything else

So you can turn on auto-ref for instant coverage, then selectively override specific sections with more descriptive names using the class converter or manual attributes. Auto-generated names like `about-us-02` work fine for bug reporting, but you might want `about-us-02-team-grid` for sections you reference often.

**Page slug logic:**

| URL | Slug used |
|-----|-----------|
| `example.com/` | `home` |
| `example.com/about-us/` | `about-us` |
| `example.com/services/web-design/` | `services-web-design` |

---

## Manual: Custom Attributes (without the converter)

If you prefer to set `data-ref` directly (no class prefix, no conversion), most builders have a custom attributes field. This approach doesn't require the class converter to be turned on.

### Elementor Pro

1. Select the Section, Container, or Widget you want to label
2. Open the **Advanced** tab in the left panel
3. Scroll down to **Custom Attributes**
4. Enter: `data-ref|home-01-hero` (pipe character separates key from value)
5. Press Enter or click outside the field

Each attribute goes on its own line:

```
data-ref|home-01-hero
data-section|hero
```

Elementor Free doesn't have custom attributes. Use the class converter instead — it works on all Elementor tiers.

### Bricks Builder

1. Select the element
2. Open the **Style** panel on the right
3. Scroll to the **Attributes** section at the bottom
4. Click **+** to add a new attribute
5. Set **Name** to `data-ref` and **Value** to your section code

Bricks also supports dynamic data in attribute values, so you can pull the value from an ACF field if you manage references in the CMS.

**Bulk assignment via PHP:**

```php
add_filter( 'bricks/element/set_root_attributes', function ( $attributes, $element ) {
    if ( ! empty( $attributes['id'] ) ) {
        $attributes['data-ref'] = $attributes['id'];
    }
    return $attributes;
}, 10, 2 );
```

### Oxygen Builder (3.5+)

1. Select the element
2. Open the **Advanced** tab
3. Find the **Attributes** section
4. Click **Add Attribute**
5. Set name to `data-ref` and value to your section code

Older Oxygen versions (pre-3.5) don't have native custom attributes. Use the class converter instead.

### Gutenberg (Block Editor)

Covered in detail in [wordpress.md](wordpress.md). Quick summary: use a Group block as the section wrapper and add `data-ref` via a custom attribute plugin or directly in the block markup.

---

## Recommended rollout approach

**Fastest:** Turn on auto-ref. Every section on every page gets a label immediately. The names are generic (`slug-01`, `slug-02`) but they work for QA and bug reporting right away.

**More descriptive:** Turn on the class converter. Go through key pages and add `dataref-` classes with meaningful names. Takes more effort but gives you names like `home-03-testimonials` instead of `home-03`.

**Hybrid:** Turn on both. Auto-ref covers everything automatically, and you override the important sections with `dataref-` classes. Best of both worlds.

**Manual only:** Turn off both features and add `data-ref` attributes directly through each builder's custom attributes field. Most control, most effort.

---

## General tips

**Label sections, not everything.** Put `data-ref` on the major blocks of each page — hero, features, testimonials, CTA, footer. You don't need it on every heading and button. The goal is section-level identification.

**Use consistent naming.** Follow a pattern like `page-number-pattern` (e.g. `home-01-hero`, `about-03-team-grid`). See [naming-conventions.md](naming-conventions.md) for the full guide.

**Test with the toolbar.** After adding your `data-ref` attributes (or turning on auto-ref), visit the front end while logged in and press **L** to cycle through modes. If a section doesn't show a label, view source and check that the `data-ref` attribute is in the rendered HTML.

**SPA and AJAX content.** If your builder loads sections dynamically (lazy loading, infinite scroll, AJAX pagination), call `window.seguruDebugToolbar.refresh()` after the new content loads. The refresh method re-runs the class converter, auto-ref, and label injection so new sections get picked up.
