/**
 * Seguru Debug Toolbar — Element Reference Labels
 * https://github.com/segurudigital/seguru-debug-toolbar
 *
 * Visual overlay for `data-ref` element labels on wireframes,
 * dev builds, and live WordPress pages.
 *
 * Usage:
 *   <script src="seguru-debug-toolbar.js"></script>
 *   (auto-injects toolbar HTML, CSS, and binds keyboard shortcuts)
 *
 * Three modes cycled by clicking buttons or pressing L:
 *   0 = Icons   — small dot per element, hover to see full label
 *   1 = Off     — nothing shown, clean view for screenshots
 *   2 = Full    — always-visible text labels on every element (default)
 *
 * Press H to toggle presentation mode: hides toolbar + all labels.
 *   By default the toolbar loads in presentation mode (hidden) so it stays
 *   out of screenshots, AI/Chrome debug sessions, and client demos. Press H
 *   to reveal the toolbar and labels. Override with seguruDebugConfig.startHidden = false.
 * Press D to cycle auto-ref depth: Off → Sections → Blocks → Elements.
 *   Default depth is Elements for the densest debugging view.
 * Use Outline to show section/block boundaries for spacing QA (off by default).
 *
 * Click any label to copy the data-ref value to clipboard.
 *
 * Programmatic API:
 *   window.seguruDebugToolbar.setState(0|1|2)
 *   window.seguruDebugToolbar.getState()
 *   window.seguruDebugToolbar.setDepth('off'|'section'|'block'|'element')
 *   window.seguruDebugToolbar.getDepth()
 *   window.seguruDebugToolbar.setOutline('off'|'section'|'block')
 *   window.seguruDebugToolbar.getOutline()
 *   window.seguruDebugToolbar.refresh()  // re-scan for new data-ref elements
 */
