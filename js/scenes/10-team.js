/* Scene 10-team: the team. Two members, two values, event line.
   Prefix p-. Entrance animates .js-in; the action animates .p-rev only. */
(function () {
  'use strict';
  TQ.registerScene({
    id: '10-team',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('10-team', 'js-in') +
        ui.title('10-team.title', { cls: 'js-in' }) +
        '<ul class="p-values">' +
          '<li class="p-rev" data-i18n="10-team.v1"></li>' +
          '<li class="p-rev" data-i18n="10-team.v2"></li>' +
        '</ul>';

      function member(n) {
        return '<div class="p-member p-rev">' +
          '<span class="p-member__i">' + ui.icon('user') + '</span>' +
          '<div><p class="p-member__n" data-i18n="10-team.m' + n + 'Name"></p>' +
          ui.label('10-team.m' + n + 'Role') + '</div></div>';
      }

      var visual =
        '<div class="p-members">' + member(1) + member(2) + '</div>' +
        '<div class="p-event p-rev">' +
          '<img src="assets/img/logo-96.webp" width="48" height="48" alt="" decoding="async">' +
          '<div><p class="p-event__t" data-i18n="10-team.event"></p>' +
          '<p class="p-event__c" data-i18n="10-team.challenge"></p></div>' +
        '</div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'even', cls: 'p-layout' });
    },

    enter: function (tl, el, api) {
      api.motion.rise(tl, el.querySelectorAll('.js-in'), 0, { y: 26, stagger: 0.08 });
    },

    action: function (el, api) {
      var tl = gsap.timeline();
      tl.fromTo(el.querySelectorAll('.p-values li'), { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.35, ease: 'power3.out' }, 0.2);
      tl.fromTo(el.querySelectorAll('.p-member, .p-event'), { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.25, ease: 'power3.out' }, 1.3);
      return tl;
    }
  });
})();
