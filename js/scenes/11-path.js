/* Scene 11-path: the 90-day pathway. Three phases with go / no-go gates. Plan targets, not results.
   Prefix r-. Entrance animates .js-in; the action animates .r-rev and .r-line only. */
(function () {
  'use strict';
  TQ.registerScene({
    id: '11-path',

    render: function (api) {
      var ui = api.ui, i, phases = '';
      for (i = 1; i <= 3; i++) {
        var p = '11-path.p' + i;
        phases +=
          '<li class="r-phase r-rev">' +
            '<span class="r-dot"></span>' +
            ui.label(p + 'Days', 'r-days') +
            '<h3 class="r-name" data-i18n="' + p + 'Name"></h3>' +
            '<p class="r-text" data-i18n="' + p + '"></p>' +
            '<div class="r-gate">' + ui.icon('gate') +
              '<div>' + ui.label('11-path.gateLabel') +
              '<p data-i18n="' + p + 'Gate"></p></div></div>' +
          '</li>';
      }

      var copy =
        ui.eyebrow('11-path', 'js-in') +
        ui.title('11-path.title', { cls: 'js-in' }) +
        '<p class="r-question js-in" data-i18n="11-path.question"></p>';

      var visual =
        '<div class="r-timeline"><span class="r-line"></span>' +
        '<ol class="r-phases">' + phases + '</ol></div>' +
        '<p class="r-measure r-rev">' + ui.icon('info') + '<span data-i18n="11-path.measure"></span></p>';

      return ui.layout({ copy: copy, visual: visual, variant: 'stack', cls: 'r-layout' });
    },

    enter: function (tl, el, api) {
      api.motion.rise(tl, el.querySelectorAll('.js-in'), 0, { y: 26, stagger: 0.08 });
    },

    action: function (el, api) {
      var tl = gsap.timeline();
      tl.fromTo(el.querySelector('.r-line'), { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: 'power2.inOut', transformOrigin: '0 50%' }, 0.1);
      tl.fromTo(el.querySelectorAll('.r-phase'), { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.7, ease: 'power3.out' }, 0.2);
      tl.fromTo(el.querySelector('.r-measure'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 2.4);
      return tl;
    }
  });
})();
