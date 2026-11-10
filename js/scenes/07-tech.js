/* Scene 07-tech: how it works. Flow, AI does / does not, measured results with the negative result.
   Prefix h-. Entrance animates .js-in; the action animates .h-rev only. */
(function () {
  'use strict';
  TQ.registerScene({
    id: '07-tech',

    render: function (api) {
      var ui = api.ui;

      var flow = ui.steps([
        { n: '01', t: '07-tech.f1', d: '07-tech.f1Note' },
        { n: '02', t: '07-tech.f2', d: '07-tech.f2Note' },
        { n: '03', t: '07-tech.f3', d: '07-tech.f3Note' },
        { n: '04', t: '07-tech.f4', d: '07-tech.f4Note' }
      ], 'h-steps');

      var does =
        '<div class="h-col">' + ui.label('07-tech.doesLabel') +
        ui.list(['07-tech.does1', '07-tech.does2', '07-tech.does3'], { icon: 'check' }) + '</div>';
      var not =
        '<div class="h-col">' + ui.label('07-tech.notLabel') +
        ui.list(['07-tech.not1', '07-tech.not2', '07-tech.not3', '07-tech.not4'], { icon: 'cross', no: true }) + '</div>';

      var results =
        ui.label('07-tech.resultsLabel', 'h-reslabel') +
        '<div class="h-results">' +
          ui.stat({ value: '07-tech.r1Value', text: '07-tech.r1' }) +
          ui.stat({ value: '07-tech.r2Value', text: '07-tech.r2' }) +
          ui.stat({ value: '07-tech.r3Value', text: '07-tech.r3' }) +
        '</div>' +
        '<div class="h-neg">' +
          '<span class="h-neg__v" data-i18n="07-tech.negValue"></span>' +
          '<span class="h-neg__t" data-i18n="07-tech.neg"></span>' +
        '</div>' +
        '<div class="h-ressrc">' + ui.source('07-tech.resultsSource', '07-tech.resultsLimit') + '</div>';

      var copy =
        ui.eyebrow('07-tech', 'js-in') +
        ui.title('07-tech.title', { cls: 'js-in' }) +
        '<div class="h-flow js-in">' + flow + '</div>' +
        '<p class="h-model h-rev">' + ui.icon('chip') + '<span data-i18n="07-tech.model"></span></p>';

      var visual =
        '<div class="h-grid">' +
          ui.panel(does + not, { cls: 'h-ai h-rev' }) +
          ui.panel(results, { cls: 'h-res h-rev', tint: false }) +
        '</div>' +
        '<p class="h-privacy h-rev tq-hide-sm">' + ui.icon('device') + '<span data-i18n="07-tech.privacy"></span></p>';

      return ui.layout({ copy: copy, visual: visual, variant: 'stack', cls: 'h-layout' });
    },

    enter: function (tl, el, api) {
      api.motion.rise(tl, el.querySelectorAll('.js-in'), 0, { y: 26, stagger: 0.08 });
    },

    action: function (el, api) {
      var tl = gsap.timeline();
      var rev = el.querySelectorAll('.h-rev');
      tl.fromTo(rev, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.3, ease: 'power3.out' }, 0.2);
      tl.fromTo(el.querySelector('.h-neg'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.9);
      return tl;
    }
  });
})();
