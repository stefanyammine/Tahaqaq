/* Scene 09-model: business model. Free for residents; funded or licensed; target partners by role.
   Prefix b-. Entrance animates .js-in; the action animates .b-rev only. */
(function () {
  'use strict';
  TQ.registerScene({
    id: '09-model',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('09-model', 'js-in') +
        ui.title('09-model.title', { cls: 'js-in' }) +
        '<div class="b-free b-rev">' +
          '<span class="b-free__i">' + ui.icon('users') + '</span>' +
          '<div>' + ui.label('09-model.freeLabel') + '<p class="b-free__t" data-i18n="09-model.free"></p></div>' +
        '</div>' +
        '<div class="b-cost b-rev tq-hide-sm">' +
          '<p class="b-cost__t" data-i18n="09-model.cost"></p>' +
          ui.source('09-model.costSource') +
        '</div>';

      function opt(n, icon) {
        return '<div class="b-opt b-rev">' + ui.icon(icon) +
          ui.label('09-model.fund' + n + 'Label') +
          '<p class="b-opt__t" data-i18n="09-model.fund' + n + '"></p></div>';
      }

      var partners = '';
      for (var i = 1; i <= 4; i++) partners += '<li data-i18n="09-model.p' + i + '"></li>';

      var visual =
        '<div class="b-opts">' + opt(1, 'flag') + opt(2, 'bank') + '</div>' +
        ui.panel(
          '<div class="b-phead">' + ui.label('09-model.partnersLabel') +
            ui.tag('09-model.partnersNote', 'dot', 'b-none') + '</div>' +
          '<ul class="b-partners">' + partners + '</ul>' +
          '<p class="b-reach tq-hide-sm">' + ui.icon('arrow') + '<span data-i18n="09-model.reach"></span></p>',
          { cls: 'b-panel b-rev' });

      return ui.layout({ copy: copy, visual: visual, variant: 'even', cls: 'b-layout' });
    },

    enter: function (tl, el, api) {
      api.motion.rise(tl, el.querySelectorAll('.js-in'), 0, { y: 26, stagger: 0.08 });
    },

    action: function (el, api) {
      var tl = gsap.timeline();
      tl.fromTo(el.querySelectorAll('.b-rev'), { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.25, ease: 'power3.out' }, 0.2);
      return tl;
    }
  });
})();
