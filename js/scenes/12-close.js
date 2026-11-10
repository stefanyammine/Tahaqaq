/* Scene 12-close: the closing view. Rendered into .close-slot on the cream opening view
   (the engine zooms back out of the computer first and switches its screen to the call).
   Class prefix: c-  (CSS in css/scenes/12-close.css). */
(function () {
  'use strict';

  function castMember(colour) {
    return '<span class="c-cast__item c-cast__item--' + colour + '">' +
      '<img src="assets/img/avatar-' + colour + '-cutout.webp" data-fallback="assets/img/avatar-' + colour + '-tile.webp" width="544" height="640" alt="" decoding="async">' +
      '</span>';
  }

  TQ.registerScene({
    id: '12-close',

    render: function () {
      return '<div class="c-wrap">' +
        '<p class="c-step js-in" data-i18n="12-close.step"></p>' +
        '<h2 class="c-title js-in"><span class="c-title__a" data-i18n="12-close.lineA"></span> <em class="c-title__b" data-i18n="12-close.lineB"></em></h2>' +
        '<div class="c-cast" aria-hidden="true">' +
          '<span class="c-cast__item c-cast__item--logo"><img src="assets/img/logo-192.webp" width="192" height="192" alt="" decoding="async"></span>' +
          castMember('peach') + castMember('purple') + castMember('green') +
        '</div>' +
        '<p class="c-status js-in" data-i18n="12-close.status"></p>' +
        '<p class="c-fine js-in"><span data-i18n="12-close.notAffiliated"></span><br><span data-i18n="12-close.credit"></span></p>' +
      '</div>';
    },

    /* scrubbed, during the zoom-out */
    enter: function (tl, el, api) {
      api.motion.slideIn(tl, el.querySelectorAll('.js-in'), 0, { x: 36, stagger: 0.07, duration: 0.7 });
    },

    /* when settled: the logo and the three avatars hop in */
    action: function (el) {
      var tl = gsap.timeline();
      var items = el.querySelectorAll('.c-cast__item');
      tl.fromTo(items, { autoAlpha: 0, y: 26, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.12 }, 0.1);
      return tl;
    }
  });
})();
