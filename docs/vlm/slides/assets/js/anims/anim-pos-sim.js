/* anim-pos-sim — why ViT needs positions, how it adds them, and what it learned.
 * Step 2 uses real data: cosine similarity between the learned position embeddings of
 * google/vit-base-patch16-224 (window.VIT_DATA.possim, run 2026-11-11).
 * Steps: 0 shuffled patches look the same to attention · 1 patch embedding + position embedding · 2 learned similarity maps */
(function () {
  var K = window.AnimKit;
  function tile(parent, x, y, s, r, c, n) {           // a crop of the cat: cell (r, c) of an n × n grid
    var t = K.box(parent, x, y, s, s, '');
    t.style.backgroundImage = 'url(assets/img/cat-224.png)';
    t.style.backgroundSize = (s * n) + 'px ' + (s * n) + 'px';
    t.style.backgroundPosition = (-c * s) + 'px ' + (-r * s) + 'px';
    t.style.borderRadius = '4px';
    return t;
  }
  K.register('pos-sim', {
    steps: 3,
    size: [1400, 560],
    captions: [
      'Shuffle the patches: attention sees the same <b>set</b> of tokens, so it gives the same outputs, just reordered',
      'Fix: add a <b>learned</b> vector for each position index (0 … 196). Only a 1D index: no row, no column',
      'After training (real weights): each position is most similar to its <b>neighbours</b>, its row and its column. The 2D grid was learned'
    ],
    build: function (st) {
      var R = st.root, D = (window.VIT_DATA || {}).possim || { q: [], maps: [] };
      // ---- group A: original vs shuffled
      var A = K.box(R, 0, 0, 1400, 560, '');
      var S = 78, G = 4, gap = 4, AX = 170, AY = 90, W4 = G * S + (G - 1) * gap;
      var order = [9, 2, 14, 5, 0, 11, 7, 12, 3, 15, 1, 8, 13, 6, 10, 4];
      for (var k = 0; k < 16; k++) {
        tile(A, AX + (k % G) * (S + gap), AY + Math.floor(k / G) * (S + gap), S, Math.floor(k / G), k % G, G);
        var o = order[k];
        tile(A, 1400 - AX - W4 + (k % G) * (S + gap), AY + Math.floor(k / G) * (S + gap), S, Math.floor(o / G), o % G, G);
      }
      K.label(A, AX + W4 / 2, AY - 30, 'original order', 'an-small an-b', 'c');
      K.label(A, 1400 - AX - W4 / 2, AY - 30, 'shuffled', 'an-small an-b', 'c');
      var eqA = K.label(A, 700, AY + W4 / 2, '=', 'an-display', 'c'); eqA.inner.style.fontSize = '90px';
      K.label(A, 700, AY + W4 / 2 + 70, 'for attention', 'an-small an-muted', 'c');
      // ---- group B: patch embedding + position embedding
      var B = K.box(R, 0, 0, 1400, 560, '');
      var BY = 150;
      tile(B, 120, BY, 120, 5, 3, 14);
      K.label(B, 180, BY + 150, 'patch p74 (the eye)', 'an-small', 'c');
      K.label(B, 290, BY + 60, '→', 'an-display', 'c').inner.style.fontSize = '44px';
      var v1 = K.vec(B, 340, BY - 30, K.randVec('patch74', 8), { cell: 22, gap: 3, vertical: true, color: '--accent' });
      K.label(B, 351, BY + 190, 'patch embedding', 'an-tiny', 'c');
      K.label(B, 440, BY + 60, '+', 'an-display', 'c').inner.style.fontSize = '54px';
      var v2 = K.vec(B, 520, BY - 30, K.randVec('pos74', 8), { cell: 22, gap: 3, vertical: true, color: '--accent-2' });
      K.label(B, 531, BY + 190, 'position 74', 'an-tiny an-accent2 an-b', 'c');
      K.label(B, 620, BY + 60, '=', 'an-display', 'c').inner.style.fontSize = '54px';
      var v3 = K.vec(B, 700, BY - 30, K.randVec('tok74', 8).map(function (x) { return x * 0.9; }), { cell: 22, gap: 3, vertical: true, color: '--fg' });
      K.label(B, 711, BY + 190, 'token fed to the Transformer', 'an-tiny', 'c');
      // the learned table
      var TX = 930, TY = 70;
      K.label(B, TX + 170, TY - 26, 'learned table: 197 × 768', 'an-small an-b', 'c');
      ['0 [CLS]', '1', '2', '…', '74', '…', '196'].forEach(function (lab, r) {
        K.label(B, TX + 60, TY + 22 + r * 52, lab, 'an-mono an-small ' + (lab === '74' ? 'an-accent2 an-b' : 'an-muted'), 'r');
        if (lab !== '…') K.vec(B, TX + 80, TY + 10 + r * 52, K.randVec('row' + lab, 10), { cell: 22, gap: 3, color: '--accent-2' });
      });
      // ---- group C: three real similarity maps
      var C = K.box(R, 0, 0, 1400, 560, ''), svg = K.s('svg', { class: 'an-svg', viewBox: '0 0 1400 560', width: 1400, height: 560 }, C);
      function col(v) { return K.tint('--accent', 3 + 97 * Math.pow(Math.max(0, v), 1.3)); }
      var picks = [[1, 1], [7, 7], [13, 11]], MS = 330, MG = 90, MX0 = (1400 - 3 * MS - 2 * MG) / 2, MY = 70;
      picks.forEach(function (p, j) {
        var qi = D.q.indexOf(p[0] * 14 + p[1]), m = D.maps[qi] || [], x = MX0 + j * (MS + MG), c = MS / 14;
        for (var k = 0; k < 196; k++) K.s('rect', { x: (x + (k % 14) * c).toFixed(1), y: (MY + Math.floor(k / 14) * c).toFixed(1), width: (c + 0.4).toFixed(1), height: (c + 0.4).toFixed(1), style: 'fill:' + col(m[k] === undefined ? 0 : m[k]) }, svg);
        K.s('rect', { x: x + p[1] * c, y: MY + p[0] * c, width: c, height: c, style: 'fill:none;stroke:var(--fg);stroke-width:4' }, svg);
        K.s('rect', { x: x, y: MY, width: MS, height: MS, style: 'fill:none;stroke:var(--line);stroke-width:1.5' }, svg);
        K.label(C, x + MS / 2, MY - 26, 'position (row ' + p[0] + ', col ' + p[1] + ')', 'an-small an-b', 'c');
      });
      K.label(C, 700, MY + MS + 34, 'cosine similarity to every other position · <span class="an-accent an-b">strong colour = similar</span> · real ViT-B/16 weights', 'an-small an-muted', 'c');
      return function (step) { K.vis(A, step === 0); K.vis(B, step === 1); K.vis(C, step === 2); };
    }
  });
})();
