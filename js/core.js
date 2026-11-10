/* Tahaqaq core: namespace, scene registry, i18n, shared UI builders, motion helpers.
   Classic script (no modules). Loaded after content.js and before the scene files.
   The site is English only: text comes from window.TQ_CONTENT.en.
   Contract for scene authors: see site/SCENES.md. */
(function () {
  'use strict';

  var TQ = window.TQ = window.TQ || {};

  /* Fixed scene ids and order (PLAN §Scenes). */
  TQ.ORDER = ['00-hero', '01-note', '02-text', '03-voice', '04-media', '05-verify',
    '06-why', '07-tech', '08-data', '09-model', '10-team', '11-path', '12-close'];


  var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqSmall = window.matchMedia('(max-width: 800px)');
  /* The site is English only (PLAN, CHANGE 1): lang is fixed, rtl is always false. */
  TQ.state = {
    lang: 'en',
    rtl: false,
    get reduced() { return mqReduced.matches || TQ.state.forceReduced === true; },
    get small() { return mqSmall.matches; },
    forceReduced: false
  };

  /* ---------------------------------------------------------------------------
     Scene registry
     TQ.registerScene({ id, tint, turn, render(api), enter(tl, el, api), leave(tl, el, api), action(el, api) })
     --------------------------------------------------------------------------- */
  TQ._scenes = {};
  TQ.registerScene = function (def) {
    if (!def || TQ.ORDER.indexOf(def.id) === -1) {
      console.error('[TQ] registerScene: unknown scene id', def && def.id);
      return;
    }
    if (TQ._scenes[def.id]) console.warn('[TQ] registerScene: scene registered twice', def.id);
    TQ._scenes[def.id] = def;
  };
  TQ.getScene = function (id) { return TQ._scenes[id] || { id: id }; };

  /* ---------------------------------------------------------------------------
     i18n
     --------------------------------------------------------------------------- */
  var missing = {};
  TQ.t = function (key) {
    var dict = (window.TQ_CONTENT || {}).en || {};
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    if (!missing[key]) { missing[key] = 1; console.warn('[TQ] missing content key:', key); }
    return null;
  };
  TQ.i18n = {
    /* Fill every [data-i18n] (textContent), [data-i18n-alt] (alt) and [data-i18n-aria] (aria-label) under root. */
    apply: function (root) {
      root = root || document;
      var nodes = root.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        var v = TQ.t(nodes[i].getAttribute('data-i18n'));
        if (v !== null) nodes[i].textContent = v; else nodes[i].setAttribute('data-i18n-missing', '');
      }
      var alts = root.querySelectorAll('[data-i18n-alt]');
      for (i = 0; i < alts.length; i++) { v = TQ.t(alts[i].getAttribute('data-i18n-alt')); if (v !== null) alts[i].setAttribute('alt', v); }
      var arias = root.querySelectorAll('[data-i18n-aria]');
      for (i = 0; i < arias.length; i++) { v = TQ.t(arias[i].getAttribute('data-i18n-aria')); if (v !== null) arias[i].setAttribute('aria-label', v); }
    }
  };

  /* ---------------------------------------------------------------------------
     UI builders. Every builder returns an HTML string. Text is never written here:
     elements carry data-i18n keys and are filled by TQ.i18n.apply() after render.
     --------------------------------------------------------------------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cls(base, extra) { return extra ? base + ' ' + extra : base; }
  function k(key) { return ' data-i18n="' + esc(key) + '"'; }

  var CHIP_ICON = { match: 'check', nomatch: 'cross', unknown: 'question', off: 'plug-off', stop: 'stop', call: 'phone' };

  var ui = TQ.ui = {
    esc: esc,
    /* <svg> icon from the sprite in index.html. names: see SCENES.md */
    icon: function (name, extra) {
      return '<svg class="' + cls('tq-icon', extra) + '" aria-hidden="true" focusable="false"><use href="#i-' + esc(name) + '"></use></svg>';
    },
    /* plain text element */
    text: function (key, opt) {
      opt = opt || {};
      var tag = opt.tag || 'span';
      return '<' + tag + (opt.cls ? ' class="' + esc(opt.cls) + '"' : '') + k(key) + '></' + tag + '>';
    },
    /* pitch-step label, from "<sceneId>.step" */
    eyebrow: function (sceneId, extra) { return '<p class="' + cls('tq-eyebrow', extra) + '"' + k(sceneId + '.step') + '></p>'; },
    /* headline. opt: { xl, tag, em: key (italic second part), cls } */
    title: function (key, opt) {
      opt = opt || {};
      var tag = opt.tag || 'h2';
      var inner = '<span' + k(key) + '></span>' + (opt.em ? ' <em' + k(opt.em) + '></em>' : '');
      return '<' + tag + ' class="' + cls('tq-title' + (opt.xl ? ' tq-title--xl' : ''), opt.cls) + '">' + inner + '</' + tag + '>';
    },
    lead: function (key, extra) { return '<p class="' + cls('tq-lead', extra) + '"' + k(key) + '></p>'; },
    body: function (key, extra) { return '<p class="' + cls('tq-body', extra) + '"' + k(key) + '></p>'; },
    label: function (key, extra) { return '<p class="' + cls('tq-label', extra) + '"' + k(key) + '></p>'; },
    quote: function (key, extra) { return '<blockquote class="' + cls('tq-quote', extra) + '"' + k(key) + '></blockquote>'; },
    rule: function (tint) { return '<hr class="tq-rule' + (tint ? ' tq-rule--tint' : '') + '">'; },
    /* source + limit lines (both optional keys) */
    source: function (sourceKey, limitKey, extra) {
      return '<p class="' + cls('tq-source', extra) + '">' +
        (sourceKey ? '<b' + k(sourceKey) + '></b>' : '') +
        (sourceKey && limitKey ? '<br>' : '') +
        (limitKey ? '<span' + k(limitKey) + '></span>' : '') + '</p>';
    },
    /* definition list. pairs: [[labelKey, textKey], ...]. opt: { cols: 2, cls } */
    defs: function (pairs, opt) {
      opt = opt || {};
      var html = '<dl class="' + cls('tq-defs' + (opt.cols === 2 ? ' tq-defs--2col' : ''), opt.cls) + '">';
      for (var i = 0; i < pairs.length; i++) {
        html += '<div class="tq-def"><dt' + k(pairs[i][0]) + '></dt><dd' + k(pairs[i][1]) + '></dd></div>';
      }
      return html + '</dl>';
    },
    /* "Sample" tag (required on every illustration) */
    sample: function (key, extra) { return '<span class="' + cls('tq-sample', extra) + '"' + k(key) + '></span>'; },
    /* retro-OS window. opt: { title: key, body: html, paper: bool, sample: key, cls, bodyCls } */
    window: function (opt) {
      return '<div class="' + cls('tq-window' + (opt.paper ? ' tq-window--paper' : '') + (opt.title ? '' : ' tq-window--untitled'), opt.cls) + '">' +
        '<div class="tq-window__bar"><span class="tq-window__box"></span>' +
        (opt.title ? '<span class="tq-window__title"' + k(opt.title) + '></span>' : '') +
        (opt.sample ? '<span class="tq-window__meta">' + ui.sample(opt.sample) + '</span>' : '') +
        '</div><div class="' + cls('tq-window__body', opt.bodyCls) + '">' + (opt.body || '') + '</div></div>';
    },
    /* result chip. state: match | nomatch | unknown | off | stop | call. key: one of the allowed wordings */
    chip: function (state, key, extra) {
      if (!CHIP_ICON[state]) console.warn('[TQ] chip: unknown state', state);
      return '<span class="' + cls('tq-chip tq-chip--' + esc(state), extra) + '">' + ui.icon(CHIP_ICON[state] || 'dot') + '<span' + k(key) + '></span></span>';
    },
    /* small neutral tag (e.g. a record source) */
    tag: function (key, icon, extra) { return '<span class="' + cls('tq-tag', extra) + '">' + (icon ? ui.icon(icon) : '') + '<span' + k(key) + '></span></span>'; },
    /* statistic. opt: { value, text, source, limit, cls } (keys) */
    stat: function (opt) {
      return '<div class="' + cls('tq-stat', opt.cls) + '">' +
        '<p class="tq-stat__value"' + k(opt.value) + '></p>' +
        (opt.text ? '<p class="tq-stat__text"' + k(opt.text) + '></p>' : '') +
        (opt.source || opt.limit ? '<div class="tq-stat__src">' + ui.source(opt.source, opt.limit) + '</div>' : '') +
        '</div>';
    },
    /* honest status block */
    status: function (labelKey, textKey, extra) {
      return '<div class="' + cls('tq-status', extra) + '">' + ui.icon('half') +
        '<p><span class="tq-status__label"' + k(labelKey) + '></span><span class="tq-status__text"' + k(textKey) + '></span></p></div>';
    },
    /* avatar stage. colour: peach | purple | green. opt: { name: key, colour: key, width: css length, cls } */
    avatar: function (colour, opt) {
      opt = opt || {};
      var c = esc(colour);
      return '<figure class="' + cls('tq-avatar', opt.cls) + '"' + (opt.width ? ' style="--avatar-w-default:' + esc(opt.width) + '"' : '') + '>' +
        '<span class="tq-avatar__glow"></span>' +
        '<img class="tq-avatar__img" src="assets/img/avatar-' + c + '-cutout.webp" data-fallback="assets/img/avatar-' + c + '-tile.webp" alt=""' +
        (opt.name ? ' data-i18n-alt="' + esc(opt.name) + '"' : '') + ' width="544" height="640" decoding="async">' +
        '<span class="tq-avatar__floor"></span>' +
        (opt.name ? '<figcaption class="tq-avatar__plate"><b' + k(opt.name) + '></b>' + (opt.colour ? '<span' + k(opt.colour) + '></span>' : '') + '</figcaption>' : '') +
        '</figure>';
    },
    /* list with icons. keys: [key, ...]. opt: { icon: 'check'|'cross'|'dot'|..., no: bool (red icons), cls } */
    list: function (keys, opt) {
      opt = opt || {};
      var html = '<ul class="' + cls('tq-list' + (opt.no ? ' tq-list--no' : ''), opt.cls) + '">';
      for (var i = 0; i < keys.length; i++) html += '<li>' + ui.icon(opt.icon || 'dot') + '<span' + k(keys[i]) + '></span></li>';
      return html + '</ul>';
    },
    /* flow row. items: [{ n: '01' (literal), t: key, d: key }, ...] */
    steps: function (items, extra) {
      var html = '<ol class="' + cls('tq-steps', extra) + '">';
      for (var i = 0; i < items.length; i++) {
        if (i) html += '<li class="tq-steps__arrow" aria-hidden="true">' + ui.icon('arrow') + '</li>';
        html += '<li class="tq-step">' + (items[i].n ? '<span class="tq-step__n">' + esc(items[i].n) + '</span>' : '') +
          '<span class="tq-step__t"' + k(items[i].t) + '></span>' + (items[i].d ? '<span class="tq-step__d"' + k(items[i].d) + '></span>' : '') + '</li>';
      }
      return html + '</ol>';
    },
    panel: function (html, opt) { opt = opt || {}; return '<div class="' + cls('tq-panel' + (opt.tint ? ' tq-panel--tint' : ''), opt.cls) + '">' + html + '</div>'; },
    /* two-column scene layout. opt: { copy: html, visual: html, variant: 'even'|'wide-copy'|'stack', cls } */
    layout: function (opt) {
      return '<div class="' + cls('tq-layout' + (opt.variant ? ' tq-layout--' + esc(opt.variant) : ''), opt.cls) + '">' +
        '<div class="tq-layout__copy">' + (opt.copy || '') + '</div>' +
        '<div class="tq-layout__visual">' + (opt.visual || '') + '</div></div>';
    }
  };

  /* Missing image -> fallback (cut-out -> sticker tile). Works for any img[data-fallback]. */
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG' && el.getAttribute('data-fallback') && !el.__tqFell) {
      el.__tqFell = true;
      el.src = el.getAttribute('data-fallback');
    }
  }, true);

  /* ---------------------------------------------------------------------------
     Motion tokens and helpers (GSAP). Only transform and opacity animate.
     --------------------------------------------------------------------------- */
  TQ.motion = {
    ease: { out: 'power3.out', inOut: 'power2.inOut', in: 'power2.in', back: 'back.out(1.6)', none: 'none' },
    dur: { fast: 0.25, base: 0.5, slow: 0.8 },
    stagger: 0.06,
    /* always +1 (English, left to right); kept so offsets read as "towards the inline end" */
    dir: function () { return 1; },
    /* enter helper: fade + rise. returns tl */
    rise: function (tl, targets, at, o) {
      o = o || {};
      return tl.fromTo(targets, { autoAlpha: 0, y: o.y == null ? 24 : o.y },
        { autoAlpha: 1, y: 0, duration: o.duration || 0.6, ease: o.ease || 'power3.out', stagger: o.stagger == null ? 0.06 : o.stagger }, at || 0);
    },
    /* enter helper: fade + slide in from the left */
    slideIn: function (tl, targets, at, o) {
      o = o || {};
      return tl.fromTo(targets, { autoAlpha: 0, x: -(o.x == null ? 32 : o.x) * TQ.motion.dir() },
        { autoAlpha: 1, x: 0, duration: o.duration || 0.6, ease: o.ease || 'power3.out', stagger: o.stagger == null ? 0.06 : o.stagger }, at || 0);
    },
    /* enter helper: pop (scale) */
    pop: function (tl, targets, at, o) {
      o = o || {};
      return tl.fromTo(targets, { autoAlpha: 0, scale: o.from || 0.85 },
        { autoAlpha: 1, scale: 1, duration: o.duration || 0.5, ease: o.ease || 'back.out(1.6)', stagger: o.stagger == null ? 0.06 : o.stagger }, at || 0);
    },
    /* leave helper: fade + lift */
    lift: function (tl, targets, at, o) {
      o = o || {};
      return tl.to(targets, { autoAlpha: 0, y: o.y == null ? -16 : o.y, duration: o.duration || 0.4, ease: o.ease || 'power2.in', stagger: o.stagger == null ? 0.03 : o.stagger }, at || 0);
    },
    /* deterministic pseudo-random numbers (stable screenshots) */
    seeded: function (seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; },
    /* split an element's text into word spans. returns the spans */
    splitWords: function (el) {
      var words = (el.textContent || '').split(/(\s+)/);
      el.textContent = '';
      var out = [];
      for (var i = 0; i < words.length; i++) {
        if (!words[i]) continue;
        if (/^\s+$/.test(words[i])) { el.appendChild(document.createTextNode(words[i])); continue; }
        var s = document.createElement('span');
        s.className = 'tq-word'; s.style.display = 'inline-block'; s.textContent = words[i];
        el.appendChild(s); out.push(s);
      }
      return out;
    }
  };
})();
