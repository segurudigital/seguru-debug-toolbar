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
* Click any label to copy the section code to your clipboard
* Configurable position (any corner of the screen)
* Role-based access control (Administrator, Editor, or Author)
* Dark mode support
* Zero external dependencies — one self-contained 10 KB JS file
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

No. The entire plugin is a single 10 KB JavaScript file that only loads for authorized logged-in users. It does one DOM scan, injects lightweight label elements, and uses CSS class toggles for mode switching.

== Screenshots ==

1. The toolbar in Icons mode — small dots on each section, hover to reveal
2. Full mode — all labels visible for QA passes
3. Settings page in wp-admin — configure mode, position, and access
4. Click any label to copy the section code to clipboard

== Changelog ==

= 1.0.0 =
* Initial release
* Three viewing modes: Icons, Off, Full
* Keyboard shortcut (L) to cycle modes
* Click-to-copy with toast confirmation
* Configurable default mode, position, and role-based access
* Dark mode support
* Built-in help documentation on settings page
* Powered by Seguru Digital badge
* Elementor Pro, Bricks Builder, and Oxygen Builder support documented
* Elementor Free workaround via CSS class-to-attribute snippet
EOF

# Inject version into readme.txt
sed -i '' "s/__VERSION__/${VERSION}/" "$TMP_DIR/seguru-debug-toolbar/readme.txt"

# Create the zip
cd "$TMP_DIR"
zip -rq "$DIST_DIR/$ZIP_NAME" seguru-debug-toolbar/

# Clean up
rm -rf "$TMP_DIR"

echo "Built: dist/$ZIP_NAME ($(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1) compressed)"
