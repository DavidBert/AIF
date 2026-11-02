/* anim-bow-vectorize — Bag of Words: vocabulary → one-hot → counts → df/idf → TF-IDF.
 * opts.docs: two (or three) short sentences; opts.log: 10 (default, as in the course) or 'e' */
(function () {
  var K = window.AnimKit;
  K.register('bow-vectorize', {
    steps: 6,
    size: [1200, 600],
    labels: ['Two documents', 'Build the vocabulary', 'One-hot (presence)', 'Term frequency (counts)', 'Document frequency & IDF', 'TF-IDF weights'],
    captions: function (o) {
      return [
        'Two documents. Goal: turn each one into a <b>fixed-size vector</b>',
        'Vocabulary = every distinct (lower-cased) token in the corpus → one column each',
        'One-hot / binary: 1 if the word appears in the document, 0 otherwise',
        'Term frequency: count the occurrences (“the” appears twice in doc 2)',
        'Words present in <b>every</b> document carry little information → idf = log(N / df) = 0',
        'TF-IDF = tf × idf: shared words vanish, <b>distinctive</b> words stand out'
      ];
    },
    build: function (st, opts) {
      var R = st.root;
      var docs = opts.docs || ['I am going to the supermarket', 'The post office is close to the supermarket'];
      var useLn = opts.log === 'e';
      var FS = 26, CW = FS * 0.6;
      var toks = docs.map(function (d) { return d.toLowerCase().split(/\s+/); });
      var vocab = [];
      toks.forEach(function (t) { t.forEach(function (w) { if (vocab.indexOf(w) < 0) vocab.push(w); }); });
      var N = docs.length;
      var counts = toks.map(function (t) { return vocab.map(function (w) { return t.filter(function (x) { return x === w; }).length; }); });
      var df = vocab.map(function (w, j) { return counts.filter(function (c) { return c[j] > 0; }).length; });
      var idf = df.map(function (d) { return useLn ? Math.log(N / d) : Math.log10(N / d); });
      var tfidf = counts.map(function (c) { return c.map(function (v, j) { return v * idf[j]; }); });

      // sentences
      var SX = 110, SY0 = 34, SDY = 50;
      var origin = {};
      docs.forEach(function (d, i) {
        K.label(R, 40, SY0 + i * SDY + 20, '(' + (i + 1) + ')', 'an-mono an-muted', 'l').inner.style.fontSize = FS + 'px';
        var idx = 0;
        d.split(/\s+/).forEach(function (w) {
          var x = SX + idx * CW;
          var lw = w.toLowerCase();
          if (!origin[lw]) origin[lw] = { x: x, y: SY0 + i * SDY, w: w.length * CW };
          var sp = K.box(R, x, SY0 + i * SDY, w.length * CW, 40, 'an-cell');
          sp.style.fontSize = FS + 'px'; sp.textContent = w;
          sp.dataset.w = lw;
          (origin[lw].els = origin[lw].els || []).push(sp);
          idx += w.length + 1;
        });
      });

      // table geometry
      var LX = 40, LW = 120, TX = LX + LW;
      var colW = vocab.map(function (w) { return Math.max(82, w.length * CW + 26); });
      var tot = colW.reduce(function (a, b) { return a + b; }, 0);
      var avail = 1160 - TX;
      if (tot < avail) { var extra = (avail - tot) / vocab.length; colW = colW.map(function (w) { return w + Math.min(extra, 20); }); }
      var colX = [], x = TX;
      colW.forEach(function (w) { colX.push(x); x += w; });
      var tableR = x;
      var HY = 140, RH = 56, rowY = [HY + 66, HY + 66 + RH];
      var DFY = rowY[1] + RH + 26, IDFY = DFY + RH;

      // grid lines (svg)
      var svg = st.svg;
      var gl = [];
      function hline(y, x1, x2, cls) { var p = K.s('line', { x1: x1, x2: x2, y1: y, y2: y, style: 'stroke:var(--line);stroke-width:2' }, svg); gl.push(p); return p; }
      var lineDocs = [hline(rowY[0] - 4, LX, tableR), hline(rowY[1], LX, tableR), hline(rowY[1] + RH + 4, LX, tableR)];
      var lineIdf = [hline(DFY - 4, LX, tableR), hline(IDFY, LX, tableR), hline(IDFY + RH + 4, LX, tableR)];

      // header chips (fly from the sentences)
      var heads = vocab.map(function (w, j) {
        var c = K.box(R, origin[w].x - 8, origin[w].y, w.length * CW + 16, 44, 'an-tok an-off');
        c.style.fontSize = FS + 'px'; c.textContent = w;
        return c;
      });
      var modeLbl = K.label(R, LX, HY + 22, '', 'an-display an-accent', 'l');
      modeLbl.inner.style.fontSize = '30px';
      var rowLbls = docs.map(function (d, i) { return K.label(R, LX, rowY[i] + RH / 2, 'doc ' + (i + 1), 'an-muted', 'l'); });
      var dfLbl = K.label(R, LX, DFY + RH / 2, 'df', 'an-muted', 'l');
      var idfLbl = K.label(R, LX, IDFY + RH / 2, 'idf', 'an-muted', 'l');
      var formula = K.label(R, 1160, IDFY + RH + 34, (useLn ? 'idf(t) = ln(N / df(t))' : 'idf(t) = log<sub>10</sub>(N / df(t))') + ',  N = ' + N + '   ·   tf-idf = tf × idf', 'an-small an-muted', 'r');

      function fmt(v) { if (v === 0) return '0'; var s = v.toFixed(2); return s; }
      // cells
      var cells = counts.map(function (row, i) {
        return vocab.map(function (w, j) {
          var c = K.box(R, colX[j], rowY[i], colW[j], RH, 'an-cell an-stack');
          c.style.fontSize = FS + 'px';
          c.style.borderRadius = '8px';
          var layers = {
            bin: K.h('span', { text: row[j] > 0 ? '1' : '0' }, c),
            cnt: K.h('span', { text: String(row[j]) }, c),
            tfidf: K.h('span', { text: fmt(tfidf[i][j]) }, c)
          };
          return { el: c, L: layers, v: row[j], t: tfidf[i][j] };
        });
      });
      var dfCells = vocab.map(function (w, j) {
        var c = K.box(R, colX[j], DFY, colW[j], RH, 'an-cell'); c.style.fontSize = FS + 'px'; c.textContent = df[j]; return c;
      });
      var idfCells = vocab.map(function (w, j) {
        var c = K.box(R, colX[j], IDFY, colW[j], RH, 'an-cell'); c.style.fontSize = FS + 'px'; c.textContent = fmt(idf[j]);
        c.style.color = idf[j] === 0 ? 'var(--neg)' : 'var(--fg)';
        return c;
      });

      return function (step) {
        // sentence words highlight when building vocab
        Object.keys(origin).forEach(function (w) {
          origin[w].els.forEach(function (sp) { sp.style.color = step === 1 ? 'var(--accent)' : 'var(--fg)'; });
        });
        heads.forEach(function (c, j) {
          var on = step >= 1;
          K.vis(c, on);
          if (on) { K.pos(c, colX[j] + 4, HY, colW[j] - 8, 50); }
          else { K.pos(c, origin[vocab[j]].x - 8, origin[vocab[j]].y - 2, vocab[j].length * CW + 16, 44); }
          c.className = 'an-abs an-tok' + (step >= 4 && idf[j] === 0 ? ' is-dim' : '') + (on ? '' : ' an-off');
        });
        var mode = step === 2 ? 'bin' : (step === 3 || step === 4) ? 'cnt' : step >= 5 ? 'tfidf' : null;
        modeLbl.inner.textContent = mode === 'bin' ? 'one-hot' : mode === 'cnt' ? 'counts' : mode === 'tfidf' ? 'tf-idf' : '';
        rowLbls.forEach(function (l) { K.vis(l, step >= 2); });
        lineDocs.forEach(function (l) { l.style.opacity = step >= 1 ? 1 : 0; });
        cells.forEach(function (row) {
          row.forEach(function (c, j) {
            K.vis(c.el, !!mode);
            Object.keys(c.L).forEach(function (k) { K.vis(c.L[k], k === mode); });
            var bg = 'transparent', col = 'var(--fg)';
            if (mode === 'bin' && c.v > 0) bg = K.tint('--accent', 18);
            if (mode === 'cnt' && c.v > 0) bg = K.tint('--accent', c.v > 1 ? 50 : 18);
            if (mode === 'cnt' && step === 4 && idf[j] === 0) col = 'var(--muted)';
            if (mode === 'tfidf') { if (c.t > 0) bg = K.tint('--pos', 22); else col = 'var(--muted)'; }
            if (!c.v && mode) col = 'var(--muted)';
            c.el.style.background = bg; c.el.style.color = col;
          });
        });
        var showIdf = step >= 4;
        lineIdf.forEach(function (l) { l.style.opacity = showIdf ? 1 : 0; });
        K.vis(dfLbl, showIdf); K.vis(idfLbl, showIdf); K.vis(formula, showIdf);
        dfCells.forEach(function (c) { K.vis(c, showIdf); });
        idfCells.forEach(function (c) { K.vis(c, showIdf); });
      };
    }
  });
})();
