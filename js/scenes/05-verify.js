/* Scene 05-verify: verify outside the chat. Class prefix f-. Text only via "05-verify.*" keys.
   enter(): scrubbed entrance of the title and the call window (.js-in).
   action(): "today" row, "with Tahaqaq" row, the call button, the three outcomes, the why block. */
(function () {
  'use strict';

  TQ.registerScene({
    id: '05-verify',
    turn: 'fade',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('05-verify', 'js-in') +
        ui.title('05-verify.title', { cls: 'js-in' }) +
        '<div class="f-flows">' +
          '<div class="f-flow f-flow--today">' +
            ui.label('05-verify.todayLabel', 'f-flow__l') +
            ui.steps([{ t: '05-verify.today1' }, { t: '05-verify.today2' }, { t: '05-verify.today3' }]) +
          '</div>' +
          '<div class="f-flow f-flow--with">' +
            ui.label('05-verify.withLabel', 'f-flow__l') +
            ui.steps([{ t: '05-verify.with1' }, { t: '05-verify.with2' }, { t: '05-verify.with3' }]) +
          '</div>' +
        '</div>' +
        '<div class="f-why">' +
          ui.label('05-verify.whyLabel', 'f-why__l') +
          '<p class="f-why__p" data-i18n="05-verify.why1"></p>' +
          '<p class="f-why__p" data-i18n="05-verify.why2"></p>' +
          ui.source('05-verify.why2Source') +
          '<p class="f-emerg" data-i18n="05-verify.emergency"></p>' +
        '</div>';

      var body =
        '<div class="f-call">' +
          '<div class="f-btnwrap"><span class="f-ring"></span>' +
            '<span class="f-btn">' + ui.icon('phone') + '<span data-i18n="05-verify.button"></span></span></div>' +
          '<p class="f-note" data-i18n="05-verify.buttonNote"></p>' +
          '<span class="f-helper">' + ui.icon('users') + '<span data-i18n="05-verify.helper"></span></span>' +
        '</div>' +
        '<div class="f-out">' +
          ui.label('05-verify.outcomesLabel', 'f-out__l') +
          '<div class="f-out__row">' + ui.chip('call', '05-verify.o1') + ui.chip('stop', '05-verify.o2') + ui.chip('stop', '05-verify.o3') + '</div>' +
        '</div>';

      var visual = '<div class="f-stage js-in">' +
        ui.window({ paper: true, body: body, cls: 'f-window' }) +
        '<p class="f-sample">' + ui.sample('05-verify.sample') + '</p></div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'even' });
    },

    enter: function (tl, el, api) {
      var m = api.motion;
      m.rise(tl, el.querySelectorAll('.tq-layout__copy .js-in'), 0, { y: 28, stagger: 0.08 });
      tl.fromTo(el.querySelector('.f-stage'), { autoAlpha: 0, y: 40, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
    },

    action: function (el, api) {
      var E = 'power3.out';
      var tl = gsap.timeline();
      tl.fromTo(el.querySelectorAll('.f-flow--today .tq-step, .f-flow--today .f-flow__l'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: E }, 0.2);
      tl.fromTo(el.querySelectorAll('.f-flow--with .tq-step, .f-flow--with .f-flow__l'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: E }, 1.2);
      tl.fromTo(el.querySelector('.f-btn'), { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)' }, 2.1);
      tl.fromTo(el.querySelector('.f-ring'), { scale: 1, autoAlpha: 0.6 }, { scale: 1.12, autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, 2.5);
      tl.fromTo(el.querySelectorAll('.f-note, .f-helper'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.1, ease: E }, 2.5);
      tl.fromTo(el.querySelectorAll('.f-out__l, .f-out .tq-chip'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.1, ease: E }, 3.0);
      tl.fromTo(el.querySelectorAll('.f-why > *'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: E }, 3.4);
      return tl;
    }
  });
})();
