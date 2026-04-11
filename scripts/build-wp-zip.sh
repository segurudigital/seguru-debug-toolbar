#!/usr/bin/env bash
# Builds a ready-to-install WordPress plugin .zip
# Output: dist/seguru-debug-toolbar-wp.zip

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist"
TMP_DIR=$(mktemp -d)
VERSION=$(node -p "require('$ROOT_DIR/package.json').version")
ZIP_NAME="seguru-debug-toolbar-wp-v${VERSION}.zip"

# Set up temp directory
mkdir -p "$TMP_DIR/seguru-debug-toolbar/assets"

# Build the minified JS first
cd "$ROOT_DIR"
npm run build --silent

# Assemble plugin contents
cp "$ROOT_DIR/wordpress/seguru-debug-toolbar/seguru-debug-toolbar.php" "$TMP_DIR/seguru-debug-toolbar/"
cp "$DIST_DIR/seguru-debug-toolbar.min.js" "$TMP_DIR/seguru-debug-toolbar/assets/"
cp "$ROOT_DIR/LICENSE" "$TMP_DIR/seguru-debug-toolbar/"

# Copy WordPress.org assets (banner, icon, screenshots) if present
if [ -d "$ROOT_DIR/assets" ]; then
  cp "$ROOT_DIR/assets"/wp-banner-*.png  "$TMP_DIR/seguru-debug-toolbar/assets/" 2>/dev/null || true
  cp "$ROOT_DIR/assets"/wp-icon-*.png    "$TMP_DIR/seguru-debug-toolbar/assets/" 2>/dev/null || true
  cp "$ROOT_DIR/assets"/screenshot-*.png "$TMP_DIR/seguru-debug-toolbar/assets/" 2>/dev/null || true
fi

# Create readme.txt for WordPress plugin directory conventions
cat > "$TMP_DIR/seguru-debug-toolbar/readme.txt" << 'EOF'
=== Seguru Debug Toolbar ===
Contributors: segurudigital
Tags: debug, data-ref, overlay, qa, wireframe, developer tools
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: __VERSION__
License: MIT
License URI: https://opensource.org/licenses/MIT

Visual overlay that makes data-ref section labels visible on your site. Built for QA, revision feedback, and bug reporting.

== Description ==

Seguru Debug Toolbar is a lightweight developer tool that turns `data-ref` attributes on your HTML elements into a clickable visual overlay. It helps designers, developers, and clients identify page sections by their reference codes — making QA, revision rounds, and bug reporting faster and more precise.

**How it works:** Add `data-ref` attributes to your page sections (e.g. `data-ref="home-01-hero"`). The toolbar displays these codes as visual labels you can see, hover, and click to copy.

**Three viewing modes:**

* **Icons** — Small dot on each section. Hover to see the full code.
* **Off** — Clean view for screenshots and presentations.
* **Full** — Always-visible labels on every section.

**Key features:**

* Press **L** to cycle between modes
* Press **H** to hide the toolbar and all labels for screenshots
* Press **D** to cycle auto-ref depth between Sections, Blocks, and Elements
* Toggle the **Tree** panel to browse all labeled elements in document order
* Click any label to copy the section code to your clipboard
* Configurable position (any corner of the screen)
* Role-based access control (Administrator, Editor, or Author)
* Dark mode support
* Adaptive label contrast on dark backgrounds
* Zero external dependencies — one self-contained JavaScript file
* Built-in help docs on the settings page

**For agencies and freelancers:** Give clients the plugin so they can identify exactly which section has an issue. They click the label, copy the code, and paste it in their email. You search your codebase for that code and find the block in seconds. No more "the thing at the top needs to change."

== Installation ==

1. Upload the plugin via Plugins → Add New → Upload Plugin
2. Activate the plugin
3. Go to Settings → Debug Toolbar
4. Enable the toolbar and configure your preferences
5. Visit the front end while logged in to see the toolbar

== Frequently Asked Questions ==

= Will visitors see the toolbar? =

No. The toolbar only loads for logged-in users who meet the minimum role requirement you set in the settings. Anonymous visitors and lower-role users never see it.

= What are data-ref attributes? =

They're custom HTML attributes you add to page sections (like `data-ref="home-01-hero"`). They're invisible to visitors and have zero performance impact. The toolbar makes them visible as clickable labels for your team.

= Does it work with Elementor, Bricks, and Oxygen? =

Yes. All three builders support custom HTML attributes, so you can add `data-ref` to any section element:

* **Elementor Pro** — Advanced tab → Custom Attributes → `data-ref|home-01-hero`
* **Bricks Builder** — Style → Attributes → Name: `data-ref`, Value: `home-01-hero`
* **Oxygen Builder** (3.5+) — Advanced tab → Attributes → Add Attribute

The toolbar scans the rendered HTML after page load, so it works with any builder that outputs the attributes. A snippet-based workaround is included for Elementor Free users.

= Can I use it with Gutenberg blocks? =

Yes. Add `data-ref` attributes to Group block wrappers via custom block attributes or the Advanced panel. The toolbar reads them from the rendered HTML.

= Does it affect site performance? =

No. The entire plugin is a single ~42 KB minified JavaScript file that only loads for authorized logged-in users. It does one DOM scan, injects lightweight label elements, and uses CSS class toggles for mode switching.

== Screenshots ==

1. The toolbar in Icons mode — small dots on each section, hover to reveal
2. Full mode — all labels visible for QA passes
3. Tree panel — browse labeled elements in document order with copy buttons
4. Settings page in wp-admin — configure mode, position, and access
5. Dark-background page with adaptive label contrast

== Changelog ==

= 2.1.0 =
* Added Outline guides for sections and blocks
* Added leader lines and depth-aware label staggering for dense layouts
* Refreshed the toolbar hierarchy and interaction states
* Improved outline contrast on dark sections and nested layouts
* Upgraded the Tree panel with context chips and click-to-jump navigation

= 2.0.0 =
* Added presentation mode toggle with the H key
* Added auto-ref depth cycling with the D key
* Added Tree panel for browsing and copying labeled elements
* Improved tooltip hover behavior so it only opens from the icon
* Improved Full mode label contrast and dark-background label visibility
* Added dual-source config support for WordPress and per-page overrides
* Updated Seguru product branding and badge colour alignment

= 1.3.0 =
* Added auto-ref generation for supported builders and standard HTML sections
* Added class-to-ref conversion for builder workflows
* Added front-end depth controls for Sections, Blocks, and Elements
* Expanded WordPress settings-page documentation
EOF

# Inject version into readme.txt
sed -i '' "s/__VERSION__/${VERSION}/" "$TMP_DIR/seguru-debug-toolbar/readme.txt"

# Create the zip
cd "$TMP_DIR"
zip -rq "$DIST_DIR/$ZIP_NAME" seguru-debug-toolbar/

# Clean up
rm -rf "$TMP_DIR"

echo "Built: dist/$ZIP_NAME ($(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1) compressed)"
