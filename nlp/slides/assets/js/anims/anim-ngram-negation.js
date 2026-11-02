/* anim-ngram-negation — "I do not like carrots" vs "I do like carrots":
 * unigram vectors are nearly identical, bigrams expose the negation. */
(function () {
  var K = window.AnimKit;
  function cos(a, b) {
    var d = 0, na = 0, nb = 0;
    for (var i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return d / Math.sqrt(na * nb);
  }
  K.register('ngram-negation', {
    steps: 5,
    size: [1200, 600],
    labels: ['Two opposite sentences', 'Unigram vectors', 'Unigram similarity', 'Bigrams', 'Bigram similarity'],
    captions: [
      'Two sentences with <b>opposite</b> meanings',
      'Bag of words (unigrams): the vectors differ in a single position',
      'Cosine similarity is high — the model barely sees the negation',
      'Use <b>n-grams</b>: count pairs of consecutive words (“do not”, “not like”)',
      'Bigram vectors alone: cos 0.58 (unigrams + bigrams: 0.76) — order shows up, the vocabulary explodes'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var sents = opts.sentences || ['I do not like carrots', 'I do like carrots'];
      var FS = 30, CW = FS * 0.6, SX = 110;
      var words = sents.map(function (s) { return s.split(' '); });
      // sentence layout
      var wpos = words.map(function (ws, i) {
        var idx = 0, y = 26 + i * 84;
        K.label(R, 40, y + 22, '(' + (i + 1) + ')', 'an-mono an-muted', 'l').inner.style.fontSize = '26px';
        return ws.map(function (w) {
          var x = SX + idx * CW;
          var b = K.box(R, x - 6, y, w.length * CW + 12, 44, 'an-cell');
          b.style.fontSize = FS + 'px'; b.textContent = w; b.style.borderRadius = '8px';
          idx += w.length + 1;
          return { x: x, c: x + w.length * CW / 2, y: y, el: b, w: w };
        });
      });
      // bigram arcs under sentences
      var arcs = wpos.map(function (ws, si) {
        return ws.slice(0, -1).map(function (p, i) {
          var q = ws[i + 1], y = p.y + 48, dip = 12 + (i % 2) * 8;
          var neg = (p.w === 'do' && q.w === 'not') || (p.w === 'not' && q.w === 'like') || (si === 1 && p.w === 'do' && q.w === 'like');
          var path = K.path(svg, 'M' + (p.c) + ',' + y + ' Q' + ((p.c + q.c) / 2) + ',' + (y + dip * 2) + ' ' + q.c + ',' + y,
            { color: neg ? '--accent' : '--muted', width: neg ? 3.5 : 2 });
          return path;
        });
      });

      function vocabOf(n) {
        var v = [];
        words.forEach(function (ws) { for (var i = 0; i + n <= ws.length; i++) { var g = ws.slice(i, i + n).join(' '); if (v.indexOf(g) < 0) v.push(g); } });
        return v;
      }
      function vecs(voc, n) {
        return words.map(function (ws) {
          var grams = []; for (var i = 0; i + n <= ws.length; i++) grams.push(ws.slice(i, i + n).join(' '));
          return voc.map(function (g) { return grams.filter(function (x) { return x === g; }).length; });
        });
      }
      function table(n, y0, title) {
        var voc = vocabOf(n), V = vecs(voc, n), TX = 170, RH = 50, CWs = 26 * 0.6;
        var widths = voc.map(function (g) { return Math.max(90, g.length * CWs + 30); });
        var xs = [], x = TX; widths.forEach(function (w) { xs.push(x); x += w + 6; });
        var g = K.box(R, 0, 0, 1200, 600, 'an-off');
        var t = K.label(g, 40, y0 + 22, title, 'an-display an-accent', 'l'); t.inner.style.fontSize = '28px';
        var heads = voc.map(function (w, j) {
          var c = K.box(g, xs[j], y0, widths[j], 44, 'an-tok'); c.style.fontSize = '26px'; c.textContent = w; return c;
        });
        var cells = V.map(function (row, i) {
          K.label(g, 40, y0 + 56 + i * RH + RH / 2, 'doc ' + (i + 1), 'an-muted', 'l');
          return row.map(function (v, j) {
            var c = K.box(g, xs[j], y0 + 56 + i * RH, widths[j], RH - 4, 'an-cell');
            c.style.fontSize = '28px'; c.textContent = v; c.style.borderRadius = '8px';
            c.style.color = v ? 'var(--fg)' : 'var(--muted)';
            return c;
          });
        });
        var cs = cos(V[0], V[1]);
        var cosL = K.label(g, x + 30, y0 + 56 + RH, 'cos = <b>' + cs.toFixed(2) + '</b>', 'an-mono', 'l');
        cosL.inner.style.fontSize = '30px';
        return { g: g, voc: voc, V: V, heads: heads, cells: cells, cosL: cosL, cos: cs, right: x };
      }
      var uni = table(1, 218, 'unigrams');
      var bi = table(2, 388, 'bigrams');
      var note1 = K.label(R, uni.right + 30, 218 + 56 + 50 + 44, 'opposite meaning, almost the same vector', 'an-small an-neg', 'l');
      var note2 = K.label(R, bi.right + 30, 388 + 56 + 50 + 44, 'the negation is now visible', 'an-small an-pos', 'l');

      return function (step) {
        K.vis(uni.g, step >= 1);
        K.vis(bi.g, step >= 3);
        // unigram: highlight differing column
        uni.voc.forEach(function (w, j) {
          var diff = uni.V[0][j] !== uni.V[1][j];
          uni.heads[j].className = 'an-abs an-tok' + (diff && step >= 1 ? ' is-accent' : '');
          uni.cells.forEach(function (row) { row[j].style.background = diff && step >= 1 ? K.tint('--accent', 16) : 'transparent'; });
        });
        bi.voc.forEach(function (w, j) {
          var diff = bi.V[0][j] !== bi.V[1][j];
          bi.heads[j].className = 'an-abs an-tok' + (diff ? ' is-accent' : '');
          bi.cells.forEach(function (row) { row[j].style.background = diff ? K.tint('--accent', 16) : 'transparent'; });
        });
        K.vis(uni.cosL, step >= 2);
        uni.cosL.inner.style.color = 'var(--neg)';
        K.vis(note1, step >= 2);
        K.vis(bi.cosL, step >= 4);
        bi.cosL.inner.style.color = 'var(--pos)';
        K.vis(note2, step >= 4);
        arcs.forEach(function (row) { row.forEach(function (p) { K.draw(p, step >= 3); }); });
        // emphasise "not"
        wpos[0].forEach(function (p) {
          var hl = p.w === 'not' && step >= 1;
          p.el.style.background = hl ? K.tint('--accent', 22) : 'transparent';
        });
      };
    }
  });
})();
