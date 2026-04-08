/**
 * Seguru Debug Toolbar — Element Reference Labels
 * https://github.com/seguru-digital/seguru-debug-toolbar
 *
 * Visual overlay for `data-ref` element labels on wireframes,
 * dev builds, and live WordPress pages.
 *
 * Usage:
 *   <script src="seguru-debug-toolbar.js"></script>
 *   (auto-injects toolbar HTML, CSS, and binds keyboard shortcut)
 *
 * Three modes cycled by clicking buttons or pressing L:
 *   0 = Icons   — small dot per element, hover to see full label
 *   1 = Off     — nothing shown, clean view for screenshots
 *   2 = Full    — always-visible text labels on every element
 *
 * Click any label to copy the data-ref value to clipboard.
 *
 * Programmatic API:
 *   window.seguruDebugToolbar.setState(0|1|2)
 *   window.seguruDebugToolbar.getState()
 *   window.seguruDebugToolbar.refresh()  // re-scan for new data-ref elements
 */
(function () {
  'use strict';

  // ─── Configuration ──────────────────────────────────────────
  var ACCENT = '234, 88, 12';        // orange — functional UI accent
  var ACCENT_HEX = '#EA580C';
  var ACCENT_WASH = 'rgba(234, 88, 12, 0.08)';
  var SEGURU_BLUE = '#00C0F3';       // brand primary — badge only
  var FONT_MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', monospace";
  var FONT_UI = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // Seguru S mark — inline SVG derived from Seguru-Favicon-Blue.svg
  // 16px circle, blue bg, white mark. Used in the toolbar badge zone.
  var S_MARK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" style="display:block">' +
    '<circle cx="256" cy="256" r="256" fill="' + SEGURU_BLUE + '"/>' +
    '<path fill="#fff" d="M328.35,158.25c0,39.96-32.39,72.35-72.35,72.35s-72.35-32.39-72.35-72.35,32.39-72.35,72.35-72.35,72.35,32.39,72.35,72.35M141.19,624.36h0v520.12c0,69.87,30.78,120.8,92.17,128.41v63.09h44.33v-63.09c61.39-7.61,92.17-58.54,92.17-128.41V480.38c0-50.17-16.33-91-46.67-112,14-17.5,29.17-31.49,29.17-57.78,0-17.25-4.37-38.67-26.63-58.37,28.72-21.35,47.41-55.43,47.41-93.97,0-64.7-52.45-117.15-117.15-117.15s-117.15,52.45-117.15,117.15,52.45,117.15,117.15,117.15c8.86,0,17.46-1.07,25.75-2.93,12.7,9.57,20.26,21.05,21.32,31.55,2.55,25.37-19.72,42.73-59.21,83.02-59.5,61.84-77,81.67-87.5,109.67-11.67,28-15.17,65.33-15.17,112v15.65h0Z M185.52,1105.92h0v-513.54c0-77,23.33-102.67,88.67-171.51,4.67-5.83,10.5-11.67,17.5-18.67,25.67,15.17,33.83,50.17,33.83,110.84v598.76c0,81.67-14,117.84-70,117.84s-70-36.17-70-117.84v-5.88h0Z"/>' +
    '</svg>';

  // Read WordPress config if present (set via wp_localize_script)
  var wpConfig = (typeof window.sdtConfig !== 'undefined') ? window.sdtConfig : {};
  var state = parseInt(wpConfig.defaultMode, 10) || 0; // 0=icons, 1=off, 2=full

  // Feature flags (set via WP settings or manual sdtConfig)
  var classConverterEnabled = wpConfig.classConverter === '1' || wpConfig.classConverter === true;
  var autoRefEnabled = wpConfig.autoRef === '1' || wpConfig.autoRef === true;
  var autoRefDepth = wpConfig.autoRefDepth || 'section'; // section | block | element

  // ─── Position config ────────────────────────────────────────
  var position = wpConfig.position || 'bottom-right';
  var posMap = {
    'bottom-right': 'bottom:20px;right:20px;',
    'bottom-left':  'bottom:20px;left:20px;right:auto;',
    'top-right':    'top:20px;bottom:auto;right:20px;',
    'top-left':     'top:20px;bottom:auto;left:20px;right:auto;'
  };
  var toastPosMap = {
    'bottom-right': 'bottom:64px;right:20px;',
    'bottom-left':  'bottom:64px;left:20px;right:auto;',
    'top-right':    'top:64px;bottom:auto;right:20px;',
    'top-left':     'top:64px;bottom:auto;left:20px;right:auto;'
  };

  // ─── Label CSS (injected into main document) ───────────────
  // Labels live inside data-ref elements, so they share the page DOM.
  // `all:initial` resets inherited page/builder styles (Elementor, Bricks, etc.)
  // before re-declaring our own properties.
  var labelCss = document.createElement('style');
  labelCss.id = 'seguru-debug-toolbar-styles';
  labelCss.textContent = [

    // --- Icon mode: small dot, hover reveals tooltip ---
    '.sdt-ref-icon {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: absolute;',
    '  top: 2px;',
    '  left: 2px;',
    '  width: 16px;',
    '  height: 16px;',
    '  font-size: 12px;',
    '  line-height: 16px;',
    '  text-align: center;',
    '  background: rgba(' + ACCENT + ', 0.12);',
    '  color: rgba(' + ACCENT + ', 0.6);',
    '  border-radius: 50%;',
    '  z-index: 90;',
    '  cursor: pointer;',
    '  pointer-events: auto;',
    '  transition: all 0.1s;',
    '  user-select: none;',
    '}',

    '.sdt-ref-icon:hover {',
    '  background: rgba(' + ACCENT + ', 0.25);',
    '  color: rgba(' + ACCENT + ', 0.9);',
    '}',

    // --- Tooltip (shown on hover via CSS) ---
    '.sdt-ref-tooltip {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: absolute;',
    '  top: 2px;',
    '  left: 22px;',
    '  font-family: ' + FONT_MONO + ';',
    '  font-size: 10px;',
    '  line-height: 1;',
    '  padding: 3px 6px;',
    '  background: rgba(17, 24, 39, 0.85);',
    '  color: #FFF7ED;',
    '  border-radius: 3px;',
    '  z-index: 91;',
    '  white-space: nowrap;',
    '  opacity: 0;',
    '  transform: translateX(-4px);',
    '  transition: opacity 0.1s, transform 0.1s;',
    '  cursor: pointer;',
    '  pointer-events: none;',
    '  user-select: all;',
    '}',

    '[data-ref]:hover .sdt-ref-tooltip,',
    '.sdt-ref-icon:hover + .sdt-ref-tooltip {',
    '  opacity: 1;',
    '  transform: translateX(0);',
    '  pointer-events: auto;',
    '}',

    // --- Full-label mode ---
    '.sdt-ref-full-label {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: absolute;',
    '  top: 2px;',
    '  left: 2px;',
    '  font-family: ' + FONT_MONO + ';',
    '  font-size: 10px;',
    '  line-height: 1;',
    '  padding: 2px 4px;',
    '  background: rgba(0, 0, 0, 0.06);',
    '  color: rgba(0, 0, 0, 0.4);',
    '  border-radius: 2px;',
    '  z-index: 90;',
    '  cursor: pointer;',
    '  pointer-events: auto;',
    '  user-select: all;',
    '  white-space: nowrap;',
    '}',

    '.sdt-ref-full-label:hover {',
    '  background: rgba(' + ACCENT + ', 0.15);',
    '  color: rgba(' + ACCENT + ', 0.8);',
    '}',

    // --- Mode: hide-labels ---
    'body.sdt-hide .sdt-ref-icon,',
    'body.sdt-hide .sdt-ref-tooltip,',
    'body.sdt-hide .sdt-ref-full-label { display: none !important; }',

    // --- Mode: show-labels (full) — icon + tooltip hidden ---
    'body.sdt-full .sdt-ref-icon,',
    'body.sdt-full .sdt-ref-tooltip { display: none !important; }',

    // --- Default (icons): full label hidden ---
    'body:not(.sdt-full) .sdt-ref-full-label { display: none !important; }',

  ].join('\n');

  document.head.appendChild(labelCss);


  // ─── Shadow DOM for toolbar + toast (isolated from page CSS) ─
  // Toolbar and toast are rendered inside a shadow root so page
  // styles (Elementor, Bricks, theme CSS) cannot leak in.
  var shadowHost = document.createElement('div');
  shadowHost.id = 'seguru-debug-toolbar-host';
  shadowHost.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:99999;pointer-events:none;';

  var shadowCss = [
    // --- Toolbar chrome ---
    '.sdt-toolbar {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: fixed;',
    '  ' + (posMap[position] || posMap['bottom-right']),
    '  z-index: 99999;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0;',
    '  background: #fff;',
    '  border: 1px solid #E5E7EB;',
    '  border-radius: 6px;',
    '  box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06);',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.75rem;',
    '  line-height: 1.5;',
    '  overflow: visible;',
    '  user-select: none;',
    '  pointer-events: auto;',
    '}',

    '.sdt-toolbar__label {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: block;',
    '  padding: 8px 12px;',
    '  font-family: ' + FONT_UI + ';',
    '  font-weight: 600;',
    '  color: #9CA3AF;',
    '  white-space: nowrap;',
    '  letter-spacing: 0.3px;',
    '  text-transform: uppercase;',
    '  font-size: 0.625rem;',
    '  line-height: 1.5;',
    '}',

    // --- Dropdown trigger ---
    '.sdt-toolbar__group {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  position: relative;',
    '  border-right: 1px solid #E5E7EB;',
    '}',

    '.sdt-toolbar__group:last-child { border-right: none; }',

    '.sdt-toolbar__select {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 4px;',
    '  padding: 8px 10px;',
    '  background: transparent;',
    '  border: none;',
    '  cursor: pointer;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.75rem;',
    '  font-weight: 600;',
    '  color: ' + ACCENT_HEX + ';',
    '  white-space: nowrap;',
    '  line-height: 1.5;',
    '  transition: background 0.1s;',
    '}',

    '.sdt-toolbar__select:hover { background: #F9FAFB; }',

    '.sdt-toolbar__caret {',
    '  all: initial;',
    '  font-size: 8px;',
    '  color: #9CA3AF;',
    '  margin-left: 2px;',
    '}',

    // --- Dropdown menu (positioned dynamically via JS) ---
    '.sdt-toolbar__dropdown {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: none;',
    '  position: absolute;',
    '  background: #fff;',
    '  border: 1px solid #E5E7EB;',
    '  border-radius: 6px;',
    '  box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08);',
    '  overflow: hidden;',
    '  min-width: 140px;',
    '  z-index: 100002;',
    '  font-family: ' + FONT_UI + ';',
    '}',

    '.sdt-toolbar__dropdown--open { display: block; }',

    '.sdt-toolbar__option {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  width: 100%;',
    '  padding: 7px 12px;',
    '  background: transparent;',
    '  border: none;',
    '  cursor: pointer;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.75rem;',
    '  font-weight: 400;',
    '  color: #374151;',
    '  white-space: nowrap;',
    '  line-height: 1.5;',
    '  transition: background 0.1s;',
    '}',

    '.sdt-toolbar__option:hover { background: #F9FAFB; }',

    '.sdt-toolbar__option--active {',
    '  color: ' + ACCENT_HEX + ';',
    '  font-weight: 600;',
    '  background: ' + ACCENT_WASH + ';',
    '}',

    '.sdt-toolbar__option-dot {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: block;',
    '  width: 6px;',
    '  height: 6px;',
    '  border-radius: 50%;',
    '  background: currentColor;',
    '  flex-shrink: 0;',
    '}',

    '.sdt-toolbar__hint {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: block;',
    '  padding: 5px 12px;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.625rem;',
    '  color: #D1D5DB;',
    '  border-top: 1px solid #F3F4F6;',
    '}',

    // --- Badge zone ---
    '.sdt-toolbar__badge {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  padding: 0 10px;',
    '  cursor: pointer;',
    '  position: relative;',
    '  border-right: 1px solid #E5E7EB;',
    '  text-decoration: none;',
    '  transition: background 0.1s;',
    '  align-self: stretch;',
    '}',

    '.sdt-toolbar__badge:hover { background: #F9FAFB; }',

    '.sdt-toolbar__badge-tip {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: absolute;',
    '  bottom: calc(100% + 8px);',
    '  left: 50%;',
    '  transform: translateX(-50%) translateY(4px);',
    '  font-family: "Open Sans", ' + FONT_UI + ';',
    '  font-size: 11px;',
    '  font-weight: 400;',
    '  color: #FFF7ED;',
    '  background: rgba(17, 24, 39, 0.88);',
    '  padding: 5px 10px;',
    '  border-radius: 4px;',
    '  white-space: nowrap;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transition: opacity 0.15s, transform 0.15s;',
    '  z-index: 100001;',
    '}',

    '.sdt-toolbar__badge:hover .sdt-toolbar__badge-tip {',
    '  opacity: 1;',
    '  transform: translateX(-50%) translateY(0);',
    '}',

    // --- Dark mode ---
    ':host-context(html.dark) .sdt-toolbar { background: #27272A; border-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__group { border-right-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__select:hover { background: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__dropdown { background: #27272A; border-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__option { color: #D1D5DB; }',
    ':host-context(html.dark) .sdt-toolbar__option:hover { background: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__option--active { background: rgba(' + ACCENT + ', 0.12); }',
    ':host-context(html.dark) .sdt-toolbar__hint { border-top-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__badge { border-right-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__badge:hover { background: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__badge-tip { color: #B1B3B6; }',

    // --- Toast ---
    '.sdt-toast {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: fixed;',
    '  ' + (toastPosMap[position] || toastPosMap['bottom-right']),
    '  font-family: ' + FONT_MONO + ';',
    '  font-size: 12px;',
    '  line-height: 1.5;',
    '  padding: 8px 14px;',
    '  background: rgba(22, 163, 74, 0.9);',
    '  color: #fff;',
    '  border-radius: 4px;',
    '  z-index: 100000;',
    '  white-space: nowrap;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transform: translateY(8px);',
    '  transition: opacity 0.2s, transform 0.2s;',
    '}',

    '.sdt-toast--visible {',
    '  opacity: 1;',
    '  transform: translateY(0);',
    '}',

  ].join('\n');


  // ─── Mode + depth display labels ─────────────────────────────
  var MODE_LABELS = { 0: 'Icons', 1: 'Off', 2: 'Full' };
  var DEPTH_LABELS = { 'off': 'Off', 'section': 'Sections', 'block': 'Blocks', 'element': 'Elements' };
  var initModeLabel = MODE_LABELS[state] || 'Icons';
  var initDepthLabel = autoRefEnabled ? (DEPTH_LABELS[autoRefDepth] || 'Sections') : 'Off';

  // ─── Build toolbar DOM ──────────────────────────────────────
  var toolbar = document.createElement('div');
  toolbar.className = 'sdt-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Element reference labels');
  toolbar.innerHTML =
    '<a class="sdt-toolbar__badge" href="https://seguru.digital" target="_blank" rel="noopener" aria-label="Powered by Seguru Digital">' +
      S_MARK_SVG +
      '<span class="sdt-toolbar__badge-tip">Powered by Seguru Digital</span>' +
    '</a>' +
    // ── Mode dropdown ──
    '<div class="sdt-toolbar__group" data-sdt-group="mode">' +
      '<div class="sdt-toolbar__label">Labels</div>' +
      '<button class="sdt-toolbar__select" data-sdt-toggle="mode">' +
        initModeLabel + ' <span class="sdt-toolbar__caret">&#9662;</span>' +
      '</button>' +
      '<div class="sdt-toolbar__dropdown" data-sdt-menu="mode">' +
        '<button class="sdt-toolbar__option' + (state === 0 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="0">' +
          '<span class="sdt-toolbar__option-dot"></span> Icons' +
        '</button>' +
        '<button class="sdt-toolbar__option' + (state === 1 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="1">' +
          '<span class="sdt-toolbar__option-dot"></span> Off' +
        '</button>' +
        '<button class="sdt-toolbar__option' + (state === 2 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="2">' +
          '<span class="sdt-toolbar__option-dot"></span> Full' +
        '</button>' +
        '<div class="sdt-toolbar__hint">Press L to cycle</div>' +
      '</div>' +
    '</div>' +
    // ── Depth dropdown ──
    '<div class="sdt-toolbar__group" data-sdt-group="depth">' +
      '<div class="sdt-toolbar__label">Depth</div>' +
      '<button class="sdt-toolbar__select" data-sdt-toggle="depth">' +
        initDepthLabel + ' <span class="sdt-toolbar__caret">&#9662;</span>' +
      '</button>' +
      '<div class="sdt-toolbar__dropdown" data-sdt-menu="depth">' +
        '<button class="sdt-toolbar__option' + (!autoRefEnabled ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="off">' +
          '<span class="sdt-toolbar__option-dot"></span> Off — manual labels only' +
        '</button>' +
        '<button class="sdt-toolbar__option' + (autoRefEnabled && autoRefDepth === 'section' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="section">' +
          '<span class="sdt-toolbar__option-dot"></span> Sections — top-level page sections' +
        '</button>' +
        '<button class="sdt-toolbar__option' + (autoRefEnabled && autoRefDepth === 'block' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="block">' +
          '<span class="sdt-toolbar__option-dot"></span> Blocks — sections + containers' +
        '</button>' +
        '<button class="sdt-toolbar__option' + (autoRefEnabled && autoRefDepth === 'element' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="element">' +
          '<span class="sdt-toolbar__option-dot"></span> Elements — headings, text, images, buttons' +
        '</button>' +
        '<div class="sdt-toolbar__hint">Press D to cycle</div>' +
      '</div>' +
    '</div>';


  // ─── Toast element ──────────────────────────────────────────
  var toast = document.createElement('div');
  toast.className = 'sdt-toast';
  var toastTimer = null;

  function showToast(text) {
    toast.textContent = 'Copied: ' + text;
    toast.classList.add('sdt-toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('sdt-toast--visible');
    }, 1400);
  }


  // ─── Class-to-Ref Converter ─────────────────────────────────
  // Converts CSS classes prefixed with `dataref-` into `data-ref` attributes.
  // Works with every page builder (including free tiers) because they all
  // support adding CSS classes. Example: class="dataref-home-01-hero"
  // becomes data-ref="home-01-hero".
  function convertClassRefs() {
    if (!classConverterEnabled) return;
    var els = document.querySelectorAll('[class*="dataref-"]');
    els.forEach(function (el) {
      if (el.getAttribute('data-ref')) return; // explicit data-ref wins
      var classes = el.className.split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
        if (classes[i].indexOf('dataref-') === 0) {
          el.setAttribute('data-ref', classes[i].replace('dataref-', ''));
          break; // first match wins
        }
      }
    });
  }


  // ─── Auto-Ref ──────────────────────────────────────────────
  // Automatically generates data-ref values for major section elements
  // based on page slug and position. Detects builder-specific wrappers
  // (Elementor, Bricks, Oxygen) plus generic <section> tags.
  //
  // Generated format: {slug}-{nn}  e.g. "about-us-01", "about-us-02"
  // Elements with an existing data-ref (manual or from class converter)
  // are counted in the sequence but not overwritten.

  // Selector tiers for auto-ref depth levels
  var SELECTORS_SECTION = [
    // Elementor (modern flexbox containers)
    '.e-con:not(.e-con .e-con)',        // top-level containers only
    // Bricks
    'section.brxe-section',
    '.brxe-container:not(.brxe-container .brxe-container)',
    // Oxygen
    '.ct-section',
    // Breakdance
    '.breakdance-section',
    // Generic HTML5
    'body > section, main > section, [role="main"] > section',
    '#content > section, .site-content > section, .page-content > section',
    // Fallback: direct children of common wrapper IDs
    '#content > div > section'
  ];

  var SELECTORS_BLOCK = SELECTORS_SECTION.concat([
    // Elementor — nested containers + all widgets
    '.e-con .e-con',
    '[class*="elementor-widget-"]',
    // Bricks inner blocks
    '.brxe-block', '.brxe-div',
    '[class*="brxe-"]:not(section)',
    // Oxygen inner
    '.ct-div', '.ct-column',
    '.ct-text-block', '.ct-headline', '.ct-image', '.ct-button',
    // Breakdance inner
    '.breakdance-column',
    '[class*="breakdance-"]:not([class*="breakdance-section"])',
    // HTML5 structural
    'article', 'aside', 'nav',
    // Gutenberg blocks
    '.wp-block-group', '.wp-block-column', '.wp-block-columns',
    '.wp-block-cover', '.wp-block-media-text',
    '[class*="wp-block-"]'
  ]);

  // Element depth targets semantic content AND builder widgets directly,
  // skipping generic wrapper divs so you see meaningful context.
  var SELECTORS_ELEMENT = SELECTORS_SECTION.concat([
    // Semantic HTML
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'figure', 'figcaption', 'img', 'video', 'audio',
    'a[href]', 'button', 'input', 'select', 'textarea',
    'form', 'table', 'ul', 'ol', 'dl',
    'article', 'aside', 'nav', 'header', 'footer',
    'details', 'summary', 'label', 'legend',
    // Elementor widgets (specific, not generic .elementor-widget wrapper)
    '[class*="elementor-widget-"]',
    // Bricks elements
    '[class*="brxe-"]',
    // Oxygen elements
    '.ct-text-block', '.ct-headline', '.ct-image', '.ct-button',
    '.ct-link-text', '.ct-video', '.ct-icon', '.ct-fancy-image',
    // Breakdance elements
    '[class*="breakdance-"]'
  ]);

  var AUTO_REF_DEPTH_MAP = {
    'section': SELECTORS_SECTION,
    'block':   SELECTORS_BLOCK,
    'element': SELECTORS_ELEMENT
  };

  var AUTO_REF_SELECTORS = (AUTO_REF_DEPTH_MAP[autoRefDepth] || SELECTORS_SECTION).join(', ');

  // Extract a human-readable context string from an element.
  // Prefers builder widget types over raw tag names.
  function getElementContext(el) {
    var cls = el.className || '';

    // Elementor: "elementor-widget-heading" → "heading"
    var eMatch = cls.match(/elementor-widget-([\w-]+)/);
    if (eMatch) return eMatch[1];

    // Bricks: "brxe-heading" → "heading"
    var bMatch = cls.match(/brxe-([\w-]+)/);
    if (bMatch) return bMatch[1];

    // Oxygen: "ct-headline" → "headline"
    var oMatch = cls.match(/ct-([\w-]+)/);
    if (oMatch) return oMatch[1];

    // Breakdance: "breakdance-form" → "form"
    var dMatch = cls.match(/breakdance-([\w-]+)/);
    if (dMatch && dMatch[1] !== 'section' && dMatch[1] !== 'column') return dMatch[1];

    // Gutenberg: "wp-block-cover" → "cover"
    var gMatch = cls.match(/wp-block-([\w-]+)/);
    if (gMatch) return gMatch[1];

    // Fallback: tag name
    return el.tagName.toLowerCase();
  }

  function getPageSlug() {
    var path = window.location.pathname
      .replace(/^\/|\/$/g, '')   // trim slashes
      .replace(/\//g, '-');      // sub-paths become hyphens
    return path || 'home';       // root = "home"
  }

  function autoRefSections() {
    if (!autoRefEnabled) return;
    var slug = getPageSlug();
    var seen = new WeakSet();     // dedup: same element matched by multiple selectors
    var allSections = [];

    // Gather unique section elements in DOM order
    var candidates = document.querySelectorAll(AUTO_REF_SELECTORS);
    candidates.forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);

      // At section/block depth, skip elements nested inside another
      // matched section (avoids double-labelling inner containers).
      // At element depth, allow nesting — the whole point is density.
      if (autoRefDepth === 'element') {
        allSections.push(el);
      } else {
        var dominated = false;
        for (var j = 0; j < allSections.length; j++) {
          if (allSections[j].contains(el)) { dominated = true; break; }
        }
        if (!dominated) allSections.push(el);
      }
    });

    // Sort by document position
    allSections.sort(function (a, b) {
      var pos = a.compareDocumentPosition(b);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    // Assign sequential refs, skip elements that already have one
    for (var i = 0; i < allSections.length; i++) {
      var el = allSections[i];
      if (!el.getAttribute('data-ref')) {
        var num = String(i + 1);
        if (num.length < 2) num = '0' + num;
        el.setAttribute('data-ref', slug + '-' + num + '-' + getElementContext(el));
        el.setAttribute('data-sdt-auto', '1');
      }
    }
  }


  // ─── Clear auto-ref'd labels (for depth switching) ─────────
  function clearAutoRefs() {
    var autoEls = document.querySelectorAll('[data-sdt-auto]');
    autoEls.forEach(function (el) {
      el.removeAttribute('data-ref');
      el.removeAttribute('data-sdt-auto');
      var labels = el.querySelectorAll('.sdt-ref-icon, .sdt-ref-tooltip, .sdt-ref-full-label');
      labels.forEach(function (label) { label.remove(); });
      delete el[MARKER];
    });
  }


  // ─── Depth management ──────────────────────────────────────
  var DEPTH_CYCLE = ['off', 'section', 'block', 'element'];

  function setDepth(newDepth) {
    if (newDepth === 'off') {
      autoRefEnabled = false;
    } else {
      autoRefEnabled = true;
      autoRefDepth = newDepth;
      AUTO_REF_SELECTORS = (AUTO_REF_DEPTH_MAP[autoRefDepth] || SELECTORS_SECTION).join(', ');
    }

    // Clear previous auto-refs and rescan
    clearAutoRefs();
    if (autoRefEnabled) {
      convertClassRefs();
      autoRefSections();
    }
    injectLabels();

    updateDropdown('depth', 'data-sdt-depth', newDepth, DEPTH_LABELS[newDepth]);
  }


  // ─── Label injection ────────────────────────────────────────
  // Tracks which elements already have labels to avoid duplicates on refresh()
  var MARKER = '_sdtLabelled';

  function injectLabels() {
    var refs = document.querySelectorAll('[data-ref]');

    refs.forEach(function (el) {
      if (el[MARKER]) return; // already labelled
      el[MARKER] = true;

      var refValue = el.getAttribute('data-ref');

      // Ensure the element can hold absolutely-positioned children
      var pos = window.getComputedStyle(el).position;
      if (pos === 'static') el.style.position = 'relative';

      // Icon dot
      var icon = document.createElement('span');
      icon.className = 'sdt-ref-icon';
      icon.textContent = '\u24D8'; // ⓘ
      icon.title = 'Click to copy: ' + refValue;
      icon.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
      });

      // Tooltip (shown on hover)
      var tooltip = document.createElement('span');
      tooltip.className = 'sdt-ref-tooltip';
      tooltip.textContent = refValue;
      tooltip.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
      });

      // Full label (always visible in full mode)
      var fullLabel = document.createElement('span');
      fullLabel.className = 'sdt-ref-full-label';
      fullLabel.textContent = refValue;
      fullLabel.title = 'Click to copy';
      fullLabel.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
      });

      el.appendChild(icon);
      el.appendChild(tooltip);
      el.appendChild(fullLabel);
    });
  }


  // ─── Clipboard helper ───────────────────────────────────────
  function copyRef(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        showToast(value);
      });
    } else {
      var temp = document.createElement('textarea');
      temp.value = value;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast(value);
    }
  }


  // ─── Dropdown helpers ────────────────────────────────────────
  function closeAllDropdowns() {
    var menus = toolbar.querySelectorAll('.sdt-toolbar__dropdown');
    menus.forEach(function (m) { m.classList.remove('sdt-toolbar__dropdown--open'); });
  }

  function toggleDropdown(name) {
    var menu = toolbar.querySelector('[data-sdt-menu="' + name + '"]');
    var isOpen = menu.classList.contains('sdt-toolbar__dropdown--open');
    closeAllDropdowns();
    if (isOpen) return;

    // Reset position before measuring
    menu.style.top = 'auto';
    menu.style.bottom = 'auto';
    menu.style.left = 'auto';
    menu.style.right = 'auto';
    menu.classList.add('sdt-toolbar__dropdown--open');

    // Measure available space
    var groupRect = menu.parentElement.getBoundingClientRect();
    var menuRect = menu.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Vertical: open above or below the toolbar
    if (groupRect.top > vh - groupRect.bottom) {
      menu.style.bottom = 'calc(100% + 6px)';
    } else {
      menu.style.top = 'calc(100% + 6px)';
    }

    // Horizontal: align left or right edge
    if (groupRect.left + menuRect.width > vw) {
      menu.style.right = '0';
    } else {
      menu.style.left = '0';
    }
  }

  function updateDropdown(name, activeAttr, activeValue, label) {
    // Update trigger text
    var trigger = toolbar.querySelector('[data-sdt-toggle="' + name + '"]');
    trigger.innerHTML = label + ' <span class="sdt-toolbar__caret">&#9662;</span>';

    // Update active option
    var opts = toolbar.querySelectorAll('[data-sdt-menu="' + name + '"] .sdt-toolbar__option');
    opts.forEach(function (opt) {
      opt.classList.toggle('sdt-toolbar__option--active',
        opt.getAttribute(activeAttr) === String(activeValue));
    });

    closeAllDropdowns();
  }


  // ─── State management ───────────────────────────────────────
  function setState(newState) {
    state = newState;
    document.body.classList.remove('sdt-hide', 'sdt-full');

    if (state === 1) {
      document.body.classList.add('sdt-hide');
    } else if (state === 2) {
      document.body.classList.add('sdt-full');
    }

    updateDropdown('mode', 'data-sdt-state', state, MODE_LABELS[state]);
  }


  // ─── Init ───────────────────────────────────────────────────
  function init() {
    // Mount toolbar + toast inside shadow DOM for style isolation
    document.body.appendChild(shadowHost);
    var shadow = shadowHost.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = shadowCss;
    shadow.appendChild(style);
    shadow.appendChild(toolbar);
    shadow.appendChild(toast);

    // Run converters before scanning for labels
    convertClassRefs();
    autoRefSections();
    injectLabels();

    // Apply initial state (may differ from 0 if configured via WP)
    if (state !== 0) setState(state);

    // Dropdown toggle clicks
    toolbar.querySelectorAll('[data-sdt-toggle]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown(trigger.getAttribute('data-sdt-toggle'));
      });
    });

    // Mode option clicks
    toolbar.querySelectorAll('[data-sdt-state]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setState(parseInt(opt.getAttribute('data-sdt-state'), 10));
      });
    });

    // Depth option clicks
    toolbar.querySelectorAll('[data-sdt-depth]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setDepth(opt.getAttribute('data-sdt-depth'));
      });
    });

    // Close dropdowns on click outside (shadow root)
    shadow.addEventListener('click', function (e) {
      if (!e.target.closest('[data-sdt-toggle]') && !e.target.closest('.sdt-toolbar__dropdown')) {
        closeAllDropdowns();
      }
    });

    // Close dropdowns on click outside (main document)
    document.addEventListener('click', function () {
      closeAllDropdowns();
    });

    // Keyboard shortcuts: L cycles modes, D cycles depth, Escape closes dropdowns
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAllDropdowns(); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
      if (e.key === 'l' || e.key === 'L') {
        setState((state + 1) % 3);
      }
      if (e.key === 'd' || e.key === 'D') {
        var currentIdx = autoRefEnabled ? DEPTH_CYCLE.indexOf(autoRefDepth) : 0;
        var nextIdx = (currentIdx + 1) % DEPTH_CYCLE.length;
        setDepth(DEPTH_CYCLE[nextIdx]);
      }
    });
  }

  // Wait for DOM if needed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


  // ─── Public API ─────────────────────────────────────────────
  window.seguruDebugToolbar = {
    setState: setState,
    getState: function () { return state; },
    setDepth: setDepth,
    getDepth: function () { return autoRefEnabled ? autoRefDepth : 'off'; },
    refresh: function () { convertClassRefs(); autoRefSections(); injectLabels(); }
  };

})();
