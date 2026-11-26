/* anim-clip-space — CLIP's two encoders map images and captions to unit vectors in ONE space; similarity = cos of the angle.
 * The circle is a 2D sketch of the 512-d space (angles are illustrative). Steps:
 * 0 two encoders · 1 image vector in the shared space · 2 matching caption: small angle · 3 other caption: large angle · 4 all pairs */
(function () {
  var K = window.AnimKit;
  K.register('clip-space', {
    steps: 5,
    size: [1440, 620],
    captions: [
      'Two separate encoders: a ViT for images, a Transformer for text. Each outputs one vector',
      'Both vectors are projected to the <b>same</b> 512-d space and normalised: they live on the unit sphere (sketched here as a circle)',
      'Matching caption → its vector points in almost the same direction: small angle θ, <b>cos θ high</b>',
      'Unrelated caption → large angle, <b>cos θ low</b>. Similarity is just the cosine of the angle (a dot product of unit vectors)',
      'Training pulls every image towards its own caption: matching pairs end up pointing the same way'
    ],
    build: function (st) {
      var R = st.root, svg = st.layer();
      function enc(x, y, label, sub, colVar) {
        var b = K.box(R, x, y, 230, 110, 'an-card');
        b.style.borderColor = 'var(' + colVar + ')'; b.style.background = K.tint(colVar, 12);
        b.style.clipPath = 'polygon(0 0, 100% 18%, 100% 82%, 0 100%)';
        K.label(b, 108, 44, label, 'an-display', 'c').inner.style.fontSize = '28px';
        K.label(b, 108, 76, sub, 'an-tiny an-muted', 'c');
        return b;
      }
      // image tower
      var im = K.h('img', { src: 'assets/img/cat.jpg', alt: 'Tabby cat', class: 'an-abs' }, R); K.pos(im, 30, 70, 120, 120); im.style.borderRadius = '10px';
      enc(190, 75, 'image encoder', 'ViT', '--accent-2');
      var iv = K.vec(R, 470, 92, K.randVec('img-cat', 6), { cell: 22, gap: 3, vertical: false, color: '--accent-2' });
      K.label(R, 470 + iv.w / 2, 140, 'i (512-d)', 'an-mono an-tiny', 'c');
      // text tower
      var tx = K.box(R, 20, 380, 150, 90, 'an-tok is-accent'); tx.style.whiteSpace = 'normal'; tx.style.fontFamily = 'var(--font-body)'; tx.style.fontSize = '19px'; tx.style.textAlign = 'center';
      tx.textContent = '“a cat lying on a blanket”';
      enc(190, 370, 'text encoder', 'Transformer', '--accent');
      var tv = K.vec(R, 470, 387, K.randVec('txt-cat', 6), { cell: 22, gap: 3, color: '--accent' });
      K.label(R, 470 + tv.w / 2, 435, 't (512-d)', 'an-mono an-tiny', 'c');
      K.path(svg, K.line(156, 130, 184, 130), { color: '--fg', width: 3, arrow: true });
      K.path(svg, K.line(174, 425, 184, 425), { color: '--fg', width: 3, arrow: true });
      K.path(svg, K.line(424, 103, 462, 103), { color: '--fg', width: 3, arrow: true });
      K.path(svg, K.line(424, 398, 462, 398), { color: '--fg', width: 3, arrow: true });
      // shared space
      var CX = 1040, CY = 290, RAD = 180;
      var space = K.box(R, 0, 0, 1440, 620, '');
      var ss = K.s('svg', { class: 'an-svg', viewBox: '0 0 1440 620', width: 1440, height: 620 }, space);
      K.s('circle', { cx: CX, cy: CY, r: RAD, style: 'fill:' + K.tint('--accent-2', 5) + ';stroke:var(--line);stroke-width:2;stroke-dasharray:6 6' }, ss);
      K.s('circle', { cx: CX, cy: CY, r: 5, style: 'fill:var(--fg)' }, ss);
      K.label(space, CX - RAD - 40, 40, 'one shared space <span class="an-muted" style="font-weight:400">· unit vectors · 2D sketch of 512-d</span>', 'an-small an-b', 'l');
      var proj1 = K.path(svg, K.hcurve(640, 103, CX - 60, CY - 120, 0.6), { color: '--accent-2', width: 2.5, dashed: '7 6', arrow: true });
      var proj2 = K.path(svg, K.hcurve(640, 398, CX - 60, CY + 60, 0.6), { color: '--accent', width: 2.5, dashed: '7 6', arrow: true });
      function ray(deg, colVar, w) {
        var a = deg * Math.PI / 180, x = CX + RAD * Math.cos(a), y = CY - RAD * Math.sin(a);
        var p = K.path(ss, K.line(CX, CY, x - 10 * Math.cos(a), y + 10 * Math.sin(a)), { color: colVar, width: w || 5, arrow: true, arrowSize: 18 });
        p.end = [x, y]; return p;
      }
      function arc(d1, d2, r) {
        var a1 = d1 * Math.PI / 180, a2 = d2 * Math.PI / 180;
        return 'M' + (CX + r * Math.cos(a1)) + ',' + (CY - r * Math.sin(a1)) + ' A' + r + ',' + r + ' 0 0,0 ' + (CX + r * Math.cos(a2)) + ',' + (CY - r * Math.sin(a2));
      }
      var A = 40;                                        // cat image direction
      var rI = ray(A, '--accent-2'), rT = ray(A + 12, '--accent'), rR = ray(A + 126, '--accent');
      function thumb(src, deg, off) {
        var a = deg * Math.PI / 180, t = K.h('img', { src: src, alt: '', class: 'an-abs' }, space);
        K.pos(t, CX + (RAD + off) * Math.cos(a) - 34, CY - (RAD + off) * Math.sin(a) - 34, 68, 68); t.style.borderRadius = '8px'; return t;
      }
      function chip(text, deg, off, cls) {
        var a = deg * Math.PI / 180;
        return K.label(R, CX + (RAD + off) * Math.cos(a), CY - (RAD + off) * Math.sin(a), text, 'an-tiny ' + (cls || ''), 'c');
      }
      var tI = thumb('assets/img/cat.jpg', A - 8, 46);
      var cT = chip('“a cat lying<br>on a blanket”', A + 16, 58, 'an-accent an-b');
      var cR = chip('“a rocket launching<br>into the sky”', A + 140, 92, 'an-accent an-b');
      var arcS = K.path(ss, arc(A, A + 12, 90), { color: '--pos', width: 4 });
      var thS = K.label(R, CX + 112 * Math.cos((A + 6) * Math.PI / 180), CY - 112 * Math.sin((A + 6) * Math.PI / 180), 'θ', 'an-b an-pos', 'c');
      var arcL = K.path(ss, arc(A, A + 126, 60), { color: '--neg', width: 4 });
      var thL = K.label(R, CX + 84 * Math.cos((A + 63) * Math.PI / 180), CY - 84 * Math.sin((A + 63) * Math.PI / 180), 'θ', 'an-b an-neg', 'c');
      var cosS = K.label(R, 1420, 470, 'cos θ <b>high</b> → match', 'an-small an-pos', 'r');
      var cosL = K.label(R, 1420, 506, 'cos θ <b>low</b> → no match', 'an-small an-neg', 'r');
      // other pairs
      var others = K.box(R, 0, 0, 1440, 620, '');
      var os = K.s('svg', { class: 'an-svg', viewBox: '0 0 1440 620', width: 1440, height: 620 }, others);
      [[205, 'assets/img/coffee.jpg', '“a cup of coffee”'], [300, 'assets/img/galaxies.jpg', '“galaxies”'], [152, 'assets/img/rocket.jpg', null]].forEach(function (o) {
        var a = o[0] * Math.PI / 180;
        K.s('line', { x1: CX, y1: CY, x2: CX + (RAD - 8) * Math.cos(a), y2: CY - (RAD - 8) * Math.sin(a), style: 'stroke:var(--muted);stroke-width:3' }, os);
        var t = K.h('img', { src: o[1], alt: '', class: 'an-abs' }, others);
        K.pos(t, CX + (RAD + 40) * Math.cos(a) - 30, CY - (RAD + 40) * Math.sin(a) - 30, 60, 60); t.style.borderRadius = '8px';
        if (o[2]) K.label(others, CX + (RAD + 40) * Math.cos(a), CY - (RAD + 40) * Math.sin(a) + 46, o[2], 'an-tiny an-muted', 'c');
      });
      return function (step) {
        K.vis(space, step >= 1); K.draw(proj1, step >= 1); K.draw(proj2, step >= 2);
        K.draw(rI, step >= 1); K.vis(tI, step >= 1);
        K.draw(rT, step >= 2); K.vis(cT, step >= 2); K.draw(arcS, step >= 2); K.vis(thS, step >= 2); K.vis(cosS, step >= 2);
        K.draw(rR, step >= 3); K.vis(cR, step >= 3); K.draw(arcL, step === 3); K.vis(thL, step === 3); K.vis(cosL, step >= 3);
        K.vis(others, step >= 4);
      };
    }
  });
})();
