/* anim-zero-shot — zero-shot classification with CLIP. Real values (run 2026-11-11):
 * openai/clip-vit-base-patch16, cat photo (scikit-image "chelsea", CC0), prompt "a photo of a {label}."
 * Steps: 0 image + label set · 1 labels → prompts → text encoder · 2 cosine similarities · 3 softmax(100·cos) → prediction */
(function () {
  var K = window.AnimKit;
  var LAB = ['dog', 'cat', 'car', 'coffee cup', 'rocket', 'galaxy'];
  var COS = [0.226, 0.291, 0.204, 0.206, 0.205, 0.201];
  var PROB = [0.001, 0.998, 0.000, 0.000, 0.000, 0.000];
  K.register('zero-shot', {
    steps: 4,
    size: [1400, 600],
    captions: [
      'A new image, and a list of classes chosen <b>at test time</b> (no training)',
      'Turn each class into a sentence and encode it with the text tower',
      'Cosine between the image vector and each sentence vector',
      'Softmax over the classes (× 100) → prediction: <b>cat, 0.998</b>. The classifier is just a list of sentences'
    ],
    build: function (st) {
      var R = st.root, svg = st.svg;
      var im = K.h('img', { src: 'assets/img/cat.jpg', alt: 'Close-up photo of a tabby cat', class: 'an-abs' }, R);
      K.pos(im, 30, 120, 300, 300); im.style.borderRadius = '10px';
      var ie = K.label(R, 180, 460, 'image encoder → i', 'an-small', 'c');
      var Y0 = 70, RH = 78, CX = 420;
      var chips = LAB.map(function (l, k) {
        var b = K.box(R, CX, Y0 + k * RH, 420, 56, 'an-tok'); b.style.fontSize = '24px'; b.style.justifyContent = 'flex-start'; b.style.paddingLeft = '16px';
        b.lab = l; return b;
      });
      var BX = 900, BW = 380;
      var bars = LAB.map(function (l, k) {
        var b = K.box(R, BX, Y0 + k * RH + 12, 0, 32, 'an-bar');
        var t = K.label(R, BX + 10, Y0 + k * RH + 28, '', 'an-mono an-small', 'l');
        return { b: b, t: t };
      });
      var axis = K.s('line', { x1: BX, x2: BX, y1: Y0 - 6, y2: Y0 + LAB.length * RH - 10, style: 'stroke:var(--line);stroke-width:2' }, svg);
      var head = K.label(R, BX, Y0 - 30, '', 'an-small an-muted', 'l');
      var te = K.label(R, CX + 210, Y0 + LAB.length * RH + 6, 'text encoder → t<sub>1</sub> … t<sub>6</sub>', 'an-small', 'c');
      return function (step) {
        chips.forEach(function (c, k) {
          c.innerHTML = step >= 1 ? '<span class="an-muted">a photo of a&nbsp;</span><b>' + c.lab + '</b><span class="an-muted">.</span>' : '<b>' + c.lab + '</b>';
          c.className = 'an-abs an-tok' + (step === 3 && k === 1 ? ' is-pos' : '');
        });
        K.vis(te, step >= 1); K.vis(ie, step >= 1);
        head.inner.textContent = step === 2 ? 'cos(i, t)' : step === 3 ? 'probability' : '';
        axis.style.opacity = step >= 2 ? 1 : 0;
        bars.forEach(function (b, k) {
          var v = step === 2 ? (COS[k] - 0.18) / (0.30 - 0.18) : step === 3 ? PROB[k] : 0;
          b.b.style.width = (step >= 2 ? Math.max(4, v * BW) : 0) + 'px';
          b.b.style.background = (step === 3 && k === 1) ? 'var(--pos)' : step === 3 ? 'var(--muted)' : 'var(--accent)';
          K.pos(b.t, BX + (step >= 2 ? Math.max(4, v * BW) : 0) + 10);
          b.t.inner.textContent = step === 2 ? COS[k].toFixed(3) : step === 3 ? PROB[k].toFixed(3) : '';
        });
      };
    }
  });
})();
