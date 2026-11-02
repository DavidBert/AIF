/* anim-self-attention — one query attending over a sentence.
 * opts.word: focused token (default "it"); opts.sentence to change the sentence (scores then generic). */
(function () {
  var K = window.AnimKit;
  var DEF = "The animal didn't cross the street because it was too tired";
  // illustrative scaled scores q·k/√d for a few focus words of the default sentence
  var SCORES = {
    it: [0.5, 3.2, 0.6, 0.9, 0.3, 1.9, 0.4, 1.6, 0.5, 0.2, 1.4],
    animal: [1.2, 2.2, 0.8, 1.0, 0.2, 0.6, 0.3, 1.5, 0.4, 0.3, 1.6],
    street: [0.4, 0.5, 0.6, 1.9, 1.5, 2.4, 0.3, 0.3, 0.2, 0.1, 0.2],
    tired: [0.3, 2.4, 0.5, 0.4, 0.2, 0.3, 0.6, 1.4, 1.0, 1.7, 2.0],
    cross: [0.4, 1.6, 1.4, 2.2, 0.6, 1.8, 0.4, 0.3, 0.2, 0.1, 0.3]
  };
  K.register('self-attention', {
    steps: 5,
    size: [1360, 660],
    labels: ['Tokens', 'Query, keys, values', 'Dot-product scores', 'Softmax weights', 'Weighted sum'],
    captions: function (o) {
      var w = o.word || 'it';
      return [
        'What does “' + w + '” refer to? Self-attention lets every token look at every other token',
        'Each token emits a <b style="color:var(--q)">query</b>, a <b style="color:var(--k)">key</b> and a <b style="color:var(--v)">value</b> (three learned projections of its embedding)',
        'Score = similarity between the query of “' + w + '” and every key (scaled dot product)',
        'Softmax turns scores into weights that sum to 1 — “' + w + '” attends mostly to <b>' + (w === 'it' ? 'animal' : 'its strongest match') + '</b>',
        'New representation of “' + w + '” = weighted sum of the values → it now carries information about ' + (w === 'it' ? '“animal”' : 'its context')
      ];
    },
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var toks = (opts.sentence || DEF).split(' ');
      var focus = toks.indexOf(opts.word || 'it'); if (focus < 0) focus = Math.min(7, toks.length - 1);
      var fw = toks[focus];
      var sc = (!opts.sentence && SCORES[fw]) ? SCORES[fw] : toks.map(function (t, j) {
        var d = Math.abs(j - focus); return (j === focus ? 1.8 : 0) + 1.6 * Math.exp(-d / 2) + K.rng(t + fw)() * 0.8;
      });
      var w = K.softmax(sc);
      var n = toks.length, X0 = 140, SLOT = (1340 - X0) / n, TY = 232, TH = 50;
      var cx = toks.map(function (t, j) { return X0 + SLOT * (j + 0.5); });
      var D = 4, CELL = 20, VW = D * CELL + (D - 1) * 3;

      // arcs (behind)
      var arcs = toks.map(function (t, j) {
        var x1 = cx[focus], x2 = cx[j], y = TY - 4;
        var d;
        if (j === focus) d = 'M' + (x1 - 14) + ',' + y + ' C' + (x1 - 40) + ',' + (y - 80) + ' ' + (x1 + 40) + ',' + (y - 80) + ' ' + (x1 + 14) + ',' + y;
        else { var h = 40 + Math.abs(x2 - x1) * 0.22; d = 'M' + x1 + ',' + y + ' Q' + ((x1 + x2) / 2) + ',' + (y - 2 * h) + ' ' + x2 + ',' + y; }
        var p = K.s('path', { d: d, style: 'fill:none;stroke:var(--accent);stroke-linecap:round;stroke-width:0;opacity:0' }, svg);
        return p;
      });

      var chips = toks.map(function (t, j) {
        var b = K.box(R, cx[j] - SLOT / 2 + 5, TY, SLOT - 10, TH, 'an-tok'); b.style.fontFamily = 'var(--font-body)'; b.style.fontSize = '24px'; b.textContent = t;
        return b;
      });
      // q/k/v rows
      var rowY = { q: 300, k: 338, v: 376 };
      var rowLbl = {};
      ['q', 'k', 'v'].forEach(function (r) {
        rowLbl[r] = K.label(R, 40, rowY[r] + CELL / 2, '<b>' + r + '</b>', '', 'l');
        rowLbl[r].inner.style.color = 'var(--' + r + ')';
      });
      var qv = K.vec(R, cx[focus] - VW / 2, rowY.q, K.randVec('q' + fw, D), { cell: CELL, color: '--q' });
      var kv = toks.map(function (t, j) { return K.vec(R, cx[j] - VW / 2, rowY.k, K.randVec('k' + t + j, D), { cell: CELL, color: '--k' }); });
      var vvals = toks.map(function (t, j) { return K.randVec('v' + t + j, D); });
      var vv = toks.map(function (t, j) { return K.vec(R, cx[j] - VW / 2, rowY.v, vvals[j], { cell: CELL, color: '--v' }); });

      // bars
      var BASE = 570, BMAX = 140;
      var maxS = Math.max.apply(null, sc), maxW = Math.max.apply(null, w);
      var barLbl = K.label(R, 40, BASE - 40, '', 'an-small an-muted', 'l');
      var bars = toks.map(function (t, j) {
        var b = K.box(R, cx[j] - 22, BASE, 44, 0, 'an-bar');
        var lab = K.label(R, cx[j], BASE, '', 'an-mono an-tiny', 'b');
        return { b: b, lab: lab };
      });
      var baseLine = K.s('line', { x1: X0, x2: 1340, y1: BASE, y2: BASE, style: 'stroke:var(--line);stroke-width:2' }, svg);

      // weighted sum: lines from v_j to z
      var ZY = 520;
      var sumLines = toks.map(function (t, j) {
        return K.s('path', { d: K.vcurve(cx[j], rowY.v + CELL + 4, cx[focus], ZY - 6, 0.6), style: 'fill:none;stroke:var(--v);stroke-linecap:round;stroke-width:0;opacity:0' }, svg);
      });
      var z = new Array(D).fill(0);
      vvals.forEach(function (v, j) { v.forEach(function (x, i) { z[i] += w[j] * x; }); });
      var zmax = Math.max.apply(null, z.map(Math.abs)) || 1;
      var zVec = K.vec(R, cx[focus] - (D * 30 + 9) / 2, ZY, z.map(function (x) { return x / zmax; }), { cell: 30, color: '--v' });
      var zLbl = K.label(R, cx[focus] + (D * 30 + 9) / 2 + 18, ZY + 15, 'z<sub>' + fw + '</sub> = Σ<sub>j</sub> α<sub>j</sub> v<sub>j</sub>', '', 'l');
      var formula = K.label(R, 1340, 36, '', 'an-small', 'r');

      return function (step) {
        chips.forEach(function (c, j) {
          var cls = 'an-abs an-tok';
          if (j === focus) cls += ' is-fill';
          else if (step >= 3 && w[j] === Math.max.apply(null, w.filter(function (x, i) { return i !== focus; }))) cls += ' is-accent';
          c.className = cls;
        });
        var showQKV = step >= 1;
        ['q', 'k', 'v'].forEach(function (r) { K.vis(rowLbl[r], showQKV); });
        K.vis(qv, showQKV);
        kv.forEach(function (k) { K.vis(k, showQKV); k.style.opacity = showQKV ? (step === 4 ? 0.3 : 1) : 0; });
        vv.forEach(function (v, j) { K.vis(v, showQKV); v.style.opacity = showQKV ? (step === 4 ? 0.25 + 0.75 * w[j] / maxW : (step >= 2 && step < 4 ? 0.45 : 1)) : 0; });
        // bars
        var showBars = step === 2 || step === 3;
        barLbl.inner.textContent = step === 2 ? 'score' : step === 3 ? 'weight α' : '';
        K.vis(barLbl, showBars);
        baseLine.style.opacity = showBars ? 1 : 0;
        bars.forEach(function (b, j) {
          var v = step === 2 ? sc[j] / maxS : step === 3 ? w[j] / maxW : 0;
          var h = showBars ? Math.max(2, v * BMAX) : 0;
          b.b.style.height = h + 'px'; b.b.style.top = (BASE - h) + 'px';
          b.b.style.background = step === 3 ? 'var(--accent)' : 'color-mix(in srgb, var(--k) 70%, var(--surface))';
          K.pos(b.lab, null, BASE - h - 6);
          b.lab.inner.textContent = step === 2 ? sc[j].toFixed(1) : step === 3 ? w[j].toFixed(2) : '';
          K.vis(b.lab, showBars);
        });
        arcs.forEach(function (p, j) {
          var on = step >= 3;
          p.style.strokeWidth = on ? (1.5 + 22 * w[j]) : 0;
          p.style.opacity = on ? (0.25 + 0.75 * w[j] / maxW) : 0;
        });
        sumLines.forEach(function (p, j) {
          var on = step === 4;
          p.style.strokeWidth = on ? (1 + 18 * w[j]) : 0;
          p.style.opacity = on ? (0.2 + 0.8 * w[j] / maxW) : 0;
        });
        K.vis(zVec, step === 4); K.vis(zLbl, step === 4);
        formula.inner.innerHTML = ['', 'q = x W<sub>Q</sub> · k = x W<sub>K</sub> · v = x W<sub>V</sub>',
          'score<sub>j</sub> = q · k<sub>j</sub> / √d', 'α = softmax(scores)', 'z = Σ<sub>j</sub> α<sub>j</sub> v<sub>j</sub>'][step];
        K.vis(formula, step >= 1);
      };
    }
  });
})();
