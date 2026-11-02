/* anim-positional-encoding — sinusoidal positional encodings (Vaswani et al. 2017), computed for real.
 * opts.pos (highlighted position, default 10), opts.d (model dim, default 64), opts.n (positions, default 50). */
(function () {
  var K = window.AnimKit;
  function pe(pos, k, d) {
    var i = Math.floor(k / 2), a = pos / Math.pow(10000, (2 * i) / d);
    return k % 2 === 0 ? Math.sin(a) : Math.cos(a);
  }
  K.register('positional-encoding', {
    steps: 5,
    size: [1240, 640],
    labels: ['Sinusoids of different frequencies', 'Read one position', 'The PE matrix', 'One position = one vector', 'Nearby positions are similar'],
    captions: function (o) {
      var P = o.pos === undefined ? 10 : o.pos;
      return [
        'Each dimension is a sinusoid over positions; the frequency decreases with the dimension index',
        'Position ' + P + ' reads one value from every sinusoid',
        'All dimensions × all positions: the positional-encoding matrix (d = ' + (o.d || 64) + ')',
        'Column ' + P + ' = PE(' + P + '), a unique “barcode” <b>added</b> to the token embedding at position ' + P,
        'PE(' + P + ') · PE(pos) is largest at pos = ' + P + ' and generally falls with distance'
      ];
    },
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var P = opts.pos === undefined ? 10 : opts.pos, d = opts.d || 64, N = opts.n || 50;
      var X0 = 150, X1 = 1210, dx = (X1 - X0) / N;
      var X = function (p) { return X0 + (p + 0.5) * dx; };
      var f = K.label(R, 620, 26, 'PE(<i>pos</i>, 2<i>i</i>) = sin(<i>pos</i> / 10000<sup>2<i>i</i>/<i>d</i></sup>)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PE(<i>pos</i>, 2<i>i</i>+1) = cos(<i>pos</i> / 10000<sup>2<i>i</i>/<i>d</i></sup>)', 'an-formula', 'c');
      f.inner.style.fontSize = '24px';
      // waves
      var DIMS = opts.dims || [0, 6, 12, 20];
      var WY0 = 92, WH = 54, AMP = 21;
      var waveG = K.s('g', null, svg);
      var waveLbls = [], dotsG = K.s('g', null, svg), valLbls = [];
      DIMS.forEach(function (k, r) {
        var cy = WY0 + r * WH + WH / 2;
        K.s('line', { x1: X0, x2: X1, y1: cy, y2: cy, style: 'stroke:var(--line);stroke-width:1.5' }, waveG);
        var dd = '';
        for (var t = 0; t <= (N - 1) * 8; t++) {
          var p = t / 8, y = cy - AMP * pe(p, k, d);
          dd += (t ? ' L' : 'M') + X(p).toFixed(1) + ',' + y.toFixed(1);
        }
        K.s('path', { d: dd, style: 'fill:none;stroke:var(--accent-2);stroke-width:2.5' }, waveG);
        waveLbls.push(K.label(R, X0 - 16, cy, 'dim ' + k, 'an-small an-muted', 'r'));
        var v = pe(P, k, d);
        K.s('circle', { cx: X(P), cy: cy - AMP * v, r: 6, style: 'fill:var(--accent)' }, dotsG);
        valLbls.push(K.label(R, X(P) + 12, cy + (v >= 0 ? 12 : -12), (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2), 'an-mono an-tiny an-accent', 'l'));
      });
      // similarity chart (same box)
      var simG = K.s('g', null, svg);
      var sims = []; for (var p = 0; p < N; p++) { var s = 0; for (var k = 0; k < d; k++) s += pe(P, k, d) * pe(p, k, d); sims.push(s); }
      var smin = Math.min.apply(null, sims), smax = Math.max.apply(null, sims);
      var SY0 = WY0 + 10, SY1 = WY0 + DIMS.length * WH - 10;
      var sd = sims.map(function (s, p) { return (p ? 'L' : 'M') + X(p).toFixed(1) + ',' + (SY1 - (s - smin) / (smax - smin) * (SY1 - SY0)).toFixed(1); }).join(' ');
      K.s('line', { x1: X0, x2: X1, y1: SY1, y2: SY1, style: 'stroke:var(--line);stroke-width:1.5' }, simG);
      K.s('path', { d: sd, style: 'fill:none;stroke:var(--accent);stroke-width:3.5;stroke-linejoin:round' }, simG);
      var simL = K.label(R, X0 - 16, (SY0 + SY1) / 2, 'PE(' + P + ')·PE(pos)', 'an-small an-accent', 'r');
      simL.inner.style.whiteSpace = 'normal'; simL.inner.style.width = '130px'; simL.inner.style.textAlign = 'right';

      // ticks (shared x axis)
      var TY = WY0 + DIMS.length * WH + 18;
      var tickP = null;
      for (var t = 0; t < N; t += 5) {
        var tk = K.label(R, X(t), TY, String(t), 'an-mono an-tiny an-muted', 'c');
        if (t === P) tickP = tk;
      }
      K.label(R, X0 - 16, TY, 'pos', 'an-tiny an-muted', 'r');
      // heatmap
      var HY0 = TY + 20, HY1 = 584, rh = (HY1 - HY0) / d;
      var heat = K.s('g', null, svg);
      // rows: all sin dimensions (2i) first, then all cos dimensions (2i+1) — the usual way to plot it
      for (var r2 = 0; r2 < d; r2++) for (var p2 = 0; p2 < N; p2++) {
        var half = Math.ceil(d / 2), k2 = r2 < half ? 2 * r2 : 2 * (r2 - half) + 1;
        var v2 = pe(p2, k2, d);
        K.s('rect', { x: (X0 + p2 * dx).toFixed(2), y: (HY0 + r2 * rh).toFixed(2), width: (dx + 0.4).toFixed(2), height: (rh + 0.4).toFixed(2),
          style: 'fill:var(' + (v2 >= 0 ? '--accent' : '--accent-2') + ');fill-opacity:' + Math.abs(v2).toFixed(3) }, heat);
      }
      var hl1 = K.label(R, X0 - 16, HY0 + (HY1 - HY0) / 4, 'sin dims', 'an-tiny an-muted', 'r');
      var hl2 = K.label(R, X0 - 16, HY0 + 3 * (HY1 - HY0) / 4, 'cos dims', 'an-tiny an-muted', 'r');
      var legend = K.label(R, 1225, (HY0 + HY1) / 2, '<span class="an-accent">+1</span><br><span class="an-accent2">−1</span>', 'an-tiny', 'c');
      // position line + column highlight
      var vline = K.s('line', { x1: X(P), x2: X(P), y1: WY0 - 4, y2: WY0 + DIMS.length * WH, style: 'stroke:var(--fg);stroke-width:2;stroke-dasharray:6 5' }, svg);
      var posL = K.label(R, X(P), TY, String(P), 'an-mono an-tiny an-b', 'c');
      var col = K.s('rect', { x: X0 + P * dx - 3, y: HY0 - 3, width: dx + 6, height: HY1 - HY0 + 6, rx: 4, style: 'fill:none;stroke:var(--fg);stroke-width:3' }, svg);
      var colL = K.label(R, X(P) + dx / 2 + 12, WY0 - 14, 'PE(' + P + ') ∈ ℝ<sup>' + d + '</sup>', 'an-small an-b', 'l');

      return function (step) {
        waveG.style.opacity = step >= 4 ? 0.12 : 1;
        waveLbls.forEach(function (l) { K.vis(l, step < 4); });
        dotsG.style.opacity = step >= 1 && step < 4 ? 1 : 0;
        valLbls.forEach(function (l) { K.vis(l, step >= 1 && step < 4); });
        simG.style.opacity = step >= 4 ? 1 : 0; K.vis(simL, step >= 4);
        vline.style.opacity = step >= 1 ? 1 : 0; K.vis(posL, step >= 1); if (tickP) K.vis(tickP, step < 1);
        heat.style.opacity = step >= 2 ? 1 : 0;
        [hl1, hl2, legend].forEach(function (l) { K.vis(l, step >= 2); });
        col.style.opacity = step >= 3 ? 1 : 0; K.vis(colL, step === 3);
        if (step >= 3) vline.setAttribute('y2', HY1); else vline.setAttribute('y2', WY0 + DIMS.length * WH);
      };
    }
  });
})();
