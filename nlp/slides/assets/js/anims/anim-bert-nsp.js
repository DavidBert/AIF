/* anim-bert-nsp — BERT input representation (token + segment + position embeddings) and the
 * Next Sentence Prediction objective, with the BERT paper's example pairs. Probabilities illustrative. */
(function () {
  var K = window.AnimKit;
  K.register('bert-nsp', {
    steps: 7,
    size: [1480, 640],
    labels: ['Sentence pair', 'Token embeddings', 'Segment embeddings', 'Position embeddings', 'Sum = input', 'NSP: IsNext', 'NSP: NotNext'],
    captions: [
      'Two sentences packed into one input: <b>[CLS]</b> A <b>[SEP]</b> B <b>[SEP]</b>',
      'Token embeddings: one learned vector per (sub)word',
      'Segment embeddings: E<sub>A</sub> for the first sentence, E<sub>B</sub> for the second',
      'Position embeddings: one learned vector per position (0 … 511)',
      'Input of the encoder = token + segment + position (element-wise sum)',
      'Next Sentence Prediction: the [CLS] output classifies “is B the real next sentence?” → <b>IsNext</b>',
      '50% of the time B is a random sentence → <b>NotNext</b> (later work, e.g. RoBERTa, dropped NSP)'
    ],
    build: function (st) {
      var R = st.root, svg = st.svg;
      var A = ['[CLS]', 'the', 'man', 'went', 'to', 'the', 'store', '[SEP]'];
      var B1 = ['he', 'bought', 'a', 'gallon', 'of', 'milk', '[SEP]'];
      var B2 = ['the', 'sky', 'is', 'blue', 'today', '[SEP]'];
      var N = A.length + B1.length, X0 = 170, SLOT = (1470 - X0) / N;
      var cx = []; for (var j = 0; j < N; j++) cx.push(X0 + SLOT * (j + 0.5));
      var TY = 520, RH = 46, ROW = { tok: 452, seg: 392, pos: 332, sum: 244 };
      function chip(j, t, cls) {
        var b = K.box(R, cx[j] - SLOT / 2 + 3, TY, SLOT - 6, 46, 'an-tok ' + (cls || ''));
        b.style.fontFamily = 'var(--font-body)'; b.style.fontSize = t.length > 7 ? '17px' : '22px'; b.textContent = t;
        if (t[0] === '[') { b.style.fontFamily = 'var(--font-mono)'; b.style.fontSize = '19px'; b.style.fontWeight = '600'; }
        return b;
      }
      var aCh = A.map(function (t, j) { return chip(j, t); });
      var b1Ch = B1.map(function (t, i) { return chip(A.length + i, t); });
      var b2Ch = B2.map(function (t, i) { return chip(A.length + i, t, 'an-off'); });
      var segAL = K.label(R, (cx[1] + cx[A.length - 2]) / 2, 236, 'sentence A', 'an-small an-accent', 'c');
      var segBL = K.label(R, (cx[A.length] + cx[N - 2]) / 2, 236, 'sentence B', 'an-small an-accent2', 'c');
      segAL.remove(); segBL.remove();

      // embedding rows
      var lbls = {}, cells = { tok: [], seg: [], pos: [], sum: [] };
      [['tok', 'token'], ['seg', 'segment'], ['pos', 'position'], ['sum', '= input']].forEach(function (r) {
        lbls[r[0]] = K.label(R, X0 - 18, ROW[r[0]] + RH / 2, r[1], 'an-small' + (r[0] === 'sum' ? ' an-b' : ' an-muted'), 'r');
      });
      var plus = [K.label(R, 30, (ROW.tok + ROW.seg + RH) / 2, '+', 'an-muted', 'c'), K.label(R, 30, (ROW.seg + ROW.pos + RH) / 2, '+', 'an-muted', 'c')];
      var sep = K.s('line', { x1: 40, x2: 1470, y1: ROW.pos - 16, y2: ROW.pos - 16, style: 'stroke:var(--line);stroke-width:2' }, svg);
      for (j = 0; j < N; j++) {
        var x = cx[j] - SLOT / 2 + 5, w = SLOT - 10;
        var t = K.vec(R, cx[j] - (4 * 16 + 9) / 2, ROW.tok + 14, K.randVec('tok' + j, 4), { cell: 16, color: '--muted' });
        cells.tok.push(t);
        var isA = j < A.length;
        var s = K.box(R, x, ROW.seg, w, RH, 'an-cell'); s.style.borderRadius = '8px';
        s.style.background = K.tint(isA ? '--accent' : '--accent-2', 28); s.innerHTML = 'E<sub>' + (isA ? 'A' : 'B') + '</sub>'; s.style.fontSize = '21px'; s.style.fontFamily = 'var(--font-body)';
        cells.seg.push(s);
        var p = K.box(R, x, ROW.pos, w, RH, 'an-cell'); p.style.borderRadius = '8px'; p.style.border = '1.5px solid var(--line)';
        p.innerHTML = 'E<sub>' + j + '</sub>'; p.style.fontSize = '21px'; p.style.fontFamily = 'var(--font-body)';
        cells.pos.push(p);
        var sm = K.box(R, x, ROW.sum, w, RH + 6, 'an-cell'); sm.style.borderRadius = '8px'; sm.style.border = '2px solid var(--fg)';
        sm.style.background = 'linear-gradient(180deg,' + K.tint('--muted', 25) + ',' + K.tint(isA ? '--accent' : '--accent-2', 30) + ')';
        cells.sum.push(sm);
      }
      var upSum = cx.map(function (x) { return K.path(svg, K.line(x, ROW.sum - 4, x, 214), { color: '--muted', width: 2, arrow: true, arrowSize: 10 }); });
      var embUp = cx.map(function (x) { return K.path(svg, K.line(x, TY - 4, x, ROW.sum + RH + 14), { color: '--line', width: 2, arrow: true, arrowSize: 10 }); });
      var embL = K.label(R, 1470, (TY + ROW.sum + RH + 6) / 2, 'token + segment + position', 'an-tiny an-muted', 'r');
      embL.inner.style.background = 'var(--surface)'; embL.inner.style.padding = '2px 8px';
      // encoder + NSP head
      var enc = K.box(R, X0, 132, 1470 - X0, 74, 'an-card an-cell');
      enc.style.fontFamily = 'var(--font-display)'; enc.style.fontSize = '30px'; enc.style.borderColor = 'var(--accent)'; enc.style.background = K.tint('--accent', 10);
      enc.textContent = 'BERT encoder';
      var cOut = K.box(R, cx[0] - 30, 46, 60, 48, 'an-tok is-fill an-display'); cOut.textContent = 'C'; cOut.style.fontSize = '28px'; cOut.style.color = 'var(--surface)';
      var cUp = K.path(svg, K.line(cx[0], 128, cx[0], 100), { color: '--accent', width: 2.5, arrow: true });
      var cls = K.box(R, cx[0] + 90, 46, 210, 48, 'an-tok'); cls.style.fontFamily = 'var(--font-body)'; cls.style.fontSize = '22px'; cls.textContent = 'linear + softmax';
      var cA = K.path(svg, K.line(cx[0] + 34, 70, cx[0] + 84, 70), { color: '--accent', width: 2.5, arrow: true });
      var cB = K.path(svg, K.line(cx[0] + 306, 70, cx[0] + 356, 70), { color: '--accent', width: 2.5, arrow: true });
      var res = K.box(R, cx[0] + 364, 30, 520, 80, '');
      var r1 = K.label(res, 0, 22, '', 'an-mono', 'l'), r2 = K.label(res, 0, 58, '', 'an-mono an-small an-muted', 'l');

      return function (step) {
        var swap = step >= 6;
        b1Ch.forEach(function (c) { K.vis(c, !swap); });
        b2Ch.forEach(function (c) { K.vis(c, swap); });
        // colour chips by segment once segments are shown
        aCh.forEach(function (c) { c.style.borderColor = step >= 2 ? 'var(--accent)' : ''; });
        b1Ch.concat(b2Ch).forEach(function (c) { c.style.borderColor = step >= 2 ? 'var(--accent-2)' : ''; });
        
        var nTok = swap ? A.length + B2.length : N;
        var embOn = step >= 1 && step <= 4;
        ['tok', 'seg', 'pos'].forEach(function (r, ri) {
          var on = step >= ri + 1 && step <= 4;
          K.vis(lbls[r], on);
          cells[r].forEach(function (c, j) { K.vis(c, on && j < nTok); });
        });
        plus.forEach(function (p, i) { K.vis(p, step >= i + 2 && step <= 4); });
        sep.style.opacity = step === 4 ? 1 : 0;
        K.vis(lbls.sum, step >= 4);
        cells.sum.forEach(function (c, j) { K.vis(c, step >= 4 && j < nTok); });
        var head = step >= 5;
        K.vis(enc, head);
        upSum.forEach(function (u, j) { K.draw(u, head && j < nTok); });
        embUp.forEach(function (u, j) { K.draw(u, head && j < nTok); }); K.vis(embL, head);
        K.vis(cOut, head); K.draw(cUp, head); K.vis(cls, head); K.draw(cA, head); K.draw(cB, head); K.vis(res, head);
        r1.inner.innerHTML = swap ? '<b class="an-neg">NotNext</b>  p = 0.94' : '<b class="an-pos">IsNext</b>  p = 0.97';
        r2.inner.innerHTML = swap ? 'IsNext 0.06' : 'NotNext 0.03';
      };
    }
  });
})();
