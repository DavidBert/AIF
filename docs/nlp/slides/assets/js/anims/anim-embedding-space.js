/* anim-embedding-space — 2-D view of word embeddings: clusters + analogy arithmetic.
 * Coordinates are illustrative (hand-placed to mimic a PCA projection of real word vectors). */
(function () {
  var K = window.AnimKit;
  var GROUPS = {
    people: { color: '--q', name: 'people & royalty', lx: 250, ly: 36 },
    places: { color: '--accent-2', name: 'countries & capitals', lx: 890, ly: 46 },
    fruit: { color: '--pos', name: 'fruits', lx: 490, ly: 545, a: 'l' },
    vehicle: { color: '--k', name: 'vehicles', lx: 1150, ly: 520, a: 'r' }
  };
  // [word, x, y, group, label anchor]
  var PTS = [
    ['man', 120, 285, 'people', 'b'], ['woman', 300, 277, 'people', 'b'],
    ['prince', 150, 195, 'people', 't'], ['princess', 330, 187, 'people', 't'],
    ['king', 130, 115, 'people', 't'], ['queen', 316, 104, 'people', 't'],
    ['France', 660, 110, 'places', 'r'], ['Germany', 790, 98, 'places', 'r'], ['Italy', 920, 118, 'places', 'r'], ['Spain', 1040, 102, 'places', 'r'],
    ['Paris', 700, 235, 'places', 'r'], ['Berlin', 830, 223, 'places', 'r'], ['Rome', 967, 248, 'places', 'r'], ['Madrid', 1080, 227, 'places', 'r'],
    ['apple', 130, 430, 'fruit', 'r'], ['pear', 215, 475, 'fruit', 'r'], ['banana', 330, 420, 'fruit', 'r'], ['orange', 260, 530, 'fruit', 'r'], ['mango', 395, 495, 'fruit', 'r'],
    ['car', 700, 440, 'vehicle', 'r'], ['truck', 815, 415, 'vehicle', 'r'], ['bus', 900, 480, 'vehicle', 'r'], ['train', 1010, 435, 'vehicle', 'r'], ['bicycle', 760, 530, 'vehicle', 'r']
  ];

  K.register('embedding-space', {
    steps: 6,
    size: [1200, 640],
    labels: ['Words as points', 'Clusters', 'Gender direction', 'king − man + woman', 'Capital direction', 'Paris − France + Italy'],
    captions: [
      'Each word is a point (real embeddings have ~300 dimensions; this is a 2-D projection)',
      'Words used in similar contexts end up <b>close together</b>',
      'Directions carry meaning: man → woman is parallel to prince → princess',
      '<b>king − man + woman ≈ queen</b>: nearest word to the computed point',
      'Another consistent direction: country → capital',
      '<b>Paris − France + Italy ≈ Rome</b>'
    ],
    build: function (st) {
      var R = st.root, svg = st.svg;
      var P = {};
      PTS.forEach(function (p) { P[p[0]] = { x: p[1], y: p[2], g: p[3], a: p[4] }; });
      // axes
      var ax = K.s('path', { d: 'M40,20 L40,610 L1180,610', style: 'fill:none;stroke:var(--line);stroke-width:2' }, svg);
      K.label(R, 1178, 596, 'dim 1', 'an-tiny an-muted', 'r');
      K.label(R, 52, 22, 'dim 2', 'an-tiny an-muted', 'l');
      // cluster hulls (ellipses)
      var hulls = {};
      Object.keys(GROUPS).forEach(function (g) {
        var pts = PTS.filter(function (p) { return p[3] === g; });
        var xs = pts.map(function (p) { return p[1]; }), ys = pts.map(function (p) { return p[2]; });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs) + 60, y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var e = K.s('ellipse', {
          cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rx: (x1 - x0) / 2 + 48, ry: (y1 - y0) / 2 + 50,
          style: 'fill:var(' + GROUPS[g].color + ');fill-opacity:0.09;stroke:var(' + GROUPS[g].color + ');stroke-opacity:.35;stroke-width:2'
        }, svg);
        var l = K.label(R, GROUPS[g].lx, GROUPS[g].ly, GROUPS[g].name, 'an-display', GROUPS[g].a || 'c');
        l.inner.style.fontSize = '28px'; l.inner.style.color = 'var(' + GROUPS[g].color + ')';
        hulls[g] = { e: e, l: l };
      });
      // arrows layer under points
      function arrow(a, b, color, dashed, shift) {
        var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
        return K.path(svg, K.line(a.x + ux * 13, a.y + uy * 13, b.x - ux * (shift || 14), b.y - uy * (shift || 14)),
          { color: color, width: 3.5, arrow: true, arrowSize: 16, dashed: dashed });
      }
      var gender = [arrow(P.man, P.woman, '--accent'), arrow(P.prince, P.princess, '--accent')];
      var gv = { x: P.woman.x - P.man.x, y: P.woman.y - P.man.y };
      var kq = { x: P.king.x + gv.x, y: P.king.y + gv.y };
      var kingArrow = arrow(P.king, kq, '--accent', '9 7', 4);
      var cap = ['France', 'Germany', 'Spain'].map(function (c, i) { return arrow(P[c], P[['Paris', 'Berlin', 'Madrid'][i]], '--accent-2'); });
      var cv = { x: P.Paris.x - P.France.x, y: P.Paris.y - P.France.y };
      var ir = { x: P.Italy.x + cv.x, y: P.Italy.y + cv.y };
      var italyArrow = arrow(P.Italy, ir, '--accent-2', '9 7', 4);
      function ring(p, color) {
        return K.s('circle', { cx: p.x, cy: p.y, r: 22, style: 'fill:none;stroke:var(' + color + ');stroke-width:3' }, svg);
      }
      var qRing = ring(P.queen, '--accent'), rRing = ring(P.Rome, '--accent-2');
      var qDot = K.s('circle', { cx: kq.x, cy: kq.y, r: 6, style: 'fill:var(--surface);stroke:var(--accent);stroke-width:2.5' }, svg);
      var rDot = K.s('circle', { cx: ir.x, cy: ir.y, r: 6, style: 'fill:var(--surface);stroke:var(--accent-2);stroke-width:2.5' }, svg);
      var gLbl = K.label(R, (P.man.x + P.woman.x) / 2, P.man.y + 52, '+ (woman − man)', 'an-small an-accent', 'c');
      var cLbl = K.label(R, 600, 175, '+ (capital − country)', 'an-small an-accent2', 'r');
      // points + labels
      var dots = PTS.map(function (p) {
        var c = K.s('circle', { cx: p[1], cy: p[2], r: 8, style: 'fill:var(--muted)' }, svg);
        var off = { r: [14, 0], t: [0, -16], b: [0, 16], l: [-14, 0] }[p[4]];
        var l = K.label(R, p[1] + off[0], p[2] + off[1], p[0], '', p[4] === 'r' ? 'l' : p[4] === 't' ? 'b' : p[4] === 'b' ? 't' : 'r');
        l.inner.style.fontSize = '24px';
        return { c: c, l: l, g: p[3], w: p[0] };
      });

      return function (step) {
        dots.forEach(function (d) {
          var col = step >= 1 ? 'var(' + GROUPS[d.g].color + ')' : 'var(--muted)';
          d.c.style.fill = col;
          var hot = (step >= 3 && step < 4 && d.w === 'queen') || (step >= 5 && d.w === 'Rome');
          d.l.inner.style.fontWeight = hot ? '700' : '400';
          var focus = step === 2 || step === 3 ? d.g === 'people' : step >= 4 ? d.g === 'places' : true;
          d.c.style.opacity = focus ? 1 : 0.35; d.l.style.opacity = focus ? 1 : 0.35;
        });
        Object.keys(hulls).forEach(function (g) {
          var on = step >= 1;
          hulls[g].e.style.opacity = on ? (step >= 2 ? 0.45 : 1) : 0;
          K.vis(hulls[g].l, on);
          hulls[g].l.style.opacity = on ? (step >= 2 ? 0.5 : 1) : 0;
        });
        gender.forEach(function (a) { K.draw(a, step >= 2 && step <= 3); });
        K.vis(gLbl, step === 2 || step === 3);
        K.draw(kingArrow, step === 3);
        qRing.style.opacity = step === 3 ? 1 : 0; qDot.style.opacity = step === 3 ? 1 : 0;
        cap.forEach(function (a) { K.draw(a, step >= 4); });
        K.vis(cLbl, step >= 4);
        K.draw(italyArrow, step >= 5);
        rRing.style.opacity = step >= 5 ? 1 : 0; rDot.style.opacity = step >= 5 ? 1 : 0;
      };
    }
  });
})();