(function () {
  'use strict';

  // ─── Configuration ──────────────────────────────────────────
  var ACCENT = '234, 88, 12';        // orange — functional UI accent
  var ACCENT_ON_DARK = '249, 115, 22';
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

  function forEachNode(nodeList, callback) {
    var i;
    for (i = 0; i < nodeList.length; i++) {
      callback(nodeList[i], i);
    }
  }

  function toArray(nodeList) {
    var arr = [];
    forEachNode(nodeList, function (node) {
      arr.push(node);
    });
    return arr;
  }

  function arrayContainsNode(nodes, target) {
    var i;
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i] === target) return true;
    }
    return false;
  }

  function setClassState(el, className, enabled) {
    if (enabled) {
      el.classList.add(className);
    } else {
      el.classList.remove(className);
    }
  }

  function rectsOverlap(a, b, gap) {
    return !(a.right + gap <= b.left || a.left >= b.right + gap || a.bottom + gap <= b.top || a.top >= b.bottom + gap);
  }

  function closestMatch(el, selector) {
    while (el && el !== shadowHost && el !== document && el.nodeType === 1) {
      if (matchesSelector(el, selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function matchesSelector(el, selector) {
    var matcher = el.matches || el.msMatchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector;
    if (!matcher) return false;
    return matcher.call(el, selector);
  }

  // ─── Config merge: wpConfig (PHP-injected) + sdtConfig (per-page override)
  // wpConfig is set by WordPress via wp_localize_script under the key 'sdtConfig'.
  // sdtConfig is a per-page override set directly on window (e.g. in wireframes).
  // Page-level sdtConfig overrides wpConfig; both fall back to defaults.
  var wpConfig = (typeof window.sdtConfig !== 'undefined') ? window.sdtConfig : {};
  var pageConfig = (typeof window.seguruDebugConfig !== 'undefined') ? window.seguruDebugConfig : {};
  // Merge: pageConfig values win over wpConfig values
  var config = {};
  var _keys = ['defaultMode', 'classConverter', 'autoRef', 'autoRefDepth', 'outlineMode', 'position', 'pageSlug', 'startHidden'];
  for (var _i = 0; _i < _keys.length; _i++) {
    var _k = _keys[_i];
    config[_k] = (_k in pageConfig) ? pageConfig[_k] : wpConfig[_k];
  }

  // 0=icons, 1=off, 2=full. Default 2 (Full) when no config provided.
  var _parsedMode = parseInt(config.defaultMode, 10);
  var state = isNaN(_parsedMode) ? 2 : _parsedMode;

  // Feature flags
  var classConverterEnabled = config.classConverter === '1' || config.classConverter === true;
  var autoRefEnabled = config.autoRef === '1' || config.autoRef === true;
  var autoRefDepth = config.autoRefDepth || 'element'; // section | block | element (default element)
  var outlineMode = config.outlineMode || 'off'; // off | section | block

  // Presentation mode — H key toggles toolbar + label visibility.
  // Default ON so the toolbar stays out of screenshots, Chrome debug sessions
  // (e.g. captured by AI agents), and client demos until explicitly revealed.
  // Set seguruDebugConfig.startHidden = false to restore legacy "visible on load" behaviour.
  var presentationMode = !(config.startHidden === '0' || config.startHidden === false);

  // ─── Position config ────────────────────────────────────────
  var position = config.position || 'bottom-right';
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
  var treePanelPosMap = {
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

    // --- Tooltip (shown on icon hover only — not whole-element hover) ---
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

    // Show tooltip when hovering the icon (not the whole element)
    '.sdt-ref-icon:hover + .sdt-ref-tooltip {',
    '  opacity: 1;',
    '  transform: translateX(0);',
    '  pointer-events: auto;',
    '}',

    // Keep tooltip visible when mouse moves onto it from the icon
    '.sdt-ref-tooltip:hover {',
    '  opacity: 1;',
    '  transform: translateX(0);',
    '  pointer-events: auto;',
    '}',

    // --- Full-label mode: high-contrast dark bg ---
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
    '  background: rgba(17, 24, 39, 0.82);',
    '  color: #FFF7ED;',
    '  border: 1px solid rgba(255, 255, 255, 0.1);',
    '  border-radius: 3px;',
    '  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);',
    '  z-index: 90;',
    '  cursor: pointer;',
    '  pointer-events: auto;',
    '  user-select: all;',
    '  white-space: nowrap;',
    '  max-width: 220px;',
    '  overflow: hidden;',
    '  text-overflow: ellipsis;',
    '}',

    '.sdt-ref-full-label:hover {',
    '  background: rgba(234, 88, 12, 0.9);',
    '  color: #fff;',
    '  border-color: rgba(255, 255, 255, 0.2);',
    '}',

    // --- Element type tag prefix ---
    '.sdt-ref-tag {',
    '  all: initial;',
    '  font-family: ' + FONT_MONO + ';',
    '  font-size: inherit;',
    '  font-weight: 600;',
    '  color: inherit;',
    '  opacity: 0.5;',
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

    // --- Presentation mode: hide everything ---
    'body.sdt-presentation .sdt-ref-icon,',
    'body.sdt-presentation .sdt-ref-tooltip,',
    'body.sdt-presentation .sdt-ref-full-label { display: none !important; }',

    // --- Adaptive: dark-background variant ---
    '.sdt-ref-icon.sdt-on-dark {',
    '  background: rgba(255, 255, 255, 0.18);',
    '  color: rgba(255, 255, 255, 0.85);',
    '}',
    '.sdt-ref-icon.sdt-on-dark:hover {',
    '  background: rgba(255, 255, 255, 0.32);',
    '  color: #fff;',
    '}',
    '.sdt-ref-full-label.sdt-on-dark {',
    '  background: rgba(255, 255, 255, 0.88);',
    '  color: #111827;',
    '  border-color: rgba(0, 0, 0, 0.08);',
    '}',
    '.sdt-ref-full-label.sdt-on-dark:hover {',
    '  background: #fff;',
    '  color: #EA580C;',
    '}',

    '.sdt-ref-link {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: absolute;',
    '  top: 2px;',
    '  left: 9px;',
    '  width: 1px;',
    '  height: 0;',
    '  background: rgba(' + ACCENT + ', 0.55);',
    '  z-index: 89;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '}',
    '.sdt-ref-link.sdt-on-dark {',
    '  background: rgba(255, 255, 255, 0.62);',
    '}',

    // --- Tree panel: element highlight on row hover ---
    '.sdt-tree-highlight {',
    '  outline: 2px solid #EA580C !important;',
    '  outline-offset: 3px !important;',
    '}',
    '.sdt-tree-jump-highlight {',
    '  outline: 3px solid rgba(' + ACCENT + ', 0.92) !important;',
    '  outline-offset: 4px !important;',
    '  box-shadow: 0 0 0 6px rgba(' + ACCENT + ', 0.16) !important;',
    '}',

    // --- Outline guides ---
    '.sdt-outline-section {',
    '  outline: 2px solid rgba(' + ACCENT + ', 0.90) !important;',
    '  outline-offset: -2px !important;',
    '  box-shadow: inset 0 0 0 1px rgba(' + ACCENT + ', 0.20), inset 0 18px 0 0 rgba(' + ACCENT + ', 0.08) !important;',
    '}',
    '.sdt-outline-block {',
    '  outline: 1px dashed rgba(' + ACCENT + ', 0.46) !important;',
    '  outline-offset: -1px !important;',
    '  box-shadow: inset 0 0 0 1px rgba(' + ACCENT + ', 0.08) !important;',
    '}',
    '.sdt-outline-section.sdt-outline-on-dark {',
    '  outline-color: rgba(' + ACCENT_ON_DARK + ', 0.98) !important;',
    '  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14), inset 0 18px 0 0 rgba(' + ACCENT_ON_DARK + ', 0.12) !important;',
    '}',
    '.sdt-outline-block.sdt-outline-on-dark {',
    '  outline-color: rgba(255, 255, 255, 0.36) !important;',
    '  box-shadow: inset 0 0 0 1px rgba(' + ACCENT_ON_DARK + ', 0.14) !important;',
    '}',
    'body.sdt-presentation .sdt-outline-section,',
    'body.sdt-presentation .sdt-outline-block {',
    '  outline: none !important;',
    '  box-shadow: none !important;',
    '}',
    'body.sdt-hide .sdt-ref-link,',
    'body.sdt-presentation .sdt-ref-link {',
    '  display: none !important;',
    '}',

  ].join('\n');

  document.head.appendChild(labelCss);


  // ─── Shadow DOM for toolbar + toast (isolated from page CSS) ─
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
    '  gap: 6px;',
    '  padding: 4px;',
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

    '.sdt-toolbar__cluster {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 4px;',
    '}',

    '.sdt-toolbar__cluster--primary {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 4px;',
    '  padding-right: 6px;',
    '  margin-right: 2px;',
    '  border-right: 1px solid #E5E7EB;',
    '}',

    '.sdt-toolbar__group {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  position: relative;',
    '}',

    '.sdt-toolbar__select {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  padding: 6px 10px;',
    '  background: #F9FAFB;',
    '  border: 1px solid transparent;',
    '  border-radius: 999px;',
    '  cursor: pointer;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.75rem;',
    '  font-weight: 500;',
    '  color: #111827;',
    '  white-space: nowrap;',
    '  line-height: 1.5;',
    '  transition: background 0.1s, border-color 0.1s, color 0.1s;',
    '}',

    '.sdt-toolbar__select:hover { background: #F3F4F6; border-color: #E5E7EB; }',

    '.sdt-toolbar__select--utility { background: transparent; color: #6B7280; }',

    '.sdt-toolbar__select--active {',
    '  background: ' + ACCENT_WASH + ';',
    '  border-color: rgba(' + ACCENT + ', 0.18);',
    '  color: ' + ACCENT_HEX + ';',
    '}',

    '.sdt-toolbar__select--diagnostic.sdt-toolbar__select--active {',
    '  background: rgba(17, 24, 39, 0.05);',
    '  border-color: rgba(' + ACCENT + ', 0.26);',
    '  color: #111827;',
    '  box-shadow: inset 0 0 0 1px rgba(' + ACCENT + ', 0.08);',
    '}',

    '.sdt-toolbar__select--open {',
    '  background: #fff;',
    '  border-color: rgba(' + ACCENT + ', 0.24);',
    '  box-shadow: 0 0 0 3px rgba(' + ACCENT + ', 0.10);',
    '}',

    '.sdt-toolbar__select:focus-visible,',
    '.sdt-toolbar__option:focus-visible,',
    '.sdt-tree-row:focus-visible,',
    '.sdt-tree-copy:focus-visible,',
    '.sdt-tree-panel__close:focus-visible,',
    '.sdt-toolbar__badge:focus-visible {',
    '  outline: 2px solid rgba(' + ACCENT + ', 0.58);',
    '  outline-offset: 2px;',
    '}',

    '.sdt-toolbar__key {',
    '  all: initial;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.625rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.3px;',
    '  text-transform: uppercase;',
    '  color: #9CA3AF;',
    '  white-space: nowrap;',
    '}',

    '.sdt-toolbar__value {',
    '  all: initial;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.75rem;',
    '  font-weight: 600;',
    '  color: inherit;',
    '  white-space: nowrap;',
    '}',

    '.sdt-toolbar__select--active .sdt-toolbar__key { color: currentColor; opacity: 0.72; }',

    '.sdt-toolbar__select--diagnostic .sdt-toolbar__key::before {',
    '  content: "";',
    '  display: inline-block;',
    '  width: 6px;',
    '  height: 6px;',
    '  margin-right: 6px;',
    '  border-radius: 50%;',
    '  background: currentColor;',
    '  opacity: 0.22;',
    '  vertical-align: middle;',
    '}',

    '.sdt-toolbar__select--diagnostic.sdt-toolbar__select--active .sdt-toolbar__key::before {',
    '  opacity: 0.95;',
    '}',

    '.sdt-toolbar__caret {',
    '  all: initial;',
    '  font-size: 8px;',
    '  color: #9CA3AF;',
    '  margin-left: 2px;',
    '  transition: transform 0.12s ease, color 0.12s ease;',
    '}',

    '.sdt-toolbar__select--open .sdt-toolbar__caret {',
    '  transform: rotate(180deg);',
    '  color: currentColor;',
    '}',

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
    '  border-bottom: 1px solid #F3F4F6;',
    '}',

    '.sdt-toolbar__badge {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  padding: 0 8px 0 4px;',
    '  cursor: pointer;',
    '  position: relative;',
    '  border-radius: 999px;',
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
    ':host-context(html.dark) .sdt-toolbar__cluster--primary { border-right-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__select { background: #313136; color: #F3F4F6; }',
    ':host-context(html.dark) .sdt-toolbar__select:hover { background: #3F3F46; border-color: #52525B; }',
    ':host-context(html.dark) .sdt-toolbar__select--utility { background: transparent; color: #D1D5DB; }',
    ':host-context(html.dark) .sdt-toolbar__select--active { background: rgba(' + ACCENT + ', 0.14); border-color: rgba(' + ACCENT + ', 0.25); }',
    ':host-context(html.dark) .sdt-toolbar__select--diagnostic.sdt-toolbar__select--active { background: rgba(255, 255, 255, 0.07); color: #FFF7ED; }',
    ':host-context(html.dark) .sdt-toolbar__select--open { background: #3A3A42; border-color: rgba(' + ACCENT + ', 0.35); box-shadow: 0 0 0 3px rgba(' + ACCENT + ', 0.14); }',
    ':host-context(html.dark) .sdt-toolbar__key { color: #A1A1AA; }',
    ':host-context(html.dark) .sdt-toolbar__dropdown { background: #27272A; border-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__option { color: #D1D5DB; }',
    ':host-context(html.dark) .sdt-toolbar__option:hover { background: #3F3F46; }',
    ':host-context(html.dark) .sdt-toolbar__option--active { background: rgba(' + ACCENT + ', 0.12); }',
    ':host-context(html.dark) .sdt-toolbar__hint { border-bottom-color: #3F3F46; }',
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

    // --- Tree panel ---
    '.sdt-tree-panel {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  position: fixed;',
    '  ' + (treePanelPosMap[position] || treePanelPosMap['bottom-right']),
    '  width: 340px;',
    '  max-height: 58vh;',
    '  display: none;',
    '  flex-direction: column;',
    '  background: #fff;',
    '  border: 1px solid #E5E7EB;',
    '  border-radius: 10px;',
    '  box-shadow: 0 10px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08);',
    '  z-index: 99998;',
    '  overflow: hidden;',
    '  font-family: ' + FONT_UI + ';',
    '  pointer-events: auto;',
    '}',

    '.sdt-tree-panel--open { display: flex; }',

    '.sdt-tree-panel__header {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: block;',
    '  padding: 12px;',
    '  border-bottom: 1px solid #E5E7EB;',
    '  background: linear-gradient(180deg, rgba(249, 250, 251, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);',
    '  font-family: ' + FONT_UI + ';',
    '  flex-shrink: 0;',
    '}',

    '.sdt-tree-panel__header-main {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: flex-start;',
    '  justify-content: space-between;',
    '  gap: 10px;',
    '  font-family: ' + FONT_UI + ';',
    '}',

    '.sdt-tree-panel__title-wrap {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 6px;',
    '  min-width: 0;',
    '  font-family: ' + FONT_UI + ';',
    '}',

    '.sdt-tree-panel__title {',
    '  all: initial;',
    '  display: block;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.8125rem;',
    '  font-weight: 600;',
    '  line-height: 1.2;',
    '  color: #111827;',
    '}',

    '.sdt-tree-panel__meta {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  gap: 6px;',
    '  font-family: ' + FONT_UI + ';',
    '}',

    '.sdt-tree-panel__meta-item {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  padding: 2px 7px;',
    '  border: 1px solid #E5E7EB;',
    '  border-radius: 999px;',
    '  background: #F9FAFB;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.625rem;',
    '  font-weight: 600;',
    '  color: #6B7280;',
    '}',

    '.sdt-tree-panel__hint {',
    '  all: initial;',
    '  display: block;',
    '  margin-top: 8px;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.6875rem;',
    '  line-height: 1.4;',
    '  color: #9CA3AF;',
    '}',

    '.sdt-tree-panel__close {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 26px;',
    '  height: 26px;',
    '  cursor: pointer;',
    '  border: 1px solid #E5E7EB;',
    '  background: #fff;',
    '  color: #9CA3AF;',
    '  font-size: 14px;',
    '  line-height: 1;',
    '  border-radius: 999px;',
    '  transition: background 0.1s, color 0.1s, border-color 0.1s;',
    '}',
    '.sdt-tree-panel__close:hover { background: #FFF7ED; color: #EA580C; border-color: rgba(' + ACCENT + ', 0.24); }',

    '.sdt-tree-panel__body {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: block;',
    '  overflow-y: auto;',
    '  flex: 1;',
    '  padding: 6px;',
    '  background: #FCFCFD;',
    '}',

    '.sdt-tree-row {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  width: 100%;',
    '  padding: 8px 9px;',
    '  border: 1px solid transparent;',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  transition: background 0.08s, border-color 0.08s, box-shadow 0.08s;',
    '  font-family: ' + FONT_UI + ';',
    '}',
    '.sdt-tree-row:hover { background: #FFF7ED; border-color: rgba(' + ACCENT + ', 0.18); }',
    '.sdt-tree-row:focus-within { background: #FFF7ED; border-color: rgba(' + ACCENT + ', 0.24); box-shadow: inset 3px 0 0 rgba(' + ACCENT + ', 0.58); }',
    '.sdt-tree-row--active { background: rgba(' + ACCENT + ', 0.08); border-color: rgba(' + ACCENT + ', 0.24); box-shadow: inset 3px 0 0 rgba(' + ACCENT + ', 0.65); }',

    '.sdt-tree-gutter {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0;',
    '  flex-shrink: 0;',
    '}',

    '.sdt-tree-indent {',
    '  all: initial;',
    '  display: inline-block;',
    '  box-sizing: border-box;',
    '  width: 12px;',
    '  height: 18px;',
    '  border-left: 1px solid #E5E7EB;',
    '  flex-shrink: 0;',
    '}',
    '.sdt-tree-row:hover .sdt-tree-indent,',
    '.sdt-tree-row--active .sdt-tree-indent {',
    '  border-left-color: rgba(' + ACCENT + ', 0.24);',
    '}',

    '.sdt-tree-content {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  min-width: 0;',
    '  flex: 1;',
    '  display: flex;',
    '  align-items: baseline;',
    '  gap: 8px;',
    '  font-family: ' + FONT_UI + ';',
    '}',

    '.sdt-tree-tag {',
    '  all: initial;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  padding: 2px 6px;',
    '  border-radius: 999px;',
    '  background: rgba(' + ACCENT + ', 0.10);',
    '  font-family: ' + FONT_MONO + ';',
    '  font-size: 0.625rem;',
    '  font-weight: 600;',
    '  color: #EA580C;',
    '  white-space: nowrap;',
    '  flex-shrink: 0;',
    '}',

    '.sdt-tree-ref {',
    '  all: initial;',
    '  font-family: ' + FONT_MONO + ';',
    '  font-size: 0.688rem;',
    '  line-height: 1.45;',
    '  color: #374151;',
    '  flex: 1;',
    '  overflow: hidden;',
    '  text-overflow: ellipsis;',
    '  white-space: nowrap;',
    '}',

    '.sdt-tree-copy {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex-shrink: 0;',
    '  cursor: pointer;',
    '  border: 1px solid transparent;',
    '  background: transparent;',
    '  color: #9CA3AF;',
    '  font-size: 12px;',
    '  width: 26px;',
    '  height: 26px;',
    '  border-radius: 999px;',
    '  transition: background 0.1s, color 0.1s, border-color 0.1s;',
    '  line-height: 1.5;',
    '  font-family: ' + FONT_UI + ';',
    '}',
    '.sdt-tree-copy:hover { background: #fff; color: #EA580C; border-color: rgba(' + ACCENT + ', 0.20); }',

    '.sdt-tree-empty {',
    '  all: initial;',
    '  box-sizing: border-box;',
    '  display: block;',
    '  padding: 16px 12px;',
    '  font-family: ' + FONT_UI + ';',
    '  font-size: 0.75rem;',
    '  color: #9CA3AF;',
    '  text-align: center;',
    '}',

    // Dark mode — tree panel
    ':host-context(html.dark) .sdt-tree-panel { background: #27272A; border-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-tree-panel__header { border-bottom-color: #3F3F46; background: linear-gradient(180deg, rgba(39, 39, 42, 0.98) 0%, rgba(24, 24, 27, 0.98) 100%); }',
    ':host-context(html.dark) .sdt-tree-panel__title { color: #F3F4F6; }',
    ':host-context(html.dark) .sdt-tree-panel__meta-item { background: #18181B; border-color: #3F3F46; color: #A1A1AA; }',
    ':host-context(html.dark) .sdt-tree-panel__hint { color: #A1A1AA; }',
    ':host-context(html.dark) .sdt-tree-panel__close { background: #18181B; border-color: #3F3F46; color: #A1A1AA; }',
    ':host-context(html.dark) .sdt-tree-panel__close:hover { background: rgba(' + ACCENT + ', 0.12); border-color: rgba(' + ACCENT_ON_DARK + ', 0.34); color: #FDBA74; }',
    ':host-context(html.dark) .sdt-tree-panel__body { background: #111827; }',
    ':host-context(html.dark) .sdt-tree-row:hover { background: rgba(' + ACCENT + ', 0.14); border-color: rgba(' + ACCENT_ON_DARK + ', 0.24); }',
    ':host-context(html.dark) .sdt-tree-row:focus-within { background: rgba(' + ACCENT + ', 0.16); border-color: rgba(' + ACCENT_ON_DARK + ', 0.28); }',
    ':host-context(html.dark) .sdt-tree-row--active { background: rgba(' + ACCENT + ', 0.18); border-color: rgba(' + ACCENT_ON_DARK + ', 0.28); }',
    ':host-context(html.dark) .sdt-tree-indent { border-left-color: #3F3F46; }',
    ':host-context(html.dark) .sdt-tree-row:hover .sdt-tree-indent,',
    ':host-context(html.dark) .sdt-tree-row--active .sdt-tree-indent { border-left-color: rgba(' + ACCENT_ON_DARK + ', 0.32); }',
    ':host-context(html.dark) .sdt-tree-tag { background: rgba(' + ACCENT + ', 0.16); color: #FDBA74; }',
    ':host-context(html.dark) .sdt-tree-ref { color: #D1D5DB; }',
    ':host-context(html.dark) .sdt-tree-copy:hover { background: #18181B; border-color: rgba(' + ACCENT_ON_DARK + ', 0.28); color: #FDBA74; }',
    ':host-context(html.dark) .sdt-tree-empty { color: #A1A1AA; }',

  ].join('\n');


  // ─── Mode + depth display labels ─────────────────────────────
  var MODE_LABELS = { 0: 'Icons', 1: 'Off', 2: 'Full' };
  var DEPTH_LABELS = { 'off': 'Off', 'section': 'Sections', 'block': 'Blocks', 'element': 'Elements' };
  var OUTLINE_LABELS = { 'off': 'Off', 'section': 'Sections', 'block': 'Blocks' };
  var initModeLabel = MODE_LABELS[state] || 'Icons';
  var initDepthLabel = autoRefEnabled ? (DEPTH_LABELS[autoRefDepth] || 'Sections') : 'Off';
  var initOutlineLabel = OUTLINE_LABELS[outlineMode] || 'Off';

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
    '<div class="sdt-toolbar__cluster sdt-toolbar__cluster--primary">' +
      // ── Mode dropdown ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--primary" data-sdt-group="mode">' +
        '<button class="sdt-toolbar__select sdt-toolbar__select--active" data-sdt-toggle="mode">' +
          '<span class="sdt-toolbar__key">Labels</span>' +
          '<span class="sdt-toolbar__value">' + initModeLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="mode">' +
          '<div class="sdt-toolbar__hint">Press L to cycle · H to hide all</div>' +
          '<button class="sdt-toolbar__option' + (state === 2 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="2">' +
            '<span class="sdt-toolbar__option-dot"></span> Full' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (state === 0 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="0">' +
            '<span class="sdt-toolbar__option-dot"></span> Icons' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (state === 1 ? ' sdt-toolbar__option--active' : '') + '" data-sdt-state="1">' +
            '<span class="sdt-toolbar__option-dot"></span> Off' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Depth dropdown ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--primary" data-sdt-group="depth">' +
        '<button class="sdt-toolbar__select' + (autoRefEnabled ? ' sdt-toolbar__select--active' : '') + '" data-sdt-toggle="depth">' +
          '<span class="sdt-toolbar__key">Depth</span>' +
          '<span class="sdt-toolbar__value">' + initDepthLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="depth">' +
          '<div class="sdt-toolbar__hint">Press D to cycle</div>' +
          '<button class="sdt-toolbar__option' + (autoRefEnabled && autoRefDepth === 'element' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="element">' +
            '<span class="sdt-toolbar__option-dot"></span> Elements — headings, text, images, buttons' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (autoRefEnabled && autoRefDepth === 'block' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="block">' +
            '<span class="sdt-toolbar__option-dot"></span> Blocks — sections + containers' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (autoRefEnabled && autoRefDepth === 'section' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="section">' +
            '<span class="sdt-toolbar__option-dot"></span> Sections — top-level page sections' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (!autoRefEnabled ? ' sdt-toolbar__option--active' : '') + '" data-sdt-depth="off">' +
            '<span class="sdt-toolbar__option-dot"></span> Off — manual labels only' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="sdt-toolbar__cluster sdt-toolbar__cluster--utility">' +
      // ── Outline dropdown ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--utility" data-sdt-group="outline">' +
        '<button class="sdt-toolbar__select sdt-toolbar__select--utility sdt-toolbar__select--diagnostic' + (outlineMode !== 'off' ? ' sdt-toolbar__select--active' : '') + '" data-sdt-toggle="outline">' +
          '<span class="sdt-toolbar__key">Outline</span>' +
          '<span class="sdt-toolbar__value">' + initOutlineLabel + '</span>' +
          '<span class="sdt-toolbar__caret">&#9662;</span>' +
        '</button>' +
        '<div class="sdt-toolbar__dropdown" data-sdt-menu="outline">' +
          '<div class="sdt-toolbar__hint">Guide blocks and sections</div>' +
          '<button class="sdt-toolbar__option' + (outlineMode === 'block' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-outline="block">' +
            '<span class="sdt-toolbar__option-dot"></span> Blocks — sections plus inner containers' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (outlineMode === 'section' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-outline="section">' +
            '<span class="sdt-toolbar__option-dot"></span> Sections — top-level wrappers only' +
          '</button>' +
          '<button class="sdt-toolbar__option' + (outlineMode === 'off' ? ' sdt-toolbar__option--active' : '') + '" data-sdt-outline="off">' +
            '<span class="sdt-toolbar__option-dot"></span> Off — no spacing guides' +
          '</button>' +
        '</div>' +
      '</div>' +
      // ── Tree toggle ──
      '<div class="sdt-toolbar__group sdt-toolbar__group--tree sdt-toolbar__group--utility" data-sdt-group="tree">' +
        '<button class="sdt-toolbar__select sdt-toolbar__select--utility sdt-toolbar__select--diagnostic" data-sdt-toggle-tree>' +
          '<span class="sdt-toolbar__value">\u229E Tree</span>' +
        '</button>' +
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
    }, 1800);
  }


  // ─── Class-to-Ref Converter ─────────────────────────────────
  function convertClassRefs() {
    if (!classConverterEnabled) return;
    var els = document.querySelectorAll('[class*="dataref-"]');
    forEachNode(els, function (el) {
      if (el.getAttribute('data-ref')) return;
      var classes = el.className.split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
        if (classes[i].indexOf('dataref-') === 0) {
          el.setAttribute('data-ref', classes[i].replace('dataref-', ''));
          break;
        }
      }
    });
  }


  // ─── Auto-Ref ──────────────────────────────────────────────
  var SELECTORS_SECTION = [
    '.e-con:not(.e-con .e-con)',
    'section.brxe-section',
    '.brxe-container:not(.brxe-container .brxe-container)',
    '.ct-section',
    '.breakdance-section',
    'body > section, main > section, [role="main"] > section',
    '#content > section, .site-content > section, .page-content > section',
    '#content > div > section'
  ];

  var SELECTORS_BLOCK = SELECTORS_SECTION.concat([
    '.e-con .e-con',
    '[class*="elementor-widget-"]',
    '.brxe-block', '.brxe-div',
    '[class*="brxe-"]:not(section)',
    '.ct-div', '.ct-column',
    '.ct-text-block', '.ct-headline', '.ct-image', '.ct-button',
    '.breakdance-column',
    '[class*="breakdance-"]:not([class*="breakdance-section"])',
    'article', 'aside', 'nav',
    '.wp-block-group', '.wp-block-column', '.wp-block-columns',
    '.wp-block-cover', '.wp-block-media-text',
    '[class*="wp-block-"]'
  ]);

  var SELECTORS_ELEMENT = SELECTORS_SECTION.concat([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'figure', 'figcaption', 'img', 'video', 'audio',
    'a[href]', 'button', 'input', 'select', 'textarea',
    'form', 'table', 'ul', 'ol', 'dl',
    'article', 'aside', 'nav', 'header', 'footer',
    'details', 'summary', 'label', 'legend',
    '[class*="elementor-widget-"]',
    '[class*="brxe-"]',
    '.ct-text-block', '.ct-headline', '.ct-image', '.ct-button',
    '.ct-link-text', '.ct-video', '.ct-icon', '.ct-fancy-image',
    '[class*="breakdance-"]'
  ]);

  var AUTO_REF_DEPTH_MAP = {
    'section': SELECTORS_SECTION,
    'block':   SELECTORS_BLOCK,
    'element': SELECTORS_ELEMENT
  };

  function collectTargetsByDepth(depthMode) {
    var selectorList = AUTO_REF_DEPTH_MAP[depthMode] || SELECTORS_SECTION;
    var candidates = document.querySelectorAll(selectorList.join(', '));
    var targets = [];

    forEachNode(candidates, function (el) {
      if (arrayContainsNode(targets, el)) return;
      if (depthMode !== 'section') {
        targets.push(el);
      } else {
        var dominated = false;
        for (var j = 0; j < targets.length; j++) {
          if (targets[j].contains(el)) { dominated = true; break; }
        }
        if (!dominated) targets.push(el);
      }
    });

    targets.sort(function (a, b) {
      var pos = a.compareDocumentPosition(b);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    return targets;
  }

  var SEMANTIC_TAGS = ['h1','h2','h3','h4','h5','h6','p','blockquote','img','video','audio','button','a','input','select','textarea','form','table','ul','ol','dl','nav','article','aside','header','footer','figure','figcaption','details','summary','label','legend','section'];

  function getElementContext(el) {
    var tag = el.tagName.toLowerCase();
    if (SEMANTIC_TAGS.indexOf(tag) !== -1) return tag;

    var heading = el.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) return heading.tagName.toLowerCase();

    var content = el.querySelector('img, video, audio, button, a, p, form, table, blockquote, figure');
    if (content) return content.tagName.toLowerCase();

    var cls = el.className || '';
    var eMatch = cls.match(/elementor-widget-([\w-]+)/);
    if (eMatch) return eMatch[1];
    var bMatch = cls.match(/brxe-([\w-]+)/);
    if (bMatch) return bMatch[1];
    var oMatch = cls.match(/ct-([\w-]+)/);
    if (oMatch) return oMatch[1];
    var dMatch = cls.match(/breakdance-([\w-]+)/);
    if (dMatch && dMatch[1] !== 'section' && dMatch[1] !== 'column') return dMatch[1];
    var gMatch = cls.match(/wp-block-([\w-]+)/);
    if (gMatch) return gMatch[1];

    return tag;
  }

  function getPageSlug() {
    // Allow manual override
    if (config.pageSlug) return config.pageSlug;

    var path = window.location.pathname;

    if (window.location.protocol === 'file:') {
      var filename = path.split('/').pop() || '';
      var slug = filename
        .replace(/-wireframe-lf\.html$/i, '')
        .replace(/-wireframe-hf\.html$/i, '')
        .replace(/-wireframe\.html$/i, '')
        .replace(/\.html$/i, '');
      return slug || 'home';
    }

    path = path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    return path || 'home';
  }

  // ─── Background luminance detection ────────────────────────
  // Walks up the DOM to find the first non-transparent background,
  // then returns its relative luminance (0=black, 1=white).
  function getEffectiveBgLuminance(el) {
    var current = el;
    while (current && current !== document.documentElement) {
      var bg = window.getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        var match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          var r = parseInt(match[1]) / 255;
          var g = parseInt(match[2]) / 255;
          var b = parseInt(match[3]) / 255;
          // WCAG relative luminance formula
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
      }
      current = current.parentElement;
    }
    return 1; // default: assume light
  }

  function autoRefSections() {
    if (!autoRefEnabled) return;
    var slug = getPageSlug();
    var allSections = collectTargetsByDepth(autoRefDepth);

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
    forEachNode(autoEls, function (el) {
      el.removeAttribute('data-ref');
      el.removeAttribute('data-sdt-auto');
      var labels = el.querySelectorAll('.sdt-ref-link, .sdt-ref-icon, .sdt-ref-tooltip, .sdt-ref-full-label');
      forEachNode(labels, function (label) { label.remove(); });
      delete el[MARKER];
      delete el._sdtIcon;
      delete el._sdtLink;
      delete el._sdtTooltip;
      delete el._sdtFullLabel;
      delete el._sdtDepth;
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
    }

    clearAutoRefs();
    if (autoRefEnabled) {
      convertClassRefs();
      autoRefSections();
    }
    injectLabels();
    resolveLabelOverlaps();
    updateDropdown('depth', 'data-sdt-depth', newDepth, DEPTH_LABELS[newDepth]);
    applyOutlineMode();

    // Rebuild tree panel if open
    if (treeOpen) buildTreePanel();
  }

  function clearOutlines() {
    var outlined = document.querySelectorAll('.sdt-outline-section, .sdt-outline-block');
    forEachNode(outlined, function (el) {
      el.classList.remove('sdt-outline-section');
      el.classList.remove('sdt-outline-block');
      el.classList.remove('sdt-outline-on-dark');
    });
  }

  function applyOutlineClass(el, className) {
    var lum = getEffectiveBgLuminance(el);
    el.classList.add(className);
    setClassState(el, 'sdt-outline-on-dark', lum < 0.40);
  }

  function applyOutlineMode() {
    clearOutlines();
    if (outlineMode === 'off') return;

    var sectionTargets = collectTargetsByDepth('section');
    var sectionLookup = [];
    var blockTargets;

    forEachNode(sectionTargets, function (el) {
      applyOutlineClass(el, 'sdt-outline-section');
      sectionLookup.push(el);
    });

    if (outlineMode !== 'block') return;

    blockTargets = collectTargetsByDepth('block');
    forEachNode(blockTargets, function (el) {
      if (arrayContainsNode(sectionLookup, el)) return;
      applyOutlineClass(el, 'sdt-outline-block');
    });
  }

  function setOutline(newMode) {
    outlineMode = OUTLINE_LABELS[newMode] ? newMode : 'off';
    applyOutlineMode();
    updateDropdown('outline', 'data-sdt-outline', outlineMode, OUTLINE_LABELS[outlineMode]);
  }


  // ─── Label injection ────────────────────────────────────────
  var MARKER = '_sdtLabelled';
  var LABEL_BASE_TOP = 2;
  var LABEL_COLLISION_GAP = 4;
  var LABEL_OFFSET_STEP = 18;
  var LABEL_OFFSET_LIMIT = 6;
  var LABEL_DEPTH_X_STEP = 10;
  var LABEL_DEPTH_X_CAP = 30;
  var LABEL_DEPTH_Y_STEP = 6;
  var LABEL_DEPTH_Y_CAP = 18;

  function getRefDepth(el) {
    var depth = 0;
    var parent = el.parentElement;
    while (parent) {
      if (parent.hasAttribute('data-ref')) depth++;
      parent = parent.parentElement;
    }
    return depth;
  }

  function getDepthInset(depth) {
    var xInset = depth * LABEL_DEPTH_X_STEP;
    if (xInset > LABEL_DEPTH_X_CAP) xInset = LABEL_DEPTH_X_CAP;
    return xInset;
  }

  function getDepthLift(depth) {
    var yInset = depth * LABEL_DEPTH_Y_STEP;
    if (yInset > LABEL_DEPTH_Y_CAP) yInset = LABEL_DEPTH_Y_CAP;
    return yInset;
  }

  function setLabelOffset(el, offset, depth) {
    var top = (LABEL_BASE_TOP + offset) + 'px';
    var xInset = getDepthInset(depth || 0);
    var icon = el._sdtIcon;
    var link = el._sdtLink;
    var tooltip = el._sdtTooltip;
    var fullLabel = el._sdtFullLabel;

    if (icon) icon.style.top = top;
    if (link) {
      link.style.height = offset + 'px';
      link.style.opacity = offset > 0 ? '1' : '0';
    }
    if (tooltip) {
      tooltip.style.top = top;
      tooltip.style.left = (22 + xInset) + 'px';
    }
    if (fullLabel) {
      fullLabel.style.top = top;
      fullLabel.style.left = (2 + xInset) + 'px';
    }
  }

  function resetLabelOffsets() {
    var refs = document.querySelectorAll('[data-ref]');
    forEachNode(refs, function (el) {
      el._sdtDepth = getRefDepth(el);
      setLabelOffset(el, getDepthLift(el._sdtDepth || 0), el._sdtDepth || 0);
    });
  }

  function getActiveLabel(el) {
    if (presentationMode || state === 1) return null;
    return state === 2 ? el._sdtFullLabel : el._sdtIcon;
  }

  function resolveLabelOverlaps() {
    var refs;
    var placed = [];

    resetLabelOffsets();
    if (presentationMode || state === 1) return;

    refs = toArray(document.querySelectorAll('[data-ref]'));
    refs.sort(function (a, b) {
      var pos = a.compareDocumentPosition(b);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    forEachNode(refs, function (el) {
      var anchor = getActiveLabel(el);
      var attempt;
      var rect;
      var collision;
      var i;
      var preferredOffset;

      if (!anchor) return;

      preferredOffset = getDepthLift(el._sdtDepth || 0);

      for (attempt = 0; attempt < LABEL_OFFSET_LIMIT; attempt++) {
        setLabelOffset(el, preferredOffset + (attempt * LABEL_OFFSET_STEP), el._sdtDepth || 0);
        rect = anchor.getBoundingClientRect();
        collision = false;

        for (i = 0; i < placed.length; i++) {
          if (rectsOverlap(rect, placed[i], LABEL_COLLISION_GAP)) {
            collision = true;
            break;
          }
        }

        if (!collision) break;
      }

      placed.push(anchor.getBoundingClientRect());
    });
  }

  function injectLabels() {
    var refs = document.querySelectorAll('[data-ref]');

    forEachNode(refs, function (el) {
      if (el[MARKER]) return;
      el[MARKER] = true;

      var refValue = el.getAttribute('data-ref');
      var elContext = getElementContext(el);

      // Adaptive background class
      var lum = getEffectiveBgLuminance(el);
      var bgClass = lum < 0.40 ? 'sdt-on-dark' : 'sdt-on-light';

      var pos = window.getComputedStyle(el).position;
      if (pos === 'static') el.style.position = 'relative';

      var icon = document.createElement('span');
      icon.className = 'sdt-ref-icon ' + bgClass;
      icon.textContent = '\u24D8';
      icon.title = elContext + ' \u00B7 ' + refValue + ' (click to copy)';
      icon.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
      });

      var tooltip = document.createElement('span');
      tooltip.className = 'sdt-ref-tooltip ' + bgClass;
      tooltip.innerHTML = '<span class="sdt-ref-tag">' + elContext + '</span> \u00B7 ' + refValue;
      tooltip.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
      });

      var fullLabel = document.createElement('span');
      fullLabel.className = 'sdt-ref-full-label ' + bgClass;
      fullLabel.innerHTML = '<span class="sdt-ref-tag">' + elContext + '</span> \u00B7 ' + refValue;
      fullLabel.title = 'Click to copy: ' + refValue;
      fullLabel.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        copyRef(refValue);
      });

      var link = document.createElement('span');
      link.className = 'sdt-ref-link ' + bgClass;

      el.appendChild(link);
      el.appendChild(icon);
      el.appendChild(tooltip);
      el.appendChild(fullLabel);
      el._sdtIcon = icon;
      el._sdtLink = link;
      el._sdtTooltip = tooltip;
      el._sdtFullLabel = fullLabel;
      el._sdtDepth = getRefDepth(el);
      setLabelOffset(el, getDepthLift(el._sdtDepth), el._sdtDepth);
    });
  }


  // ─── Clipboard helper ───────────────────────────────────────
  function copyRef(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () {
        showToast(value);
      }, function () {
        fallbackCopyRef(value);
      });
    } else {
      fallbackCopyRef(value);
    }
  }

  function fallbackCopyRef(value) {
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


  // ─── Dropdown helpers ────────────────────────────────────────
  function closeAllDropdowns() {
    var menus = toolbar.querySelectorAll('.sdt-toolbar__dropdown');
    forEachNode(menus, function (m) { m.classList.remove('sdt-toolbar__dropdown--open'); });
    forEachNode(toolbar.querySelectorAll('[data-sdt-toggle]'), function (trigger) {
      trigger.classList.remove('sdt-toolbar__select--open');
    });
  }

  function toggleDropdown(name) {
    var menu = toolbar.querySelector('[data-sdt-menu="' + name + '"]');
    var trigger = toolbar.querySelector('[data-sdt-toggle="' + name + '"]');
    var isOpen = menu.classList.contains('sdt-toolbar__dropdown--open');
    closeAllDropdowns();
    if (isOpen) return;

    menu.style.top = 'auto';
    menu.style.bottom = 'auto';
    menu.style.left = 'auto';
    menu.style.right = 'auto';
    menu.classList.add('sdt-toolbar__dropdown--open');
    if (trigger) trigger.classList.add('sdt-toolbar__select--open');

    var groupRect = menu.parentElement.getBoundingClientRect();
    var menuRect = menu.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    if (groupRect.top > vh - groupRect.bottom) {
      menu.style.bottom = 'calc(100% + 6px)';
    } else {
      menu.style.top = 'calc(100% + 6px)';
    }

    if (groupRect.left + menuRect.width > vw) {
      menu.style.right = '0';
    } else {
      menu.style.left = '0';
    }
  }

  function shouldTriggerAppearActive(name, activeValue) {
    if (name === 'mode') return String(activeValue) !== '1';
    if (name === 'depth') return String(activeValue) !== 'off';
    if (name === 'outline') return String(activeValue) !== 'off';
    return false;
  }

  function updateDropdown(name, activeAttr, activeValue, label) {
    var trigger = toolbar.querySelector('[data-sdt-toggle="' + name + '"]');
    var valueNode = trigger.querySelector('.sdt-toolbar__value');
    if (valueNode) valueNode.textContent = label;
    setClassState(trigger, 'sdt-toolbar__select--active', shouldTriggerAppearActive(name, activeValue));

    var opts = toolbar.querySelectorAll('[data-sdt-menu="' + name + '"] .sdt-toolbar__option');
    forEachNode(opts, function (opt) {
      setClassState(opt, 'sdt-toolbar__option--active', opt.getAttribute(activeAttr) === String(activeValue));
    });

    closeAllDropdowns();
  }


  // ─── Tree panel ─────────────────────────────────────────────
  var treeOpen = false;
  var treeJumpTimer = null;
  var treeJumpTarget = null;
  var treePanel = document.createElement('div');
  treePanel.className = 'sdt-tree-panel';

  function clearTreeJumpHighlight() {
    if (treeJumpTimer) {
      clearTimeout(treeJumpTimer);
      treeJumpTimer = null;
    }
    if (treeJumpTarget) {
      treeJumpTarget.classList.remove('sdt-tree-jump-highlight');
      treeJumpTarget = null;
    }
  }

  function clearTreeHoverHighlights() {
    var highlighted = document.querySelectorAll('.sdt-tree-highlight');
    forEachNode(highlighted, function (el) {
      el.classList.remove('sdt-tree-highlight');
    });
    if (treePanel) {
      forEachNode(treePanel.querySelectorAll('.sdt-tree-row--active'), function (row) {
        row.classList.remove('sdt-tree-row--active');
      });
    }
  }

  function jumpToTreeTarget(target) {
    clearTreeJumpHighlight();
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    } catch (err) {
      target.scrollIntoView();
    }
    target.classList.add('sdt-tree-jump-highlight');
    treeJumpTarget = target;
    treeJumpTimer = setTimeout(function () {
      if (treeJumpTarget) treeJumpTarget.classList.remove('sdt-tree-jump-highlight');
      treeJumpTarget = null;
      treeJumpTimer = null;
    }, 1400);
  }

  function buildTreePanel() {
    var refs = toArray(document.querySelectorAll('[data-ref]'));
    var depthLabel = autoRefEnabled ? (DEPTH_LABELS[autoRefDepth] || 'Sections') : 'Off';
    var outlineLabel = OUTLINE_LABELS[outlineMode] || 'Off';

    clearTreeHoverHighlights();

    refs.sort(function (a, b) {
      return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    var header = document.createElement('div');
    header.className = 'sdt-tree-panel__header';
    var headerMain = document.createElement('div');
    headerMain.className = 'sdt-tree-panel__header-main';
    var titleWrap = document.createElement('div');
    titleWrap.className = 'sdt-tree-panel__title-wrap';
    var title = document.createElement('span');
    title.className = 'sdt-tree-panel__title';
    title.textContent = 'Element Tree';
    var meta = document.createElement('div');
    meta.className = 'sdt-tree-panel__meta';
    var countMeta = document.createElement('span');
    countMeta.className = 'sdt-tree-panel__meta-item';
    countMeta.textContent = refs.length + ' refs';
    var depthMeta = document.createElement('span');
    depthMeta.className = 'sdt-tree-panel__meta-item';
    depthMeta.textContent = 'Depth: ' + depthLabel;
    var outlineMeta = document.createElement('span');
    outlineMeta.className = 'sdt-tree-panel__meta-item';
    outlineMeta.textContent = 'Outline: ' + outlineLabel;
    meta.appendChild(countMeta);
    meta.appendChild(depthMeta);
    meta.appendChild(outlineMeta);
    titleWrap.appendChild(title);
    titleWrap.appendChild(meta);
    var closeBtn = document.createElement('button');
    closeBtn.className = 'sdt-tree-panel__close';
    closeBtn.type = 'button';
    closeBtn.textContent = '\u00D7';
    closeBtn.title = 'Close tree panel';
    closeBtn.addEventListener('click', function () { toggleTree(); });
    headerMain.appendChild(titleWrap);
    headerMain.appendChild(closeBtn);
    header.appendChild(headerMain);
    var hint = document.createElement('div');
    hint.className = 'sdt-tree-panel__hint';
    hint.textContent = refs.length ? 'Hover to preview the target. Click a row to jump to it.' : 'Select a depth to begin.';
    header.appendChild(hint);

    var body = document.createElement('div');
    body.className = 'sdt-tree-panel__body';

    if (refs.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'sdt-tree-empty';
      empty.textContent = 'No labeled elements yet.';
      body.appendChild(empty);
    } else {
      forEachNode(refs, function (el) {
        var depth = 0;
        var ancestor = el.parentElement;
        while (ancestor) {
          if (ancestor.hasAttribute('data-ref')) depth++;
          ancestor = ancestor.parentElement;
        }

        var row = document.createElement('div');
        row.className = 'sdt-tree-row';
        row.tabIndex = 0;
        row.title = 'Jump to ' + el.getAttribute('data-ref');

        var gutter = document.createElement('div');
        gutter.className = 'sdt-tree-gutter';

        for (var i = 0; i < depth; i++) {
          var indent = document.createElement('span');
          indent.className = 'sdt-tree-indent';
          gutter.appendChild(indent);
        }

        row.appendChild(gutter);

        var content = document.createElement('div');
        content.className = 'sdt-tree-content';

        var tag = document.createElement('span');
        tag.className = 'sdt-tree-tag';
        tag.textContent = getElementContext(el);

        var ref = document.createElement('span');
        ref.className = 'sdt-tree-ref';
        ref.textContent = el.getAttribute('data-ref');
        ref.title = el.getAttribute('data-ref');

        var copyBtn = document.createElement('button');
        copyBtn.className = 'sdt-tree-copy';
        copyBtn.textContent = '\u2398';
        copyBtn.title = 'Copy';
        (function (refVal) {
          copyBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            copyRef(refVal);
          });
        }(el.getAttribute('data-ref')));

        (function (target) {
          row.addEventListener('mouseenter', function () {
            target.classList.add('sdt-tree-highlight');
            row.classList.add('sdt-tree-row--active');
          });
          row.addEventListener('mouseleave', function () {
            target.classList.remove('sdt-tree-highlight');
            row.classList.remove('sdt-tree-row--active');
          });
          row.addEventListener('focus', function () {
            target.classList.add('sdt-tree-highlight');
            row.classList.add('sdt-tree-row--active');
          });
          row.addEventListener('blur', function () {
            target.classList.remove('sdt-tree-highlight');
            row.classList.remove('sdt-tree-row--active');
          });
          row.addEventListener('click', function () {
            jumpToTreeTarget(target);
          });
          row.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
              e.preventDefault();
              jumpToTreeTarget(target);
            }
          });
        }(el));

        content.appendChild(tag);
        content.appendChild(ref);
        row.appendChild(content);
        row.appendChild(copyBtn);
        body.appendChild(row);
      });
    }

    treePanel.innerHTML = '';
    treePanel.appendChild(header);
    treePanel.appendChild(body);
  }

  function toggleTree() {
    treeOpen = !treeOpen;
    setClassState(treePanel, 'sdt-tree-panel--open', treeOpen);
    if (treeOpen) buildTreePanel();
    else {
      clearTreeJumpHighlight();
      clearTreeHoverHighlights();
    }
    var treeBtn = toolbar.querySelector('[data-sdt-toggle-tree]');
    if (treeBtn) {
      var treeValue = treeBtn.querySelector('.sdt-toolbar__value');
      if (treeValue) treeValue.textContent = treeOpen ? '\u229F Tree' : '\u229E Tree';
      setClassState(treeBtn, 'sdt-toolbar__select--active', treeOpen);
    }
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
    resolveLabelOverlaps();
  }


  // ─── Init ───────────────────────────────────────────────────
  function init() {
    document.body.appendChild(shadowHost);
    var shadow = shadowHost.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = shadowCss;
    shadow.appendChild(style);
    shadow.appendChild(toolbar);
    shadow.appendChild(toast);
    shadow.appendChild(treePanel);

    convertClassRefs();
    autoRefSections();
    injectLabels();
    resolveLabelOverlaps();
    applyOutlineMode();

    if (state !== 0) setState(state);
    if (outlineMode !== 'off') setOutline(outlineMode);

    // Apply initial presentation mode (hidden by default — press H to reveal).
    if (presentationMode) {
      shadowHost.style.display = 'none';
      setClassState(document.body, 'sdt-presentation', true);
    }

    // Dropdown toggle clicks
    forEachNode(toolbar.querySelectorAll('[data-sdt-toggle]'), function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown(trigger.getAttribute('data-sdt-toggle'));
      });
    });

    // Mode option clicks
    forEachNode(toolbar.querySelectorAll('[data-sdt-state]'), function (opt) {
      opt.addEventListener('click', function () {
        setState(parseInt(opt.getAttribute('data-sdt-state'), 10));
      });
    });

    // Depth option clicks
    forEachNode(toolbar.querySelectorAll('[data-sdt-depth]'), function (opt) {
      opt.addEventListener('click', function () {
        setDepth(opt.getAttribute('data-sdt-depth'));
      });
    });

    // Outline option clicks
    forEachNode(toolbar.querySelectorAll('[data-sdt-outline]'), function (opt) {
      opt.addEventListener('click', function () {
        setOutline(opt.getAttribute('data-sdt-outline'));
      });
    });

    // Tree panel toggle
    var treeToggleBtn = toolbar.querySelector('[data-sdt-toggle-tree]');
    if (treeToggleBtn) {
      treeToggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleTree();
      });
    }

    // Close dropdowns on click outside (shadow root)
    shadow.addEventListener('click', function (e) {
      if (!closestMatch(e.target, '[data-sdt-toggle]') && !closestMatch(e.target, '.sdt-toolbar__dropdown')) {
        closeAllDropdowns();
      }
    });

    // Close dropdowns on click outside (main document)
    document.addEventListener('click', function (e) {
      if (!shadowHost.contains(e.target) && e.target !== shadowHost) {
        closeAllDropdowns();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAllDropdowns(); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;

      if (e.key === 'h' || e.key === 'H') {
        presentationMode = !presentationMode;
        shadowHost.style.display = presentationMode ? 'none' : '';
        setClassState(document.body, 'sdt-presentation', presentationMode);
      }

      if (e.key === 'l' || e.key === 'L') {
        var MODE_CYCLE = [1, 0, 2]; // Off → Icons → Full
        var nextMode = MODE_CYCLE[(MODE_CYCLE.indexOf(state) + 1) % MODE_CYCLE.length];
        setState(nextMode);
      }

      if (e.key === 'd' || e.key === 'D') {
        var currentIdx = autoRefEnabled ? DEPTH_CYCLE.indexOf(autoRefDepth) : 0;
        var nextIdx = (currentIdx + 1) % DEPTH_CYCLE.length;
        setDepth(DEPTH_CYCLE[nextIdx]);
      }
    });

    window.addEventListener('resize', function () {
      resolveLabelOverlaps();
    });
  }

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
    setOutline: setOutline,
    getOutline: function () { return outlineMode; },
    refresh: function () {
      convertClassRefs();
      autoRefSections();
      injectLabels();
      resolveLabelOverlaps();
      applyOutlineMode();
      if (treeOpen) buildTreePanel();
    }
  };

})();
