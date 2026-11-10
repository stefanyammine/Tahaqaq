/* Scene 02-text: Peach, the text agent. Class prefix t-. Text only via "02-text.*" keys.
   enter(): scrubbed entrance of the title and the stage window (.js-in).
   action(): a message arrives, the claim words light up, claim card and record lines appear, then the avatar and the copy blocks. */
(function () {
  'use strict';

  function recRow(labelKey, chipState, chipKey, tagKey, ui) {
    return '<li class="t-rec">' +
      '<span class="t-rec__label" data-i18n="' + labelKey + '"></span>' +
      '<span class="t-rec__res">' + ui.chip(chipState, chipKey) + ui.tag(tagKey, 'doc') + '</span></li>';
  }

  TQ.registerScene({
    id: '02-text',
    tint: 'peach',
    turn: 'wipe',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('02-text', 'js-in') +
        '<div class="t-head">' +
          ui.avatar('peach', { name: '02-text.name', colour: '02-text.colour', width: '150px', cls: 't-avatar' }) +
          ui.title('02-text.title', { cls: 'js-in t-title' }) +
        '</div>' +
        '<div class="t-reveal">' +
          ui.defs([['02-text.whatLabel', '02-text.what'], ['02-text.howLabel', '02-text.how'],
                   ['02-text.helpsLabel', '02-text.helps'], ['02-text.useLabel', '02-text.use']], { cols: 2 }) +
          ui.status('02-text.statusLabel', '02-text.status') +
        '</div>';

      var body =
        '<div class="t-chat">' +
          '<p class="t-bubble" data-i18n="02-text.sampleMsg"></p>' +
          '<p class="t-meta">' + ui.icon('message') + '<span data-i18n="02-text.action"></span></p>' +
        '</div>' +
        '<div class="t-claim">' +
          '<p class="tq-label t-cap" data-i18n="02-text.cardTitle"></p>' +
          '<div class="t-claim__grid">' +
            '<div class="t-claim__cell"><span class="t-k" data-i18n="02-text.claimWhoLabel"></span><b data-i18n="02-text.claimWho"></b></div>' +
            '<div class="t-claim__cell"><span class="t-k" data-i18n="02-text.claimHowLabel"></span><b data-i18n="02-text.claimHow"></b></div>' +
            '<div class="t-claim__cell"><span class="t-k" data-i18n="02-text.claimAskLabel"></span><b data-i18n="02-text.claimAsk"></b></div>' +
          '</div>' +
        '</div>' +
        '<div class="t-records">' +
          '<p class="tq-label t-cap" data-i18n="02-text.recordsTitle"></p>' +
          '<ul class="t-recs">' +
            recRow('02-text.recSourceLabel', 'nomatch', '02-text.recSource', '02-text.recSourceChip', ui) +
            recRow('02-text.recNumberLabel', 'match', '02-text.recNumber', '02-text.recNumberChip', ui) +
            recRow('02-text.recRedLabel', 'nomatch', '02-text.recRed', '02-text.recRedChip', ui) +
            recRow('02-text.recAnnLabel', 'unknown', '02-text.recAnn', '02-text.recAnnChip', ui) +
          '</ul>' +
        '</div>';

      var visual = '<div class="t-stage js-in">' +
        ui.window({ title: '02-text.cardTitle', paper: true, body: body, cls: 't-window', bodyCls: 't-body' }) +
        '<p class="t-sample">' + ui.sample('02-text.sample') + '</p></div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'even' });
    },

    enter: function (tl, el, api) {
      var m = api.motion;
      m.rise(tl, el.querySelectorAll('.tq-layout__copy .js-in'), 0, { y: 28, stagger: 0.08 });
      tl.fromTo(el.querySelector('.t-stage'), { autoAlpha: 0, y: 40, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
    },

    action: function (el, api) {
      var words = api.motion.splitWords(el.querySelector('.t-bubble'));
      var marks = [];
      words.forEach(function (w) {
        if (/^(Labour|ministry:|ministry-fee\.example|Pay|today)$/.test(w.textContent)) {
          var m = document.createElement('i');
          m.className = 't-mark';
          w.appendChild(m);
          marks.push(m);
        }
      });
      var tl = gsap.timeline();
      var E = 'power3.out';
      // 1) a message arrives
      tl.fromTo(el.querySelector('.t-bubble'), { autoAlpha: 0, y: 26, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: E }, 0.1);
      tl.fromTo(el.querySelector('.t-meta'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.5);
      // 2) the suspicious words light up one by one
      tl.fromTo(marks, { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.22, ease: 'power2.out' }, 0.9);
      // 3) claim card, then the record lines
      tl.fromTo(el.querySelector('.t-claim'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: E }, 2.0);
      tl.fromTo(el.querySelectorAll('.t-rec'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: E }, 2.5);
      tl.fromTo(el.querySelector('.t-records > .t-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 2.5);
      // 4) the avatar appears, then what it does, how, helps, use, status
      tl.fromTo(el.querySelector('.t-avatar'), { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 3.1);
      tl.fromTo(el.querySelectorAll('.t-reveal .tq-def, .t-reveal .tq-status'), { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: E }, 3.4);
      return tl;
    }
  });
})();
