/* anim-word2vec-cbow — Word2Vec training step, CBOW (default) or skip-gram (opts.mode = 'skipgram').
 * opts.sentence: 7-word sentence (default "I am eating a sandwich for lunch"), windows centred on words 2 and 3. */
(function () {
  var K = window.AnimKit;
  var D = 8;

  K.register('word2vec-cbow', {
    steps: 6,
    size: [1300, 620],
    labels: ['Context window', 'Embedding lookup', 'Combine', 'Predict', 'Learn', 'Slide the window'],
    captions: function (o) {
      if (o.mode === 'skipgram') return [
        'Skip-gram: take the <b>centre</b> word and try to predict the words around it',
        'Look up the centre word’s row in the embedding table E',
        'Score every vocabulary word against it: softmax(W′ v)',
        'Probability of each true context word — we want these to be high',
        'Training pairs (centre, context) → gradient updates E and W′',
        'Slide the window and repeat over the whole corpus'
      ];
      return [
        'CBOW: hide the <b>centre</b> word and use its context (±2 words) to guess it',
        'Each context word is an index → look up its row in the embedding table E',
        'Average (or sum) the context vectors into one vector h',
        'Score every vocabulary word: softmax(W′ h) → probability of the centre word',
        'Loss = −log p(“eating”) → gradient updates W′ <b>and the embeddings</b> E',
        'Slide the window and repeat over the whole corpus: embeddings slowly organise'
      ];
    },
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var skip = opts.mode === 'skipgram';
      var words = (opts.sentence || 'I am eating a sandwich for lunch').split(' ');
      var IDS = {}; words.forEach(function (w, i) { IDS[w] = [301, 125, 6595, 5899, 9812, 1037, 4471][i % 7] + (i >= 7 ? i : 0); });
      var WINS = [2, 3];
      var CANDS = skip ? null : [
        [[words[2], .46], ['drinking', .18], ['buying', .12], ['making', .09], ['holding', .05]],
        [[words[3], .58], ['the', .21], ['my', .09], ['one', .05], ['this', .03]]
      ];
      var SKIPP = [[.08, .11, .19, .14], [.05, .09, .22, .07]];

      // sentence
      var FS = 28, CW = FS * 0.6, GAP = 16, x = 60, Y0 = 30;
      var sent = words.map(function (w) {
        var wd = Math.max(w.length, 4) * CW + 28;
        var b = K.box(R, x, Y0, wd, 52, 'an-tok an-stack'); b.style.fontSize = FS + 'px';
        var t = K.h('span', { text: w }, b);
        var blank = K.h('span', { text: '____', class: 'an-muted' }, b);
        var it = { el: b, t: t, blank: blank, x: x, w: wd, word: w };
        x += wd + GAP;
        return it;
      });
      var win = K.box(R, 0, Y0 - 10, 10, 72, '');
      win.style.border = '2px solid var(--accent-2)'; win.style.borderRadius = '14px'; win.style.background = K.tint('--accent-2', 6);
      R.insertBefore(win, R.children[1]);
      var winLbl = K.label(R, 0, Y0 + 76, 'window ±2', 'an-small an-accent2', 'r');

      var rowsY = [150, 240, 330, 420], midY = 285;
      var AX = 40, AW = 230, BX = 320, CX = 600, DX = 900;
      var vecW = D * 22 + (D - 1) * 3;
      var arrows = [];

      // column A: input chips (4 context words for CBOW, 1 centre word for skip-gram)
      var inY = skip ? [midY] : rowsY;
      var ins = inY.map(function (y) {
        var b = K.box(R, AX, y - 26, AW, 52, 'an-tok an-off'); b.style.fontSize = '26px'; b.style.justifyContent = 'space-between'; b.style.padding = '0 14px';
        var w = K.h('span', null, b), id = K.h('span', { class: 'an-muted', style: { fontSize: '20px' } }, b);
        return { el: b, w: w, id: id, y: y };
      });
      var vecs = inY.map(function (y) { return K.vec(R, BX, y - 11, new Array(D).fill(0), { cell: 22, cls: 'an-off' }); });
      var hdrB = K.label(R, BX + vecW / 2, 112, 'embedding lookup  E[id]', 'an-small an-muted', 'c');
      var a1 = inY.map(function (y) { return K.path(svg, K.line(AX + AW + 8, y, BX - 12, y), { color: '--muted', width: 2, arrow: true }); });

      // column C
      var hVec = K.vec(R, CX, midY - 11, new Array(D).fill(0), { cell: 22, cls: 'an-off' });
      var hLbl = K.label(R, CX + vecW / 2, midY - 50, skip ? 'v = E[centre]' : 'h = mean(context vectors)', 'an-small', 'c');
      var a2 = inY.map(function (y) {
        return skip ? K.path(svg, K.line(BX + vecW + 10, y, CX - 12, midY), { color: '--muted', width: 2, arrow: true })
          : K.path(svg, K.hcurve(BX + vecW + 10, y, CX - 12, midY), { color: '--muted', width: 2, arrow: true });
      });
      var a3 = K.path(svg, K.line(CX + vecW + 10, midY, DX - 14, midY), { color: '--muted', width: 2, arrow: true });
      var a3lbl = K.label(R, (CX + vecW + DX) / 2, midY - 24, 'W′', 'an-mono an-small an-muted', 'c');

      // column D
      var BMAX = 180;
      var bars = [0, 1, 2, 3, 4].map(function (i) {
        var y = (skip ? rowsY[0] + i * 90 : 160 + i * 64);
        var g = K.box(R, DX, y - 24, 395, 48, 'an-off');
        var lab = K.box(g, 0, 0, 140, 48, 'an-tok'); lab.style.fontSize = '24px';
        var bar = K.box(g, 155, 10, 0, 28, 'an-bar');
        var num = K.label(g, 160, 24, '', 'an-mono an-small', 'l');
        return { g: g, lab: lab, bar: bar, num: num };
      });
      if (skip) bars = bars.slice(0, 4);
      var hdrD = K.label(R, DX + 200, 112, skip ? 'p(context | centre)' : 'p(centre | context)', 'an-small an-muted', 'c');
      var lossLbl = K.label(R, DX + 190, skip ? 490 : 470, '', 'an-small an-neg', 'c');
      // backprop arrow
      var back = K.path(svg, 'M' + (DX + 40) + ',' + (skip ? 455 : 450) + ' C ' + (DX - 60) + ',565 ' + (BX + 300) + ',565 ' + (BX + vecW / 2) + ',' + (skip ? 312 : 448),
        { color: '--neg', width: 2.5, dashed: '8 8', arrow: true });
      var backLbl = K.label(R, (BX + DX) / 2 + 40, 556, 'gradient → update E, W′', 'an-small an-neg', 'c');

      return function (step) {
        var w = step >= 5 ? 1 : 0, c = WINS[w];
        var ctxIdx = [c - 2, c - 1, c + 1, c + 2];
        // sentence
        sent.forEach(function (s, i) {
          var isC = i === c, isCtx = ctxIdx.indexOf(i) >= 0;
          var hidden = skip ? (isCtx && step < 3) : (isC && step < 3);
          K.vis(s.t, !hidden); K.vis(s.blank, hidden);
          s.el.className = 'an-abs an-tok an-stack' + (isC ? (skip ? ' is-fill' : ' is-accent') : isCtx ? ' is-accent2' : ' is-ghost');
          if (!skip && isC && step >= 3) s.el.className = 'an-abs an-tok an-stack is-pos';
          if (skip && isCtx && step >= 3) s.el.className = 'an-abs an-tok an-stack is-pos';
        });
        var lo = sent[c - 2], hi = sent[c + 2];
        K.pos(win, lo.x - 12, null, hi.x + hi.w - lo.x + 24);
        K.pos(winLbl, hi.x + hi.w + 10);
        // inputs + lookup
        var inWords = skip ? [words[c]] : ctxIdx.map(function (i) { return words[i]; });
        var vlist = inWords.map(function (iw) { return K.randVec('w2v' + iw, D); });
        ins.forEach(function (it, k) {
          K.vis(it.el, step >= 1);
          it.w.textContent = inWords[k]; it.id.textContent = '#' + IDS[inWords[k]];
          it.el.className = 'an-abs an-tok' + (skip ? ' is-fill' : ' is-accent2') + (step >= 1 ? '' : ' an-off');
          it.el.style.color = skip ? 'var(--surface)' : '';
          it.id.style.color = skip ? 'var(--surface)' : '';
          vecs[k].set(vlist[k]); K.vis(vecs[k], step >= 1);
          K.draw(a1[k], step >= 1);
          K.draw(a2[k], step >= 2);
        });
        K.vis(hdrB, step >= 1);
        var h = new Array(D).fill(0);
        vlist.forEach(function (v) { v.forEach(function (x, j) { h[j] += x / vlist.length; }); });
        if (!skip) h = h.map(function (x) { return Math.max(-1, Math.min(1, x * 1.8)); });
        hVec.set(h); K.vis(hVec, step >= 2); K.vis(hLbl, step >= 2);
        K.draw(a3, step >= 3); K.vis(a3lbl, step >= 3);
        K.vis(hdrD, step >= 3);
        bars.forEach(function (b, i) {
          K.vis(b.g, step >= 3);
          var name, p, target;
          if (skip) { name = words[ctxIdx[i]]; p = SKIPP[w][i]; target = true; }
          else { name = CANDS[w][i][0]; p = CANDS[w][i][1]; target = i === 0; }
          b.lab.textContent = name;
          b.lab.className = 'an-abs an-tok' + (target ? ' is-pos' : '');
          var bw = p / (skip ? 0.25 : 0.6) * BMAX;
          b.bar.style.width = bw + 'px';
          b.bar.style.background = target ? 'var(--pos)' : 'color-mix(in srgb, var(--muted) 45%, var(--surface))';
          K.pos(b.num, 155 + bw + 10); b.num.inner.textContent = p.toFixed(2);
        });
        var learn = step === 4;
        K.draw(back, learn); K.vis(backLbl, learn);
        lossLbl.inner.innerHTML = skip ? 'loss = −Σ log p(context | centre)' : 'loss = −log p(“' + words[c] + '”) = ' + (-Math.log(CANDS[w][0][1])).toFixed(2);
        K.vis(lossLbl, step >= 4);
      };
    }
  });
})();
