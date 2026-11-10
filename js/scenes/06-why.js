/* Scene 06-why: why it matters. The challenge question and the evidence, each number with source and limit.
   Prefix w-. Entrance animates .js-in; the action animates .w-rev only. */
(function () {
  'use strict';
  TQ.registerScene({
    id: '06-why',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('06-why', 'js-in') +
        ui.label('06-why.hmwLabel', 'w-label js-in') +
        ui.quote('06-why.hmw', 'w-hmw js-in') +
        '<div class="w-hmwsrc js-in">' + ui.source('06-why.hmwSource') + '</div>' + // div, not p: ui.source is a <p> (nested <p> escaped the .js-in wrapper)
        '<p class="w-focus w-rev" data-i18n="06-why.focus"></p>';

      var stats =
        '<div class="w-stats">' +
          '<div class="w-group w-rev">' +
            '<div class="w-pair">' +
              ui.stat({ value: '06-why.stat1Value', text: '06-why.stat1Text' }) +
              ui.stat({ value: '06-why.stat2Value', text: '06-why.stat2Text' }) +
            '</div>' +
            '<div class="w-groupsrc">' + ui.source('06-why.stat12Source', '06-why.stat12Limit') + '</div>' +
          '</div>' +
          '<div class="w-group w-rev">' +
            ui.stat({ value: '06-why.stat3Value', text: '06-why.stat3Text', source: '06-why.stat3Source', limit: '06-why.stat3Limit' }) +
          '</div>' +
        '</div>';

      var warn =
        ui.panel(
          '<p class="w-date">' + ui.icon('alert') + '<span data-i18n="06-why.warnDate"></span></p>' +
          '<p class="w-note" data-i18n="06-why.warn"></p>' +
          ui.source('06-why.warnSource', '06-why.warnLimit'), { cls: 'w-card w-rev' });
      var survey =
        ui.panel(
          '<p class="w-date"><span class="w-big" data-i18n="06-why.surveyValue"></span></p>' +
          '<p class="w-note" data-i18n="06-why.survey"></p>' +
          ui.source('06-why.surveySource', '06-why.surveyLimit'), { cls: 'w-card w-rev tq-hide-sm' });

      var visual =
        '<h3 class="w-head js-in" data-i18n="06-why.title"></h3>' + stats +
        '<div class="w-cards">' + warn + survey + '</div>' +
        '<p class="w-unknown w-rev tq-hide-sm">' + ui.icon('info') + '<span data-i18n="06-why.unknown"></span></p>';

      return ui.layout({ copy: copy, visual: visual, variant: 'stack', cls: 'w-layout' });
    },

    enter: function (tl, el, api) {
      api.motion.rise(tl, el.querySelectorAll('.js-in'), 0, { y: 26, stagger: 0.07 });
    },

    action: function (el, api) {
      var tl = gsap.timeline();
      var rev = el.querySelectorAll('.w-rev');
      tl.fromTo(rev, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.28, ease: 'power3.out' }, 0.2);
      return tl;
    }
  });
})();
