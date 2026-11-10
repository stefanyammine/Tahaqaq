/* Scene 04-media: Green, the video and image agent. Class prefix m-. Text only via "04-media.*" keys.
   enter(): scrubbed entrance of the title and the stage window (.js-in).
   action(): a video frame drops in, a scan line passes over it once, then the content line, the SARAAB slot,
   the announcement check and the outcome, then the avatar and the copy blocks. */
(function () {
  'use strict';

  TQ.registerScene({
    id: '04-media',
    tint: 'green',
    turn: 'wipe',

    render: function (api) {
      var ui = api.ui;
      var copy =
        ui.eyebrow('04-media', 'js-in') +
        '<div class="m-head">' +
          ui.avatar('green', { name: '04-media.name', colour: '04-media.colour', width: '150px', cls: 'm-avatar' }) +
          ui.title('04-media.title', { cls: 'js-in m-title' }) +
        '</div>' +
        '<div class="m-reveal">' +
          ui.defs([['04-media.whatLabel', '04-media.what'], ['04-media.howLabel', '04-media.how'],
                   ['04-media.helpsLabel', '04-media.helps'], ['04-media.useLabel', '04-media.use']], { cols: 2 }) +
          ui.status('04-media.statusLabel', '04-media.status') +
        '</div>';

      var frame =
        '<div class="m-media">' +
          '<div class="m-frame">' +
            '<span class="m-sun"></span><span class="m-hill"></span>' +
            '<span class="m-lectern"></span><span class="m-body"></span><span class="m-face"></span>' +
            '<span class="m-play">' + ui.icon('play') + '</span>' +
            '<i class="m-scan"></i>' +
          '</div>' +
          '<p class="m-caption">' + ui.icon('film') + '<span data-i18n="04-media.sampleCaption"></span></p>' +
          '<p class="m-meta"><span data-i18n="04-media.action"></span></p>' +
        '</div>';

      var content =
        '<div class="m-content">' +
          '<p class="tq-label m-cap" data-i18n="04-media.contentTitle"></p>' +
          '<ul class="m-states">' +
            '<li>' + ui.icon('check') + '<span data-i18n="04-media.ccFound"></span></li>' +
            '<li>' + ui.icon('question') + '<span data-i18n="04-media.ccNone"></span></li>' +
            '<li>' + ui.chip('off', '04-media.ccNot') + '</li>' +
          '</ul>' +
          '<p class="m-slot">' + ui.icon('film') + '<span data-i18n="04-media.saraab"></span></p>' +
        '</div>';

      var ann =
        '<div class="m-ann">' +
          '<span class="m-ann__label" data-i18n="04-media.annLabel"></span>' +
          '<span class="m-ann__res">' + ui.chip('unknown', '04-media.ann') + ui.tag('04-media.annChip', 'doc') + '</span>' +
        '</div>';

      var out =
        '<div class="m-out">' + ui.chip('stop', '04-media.outcome') +
          '<span class="m-nv" data-i18n="04-media.noVerdict"></span></div>';

      var visual = '<div class="m-stage js-in">' +
        ui.window({ paper: true, body: frame + content + ann + out, cls: 'm-window', bodyCls: 'm-wbody' }) +
        '<p class="m-sample">' + ui.sample('04-media.sample') + '</p></div>';

      return ui.layout({ copy: copy, visual: visual, variant: 'even' });
    },

    enter: function (tl, el, api) {
      var m = api.motion;
      m.rise(tl, el.querySelectorAll('.tq-layout__copy .js-in'), 0, { y: 28, stagger: 0.08 });
      tl.fromTo(el.querySelector('.m-stage'), { autoAlpha: 0, y: 40, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.1);
    },

    action: function (el, api) {
      var E = 'power3.out';
      var tl = gsap.timeline();
      // 1) a frame drops in
      tl.fromTo(el.querySelector('.m-frame'), { autoAlpha: 0, y: -70, rotation: -3 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.7, ease: 'back.out(1.3)' }, 0.1);
      tl.fromTo(el.querySelectorAll('.m-caption, .m-meta'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.1 }, 0.6);
      // 2) a scan line passes over it once (the band is 22% of the frame high)
      tl.fromTo(el.querySelector('.m-scan'), { yPercent: -100, autoAlpha: 1 }, { yPercent: 450, duration: 1.3, ease: 'power1.inOut' }, 1.0);
      tl.to(el.querySelector('.m-scan'), { autoAlpha: 0, duration: 0.1 }, 2.3);
      // 3) what can be checked
      tl.fromTo(el.querySelector('.m-cap'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 2.2);
      tl.fromTo(el.querySelectorAll('.m-states li'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.1, ease: E }, 2.2);
      tl.fromTo(el.querySelector('.m-slot'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: E }, 2.6);
      tl.fromTo(el.querySelector('.m-ann'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: E }, 2.9);
      tl.fromTo(el.querySelector('.m-out'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: E }, 3.2);
      // 4) the avatar appears, then the copy blocks
      tl.fromTo(el.querySelector('.m-avatar'), { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, 3.3);
      tl.fromTo(el.querySelectorAll('.m-reveal .tq-def, .m-reveal .tq-status'), { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: E }, 3.6);
      return tl;
    }
  });
})();
