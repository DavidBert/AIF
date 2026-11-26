/* anim-pixel-options — why not pixels as tokens? Three options, then patches.
 * Numbers are exact for a 224 × 224 RGB image: 50,176 pixels; 50,176² ≈ 2.52 billion attention scores;
 * 196 patches → 38,416 scores, i.e. 256² = 65,536× fewer. The attention squares in steps 0 and 3 share one scale.
 * Steps: 0 one pixel = one token · 1 whole image = one token · 2 CNN features → Transformer · 3 patches */
(function () {
  var K = window.AnimKit;
  K.register('pixel-options', {
    steps: 4,
    size: [1440, 600],
    captions: [
      '<b>Option A</b>: one pixel = one token → 50,176 tokens; attention compares every pair: <b>2.5 billion</b> scores per head and per layer. ✗ intractable',
      '<b>Option B</b>: flatten the whole image into one vector → a sequence of length 1: attention has nothing to compare. ✗ no structure left',
      '<b>Option C</b> (2018–2020): a CNN makes a small feature map, a Transformer reads it (e.g. DETR). Works, but two different architectures',
      '<b>Patches</b>: 16 × 16 pixels per token → 196 tokens, 38,416 scores: <b>65,536× fewer</b> than option A (same scale as A)'
    ],
    build: function (st) {
      var R = st.root;
      var labs = ['A · pixel = token', 'B · image = 1 token', 'C · CNN → Transformer', 'patches'];
      var pills = labs.map(function (n, i) {
        var p = K.box(R, 250 + i * 240, 14, 220, 40, 'an-tok', n); p.style.fontFamily = 'var(--font-body)'; p.style.fontSize = '20px'; return p;
      });
      function scene() { return K.box(R, 0, 0, 1440, 600, ''); }
      function cat(parent, x, y, s, grid) {
        var b = K.box(parent, x, y, s, s, '');
        b.style.backgroundImage = (grid ? 'linear-gradient(to right, rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.8) 1px, transparent 1px), ' : '') + 'url(assets/img/cat-224.png)';
        b.style.backgroundSize = (grid ? (s / grid) + 'px ' + (s / grid) + 'px, ' + (s / grid) + 'px ' + (s / grid) + 'px, ' : '') + 'cover';
        b.style.borderRadius = '6px';
        return b;
      }
      function arrow(parent, x, y, txt) {
        var a = K.label(parent, x, y, '→', 'an-display an-accent', 'c'); a.inner.style.fontSize = '48px';
        if (txt) K.label(parent, x + 10, y + 46, txt, 'an-tiny an-muted', 'c');
      }
      function verdict(parent, x, y, txt, cls) { var v = K.label(parent, x, y, txt, 'an-small an-b ' + cls, 'c'); return v; }
      var MS = 360, MX = 960, MY = 110;                       // attention square for A (and the ghost in "patches")
      // ---- A
      var A = scene();
      cat(A, 60, 140, 300, 56);                                // grid every 4 px (illustrative: 1 cell ≈ 4 × 4 px)
      K.label(A, 210, 470, '224 × 224 = <b>50,176</b> pixels', 'an-small', 'c');
      arrow(A, 430, 290, 'each pixel a token');
      var row = K.box(A, 490, 262, 380, 56, '');
      ['px₁', 'px₂', 'px₃', '…', 'px₅₀₁₇₆'].forEach(function (t, i) { var c = K.box(row, i * 72, 0, i === 4 ? 104 : 64, 52, 'an-tok' + (t === '…' ? ' is-ghost' : ' is-neg'), t); c.style.fontSize = '17px'; });
      var mA = K.box(A, MX, MY, MS, MS, ''); mA.style.border = '2px solid var(--neg)';
      mA.style.background = 'repeating-linear-gradient(45deg, ' + K.tint('--neg', 30) + ' 0 3px, ' + K.tint('--neg', 12) + ' 3px 7px)';
      K.label(A, MX + MS / 2, MY - 22, 'attention: 50,176 × 50,176', 'an-small an-b', 'c');
      verdict(A, MX + MS / 2, MY + MS + 30, '≈ 2.5 billion scores ✗', 'an-neg');
      // ---- B
      var B = scene();
      cat(B, 60, 140, 300, 0);
      arrow(B, 430, 290, 'flatten');
      var bar = K.box(B, 490, 278, 420, 24, ''); bar.style.backgroundImage = 'url(assets/img/cat-224.png)'; bar.style.backgroundSize = '100% 100%'; bar.style.borderRadius = '4px';
      K.label(B, 700, 330, '150,528 numbers in one vector', 'an-tiny an-muted', 'c');
      arrow(B, 960, 290, '');
      var one = K.box(B, 1010, 262, 120, 56, 'an-tok is-neg', '1 token'); one.style.fontSize = '20px';
      var m1 = K.box(B, 1200, 276, 28, 28, ''); m1.style.border = '2px solid var(--neg)'; m1.style.background = K.tint('--neg', 25);
      K.label(B, 1214, 240, '1 × 1', 'an-small an-b', 'c');
      verdict(B, 1120, 400, 'nothing to attend to ✗', 'an-neg');
      // ---- C
      var C = scene();
      cat(C, 60, 140, 300, 0);
      var cnn = K.box(C, 400, 175, 220, 230, 'an-card'); cnn.style.clipPath = 'polygon(0 0, 100% 25%, 100% 75%, 0 100%)';
      cnn.style.borderColor = 'var(--accent-2)'; cnn.style.background = K.tint('--accent-2', 18);
      K.label(C, 500, 290, 'CNN', 'an-display', 'c').inner.style.fontSize = '36px';
      K.label(C, 510, 440, 'e.g. ResNet-50', 'an-tiny an-muted', 'c');
      var fm = K.box(C, 660, 205, 170, 170, '');
      for (var k = 0; k < 49; k++) { var c = K.box(fm, (k % 7) * 24.5, Math.floor(k / 7) * 24.5, 22, 22, ''); c.style.background = K.tint('--accent-2', 20 + (k * 37) % 60); c.style.borderRadius = '3px'; }
      K.label(C, 745, 400, '7 × 7 feature map', 'an-tiny an-muted', 'c');
      arrow(C, 880, 290, '49 tokens');
      var tr = K.box(C, 930, 215, 260, 150, 'an-card an-cell'); tr.style.borderColor = 'var(--accent)'; tr.style.background = K.tint('--accent', 14);
      tr.style.fontSize = '28px'; tr.textContent = 'Transformer';
      K.label(C, 1060, 400, 'DETR (2020) for detection', 'an-tiny an-muted', 'c');
      verdict(C, 760, 490, '~ works, but two different architectures', 'an-accent');
      // ---- patches
      var P = scene();
      cat(P, 60, 140, 300, 14);
      K.label(P, 210, 470, '14 × 14 = <b>196</b> patches', 'an-small', 'c');
      arrow(P, 430, 290, 'each patch a token');
      var prow = K.box(P, 490, 262, 380, 56, '');
      ['p₁', 'p₂', 'p₃', '…', 'p₁₉₆'].forEach(function (t, i) { var c = K.box(prow, i * 76, 0, 70, 52, 'an-tok' + (t === '…' ? ' is-ghost' : ' is-pos'), t); c.style.fontSize = '18px'; });
      var ghost = K.box(P, MX, MY, MS, MS, ''); ghost.style.border = '2px dashed var(--line)';
      K.label(P, MX + MS / 2, MY + MS / 2, 'option A, same scale', 'an-tiny an-muted', 'c');
      var tiny = MS * 196 / 50176;
      var mP = K.box(P, MX, MY, Math.max(2, tiny), Math.max(2, tiny), ''); mP.style.background = 'var(--pos)';
      var ring = K.box(P, MX - 14, MY - 14, 30, 30, ''); ring.style.border = '3px solid var(--pos)'; ring.style.borderRadius = '50%';
      K.label(P, MX + 26, MY - 22, '196 × 196 = 38,416 scores', 'an-small an-b an-pos', 'l');
      verdict(P, MX + MS / 2, MY + MS + 30, '65,536× fewer ✓', 'an-pos');
      var scenes = [A, B, C, P];
      return function (step) {
        scenes.forEach(function (s, i) { K.vis(s, i === step); });
        pills.forEach(function (p, i) { p.className = 'an-abs an-tok' + (i === step ? ' is-fill' : i < step ? (i < 2 ? ' is-neg' : i === 2 ? ' is-accent' : ' is-pos') : ' is-dim'); });
      };
    }
  });
})();
