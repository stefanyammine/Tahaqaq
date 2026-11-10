/* The retro computer: zoom geometry, screen states, idle float.
   Zoom model: one number z in [0, 1]. z = 0 is the opening view, z = 1 means the CRT glass covers the viewport.
   Scale grows exponentially with z (perceived constant speed); the glass centre travels in a straight
   line to the viewport centre. transform-origin is the glass centre, so the zoom is continuous and reversible. */
(function () {
  'use strict';
  var TQ = window.TQ;

  var C = TQ.computer = {
    rig: null, glass: null, float: null,
    zoom: { z: 0 },          // tweened by the engine's master timeline
    geo: null,
    floatTween: null,

    init: function () {
      C.rig = document.querySelector('.rig');
      C.glass = document.querySelector('.crt');
      C.float = document.querySelector('.rig__float');
      C.noteState = document.querySelector('.crt__state--note');
      C.callState = document.querySelector('.crt__state--call');
      C.buildWave();
    },

    /* Waveform bars on the small screen (deterministic heights). */
    buildWave: function () {
      var wave = document.querySelector('.crt__wave');
      if (!wave || wave.childElementCount) return;
      var rnd = TQ.motion.seeded(7), html = '';
      for (var i = 0; i < 26; i++) {
        var env = Math.sin(Math.PI * (i + 1) / 27);
        html += '<i style="--h:' + Math.round(18 + 78 * env * (0.45 + 0.55 * rnd())) + '"></i>';
      }
      wave.innerHTML = html;
    },

    /* Measure in the un-zoomed state. Call on every (re)build. */
    measure: function () {
      if (!C.rig) return;
      gsap.set(C.rig, { clearProps: 'transform' });
      if (C.float) gsap.set(C.float, { y: 0 });
      var r = C.rig.getBoundingClientRect();
      var g = C.glass.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      var gcx = g.left + g.width / 2, gcy = g.top + g.height / 2;
      // Cover the viewport; 1.14 pushes the rounded glass corners off-screen.
      var s = Math.max(vw / g.width, vh / g.height) * 1.14;
      C.geo = { ox: gcx - r.left, oy: gcy - r.top, dx: vw / 2 - gcx, dy: vh / 2 - gcy, s: s };
      C.rig.style.transformOrigin = C.geo.ox + 'px ' + C.geo.oy + 'px';
      C.apply();
    },

    apply: function () {
      if (!C.geo) return;
      var z = Math.max(0, Math.min(1, C.zoom.z));
      var g = C.geo;
      var scale = Math.pow(g.s, z);
      var f = g.s > 1 ? (scale - 1) / (g.s - 1) : 0;
      gsap.set(C.rig, { x: g.dx * f, y: g.dy * f, scale: scale, force3D: z > 0 && z < 1 });
    },

    /* 'note' (opening) or 'call' (closing); instant, used for deep links */
    setScreen: function (which) {
      gsap.set(C.noteState, { autoAlpha: which === 'note' ? 1 : 0 });
      gsap.set(C.callState, { autoAlpha: which === 'call' ? 1 : 0 });
    },

    startFloat: function () {
      if (TQ.state.reduced || !C.float) return;
      if (!C.floatTween) C.floatTween = gsap.to(C.float, { y: -7, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
      C.floatTween.play();
    },
    stopFloat: function () {
      if (C.floatTween && !C.floatTween.paused()) {
        C.floatTween.pause();
        gsap.to(C.float, { y: 0, duration: 0.3, ease: 'power2.out' });
      }
    },
    resetFloat: function () {
      if (C.floatTween) { C.floatTween.kill(); C.floatTween = null; }
      if (C.float) gsap.set(C.float, { y: 0 });
    }
  };
})();
