/* Scene 01-note: the voice note (REFERENCE IMPLEMENTATION, see SCENES.md).
   Shows the pattern every scene follows:
   - render(api)   returns HTML built from TQ.ui components; all text via data-i18n keys "01-note.*".
   - enter(tl, el) scrubbed entrance (engine fits it into its slot). Animates: .js-in elements.
   - action(el)    time-based timeline, played when the scene settles. Animates: other elements only.
   Class prefix for this scene: n-  (CSS in css/scenes/01-note.css, scoped to [data-scene="01-note"]). */
(function () {
  'use strict';

  function waveBars(n, seed) {
    var rnd = TQ.motion.seeded(seed), html = '';
    for (var i = 0; i < n; i++) {
      var env = 0.35 + 0.65 * Math.sin(Math.PI * (i + 0.5) / n);
      html += '<i style="--h:' + Math.round(14 + 86 * env * (0.35 + 0.65 * rnd())) + '%"></i>';
    }
    return html;
  }

  TQ.registerScene({
    id: '01-note',
    tint: 'red',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('01-note', 'js-in') +
        ui.label('01-note.wordsLabel', 'n-label js-in') +
        ui.quote('01-note.words', 'n-words js-in') +
        '<p class="n-tension"' + ' data-i18n="01-note.tension"></p>' +
        '<div class="n-core">' +
          '<img class="n-core__logo" src="assets/img/logo-96.webp" width="96" height="96" alt="" decoding="async">' +
          '<p class="n-core__text" data-i18n="01-note.core"></p>' +
        '</div>';

      var chat =
        '<div class="n-chat" aria-hidden="true">' +
          '<div class="n-bubble">' +
            '<span class="n-play">' + ui.icon('play', 'n-play__on') + ui.icon('pause', 'n-play__off') + '</span>' +
            '<span class="n-wave">' + waveBars(44, 11) + '<b class="n-track"><i class="n-head"></i></b></span>' +
          '</div>' +
          '<p class="n-meta">' + ui.icon('mic') + '<span data-i18n="01-note.meta"></span></p>' +
          '<div class="n-input"><span></span>' + ui.icon('mic') + '</div>' +
        '</div>';

      var visual =
        '<div class="n-visual js-in">' +
          ui.window({ title: '01-note.from', paper: true, body: chat, cls: 'n-window' }) +
          '<p class="n-sample">' + ui.sample('01-note.sample') + '</p>' +
        '</div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'even' });
    },

    /* Scrubbed entrance (during the zoom). Only .js-in elements. */
    enter: function (tl, el, api) {
      var m = api.motion;
      m.rise(tl, el.querySelectorAll('.tq-layout__copy .js-in'), 0, { y: 28, stagger: 0.08 });
      tl.fromTo(el.querySelector('.n-visual'), { autoAlpha: 0, y: 40, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
    },

    /* Played once the scene settles: the note plays, the words light up, then the core line. */
    action: function (el, api) {
      var words = api.motion.splitWords(el.querySelector('.n-words'));
      var bars = el.querySelectorAll('.n-wave i');
      var tl = gsap.timeline();
      var play = 2.8;
      tl.fromTo(words, { opacity: 0.16 }, { opacity: 1, duration: 0.35, stagger: play / Math.max(1, words.length), ease: 'none' }, 0.2);
      tl.fromTo(bars, { opacity: 0.28 }, { opacity: 1, duration: 0.12, stagger: play / bars.length, ease: 'none' }, 0.2);
      // playhead: the track is as wide as the wave; moving it by 100% of its width carries the head across
      tl.fromTo(el.querySelector('.n-track'), { xPercent: 0, autoAlpha: 1 },
        { xPercent: 100 * api.dir, duration: play, ease: 'none' }, 0.2);
      tl.to(el.querySelector('.n-track'), { autoAlpha: 0, duration: 0.2 }, 0.2 + play);
      tl.fromTo(el.querySelector('.n-play__on'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15 }, 0.1);
      tl.fromTo(el.querySelector('.n-play__off'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.1);
      tl.to(el.querySelector('.n-play__on'), { autoAlpha: 1, duration: 0.15 }, 0.2 + play);
      tl.to(el.querySelector('.n-play__off'), { autoAlpha: 0, duration: 0.15 }, 0.2 + play);
      tl.fromTo(el.querySelector('.n-tension'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.4 + play);
      tl.fromTo(el.querySelector('.n-core'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.0 + play);
      return tl;
    }
  });
})();
