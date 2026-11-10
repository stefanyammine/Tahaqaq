/* Tahaqaq scroll engine.
   One fixed stage + a tall scroll track. One master GSAP timeline, scrubbed by ScrollTrigger,
   one label per scene (label name = scene id), snap to labels (directional).
   Owns: zoom in/out, page turns, rail, top bar, keys, deep links (?scene=, ?p=, ?motion=reduced), reduced motion,
   scene rendering, fit-to-slot, scene actions (played when a scene settles).
   Contract for scene files: site/SCENES.md. */
(function () {
  'use strict';
  var TQ = window.TQ;
  if (!window.gsap || !window.ScrollTrigger) { console.error('[TQ] GSAP not loaded'); return; }
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  // The engine rebuilds itself on resize; ScrollTrigger must not refresh on its own.
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load', ignoreMobileResize: true });

  var ORDER = TQ.ORDER, N = ORDER.length, LAST = N - 1;
  var UNITS = { zoom: 1.6, step: 1.0, out: 1.6 };   // timeline length of each segment
  var DEFAULT_TINT = { '01-note': 'red', '02-text': 'peach', '03-voice': 'purple', '04-media': 'green' };
  var DEFAULT_TURN = {
    '02-text': 'wipe', '03-voice': 'slide', '04-media': 'wipe', '05-verify': 'fade', '06-why': 'slide',
    '07-tech': 'wipe', '08-data': 'shift', '09-model': 'fade', '10-team': 'wipe', '11-path': 'slide'
  };
  var TINTS = ['red', 'peach', 'purple', 'green'];

  var html = document.documentElement;
  var E = TQ.engine = {
    master: null, st: null, labels: [], actions: {}, activeIdx: -1, settledIdx: -1,
    params: null, pendingIdx: null, built: false
  };
  var els = {};

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function sceneEl(id) {
    if (id === '00-hero') return els.heroCopy;
    if (id === '12-close') return els.closeSlot;
    return document.getElementById('scene-' + id);
  }
  function tintOf(id) { var d = TQ.getScene(id); return d.tint || DEFAULT_TINT[id] || null; }
  function turnOf(id) { var d = TQ.getScene(id); return d.turn || DEFAULT_TURN[id] || 'fade'; }

  function makeApi(id, el) {
    return {
      id: id, el: el, lang: TQ.state.lang, rtl: TQ.state.rtl, dir: TQ.motion.dir(),
      reduced: TQ.state.reduced, small: TQ.state.small,
      t: TQ.t, ui: TQ.ui, motion: TQ.motion,
      q: function (sel) { return el.querySelectorAll(sel); },
      q1: function (sel) { return el.querySelector(sel); }
    };
  }

  /* ---------------------------------------------------------------- params */
  function readParams() {
    var p = {};
    try {
      var sp = new URLSearchParams(window.location.search);
      var sc = sp.get('scene');
      if (sc && ORDER.indexOf(sc) !== -1) p.scene = sc;
      var pr = sp.get('p');
      if (pr !== null && !isNaN(parseFloat(pr))) p.p = clamp(parseFloat(pr), 0, 1);
      if (sp.get('motion') === 'reduced') p.reduced = true;
    } catch (e) { /* old browser: no deep link */ }
    return p;
  }

  /* ---------------------------------------------------------------- rail */
  function buildRail() {
    var list = $('.rail__list');
    var h = '';
    for (var i = 0; i < N; i++) {
      h += '<li><button type="button" class="rail__item" data-idx="' + i + '">' +
        '<span class="rail__dot" aria-hidden="true"></span>' +
        '<span class="rail__num" aria-hidden="true">' + (i < 10 ? '0' : '') + i + '</span>' +
        '<span class="rail__label" data-i18n="' + ORDER[i] + '.rail"></span></button></li>';
    }
    list.innerHTML = h;
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.rail__item');
      if (b) goTo(+b.getAttribute('data-idx'));
    });
  }

  function setActive(idx) {
    if (idx === E.activeIdx) return;
    E.activeIdx = idx;
    var items = $$('.rail__item');
    for (var i = 0; i < items.length; i++) {
      if (i === idx) items[i].setAttribute('aria-current', 'step'); else items[i].removeAttribute('aria-current');
      items[i].classList.toggle('is-past', i < idx);
    }
    var id = ORDER[idx];
    var step = TQ.t(id + '.step');
    if (step !== null) { els.step.textContent = step; els.step.setAttribute('data-i18n', id + '.step'); }
    els.count.textContent = (idx < 10 ? '0' : '') + idx + ' / ' + (LAST < 10 ? '0' : '') + LAST;
    var rail = TQ.t(id + '.rail');
    if (rail !== null) els.live.textContent = rail;
    if (idx !== 0) TQ.computer.stopFloat();
  }

  /* ---------------------------------------------------------------- render */
  function renderScenes() {
    for (var i = 1; i < N; i++) {
      var id = ORDER[i], def = TQ.getScene(id);
      var host = id === '12-close' ? els.closeSlot : $('.scene__fit', sceneEl(id));
      var sec = sceneEl(id);
      var tint = tintOf(id);
      if (tint) sec.setAttribute('data-tint', tint); else sec.removeAttribute('data-tint');
      try {
        host.innerHTML = def.render ? def.render(makeApi(id, sec)) : '';
      } catch (err) {
        console.error('[TQ] render failed for', id, err);
        host.innerHTML = '';
      }
    }
    TQ.i18n.apply(document);
  }

  /* Scale a scene down when its content is taller/wider than its slot. */
  function fitScenes() {
    $$('.scene').forEach(function (sec) {
      var fit = $('.scene__fit', sec);
      fit.style.setProperty('--fit', 1);
      var cs = getComputedStyle(sec);
      var availH = sec.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var availW = sec.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var h = fit.scrollHeight, w = fit.scrollWidth;
      var f = Math.min(1, availH / Math.max(1, h), availW / Math.max(1, w));
      if (f < 1) fit.style.setProperty('--fit', Math.max(0.55, f).toFixed(3));
      if (f < 0.75) console.warn('[TQ] scene', sec.getAttribute('data-scene'), 'scaled to', f.toFixed(2), '- content too tall for the slot');
    });
  }

  /* ---------------------------------------------------------------- timeline */
  function sceneEnter(tl, id, at, slot) {
    var def = TQ.getScene(id);
    if (TQ.state.reduced || !def.enter) return;
    var sub = gsap.timeline();
    try { def.enter(sub, sceneEl(id), makeApi(id, sceneEl(id))); } catch (e) { console.error('[TQ] enter failed for', id, e); return; }
    if (sub.duration() > 0) { sub.duration(slot); tl.add(sub, at); }
  }
  function sceneLeave(tl, id, at, slot) {
    var def = TQ.getScene(id);
    if (TQ.state.reduced || !def.leave) return;
    var sub = gsap.timeline();
    try { def.leave(sub, sceneEl(id), makeApi(id, sceneEl(id))); } catch (e) { console.error('[TQ] leave failed for', id, e); return; }
    if (sub.duration() > 0) { sub.duration(slot); tl.add(sub, at); }
  }
  function glowSwap(tl, fromId, toId, at, dur) {
    var a = tintOf(fromId), b = tintOf(toId);
    if (a === b) return;
    if (a && els.glow[a]) tl.to(els.glow[a], { opacity: 0, duration: dur, ease: 'none' }, at);
    if (b && els.glow[b]) tl.fromTo(els.glow[b], { opacity: 0 }, { opacity: 1, duration: dur, ease: 'none', immediateRender: false }, at);
  }

  /* Page turn between two inside scenes. t0 = label of A; B's label = t0 + 1. */
  function addTurn(tl, a, b, t0) {
    var A = sceneEl(a), B = sceneEl(b), d = TQ.motion.dir();
    var turn = TQ.state.reduced ? 'reduced' : turnOf(b);
    sceneLeave(tl, a, t0, 0.3);
    glowSwap(tl, a, b, t0 + 0.2, 0.6);
    if (turn === 'wipe') {
      // a panel slides across the glass, the scenes swap under it, the panel slides away
      tl.fromTo(els.curtain, { xPercent: -101 * d, autoAlpha: 1 }, { xPercent: 0, duration: 0.42, ease: 'power2.inOut', immediateRender: false }, t0 + 0.06);
      tl.set(A, { autoAlpha: 0 }, t0 + 0.48);
      tl.set(B, { autoAlpha: 1 }, t0 + 0.48);
      tl.to(els.curtain, { xPercent: 101 * d, duration: 0.42, ease: 'power2.inOut' }, t0 + 0.5);
      tl.set(els.curtain, { autoAlpha: 0 }, t0 + 0.93);
      sceneEnter(tl, b, t0 + 0.55, 0.45);
    } else if (turn === 'slide') {
      tl.to(A, { yPercent: -7, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t0 + 0.08);
      tl.fromTo(B, { yPercent: 9, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t0 + 0.46);
      sceneEnter(tl, b, t0 + 0.5, 0.5);
    } else if (turn === 'shift') {
      tl.to(A, { xPercent: -8 * d, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t0 + 0.08);
      tl.fromTo(B, { xPercent: 10 * d, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t0 + 0.46);
      sceneEnter(tl, b, t0 + 0.5, 0.5);
    } else if (turn === 'reduced') {
      tl.to(A, { autoAlpha: 0, duration: 0.3, ease: 'none' }, t0 + 0.2);
      tl.fromTo(B, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none', immediateRender: false }, t0 + 0.5);
    } else { // fade (with a small depth change)
      tl.to(A, { scale: 0.97, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t0 + 0.08);
      tl.fromTo(B, { scale: 1.03, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t0 + 0.46);
      sceneEnter(tl, b, t0 + 0.5, 0.5);
    }
  }

  function buildMaster() {
    var reduced = TQ.state.reduced, d = TQ.motion.dir();
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    var C = TQ.computer, Z = C.zoom;
    var labels = [];
    var t = 0;

    // initial states
    html.setAttribute('data-mode', 'hero');
    gsap.set(els.world, { autoAlpha: 0, scale: 1 });
    gsap.set(els.hero, { autoAlpha: 1 });
    gsap.set(els.heroCopy, { autoAlpha: 1, x: 0 });
    gsap.set(els.closeSlot, { autoAlpha: 0 });
    gsap.set(els.stickers, { autoAlpha: 1 });
    gsap.set(els.topbar, { autoAlpha: 1 });
    gsap.set(els.curtain, { autoAlpha: 0, xPercent: -101 });
    TINTS.forEach(function (k) { gsap.set(els.glow[k], { opacity: 0 }); });
    $$('.scene').forEach(function (s) { gsap.set(s, { autoAlpha: 0, xPercent: 0, yPercent: 0, scale: 1 }); });
    C.setScreen('note');
    Z.z = 0; C.measure();

    /* ---- 00-hero -> 01-note : zoom into the glass ---- */
    labels.push(0); tl.addLabel('00-hero', 0);
    var first = sceneEl('01-note');
    if (!reduced) {
      tl.to(els.heroCopy, { x: -70 * d, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, 0.02);
      tl.to(els.hint, { autoAlpha: 0, duration: 0.2 }, 0);
      tl.to(els.topbar, { autoAlpha: 0, duration: 0.25 }, 0.12);
      tl.to(els.stickers, { autoAlpha: 0, duration: 0.3, stagger: 0.04 }, 0.42);
      tl.fromTo(Z, { z: 0 }, { z: 1, duration: 1.15, ease: 'power1.inOut', onUpdate: C.apply, immediateRender: false }, 0);
      // the small screen's content dissolves into the dark glass, then the world appears: a clean crossing
      tl.to(els.noteState, { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 0.8);
      tl.fromTo(els.world, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.36, ease: 'power1.out', immediateRender: false }, 1.0);
      tl.set(html, { attr: { 'data-mode': 'inside' } }, 1.1);
      tl.set(first, { autoAlpha: 1 }, 1.0);
      if (els.glow[tintOf('01-note')]) tl.fromTo(els.glow[tintOf('01-note')], { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 1.0);
      tl.fromTo($$('.rail__item'), { autoAlpha: 0, x: -14 * d }, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.012, ease: 'power2.out', immediateRender: false }, 1.12);
      tl.to(els.topbar, { autoAlpha: 1, duration: 0.25 }, 1.22);
      tl.set(els.hero, { autoAlpha: 0 }, 1.4);
      sceneEnter(tl, '01-note', 1.06, 0.5);
    } else {
      tl.to(els.hero, { autoAlpha: 0, duration: 0.4 }, 0.3);
      tl.to(els.topbar, { autoAlpha: 0, duration: 0.2 }, 0.3);
      tl.fromTo(els.world, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, 0.7);
      tl.set(first, { autoAlpha: 1 }, 0.7);
      if (els.glow[tintOf('01-note')]) tl.set(els.glow[tintOf('01-note')], { opacity: 1 }, 0.7);
      tl.set(html, { attr: { 'data-mode': 'inside' } }, 0.9);
      tl.to(els.topbar, { autoAlpha: 1, duration: 0.2 }, 1.0);
    }
    t = UNITS.zoom; labels.push(t); tl.addLabel('01-note', t);

    /* ---- inside scenes: page turns ---- */
    for (var i = 1; i < LAST - 1; i++) {
      addTurn(tl, ORDER[i], ORDER[i + 1], t);
      t += UNITS.step; labels.push(t); tl.addLabel(ORDER[i + 1], t);
    }

    /* ---- 11-path -> 12-close : zoom back out to the computer ---- */
    var lastIn = sceneEl(ORDER[LAST - 1]);
    var t0 = t;
    sceneLeave(tl, ORDER[LAST - 1], t0, 0.3);
    tl.to(els.topbar, { autoAlpha: 0, duration: 0.22 }, t0 + 0.04);
    tl.set(html, { attr: { 'data-mode': 'hero' } }, t0 + 0.3);
    tl.set(els.noteState, { autoAlpha: 0 }, t0 + 0.05);
    tl.set(els.callState, { autoAlpha: 1 }, t0 + 0.05);
    tl.set(els.hero, { autoAlpha: 1 }, t0 + 0.05);
    var lastTint = tintOf(ORDER[LAST - 1]);
    if (!reduced) {
      tl.to(els.world, { autoAlpha: 0, scale: 1.04, duration: 0.32, ease: 'power1.in' }, t0 + 0.12);
      tl.fromTo(Z, { z: 1 }, { z: 0, duration: 1.1, ease: 'power1.inOut', onUpdate: C.apply, immediateRender: false }, t0 + 0.3);
      tl.to(els.stickers, { autoAlpha: 1, duration: 0.3, stagger: 0.04 }, t0 + 1.0);
      tl.to(els.topbar, { autoAlpha: 1, duration: 0.25 }, t0 + 1.2);
      tl.fromTo(els.closeSlot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, t0 + 0.9);
      sceneEnter(tl, '12-close', t0 + 0.92, 0.66);
      if (!TQ.getScene('12-close').enter) tl.fromTo(els.closeSlot, { x: 40 * d }, { x: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, t0 + 0.92);
    } else {
      tl.to(els.world, { autoAlpha: 0, duration: 0.4 }, t0 + 0.3);
      tl.fromTo(els.closeSlot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, immediateRender: false }, t0 + 0.3);
      tl.to(els.topbar, { autoAlpha: 1, duration: 0.2 }, t0 + 0.8);
    }
    tl.set(lastIn, { autoAlpha: 0 }, t0 + 0.6);
    if (lastTint && els.glow[lastTint]) tl.set(els.glow[lastTint], { opacity: 0 }, t0 + 0.6);
    t = t0 + UNITS.out; labels.push(t); tl.addLabel('12-close', t);
    tl.set({}, {}, t); // pad: the timeline must end exactly on the last label

    E.labels = labels;
    return tl;
  }

  function buildActions() {
    E.actions = {};
    for (var i = 1; i < N; i++) {
      var id = ORDER[i], def = TQ.getScene(id);
      if (!def.action) continue;
      try {
        var a = def.action(sceneEl(id), makeApi(id, sceneEl(id)));
        if (a) { a.pause(0); E.actions[id] = a; if (TQ.state.reduced) a.progress(1); }
      } catch (e) { console.error('[TQ] action failed for', id, e); }
    }
  }

  /* ---------------------------------------------------------------- settle + actions */
  function nearestIdx(time) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < E.labels.length; i++) { var dd = Math.abs(E.labels[i] - time); if (dd < bd) { bd = dd; best = i; } }
    return best;
  }
  function settle(idx, instant) {
    E.settledIdx = idx;
    var id = ORDER[idx];
    for (var k in E.actions) {
      if (k === id) continue;
      if (E.actions[k].progress() > 0 && !TQ.state.reduced) E.actions[k].pause(0);
    }
    var a = E.actions[id];
    if (a) {
      if (instant || TQ.state.reduced) a.pause().progress(1);
      else a.restart();
    }
    if (idx === 0) TQ.computer.startFloat(); else TQ.computer.stopFloat();
    E.pendingIdx = null;
    syncUrl(id);
  }
  function syncUrl(id) {
    try {
      var sp = new URLSearchParams(window.location.search);
      if (id === '00-hero') sp.delete('scene'); else sp.set('scene', id);
      sp.delete('lang'); // English only: an old lang= parameter is dropped
      sp.delete('p');
      var q = sp.toString();
      history.replaceState(null, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
    } catch (e) { /* file:// or blocked history: ignore */ }
  }
  function tick() {
    if (!E.master || !E.built) return;
    var time = E.master.time();
    var idx = nearestIdx(time);
    setActive(idx);
    els.progress.style.transform = 'scaleX(' + (time / E.master.duration()).toFixed(4) + ')';
    if (E.params && E.params.p != null) return; // mid-transition capture: never settle
    // Settled = the timeline has not moved for 8 frames and sits within 1% of a scene of its label.
    // (Scroll positions are whole pixels, so the scrub never lands exactly on the label time.)
    var still = Math.abs(time - E.lastTime) < 1e-4;
    E.lastTime = time;
    E.stillFrames = still ? (E.stillFrames || 0) + 1 : 0;
    var near = Math.abs(time - E.labels[idx]) < 0.03;
    if (E.stillFrames >= 8 && near && E.settledIdx !== idx && !gsap.isTweening(window)) settle(idx, false);
    if (!still && E.settledIdx !== -1 && Math.abs(time - E.labels[E.settledIdx]) > 0.02) E.settledIdx = -1;
    // Safety net: if the page ever rests between two scenes (a missed snap), finish the step.
    if (E.userMoved && E.stillFrames === 45 && !near && !gsap.isTweening(window) && performance.now() > (E.snapBlockUntil || 0)) {
      goTo(stepIdx(E.st && E.st.direction < 0 ? -1 : 1));
    }
  }

  /* ---------------------------------------------------------------- navigation */
  function scrollForTime(time) {
    var st = E.st;
    return st.start + (time / E.master.duration()) * (st.end - st.start);
  }
  function goTo(idx) {
    if (!E.built) return;
    E.userMoved = true; // any navigation ends the deep-link state
    idx = clamp(idx, 0, LAST);
    var from = E.pendingIdx != null ? E.pendingIdx : E.activeIdx;
    E.pendingIdx = idx;
    var dist = Math.abs(idx - from);
    gsap.to(window, {
      scrollTo: { y: scrollForTime(E.labels[idx]), autoKill: false },
      duration: TQ.state.reduced ? 0.3 : clamp(0.7 + 0.18 * dist, 0.8, 2.2),
      ease: 'power2.inOut', overwrite: true,
      onComplete: function () { E.pendingIdx = null; }
    });
  }
  TQ.goTo = function (id) { var i = ORDER.indexOf(id); if (i !== -1) goTo(i); };

  function stepIdx(dir) {
    if (E.pendingIdx != null) return E.pendingIdx + dir;
    var time = E.master.time(), eps = 0.01, i;
    if (dir > 0) { for (i = 0; i < E.labels.length; i++) if (E.labels[i] > time + eps) return i; return LAST; }
    for (i = E.labels.length - 1; i >= 0; i--) if (E.labels[i] < time - eps) return i;
    return 0;
  }
  function onKey(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    var tg = e.target, tag = tg && tg.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (tg && tg.isContentEditable)) return;
    var k = e.key, target = null;
    if (k === ' ' || k === 'Spacebar') {
      if (tag === 'BUTTON' || tag === 'A') return; // let Space press the focused control
      target = stepIdx(e.shiftKey ? -1 : 1);
    } else if (k === 'ArrowDown' || k === 'PageDown' || k === 'ArrowRight') target = stepIdx(1);
    else if (k === 'ArrowUp' || k === 'PageUp' || k === 'ArrowLeft') target = stepIdx(-1);
    else if (k === 'Home') target = 0;
    else if (k === 'End') target = LAST;
    if (target === null) return;
    e.preventDefault();
    goTo(target);
  }

  /* ---------------------------------------------------------------- build / rebuild */
  function teardown() {
    if (E.st) { E.st.kill(); E.st = null; }
    if (E.master) { E.master.kill(); E.master = null; }
    for (var k in E.actions) E.actions[k].kill();
    E.actions = {};
    gsap.killTweensOf(window);
    TQ.computer.resetFloat();
    E.built = false;
  }

  function build(restoreIdx, p) {
    teardown();
    E.restore = { idx: restoreIdx || 0, p: p };
    E.lastBuild = performance.now();
    renderScenes();
    TQ.computer.init();
    fitScenes();
    E.master = buildMaster();
    buildActions();

    var total = E.master.duration();
    var unit = Math.max(520, window.innerHeight);
    var trackH = Math.round(window.innerHeight + total * unit);
    els.track.style.height = trackH + 'px';

    var idx = clamp(restoreIdx || 0, 0, LAST);
    var time = E.labels[idx];
    if (p != null && idx < LAST) time = E.labels[idx] + p * (E.labels[idx + 1] - E.labels[idx]);
    E.snapBlockUntil = performance.now() + 900; // the jump below must never trigger a snap

    var snap = (E.params && E.params.p != null) ? false : {
      snapTo: snapDirectional,
      duration: TQ.state.reduced ? 0.25 : { min: 0.4, max: 1.2 },
      delay: 0.08,
      ease: 'power2.inOut',
      inertia: false
    };
    E.st = ScrollTrigger.create({
      trigger: els.track, start: 'top top', end: 'bottom bottom',
      animation: E.master,
      scrub: TQ.state.reduced ? true : 0.6,
      snap: snap
    });
    E.st.refresh();
    E.built = true;
    E.activeIdx = -1; E.settledIdx = -1; E.pendingIdx = null;

    // land exactly: scroll to the label with the trigger's own mapping, then skip the scrub lag
    window.scrollTo(0, Math.round(scrollForTime(time)));
    ScrollTrigger.update();
    var tw = E.st.getTween && E.st.getTween();
    if (tw) tw.progress(1);
    E.master.time(time, false);
    E.lastTime = time; E.stillFrames = 0;
    setActive(nearestIdx(time));
    if (p == null) settle(idx, true);
  }

  /* Directional snap to scene labels. Inactive until the user first scrolls/touches/presses a key,
     so deep links and rebuilds never drift. */
  function snapDirectional(value, self) {
    if (!E.userMoved || !E.master || performance.now() < (E.snapBlockUntil || 0)) return value;
    var total = E.master.duration(), L = E.labels, i, eps = 0.0015;
    for (i = 0; i < L.length; i++) if (Math.abs(L[i] / total - value) < 0.004) return L[i] / total; // already on a label
    if (self.direction > 0) { for (i = 0; i < L.length; i++) if (L[i] / total >= value - eps) return L[i] / total; return 1; }
    for (i = L.length - 1; i >= 0; i--) if (L[i] / total <= value + eps) return L[i] / total;
    return 0;
  }

  function rebuild() {
    // Before any user input, a rebuild (resize) keeps the deep-linked state, including ?p=.
    if (!E.userMoved && E.restore) { build(E.restore.idx, E.restore.p); return; }
    var idx = E.settledIdx !== -1 ? E.settledIdx : (E.activeIdx !== -1 ? E.activeIdx : 0);
    if (E.params) E.params.p = null;
    build(idx, null);
  }
  TQ.rebuild = rebuild;

  /* ---------------------------------------------------------------- init */
  function init() {
    html.classList.remove('no-js');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    E.params = readParams();
    if (E.params.reduced) TQ.state.forceReduced = true;
    html.classList.toggle('is-reduced', TQ.state.reduced);

    els.hero = $('.hero'); els.heroCopy = $('.hero__copy'); els.closeSlot = $('.close-slot');
    els.hint = $('.hero__hint'); els.stickers = $$('.sticker'); els.topbar = $('.topbar');
    els.world = $('.world'); els.curtain = $('.curtain'); els.track = $('.track');
    els.step = $('.topbar__step'); els.count = $('.world__count'); els.live = $('#tq-live');
    els.progress = $('.world__progress i');
    els.noteState = $('.crt__state--note'); els.callState = $('.crt__state--call');
    els.glow = {};
    TINTS.forEach(function (k) { els.glow[k] = $('.world__glow--' + k); });

    html.setAttribute('lang', 'en'); html.setAttribute('dir', 'ltr');

    buildRail();
    build(E.params.scene ? ORDER.indexOf(E.params.scene) : 0, E.params.p);

    gsap.ticker.add(tick);
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
      window.addEventListener(ev, function () { E.userMoved = true; }, { passive: true, capture: true });
    });
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', function (e) {
      var g = e.target.closest('[data-goto]');
      if (g) { e.preventDefault(); TQ.goTo(g.getAttribute('data-goto')); }
    });

    // Resize: rebuild at once (leading) and again when resizing stops (trailing).
    // Only on touch devices, ignore small height-only changes (the mobile URL bar).
    var lastW = window.innerWidth, lastH = window.innerHeight, rt, coarse = window.matchMedia('(pointer: coarse)');
    window.addEventListener('resize', function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && h === lastH) return;
      if (coarse.matches && w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h;
      clearTimeout(rt);
      if (performance.now() - (E.lastBuild || 0) > 400) rebuild();
      rt = setTimeout(rebuild, 260);
    });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function () {
      html.classList.toggle('is-reduced', TQ.state.reduced);
      rebuild();
    });
    html.setAttribute('data-ready', '');
  }

  function whenReady(fn) {
    var go = function () {
      var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      var timeout = new Promise(function (r) { setTimeout(r, 1500); });
      Promise.race([fonts, timeout]).then(fn, fn);
    };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
  }
  whenReady(init);
})();
