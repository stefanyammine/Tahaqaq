/* Scene 03-voice: Purple, the voice and call agent. Class prefix v-. Text only via "03-voice.*" keys.
   enter(): scrubbed entrance of the title and the stage window (.js-in).
   action(): the handset is picked up, a voice note plays (waveform), the handset is hung up, then the three taps,
   the saved-number check, the avatar and the copy blocks. */
(function () {
  'use strict';

  function waveBars(n, seed) {
    var rnd = TQ.motion.seeded(seed), html = '';
    for (var i = 0; i < n; i++) {
      var env = 0.35 + 0.65 * Math.sin(Math.PI * (i + 0.5) / n);
      html += '<i style="--h:' + Math.round(16 + 84 * env * (0.35 + 0.65 * rnd())) + '%"></i>';
    }
    return html;
  }

  function group(qKey, optKeys, picked, ui, extra) {
    var html = '<div class="v-group"><p class="v-q" data-i18n="' + qKey + '"></p><div class="v-opts">';
    for (var i = 0; i < optKeys.length; i++) {
      html += ui.text(optKeys[i], { cls: 'v-opt' + (i === picked ? ' is-on' : '') });
    }
    return html + (extra || '') + '</div></div>';
  }

  TQ.registerScene({
    id: '03-voice',
    tint: 'purple',
    turn: 'slide',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('03-voice', 'js-in') +
        '<div class="v-head">' +
          ui.avatar('purple', { name: '03-voice.name', colour: '03-voice.colour', width: '150px', cls: 'v-avatar' }) +
          ui.title('03-voice.title', { cls: 'js-in v-title' }) +
        '</div>' +
        '<div class="v-reveal">' +
          ui.defs([['03-voice.whatLabel', '03-voice.what'], ['03-voice.howLabel', '03-voice.how'],
                   ['03-voice.helpsLabel', '03-voice.helps'], ['03-voice.useLabel', '03-voice.use']], { cols: 2 }) +
          ui.status('03-voice.statusLabel', '03-voice.status') +
        '</div>';

      var call =
        '<div class="v-call">' +
          '<div class="v-call__row">' +
            '<span class="v-phone"><b class="v-phone__red"></b>' +
              ui.icon('phone', 'v-phone__on') + ui.icon('phone-down', 'v-phone__off') + '<i class="v-ring"></i></span>' +
            '<span class="v-wave">' + waveBars(34, 7) + '<b class="v-track"><i class="v-head-line"></i></b></span>' +
          '</div>' +
          '<p class="v-meta">' + ui.icon('mic') + '<span data-i18n="03-voice.action"></span></p>' +
        '</div>';

      var taps =
        '<div class="v-taps">' +
          '<p class="tq-label v-cap" data-i18n="03-voice.tapsLabel"></p>' +
          group('03-voice.q1', ['03-voice.q1a', '03-voice.q1b', '03-voice.q1c', '03-voice.q1d'], 0, ui) +
          group('03-voice.q2', ['03-voice.q2a', '03-voice.q2b', '03-voice.q2c', '03-voice.q2d', '03-voice.q2e'], 0, ui) +
          group('03-voice.q3', ['03-voice.q3a', '03-voice.q3b', '03-voice.q3c'], 0, ui,
                ui.text('03-voice.notSure', { cls: 'v-opt v-opt--ns' })) +
        '</div>';

      var saved =
        '<div class="v-saved">' +
          '<p class="v-q" data-i18n="03-voice.savedQ"></p>' +
          '<div class="v-saved__row">' + ui.text('03-voice.savedB', { cls: 'v-opt is-on' }) + ui.icon('arrow') +
            '<span class="v-saved__t" data-i18n="03-voice.savedNew"></span></div>' +
          '<div class="v-saved__row">' + ui.text('03-voice.savedA', { cls: 'v-opt' }) + ui.icon('arrow') +
            '<span class="v-saved__t" data-i18n="03-voice.savedSame"></span></div>' +
        '</div>';

      var det = '<div class="v-det">' + ui.chip('off', '03-voice.detector') + '</div>';

      var visual = '<div class="v-stage js-in">' +
        ui.window({ paper: true, body: call + taps + saved + det, cls: 'v-window', bodyCls: 'v-body' }) +
        '<p class="v-sample">' + ui.sample('03-voice.sample') + '</p></div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'even' });
    },

    enter: function (tl, el, api) {
      var m = api.motion;
      m.rise(tl, el.querySelectorAll('.tq-layout__copy .js-in'), 0, { y: 28, stagger: 0.08 });
      tl.fromTo(el.querySelector('.v-stage'), { autoAlpha: 0, y: 40, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
    },

    action: function (el, api) {
      var bars = el.querySelectorAll('.v-wave i');
      var track = el.querySelector('.v-track');
      var E = 'power3.out';
      var play = 1.7, t0 = 0.9;
      var tl = gsap.timeline();
      // 1) the handset is picked up: it tilts up out of its cradle and a ring spreads
      tl.fromTo(el.querySelector('.v-phone'), { rotation: -28, y: 8 }, { rotation: 0, y: 0, duration: 0.5, ease: 'back.out(1.8)' }, 0.1);
      tl.fromTo(el.querySelector('.v-ring'), { scale: 1, autoAlpha: 0.6 }, { scale: 1.9, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, 0.2);
      // 2) the voice note plays
      tl.fromTo(el.querySelector('.v-wave'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: E }, 0.5);
      tl.fromTo(bars, { opacity: 0.25 }, { opacity: 1, duration: 0.1, stagger: play / bars.length, ease: 'none' }, t0);
      tl.fromTo(track, { xPercent: 0, autoAlpha: 1 }, { xPercent: 100, duration: play, ease: 'none' }, t0);
      tl.to(track, { autoAlpha: 0, duration: 0.15 }, t0 + play);
      tl.fromTo(el.querySelector('.v-meta'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6);
      // 3) the handset is hung up
      tl.fromTo(el.querySelector('.v-phone__red'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, t0 + play + 0.1);
      tl.fromTo(el.querySelector('.v-phone__on'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15 }, t0 + play + 0.1);
      tl.fromTo(el.querySelector('.v-phone__off'), { autoAlpha: 0, rotation: -40 }, { autoAlpha: 1, rotation: 0, duration: 0.3, ease: 'back.out(1.8)' }, t0 + play + 0.1);
      // 4) the three taps, the saved-number check, the detector line
      var at = t0 + play + 0.5;
      tl.fromTo(el.querySelector('.v-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, at);
      tl.fromTo(el.querySelectorAll('.v-group'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: E }, at);
      tl.fromTo(el.querySelector('.v-saved'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: E }, at + 0.5);
      tl.fromTo(el.querySelector('.v-det'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, at + 0.8);
      // 5) the avatar appears, then the copy blocks
      tl.fromTo(el.querySelector('.v-avatar'), { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, at + 0.7);
      tl.fromTo(el.querySelectorAll('.v-reveal .tq-def, .v-reveal .tq-status'), { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: E }, at + 1.0);
      return tl;
    }
  });
})();
