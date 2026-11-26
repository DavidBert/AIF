/* anim-clip-matrix + anim-siglip-matrix — the N × N image–caption similarity matrix of a batch.
 * Real numbers (run 2026-11-11, CPU): openai/clip-vit-base-patch16 and google/siglip-base-patch16-224
 * on 4 public-domain / CC0 images (scikit-image sample data) and 4 captions.
 * clip-matrix steps: 0 batch · 1 cosine similarities · 2 row softmax (image→text) · 3 column softmax (text→image) · 4 positives vs negatives
 * siglip-matrix steps: 0 batch · 1 logits t·cos + b · 2 each cell is its own yes/no question (sigmoid) */
(function () {
  var K = window.AnimKit;
  var IMGS = ['cat', 'coffee', 'rocket', 'galaxies'];
  var CAPS = ['a cat lying on a blanket', 'a cup of coffee on a table', 'a rocket launching into the sky', 'galaxies in deep space'];
  var COS = [[0.240, 0.201, 0.176, 0.185], [0.129, 0.288, 0.138, 0.162], [0.143, 0.133, 0.252, 0.170], [0.178, 0.209, 0.191, 0.296]];
  var SIG = { t: 117.33, b: -12.93, z: [[-6.16, -14.71, -19.87, -18.73], [-17.88, -2.57, -22.31, -22.41], [-20.58, -14.12, -1.49, -10.84], [-17.92, -16.48, -14.76, -0.92]] };

  function frame(st) {
    var R = st.root, n = 4, X0 = 310, Y0 = 150, CW = 212, CH = 108;
    var thumbs = IMGS.map(function (nm, i) {
      var im = K.h('img', { src: 'assets/img/' + nm + '.jpg', alt: nm, class: 'an-abs' }, R);
      K.pos(im, X0 - 120, Y0 + i * CH + 6, CH - 12, CH - 12); im.style.borderRadius = '8px'; im.style.objectFit = 'cover';
      return im;
    });
    var il = K.label(R, X0 - 196, Y0 + n * CH / 2, 'images', 'an-small an-muted', 'c');
    il.inner.style.transform = 'translate(-50%,-50%) rotate(-90deg)';
    var caps = CAPS.map(function (c, j) {
      var b = K.box(R, X0 + j * CW + 8, Y0 - 92, CW - 16, 80, 'an-tok is-accent2');
      b.style.whiteSpace = 'normal'; b.style.textAlign = 'center'; b.style.fontSize = '20px'; b.style.lineHeight = '1.15'; b.style.padding = '4px 8px';
      b.textContent = c; return b;
    });
    K.label(R, X0 + n * CW / 2, Y0 - 120, 'captions', 'an-small an-muted', 'c');
    var cells = [];
    for (var i = 0; i < n; i++) {
      cells.push([]);
      for (var j = 0; j < n; j++) {
        var c = K.box(R, X0 + j * CW, Y0 + i * CH, CW, CH, 'an-cell');
        c.style.border = '1px solid var(--line)'; c.style.fontSize = '30px';
        cells[i].push(c);
      }
    }
    var rowHL = K.box(R, X0 - 4, Y0 - 4, n * CW + 8, CH + 8, 'an-off'); rowHL.style.border = '4px solid var(--accent)'; rowHL.style.borderRadius = '10px';
    var colHL = K.box(R, X0 - 4, Y0 - 4, CW + 8, n * CH + 8, 'an-off'); colHL.style.border = '4px solid var(--accent-2)'; colHL.style.borderRadius = '10px';
    return { R: R, n: n, X0: X0, Y0: Y0, CW: CW, CH: CH, cells: cells, rowHL: rowHL, colHL: colHL, side: X0 + n * CW + 26 };
  }
  function sm(a) { return K.softmax(a); }

  K.register('clip-matrix', {
    steps: 5,
    size: [1460, 640],
    captions: [
      'A batch of N image–caption pairs (here N = 4). Each tower encodes its side into ℝ<sup>512</sup>',
      'Cosine similarity of every image with every caption (real CLIP ViT-B/16 values)',
      'Rows: multiply by 1/τ = 100, softmax → “which caption is mine?” (image → text)',
      'Columns: the same question the other way (text → image)',
      'Loss = average cross-entropy of both directions: pull the <b style="color:var(--pos)">diagonal</b> up, push the rest down'
    ],
    build: function (st) {
      var f = frame(st), n = f.n, R = f.R;
      // real softmax outputs of the same run (computed from unrounded cosines)
      var rows = [[0.976, 0.019, 0.002, 0.004], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
      var colsIJ = [[0.998, 0, 0.001, 0], [0, 0.999, 0, 0], [0, 0, 0.997, 0], [0.002, 0, 0.002, 1]];
      var cols = [0, 1, 2, 3].map(function (j) { return colsIJ.map(function (r) { return r[j]; }); });
      var note = K.label(R, f.side, f.Y0 + 10, '', 'an-small', 'tl');
      note.inner.style.whiteSpace = 'normal'; note.inner.style.width = '270px';
      return function (step) {
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var c = f.cells[i][j], v = '', bg = 'transparent', fg = 'var(--fg)';
          if (step === 1) { v = COS[i][j].toFixed(2); bg = K.tint('--accent', 10 + 260 * (COS[i][j] - 0.12)); }
          if (step === 2) { v = rows[i][j].toFixed(2); bg = K.tint('--accent', 6 + 80 * rows[i][j]); }
          if (step === 3) { v = cols[j][i].toFixed(2); bg = K.tint('--accent-2', 6 + 80 * cols[j][i]); }
          if (step === 4) { v = i === j ? '✓' : '✗'; bg = K.tint(i === j ? '--pos' : '--neg', i === j ? 40 : 14); fg = i === j ? 'var(--pos)' : 'var(--neg)'; }
          c.textContent = v; c.style.background = bg; c.style.color = fg; c.style.fontWeight = (i === j && step >= 2) ? '700' : '400';
        }
        K.vis(f.rowHL, step === 2); K.vis(f.colHL, step === 3);
        note.inner.innerHTML = [
          '', 'cosines are small (0.13–0.30)…<br>but the diagonal wins every row',
          'row “cat”: <b>0.98</b> on its caption',
          'every column also picks its own image',
          'N positives, N² − N negatives.<br>CLIP: N = <b>32,768</b> → ≈ <b>1.07 billion</b> negatives per step'][step];
      };
    }
  });

  K.register('siglip-matrix', {
    steps: 3,
    size: [1460, 640],
    captions: [
      'Same batch, same two towers',
      'Logit of each pair: z = t · cos + b (real SigLIP-B/16: t ≈ 117, b ≈ −12.9)',
      'Each cell is its own binary question “is this a match?” → sigmoid loss. No softmax over the row or the column'
    ],
    build: function (st) {
      var f = frame(st), n = f.n, R = f.R;
      var note = K.label(R, f.side, f.Y0 + 10, '', 'an-small', 'tl');
      note.inner.style.whiteSpace = 'normal'; note.inner.style.width = '270px';
      return function (step) {
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
          var c = f.cells[i][j], z = SIG.z[i][j], v = '', bg = 'transparent', fg = 'var(--fg)';
          if (step === 1) { v = z.toFixed(1); bg = K.tint('--accent', 6 + 70 * Math.max(0, (z + 22) / 22)); }
          if (step === 2) { v = (i === j ? 'label +1' : 'label −1'); bg = K.tint(i === j ? '--pos' : '--neg', i === j ? 36 : 12); fg = i === j ? 'var(--pos)' : 'var(--neg)'; c.style.fontSize = '24px'; }
          else c.style.fontSize = '30px';
          c.textContent = v; c.style.background = bg; c.style.color = fg;
        }
        note.inner.innerHTML = ['', 'diagonal: −6 to −1<br>off-diagonal: −11 to −22', 'N² independent yes/no losses:<br>• no batch-wide normalisation<br>• easier to shard, fine with smaller batches'][step];
      };
    }
  });
})();
