/* anim-attention-matrix — full N×N attention weights; then the causal mask of a decoder (GPT)
 * versus bidirectional attention of an encoder (BERT). opts.tokens to change the sentence (≤ 7 tokens). */
(function () {
  var K = window.AnimKit;
  K.register('attention-matrix', {
    steps: 5,
    size: [1240, 620],
    labels: ['Query × key grid', 'Bidirectional weights', 'One row = one token', 'Causal mask', 'Masked (decoder) weights'],
    captions: [
      'Attention for a whole sentence: one row per <b>query</b> token, one column per <b>key</b> token',
      'Each row is a softmax over all keys (rows sum to 1) — this is <b>bidirectional</b> attention (BERT encoder)',
      '“sat” looks at every word, including the future “on the mat”',
      'Decoder (GPT): a token must not see the future → set scores above the diagonal to −∞',
      'After softmax the masked weights are 0: each token only attends to itself and the past'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var toks = opts.tokens || ['The', 'cat', 'sat', 'on', 'the', 'mat'];
      var n = toks.length, FOC = Math.min(2, n - 1);
      var S = [];
      for (var i = 0; i < n; i++) { S.push([]); for (var j = 0; j < n; j++) S[i].push(i === j ? 1.0 : Math.abs(i - j) === 1 ? 0.8 : 0.2); }
      if (!opts.tokens) {
        var extra = [[0, 1, 1.5], [1, 2, 1.2], [1, 0, 1.0], [2, 1, 2.0], [2, 5, 1.3], [3, 5, 1.4], [3, 2, 1.2], [4, 5, 1.8], [5, 3, 1.2], [5, 2, 1.0], [5, 4, 1.0]];
        extra.forEach(function (e) { S[e[0]][e[1]] = e[2]; });
      }
      var Wb = S.map(function (r) { return K.softmax(r); });
      var Wc = S.map(function (r, i) { var p = K.softmax(r.slice(0, i + 1)); return r.map(function (x, j) { return j <= i ? p[j] : 0; }); });

      var CELL = Math.min(70, 420 / n), GX = 190, GY = 100;
      K.label(R, GX + n * CELL / 2, 30, 'keys →', 'an-small an-muted', 'c');
      K.label(R, 40, GY - 26, 'queries ↓', 'an-small an-muted', 'l');
      var colL = toks.map(function (t, j) { var l = K.label(R, GX + j * CELL + CELL / 2, GY - 24, t, '', 'c'); l.inner.style.fontSize = '24px'; return l; });
      var rowL = toks.map(function (t, i) { var l = K.label(R, GX - 14, GY + i * CELL + CELL / 2, t, '', 'r'); l.inner.style.fontSize = '24px'; return l; });
      var cells = [], masks = [];
      for (i = 0; i < n; i++) {
        cells.push([]); masks.push([]);
        for (j = 0; j < n; j++) {
          var c = K.box(R, GX + j * CELL, GY + i * CELL, CELL, CELL, 'an-cell');
          c.style.border = '1px solid var(--line)'; c.style.fontSize = '20px';
          cells[i].push(c);
          if (j > i) {
            var m = K.box(R, GX + j * CELL, GY + i * CELL, CELL, CELL, 'an-cell an-off');
            m.style.background = 'repeating-linear-gradient(135deg, var(--line) 0 3px, var(--surface) 3px 10px)';
            m.style.color = 'var(--muted)'; m.style.fontSize = '22px';
            m.innerHTML = '<span style="background:var(--surface);padding:0 4px;border-radius:4px">−∞</span>';
            masks[i].push(m);
          } else masks[i].push(null);
        }
      }
      var rowHL = K.box(R, GX - 4, GY + FOC * CELL - 4, n * CELL + 8, CELL + 8, 'an-off');
      rowHL.style.border = '3px solid var(--accent-2)'; rowHL.style.borderRadius = '8px';
      var sumL = K.label(R, GX + n * CELL + 16, GY + FOC * CELL + CELL / 2, 'Σ = 1', 'an-small an-accent2', 'l');

      // right panel: mini diagrams
      var PX = 760, PW = 440;
      function mini(y, title, causal) {
        var g = K.box(R, 0, 0, 1240, 620, '');
        var gs = K.s('svg', { class: 'an-svg', viewBox: '0 0 1240 620', width: 1240, height: 620 }, g);
        var t = K.label(g, PX, y, title, 'an-display', 'l'); t.inner.style.fontSize = '28px';
        var step = PW / n, ty = y + 150;
        var xs = toks.map(function (tk, j) { return PX + step * (j + 0.5); });
        toks.forEach(function (tk, j) {
          var c = K.box(g, xs[j] - step / 2 + 4, ty, step - 8, 40, 'an-tok' + (j === FOC ? ' is-accent2' : '')); c.style.fontSize = '20px'; c.textContent = tk;
          c.style.fontFamily = 'var(--font-body)';
          if (causal && j > FOC) c.className = 'an-abs an-tok is-dim';
        });
        toks.forEach(function (tk, j) {
          if (j === FOC) return;
          var allowed = !causal || j < FOC;
          var x1 = xs[FOC], x2 = xs[j], h = 26 + Math.abs(x2 - x1) * 0.28;
          K.s('path', {
            d: 'M' + x1 + ',' + (ty - 4) + ' Q' + ((x1 + x2) / 2) + ',' + (ty - 4 - 2 * h) + ' ' + x2 + ',' + (ty - 8),
            'marker-end': allowed ? K.marker(gs, '--accent-2', 12) : null,
            style: 'fill:none;stroke:var(' + (allowed ? '--accent-2' : '--line') + ');stroke-width:' + (allowed ? 2.5 : 2) + (allowed ? '' : ';stroke-dasharray:5 6')
          }, gs);
        });
        return g;
      }
      var bert = mini(70, 'Encoder (BERT): sees both sides', false);
      var gpt = mini(330, 'Decoder (GPT): sees only the past', true);

      return function (step) {
        var Wm = step >= 4 ? Wc : Wb, show = step >= 1;
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var v = Wm[i][j], c = cells[i][j];
          c.textContent = show ? (v === 0 ? '0' : v.toFixed(2)) : '';
          c.style.background = show && v > 0 ? K.tint('--accent', 6 + 150 * v) : 'transparent';
          c.style.color = v === 0 ? 'var(--muted)' : 'var(--fg)';
          if (masks[i][j]) K.vis(masks[i][j], step === 3);
        }
        K.vis(rowHL, step === 2 || step === 4);
        K.vis(sumL, step === 2 || step === 4);
        bert.style.opacity = step === 0 ? 0 : step <= 2 ? 1 : 0.3;
        gpt.style.opacity = step <= 2 ? 0 : 1;
        rowL.forEach(function (l, i) { l.inner.style.fontWeight = (step === 2 || step === 4) && i === FOC ? '700' : '400'; });
      };
    }
  });
})();
