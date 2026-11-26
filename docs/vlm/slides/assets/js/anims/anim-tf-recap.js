/* anim-tf-recap — the Transformer recap, one piece per click, on "The cat sat on the mat".
 * Token IDs are the real GPT-2 ones; embedding values and attention weights are illustrative.
 * Steps: 0 tokens · 1 embeddings · 2 positions · 3 self-attention · 4 [CLS] · 5 the question for images */
(function () {
  var K = window.AnimKit;
  var TOK = [['The', 464, '--q'], ['␣cat', 3797, '--k'], ['␣sat', 3332, '--v'], ['␣on', 319, '--pos'], ['␣the', 262, '--accent'], ['␣mat', 2603, '--neg']];
  var ATT = [0.06, 0.38, 0.22, 0.08, 0.04, 0.22];        // illustrative: where "sat" looks
  K.register('tf-recap', {
    steps: 6,
    size: [1440, 600],
    captions: [
      '<b>Token</b>: the tokenizer cuts text into pieces from a fixed vocabulary; each piece is an integer ID',
      '<b>Embedding</b>: each ID selects one row of a learned table → one vector per token',
      '<b>Position</b>: attention will ignore order, so a position vector is added to each token embedding',
      '<b>Self-attention</b>: every token builds its new vector as a weighted mix of all the others (here: “sat”)',
      '<b>[CLS]</b>: an extra token in front; its output vector summarises the whole sentence (e.g. for classification)',
      'All of this assumes a vocabulary of tokens. Pixels have none: <b>what is a token for an image?</b>'
    ],
    build: function (st) {
      var R = st.root, svg = st.layer();
      var names = ['Token', 'Embedding', 'Position', 'Self-attention', '[CLS]'];
      var pills = names.map(function (n, i) {
        var p = K.box(R, 300 + i * 190, 18, 170, 40, 'an-tok', n); p.style.fontFamily = 'var(--font-body)'; p.style.fontSize = '20px'; return p;
      });
      var X = function (i) { return 330 + i * 140; }, TY = 150, TW = 112;
      var chips = TOK.map(function (t, i) {
        var b = K.box(R, X(i), TY, TW, 52, 'an-tok'); b.style.fontSize = '24px'; b.textContent = t[0];
        b.style.borderColor = 'var(' + t[2] + ')'; b.style.background = K.tint(t[2], 18);
        var id = K.label(R, X(i) + TW / 2, TY + 72, String(t[1]), 'an-mono an-small an-muted', 'c');
        return { b: b, id: id };
      });
      // embedding table
      var tab = K.box(R, 0, 0, 1440, 600, '');
      K.label(tab, 130, 236, 'embedding table', 'an-small an-b', 'c');
      K.label(tab, 130, 262, '50,257 rows × 768', 'an-mono an-tiny an-muted', 'c');
      for (var r = 0; r < 9; r++) K.vec(tab, 60, 284 + r * 22, K.randVec('tab' + r, 6), { cell: 18, gap: 2, color: r === 3 ? '--k' : '--muted' });
      // embedding vectors under each token
      var EY = 260, embs = TOK.map(function (t, i) { return K.vec(R, X(i) + 18, EY, K.randVec('e' + t[0], 6), { cell: 26, gap: 3, vertical: true, color: t[2] }); });
      // attention arcs from "sat"
      var arcs = TOK.map(function (t, i) {
        var x1 = X(2) + TW / 2, x2 = X(i) + TW / 2, y = TY - 6;
        var d = i === 2 ? 'M' + (x1 - 16) + ',' + y + ' C' + (x1 - 40) + ',' + (y - 70) + ' ' + (x1 + 40) + ',' + (y - 70) + ' ' + (x1 + 16) + ',' + y
          : 'M' + x1 + ',' + y + ' Q' + ((x1 + x2) / 2) + ',' + (y - 40 - Math.abs(x2 - x1) * 0.25) + ' ' + x2 + ',' + y;
        var p = K.s('path', { d: d, style: 'fill:none;stroke:var(--accent);stroke-linecap:round;stroke-width:0;opacity:0' }, svg);
        return p;
      });
      var wl = TOK.map(function (t, i) { return K.label(R, X(i) + TW / 2, TY + 72, 'α = ' + ATT[i].toFixed(2), 'an-mono an-small an-accent an-b', 'c'); });
      var mixed = K.vec(R, X(2) + 74, EY, [0.5, -0.3, 0.6, 0.2, -0.5, 0.4], { cell: 26, gap: 3, vertical: true, color: '--fg' });
      var mixL = K.label(R, X(2) + 87, EY + 200, 'new “sat”', 'an-tiny an-b', 'c');
      // positions
      var pos = TOK.map(function (t, i) {
        var g = K.box(R, 0, 0, 1440, 600, '');
        K.label(g, X(i) + 66, EY + 85, '+', 'an-display', 'c').inner.style.fontSize = '30px';
        K.vec(g, X(i) + 78, EY, K.randVec('p' + i, 6), { cell: 26, gap: 3, vertical: true, color: '--accent-2' });
        K.label(g, X(i) + 91, EY + 200, 'pos ' + i, 'an-mono an-tiny an-accent2', 'c');
        return g;
      });
      var shuf = K.label(R, X(0), 520, '“mat the on sat cat The” = same set of vectors without positions', 'an-small an-muted', 'l');
      // CLS
      var cls = K.box(R, X(-1) + 6, TY, 100, 52, 'an-tok is-fill', '[CLS]'); cls.style.fontSize = '20px';
      var clsV = K.vec(R, X(-1) + 42, EY, K.randVec('cls', 6), { cell: 26, gap: 3, vertical: true, color: '--accent' });
      var clsL = K.label(R, X(-1) + 56, EY + 200, 'summary of<br>the sentence', 'an-tiny an-accent an-b', 'c'); clsL.inner.style.textAlign = 'center';
      // question
      var q = K.box(R, 1180, 120, 240, 330, 'an-card'); q.style.borderColor = 'var(--accent)';
      var qi = K.h('img', { src: 'assets/img/cat.jpg', alt: 'Cat photo', class: 'an-abs' }, q); K.pos(qi, 30, 24, 176, 176); qi.style.borderRadius = '8px';
      K.label(q, 118, 236, 'tokens = ?', 'an-display', 'c').inner.style.fontSize = '36px';
      K.label(q, 118, 284, 'no vocabulary,<br>no IDs', 'an-small an-muted', 'c').inner.style.textAlign = 'center';
      return function (step) {
        pills.forEach(function (p, i) { p.className = 'an-abs an-tok' + (i === step ? ' is-fill' : i < step ? ' is-accent' : ' is-dim'); });
        chips.forEach(function (c) { K.vis(c.id, step <= 1 || step === 5); });
        K.vis(tab, step === 1);
        embs.forEach(function (e, i) { K.vis(e, step >= 1); e.style.opacity = step >= 1 ? (step === 3 && i !== 2 ? 0.55 : 1) : 0; });
        arcs.forEach(function (p, i) { p.style.strokeWidth = step === 3 ? (2 + 26 * ATT[i]) : 0; p.style.opacity = step === 3 ? 0.35 + ATT[i] * 1.6 : 0; });
        wl.forEach(function (l) { K.vis(l, step === 3); });
        K.vis(mixed, step === 3); K.vis(mixL, step === 3);
        pos.forEach(function (g) { K.vis(g, step === 2); }); K.vis(shuf, step === 2);
        K.vis(cls, step >= 4); K.vis(clsV, step === 4); K.vis(clsL, step === 4);
        K.vis(q, step === 5);
      };
    }
  });
})();
