/* anim-bert-mlm — BERT masked-language-model pre-training on the paper's example sentence.
 * Probabilities are illustrative. */
(function () {
  var K = window.AnimKit;
  K.register('bert-mlm', {
    steps: 6,
    size: [1320, 620],
    labels: ['Input sentence', 'Select 15% of tokens', 'Mask them', 'Bidirectional encoder', 'Predict the masked tokens', '80 / 10 / 10 rule'],
    captions: [
      'Pre-training data is just raw text — no labels needed',
      'Randomly select <b>15%</b> of the tokens',
      'Replace them with a special <b>[MASK]</b> token',
      'The Transformer encoder sees the <b>whole</b> sentence: context from the left <i>and</i> from the right',
      'Predict the original token at each masked position; the loss is computed only there',
      'Of the selected tokens: 80% → [MASK], 10% → random token, 10% → unchanged (fine-tuning text never contains [MASK])'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var toks = 'the man went to the store to buy a gallon of milk'.split(' ');
      var MASK = [5, 9];
      var PRED = { 5: [['store', .62], ['market', .14], ['shop', .09]], 9: [['gallon', .71], ['bottle', .12], ['carton', .09]] };
      var n = toks.length, X0 = 40, SLOT = 1240 / n, TY = 404, TH = 50;
      var cx = toks.map(function (t, j) { return X0 + SLOT * (j + 0.5); });
      var chips = toks.map(function (t, j) {
        var b = K.box(R, cx[j] - SLOT / 2 + 4, TY, SLOT - 8, TH, 'an-tok an-stack'); b.style.fontSize = '23px';
        var a = K.h('span', { text: t }, b), m = K.h('span', { text: '[MASK]' }, b);
        return { b: b, a: a, m: m };
      });
      var selL = K.label(R, X0, 372, '15% selected → 2 of 12 tokens', 'an-small an-accent2', 'l');
      // encoder box
      var BY = 250, BH = 86;
      var enc = K.box(R, X0, BY, 1240, BH, 'an-card an-cell');
      enc.style.fontFamily = 'var(--font-display)'; enc.style.fontSize = '32px'; enc.style.borderColor = 'var(--accent)';
      enc.style.background = K.tint('--accent', 10);
      enc.innerHTML = 'BERT encoder&nbsp;<span class="an-muted" style="font-size:24px;font-family:var(--font-body)">(Transformer, bidirectional self-attention)</span>';
      var ups = cx.map(function (x) { return K.path(svg, K.line(x, TY - 4, x, BY + BH + 8), { color: '--muted', width: 2, arrow: true, arrowSize: 10 }); });
      // bidirectional arcs into the first mask
      var M0 = MASK[0];
      var arcs = toks.map(function (t, j) {
        if (j === M0) return null;
        var x1 = cx[j], x2 = cx[M0], y = TY + TH + 6, h = 10 + Math.abs(x2 - x1) * 0.075;
        return K.path(svg, 'M' + x1 + ',' + y + ' Q' + ((x1 + x2) / 2) + ',' + (y + 2 * h) + ' ' + (x2 + (j < M0 ? -6 : 6)) + ',' + (y + 2),
          { color: j < M0 ? '--accent-2' : '--accent', width: 2.2, arrow: true, arrowSize: 10 });
      });
      var lc = K.label(R, cx[1], 548, 'left context →', 'an-small an-accent2', 'c');
      var rc = K.label(R, cx[9], 548, '← right context', 'an-small an-accent', 'c');
      // predictions
      var preds = MASK.map(function (mi) {
        var g = K.box(R, cx[mi] - 150, 30, 300, 170, 'an-off');
        K.label(g, 150, 10, 'p( · | context)', 'an-tiny an-muted', 'c');
        PRED[mi].forEach(function (p, i) {
          var y = 34 + i * 46;
          K.label(g, 96, y + 18, p[0], 'an-mono an-small' + (i === 0 ? ' an-b' : ''), 'r');
          var bar = K.box(g, 108, y + 5, p[1] * 190, 26, 'an-bar');
          bar.style.background = i === 0 ? 'var(--pos)' : 'color-mix(in srgb, var(--muted) 45%, var(--surface))';
          K.label(g, 108 + p[1] * 190 + 8, y + 18, p[1].toFixed(2), 'an-mono an-tiny', 'l');
        });
        var arr = K.path(svg, K.line(cx[mi], BY - 4, cx[mi], 196), { color: '--pos', width: 2.5, arrow: true });
        return { g: g, arr: arr };
      });
      var lossL = K.label(R, 230, 128, 'loss only on<br>masked positions', 'an-small an-neg', 'c');
      lossL.inner.style.textAlign = 'center';
      // 80/10/10 panel
      var rule = K.box(R, 0, 0, 1320, 240, 'an-off');
      var RX = 180, RW = 960, RY = 40;
      var rsvg = K.s('svg', { class: 'an-svg', viewBox: '0 0 1320 240', width: 1320, height: 240 }, rule);
      var COLX = [340, 660, 980];
      [[0.8, '[MASK]', 'replace with [MASK]', '--accent'], [0.1, 'apple', 'random token', '--accent-2'], [0.1, 'store', 'keep unchanged', '--pos']].reduce(function (x, r, i) {
        var w = r[0] * RW;
        var seg = K.box(rule, x, RY, w - 4, 44, 'an-cell'); seg.style.background = K.tint(r[3], 35); seg.style.borderRadius = '8px';
        seg.innerHTML = '<b>' + Math.round(r[0] * 100) + '%</b>'; seg.style.fontSize = '22px';
        K.s('path', { d: K.vcurve(x + (w - 4) / 2, RY + 48, COLX[i], RY + 84, 0.5), style: 'fill:none;stroke:var(' + r[3] + ');stroke-width:2' }, rsvg);
        K.label(rule, COLX[i], RY + 102, r[2], 'an-small', 'c');
        var ex = K.box(rule, COLX[i] - 70, RY + 124, 140, 48, 'an-tok an-mono'); ex.style.fontSize = '23px'; ex.textContent = r[1];
        ex.style.borderColor = 'var(' + r[3] + ')';
        return x + w;
      }, RX);
      K.label(rule, RX - 16, RY + 22, 'selected', 'an-small an-muted', 'r');
      K.label(rule, COLX[0] - 90, RY + 148, 'e.g. “store” →', 'an-small an-muted', 'r');

      return function (step) {
        chips.forEach(function (c, j) {
          var isM = MASK.indexOf(j) >= 0;
          var masked = isM && step >= 2;
          K.vis(c.a, !masked); K.vis(c.m, masked);
          c.b.className = 'an-abs an-tok an-stack' + (isM && step === 1 ? ' is-accent2' : masked ? ' is-fill' : '');
          c.b.style.color = masked ? 'var(--surface)' : '';
          if (step === 3 && j !== M0) c.b.className += j < M0 ? ' is-accent2' : ' is-accent';
        });
        K.vis(selL, step === 1 || step === 2);
        var encOn = step >= 3;
        K.vis(enc, encOn);
        ups.forEach(function (u) { K.draw(u, encOn); });
        arcs.forEach(function (a) { if (a) K.draw(a, step === 3); });
        K.vis(lc, step === 3); K.vis(rc, step === 3);
        preds.forEach(function (p) { K.vis(p.g, step === 4); K.draw(p.arr, step === 4); });
        K.vis(lossL, step === 4);
        K.vis(rule, step === 5);
      };
    }
  });
})();
