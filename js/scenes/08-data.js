/* Scene 08-data: official data. Used today, not connected, asked for in the 90 days.
   Prefix d-. Entrance animates .js-in; the action animates .d-rev only. */
(function () {
  'use strict';

  function used(ui, n) {
    var p = '08-data.u' + n;
    return '<li class="d-card d-rev">' +
      '<span class="d-card__t" data-i18n="' + p + '"></span>' +
      '<span class="d-card__n" data-i18n="' + p + 'Note"></span>' +
      '<span class="d-card__l" data-i18n="' + p + 'Limit"></span></li>';
  }

  TQ.registerScene({
    id: '08-data',

    render: function (api) {
      var ui = api.ui, i, cards = '', asks = [];
      for (i = 1; i <= 6; i++) cards += used(ui, i);
      for (i = 1; i <= 5; i++) asks.push('08-data.a' + i);

      var copy =
        ui.eyebrow('08-data', 'js-in') +
        ui.title('08-data.title', { cls: 'js-in' }) +
        '<p class="d-rule d-rev">' + ui.icon('info') + '<span data-i18n="08-data.rule"></span></p>' +
        '<div class="d-not d-rev">' +
          ui.label('08-data.notLabel') +
          '<ul class="d-nots">' +
            '<li><span class="d-nots__t" data-i18n="08-data.n1"></span>' +
              ui.tag('08-data.n1Status', 'plug-off') +
              '<span class="d-nots__l" data-i18n="08-data.n1Limit"></span></li>' +
            '<li><span class="d-nots__t" data-i18n="08-data.n2"></span>' +
              ui.tag('08-data.n2Status', 'plug-off') + '</li>' +
          '</ul>' +
        '</div>';

      var visual =
        '<div class="d-used d-rev">' + ui.label('08-data.usedLabel') + '</div>' +
        '<ul class="d-cards">' + cards + '</ul>' +
        '<div class="d-ask d-rev tq-hide-sm">' + ui.label('08-data.askLabel') +
          ui.list(asks, { icon: 'arrow', cls: 'd-asklist' }) + '</div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'wide-copy', cls: 'd-layout' });
    },

    enter: function (tl, el, api) {
      api.motion.rise(tl, el.querySelectorAll('.js-in'), 0, { y: 26, stagger: 0.08 });
    },

    action: function (el, api) {
      var tl = gsap.timeline();
      tl.fromTo(el.querySelectorAll('.d-rev'), { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.16, ease: 'power3.out' }, 0.2);
      return tl;
    }
  });
})();
