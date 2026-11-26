/* anim-cls-token — the [CLS] token as a sequence: an extra learned token, attends to every patch, its output is classified.
 * Prediction values are real (google/vit-base-patch16-224 on the cat crop, run 2026-11-11, window.VIT_DATA.top5).
 * Steps: 0 196 patch tokens · 1 prepend [CLS] · 2 Transformer: [CLS] attends to every patch · 3 197 outputs, keep only [CLS] · 4 linear head → class */
(function () {
  var K = window.AnimKit;
  function tile(parent, x, y, s, r, c) {
    var t = K.box(parent, x, y, s, s, '');
    t.style.backgroundImage = 'url(assets/img/cat-224.png)';
    t.style.backgroundSize = (s * 14) + 'px ' + (s * 14) + 'px';
    t.style.backgroundPosition = (-c * s) + 'px ' + (-r * s) + 'px';
    t.style.borderRadius = '6px'; t.style.border = '2px solid var(--line)';
    return t;
  }
  K.register('cls-token', {
    steps: 5,
    size: [1440, 620],
    captions: [
      'The image as a sequence: 196 patch tokens (we show a few of them)',
      'Add one extra token in front: <b>[CLS]</b>. It contains no pixels: it is a <b>learned</b> vector, the same for every image',
      'In every layer, [CLS] attends to all 196 patches: it gathers information from the whole image',
      'Out come 197 vectors. For classification we keep only the <b>[CLS] output</b>: one vector that summarises the image',
      'A linear layer (768 → 1000 classes) + softmax on that vector gives the prediction (real ViT-B/16 output)'
    ],
    build: function (st) {
      var R = st.root, svg = st.layer();
      var top = ((window.VIT_DATA || {}).top5 || [['Egyptian cat', 0.922], ['tiger cat', 0.038], ['tabby', 0.026]]).slice(0, 3);
      var S = 74, X0 = 60, SLOT = 92, YIN = 470, YOUT = 70;
      // slot 0 = [CLS]; slots 1..8 = patches
      var pats = [[0, 0, 'p1'], [0, 1, 'p2'], [0, 2, 'p3'], null, [5, 3, 'p74'], [5, 4, 'p75'], null, [13, 13, 'p196']];
      var xs = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return X0 + i * SLOT; });
      var patches = K.box(R, 0, 0, 1440, 620, '');
      pats.forEach(function (p, i) {
        var x = xs[i + 1];
        if (!p) { K.label(patches, x + S / 2, YIN + S / 2, '…', 'an-display', 'c').inner.style.fontSize = '40px'; return; }
        tile(patches, x, YIN, S, p[0], p[1]);
        K.label(patches, x + S / 2, YIN + S + 18, p[2], 'an-mono an-tiny an-muted', 'c');
      });
      var cls = K.box(R, xs[0], YIN, S, S, 'an-tok is-fill', '[CLS]'); cls.style.fontSize = '18px';
      var clsL = K.label(R, xs[0] + S / 2, YIN + S + 18, 'learned', 'an-tiny an-accent an-b', 'c');
      var countL = K.label(R, xs[8] + S + 30, YIN + S / 2, '', 'an-small an-b', 'l');
      // Transformer band
      var band = K.box(R, X0 - 14, 250, xs[8] + S - X0 + 28, 110, 'an-card');
      band.style.background = K.tint('--accent-2', 10); band.style.borderColor = 'var(--accent-2)';
      var bl = K.label(band, (xs[8] + S - X0 + 28) / 2, 55, 'Transformer encoder × 12 · full self-attention', 'an-display', 'c'); bl.inner.style.fontSize = '30px';
      var ins = xs.map(function (x) { return K.path(svg, K.line(x + S / 2, YIN - 6, x + S / 2, 366), { color: '--muted', width: 2, arrow: true }); });
      var att = [1, 2, 3, 5, 6, 8].map(function (i) {
        return K.path(svg, 'M' + (xs[i] + S / 2) + ',' + (YIN - 4) + ' Q' + ((xs[0] + xs[i]) / 2 + S / 2) + ',' + (YIN - 70 - i * 6) + ' ' + (xs[0] + S / 2) + ',' + (YIN - 4), { color: '--accent', width: 3, arrow: true });
      });
      // outputs
      var outs = xs.map(function (x, i) {
        if (i === 4 || i === 7) return K.label(R, x + S / 2, YOUT + 40, '…', 'an-display', 'c');
        var v = K.vec(R, x + S / 2 - 11, YOUT, K.randVec('out' + i, 4), { cell: 22, gap: 3, vertical: true, color: i === 0 ? '--accent' : '--muted' });
        return v;
      });
      var outsUp = xs.map(function (x) { return K.path(svg, K.line(x + S / 2, 244, x + S / 2, YOUT + 104), { color: '--muted', width: 2, arrow: true }); });
      var outL = K.label(R, xs[0] + S / 2, YOUT - 22, 'h<sub>CLS</sub>', 'an-small an-accent an-b', 'c');
      var dimL = K.label(R, (xs[1] + xs[8] + S) / 2, YOUT - 22, '196 patch outputs: not used for classification', 'an-tiny an-muted', 'c');
      // head
      var HX = 1030;
      var head = K.box(R, HX, 60, 370, 200, 'an-card');
      var hl = K.label(head, 185, 30, 'linear 768 → 1000 + softmax', 'an-small an-b', 'c');
      top.forEach(function (t, k) {
        K.label(head, 18, 76 + k * 42, t[0], 'an-small', 'l');
        var b = K.box(head, 170, 62 + k * 42, Math.max(4, t[1] * 150), 28, 'an-bar'); b.style.background = k === 0 ? 'var(--accent)' : 'var(--muted)';
        K.label(head, 176 + Math.max(4, t[1] * 150), 76 + k * 42, t[1].toFixed(3), 'an-mono an-tiny', 'l');
      });
      var toHead = K.path(svg, 'M' + (xs[0] + S / 2 + 18) + ',' + (YOUT + 30) + ' C' + 420 + ',' + (YOUT - 75) + ' ' + 820 + ',' + (YOUT - 75) + ' ' + (HX - 8) + ',' + (YOUT + 60), { color: '--accent', width: 3, arrow: true });
      return function (step) {
        K.vis(cls, step >= 1); K.vis(clsL, step >= 1);
        countL.inner.innerHTML = step >= 1 ? '197 tokens' : '196 tokens';
        K.vis(band, step >= 2);
        ins.forEach(function (p) { K.draw(p, step >= 3); });
        att.forEach(function (p) { K.draw(p, step === 2); });
        outs.forEach(function (o, i) { K.vis(o, step >= 3); if (o && step >= 3) o.style.opacity = i === 0 ? 1 : 0.35; });
        outsUp.forEach(function (p) { K.draw(p, step >= 3); });
        K.vis(outL, step >= 3); K.vis(dimL, step >= 3);
        K.vis(head, step >= 4); K.draw(toHead, step >= 4);
        patches.style.opacity = step >= 3 ? 0.6 : 1;
      };
    }
  });
})();
