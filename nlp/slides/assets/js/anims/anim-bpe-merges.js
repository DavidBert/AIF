/* anim-bpe-merges — Byte-pair encoding training on a tiny corpus (Sennrich et al. 2016 example).
 * opts.corpus: [[word, freq], ...]  (default low×5, lower×2, newest×6, widest×3)
 * Steps: 0 corpus, 1 split into characters, 2..7 merges #1..#6 */
(function () {
  var K = window.AnimKit;
  var NMERGE = 6;

  function countPairs(seg) {
    var map = new Map();
    seg.forEach(function (w) {
      for (var i = 0; i + 1 < w.syms.length; i++) {
        var a = w.syms[i].t, b = w.syms[i + 1].t, k = a + '\u0001' + b;
        if (!map.has(k)) map.set(k, { a: a, b: b, n: 0 });
        map.get(k).n += w.f;
      }
    });
    var arr = Array.from(map.values());
    arr.forEach(function (p, i) { p.order = i; });
    arr.sort(function (x, y) { return y.n - x.n || x.order - y.order; });
    return arr;
  }
  function mergeSeg(seg, a, b) {
    return seg.map(function (w) {
      var out = [];
      for (var i = 0; i < w.syms.length; i++) {
        var s = w.syms[i];
        if (i + 1 < w.syms.length && s.t === a && w.syms[i + 1].t === b) {
          out.push({ s: s.s, e: w.syms[i + 1].e, t: a + b }); i++;
        } else out.push(s);
      }
      return { w: w.w, f: w.f, syms: out };
    });
  }
  function symHtml(t) {
    return t.replace(/_$/, '<span class="an-muted">_</span>');
  }

  K.register('bpe-merges', {
    steps: 2 + NMERGE,
    size: [1200, 600],
    labels: ['Corpus with word counts', 'Split into characters', 'Merge #1', 'Merge #2', 'Merge #3', 'Merge #4', 'Merge #5', 'Merge #6'],
    captions: [
      'Training corpus: each word with its frequency',
      'Start from <b>characters</b> (+ end-of-word marker _) and count every adjacent pair',
      'Merge the most frequent pair into a new symbol, add it to the vocabulary, recount',
      'Repeat: merge the most frequent pair…',
      '… “est_” becomes a unit: a reusable suffix',
      'Merges are learned greedily from frequency, no linguistics involved',
      '“low” is now a single token',
      'Stop after a fixed number of merges → vocabulary size is a <b>hyper-parameter</b>'
    ],
    build: function (st, opts) {
      var R = st.root;
      var corpus = opts.corpus || [['low', 5], ['lower', 2], ['newest', 6], ['widest', 3]];
      var seg0 = corpus.map(function (c) {
        var txt = c[0] + '_';
        return { w: txt, f: c[1], syms: txt.split('').map(function (ch, i) { return { s: i, e: i + 1, t: ch }; }) };
      });
      var states = [seg0], merges = [];
      for (var k = 0; k <= NMERGE; k++) {
        var pc = countPairs(states[k]);
        if (!pc.length) break;
        merges.push(pc[0]);
        states.push(mergeSeg(states[k], pc[0].a, pc[0].b));
      }

      // panels
      K.label(R, 40, 34, 'Corpus', 'an-title', 'l');
      K.label(R, 680, 34, 'Pair counts', 'an-title', 'l');
      var nextTag = K.label(R, 1160, 34, 'most frequent = next merge', 'an-small an-accent', 'r');
      var FS = 28, CW = FS * 0.6, PAD = 10, SG = 6, BH = 52, X0 = 130;
      var rowY = function (i) { return 78 + i * 66; };

      // frequency labels
      corpus.forEach(function (c, i) {
        K.label(R, 40, rowY(i) + BH / 2, '×' + c[1], 'an-mono an-muted', 'l');
      });

      // symbol elements keyed by word:start:end (+raw)
      var symEls = {};
      function symEl(wi, s, e, t, raw) {
        var key = wi + ':' + s + ':' + e + (raw ? ':raw' : '');
        if (symEls[key]) return symEls[key];
        var w = t.length * CW + 2 * PAD;
        var b = K.box(R, 0, rowY(wi), w, BH, 'an-tok an-off');
        b.style.fontSize = FS + 'px';
        b.innerHTML = raw ? t : symHtml(t);
        symEls[key] = { b: b, w: w, t: t, placed: false };
        return symEls[key];
      }
      function layoutWord(wi, syms) {
        var x = X0, out = [];
        syms.forEach(function (sy) {
          var e = symEl(wi, sy.s, sy.e, sy.t, false);
          out.push({ e: e, x: x, t: sy.t });
          x += e.w + SG;
        });
        return out;
      }
      // pre-create everything with initial positions
      var layouts = states.map(function (seg) { return seg.map(function (w, wi) { return layoutWord(wi, w.syms); }); });
      layouts.forEach(function (L) { L.forEach(function (row) { row.forEach(function (it) {
        if (!it.e.placed) { it.e.b.style.left = it.x + 'px'; it.e.placed = true; }
      }); }); });
      var rawEls = corpus.map(function (c, wi) {
        var e = symEl(wi, 0, c[0].length, c[0], true);
        e.b.style.left = X0 + 'px';
        return e;
      });

      // pair-count rows (top 5)
      var TOP = 5, PX = 680, BX = 820, BMAX = 250;
      var maxN = 0;
      var pairLists = states.map(function (seg) { var l = countPairs(seg).slice(0, TOP); l.forEach(function (p) { maxN = Math.max(maxN, p.n); }); return l; });
      var pairEls = {};
      function pairEl(p) {
        var key = p.a + '\u0001' + p.b;
        if (pairEls[key]) return pairEls[key];
        var g = K.box(R, PX, 0, 480, BH, 'an-off');
        var lab = K.box(g, 0, 0, 130, BH, 'an-cell');
        lab.innerHTML = symHtml(p.a) + '<span class="an-muted"> + </span>' + symHtml(p.b);
        lab.style.fontSize = '24px'; lab.style.justifyContent = 'flex-start';
        var bar = K.box(g, BX - PX, 12, 0, BH - 24, 'an-bar');
        var num = K.label(g, BX - PX, BH / 2, '', 'an-mono', 'l');
        pairEls[key] = { g: g, bar: bar, num: num, placed: false };
        return pairEls[key];
      }
      pairLists.forEach(function (l) { l.forEach(function (p, r) {
        var e = pairEl(p);
        if (!e.placed) { e.g.style.top = rowY(r) + 'px'; e.placed = true; }
      }); });

      // merges + vocabulary
      K.label(R, 40, 452, 'Merges', 'an-small an-muted', 'l');
      K.label(R, 40, 522, 'Vocab', 'an-small an-muted', 'l');
      var mergeChips = [];
      var mx = 150;
      merges.slice(0, NMERGE).forEach(function (m, i) {
        var txt = m.a + ' + ' + m.b + ' → ' + m.a + m.b;
        var w = txt.length * 12.6 + 22;
        if (i === 3) { mx = 150; }
        var c = K.box(R, mx, 430, w, 44, 'an-tok an-off');
        c.style.fontSize = '21px';
        c.innerHTML = symHtml(m.a) + '<span class="an-muted"> + </span>' + symHtml(m.b) + '<span class="an-muted"> → </span>' + symHtml(m.a + m.b);
        c.dataset.w = w;
        mergeChips.push(c);
      });
      // lay merges in one row (shrink if needed)
      var totalW = mergeChips.reduce(function (a, c) { return a + (+c.dataset.w) + 10; }, 0);
      var mscale = Math.min(1, (1160 - 150) / totalW);
      mx = 150;
      mergeChips.forEach(function (c) {
        var w = +c.dataset.w * mscale; c.style.width = w + 'px'; c.style.left = mx + 'px';
        if (mscale < 1) c.style.fontSize = (21 * mscale) + 'px';
        mx += w + 10 * mscale;
      });
      var base = [];
      seg0.forEach(function (w) { w.syms.forEach(function (s) { if (base.indexOf(s.t) < 0) base.push(s.t); }); });
      base.sort(function (a, b) { return a === '_' ? 1 : b === '_' ? -1 : a < b ? -1 : 1; });
      var vocab = base.map(function (t) { return { t: t, k: -1 }; })
        .concat(merges.slice(0, NMERGE).map(function (m, i) { return { t: m.a + m.b, k: i }; }));
      var vx = 150;
      var vocabEls = vocab.map(function (v) {
        var w = v.t.length * 13.2 + 20;
        var c = K.box(R, vx, 500, w, 44, 'an-tok' + (v.k >= 0 ? ' is-accent an-off' : ' an-off'));
        c.style.fontSize = '22px'; c.innerHTML = symHtml(v.t);
        vx += w + 8;
        return { el: c, k: v.k };
      });
      var vocabSize = K.label(R, 1160, 522, '', 'an-small an-muted', 'r');

      return function (step) {
        var raw = step === 0;
        var si = Math.max(0, step - 1);           // segmentation state shown
        var nDone = Math.max(0, step - 1);        // merges done
        var next = merges[si];
        // words
        rawEls.forEach(function (e) { K.vis(e.b, raw); e.b.className = 'an-abs an-tok is-raw' + (raw ? '' : ' an-off'); });
        var shown = {};
        if (!raw) {
          layouts[si].forEach(function (row, wi) {
            var syms = row;
            for (var i = 0; i < syms.length; i++) {
              var it = syms[i];
              shown[wi + ':' + it.e.b.style.top + it.t + it.x] = 1;
              it.e._show = true;
              it.e.b.style.left = it.x + 'px';
              var isNew = nDone > 0 && it.t === merges[nDone - 1].a + merges[nDone - 1].b;
              var isPair = next && ((it.t === next.a && syms[i + 1] && syms[i + 1].t === next.b) ||
                (it.t === next.b && syms[i - 1] && syms[i - 1].t === next.a && !(syms[i - 2] && syms[i - 2].t === next.a && syms[i - 1].t === next.b)));
              it.e.b.className = 'an-abs an-tok' + (isNew ? ' is-accent' : isPair ? ' is-accent2' : '');
            }
          });
        }
        Object.keys(symEls).forEach(function (k) {
          var e = symEls[k];
          if (k.slice(-4) === ':raw') return;
          if (!e._show) K.vis(e.b, false);
          e._show = false;
        });
        // pairs
        var list = raw ? [] : pairLists[si];
        Object.keys(pairEls).forEach(function (k) { pairEls[k]._r = -1; });
        list.forEach(function (p, r) { pairEls[p.a + '\u0001' + p.b]._r = r; pairEls[p.a + '\u0001' + p.b]._n = p.n; });
        Object.keys(pairEls).forEach(function (k) {
          var e = pairEls[k];
          if (e._r < 0) { K.vis(e.g, false); return; }
          K.vis(e.g, true);
          e.g.style.top = rowY(e._r) + 'px';
          e.bar.style.width = (e._n / maxN * BMAX) + 'px';
          e.bar.style.background = e._r === 0 ? 'var(--accent)' : 'color-mix(in srgb, var(--muted) 45%, var(--surface))';
          K.pos(e.num, BX - 680 + e._n / maxN * BMAX + 12);
          e.num.inner.textContent = e._n;
          e.num.inner.style.color = e._r === 0 ? 'var(--accent)' : 'var(--muted)';
        });
        K.vis(nextTag, !raw);
        mergeChips.forEach(function (c, i) {
          K.vis(c, i < nDone);
          c.className = 'an-abs an-tok' + (i === nDone - 1 ? ' is-accent' : '') + (i < nDone ? '' : ' an-off');
        });
        var vs = 0;
        vocabEls.forEach(function (v) {
          var on = !raw && (v.k < 0 || v.k < nDone);
          K.vis(v.el, on);
          if (on) vs++;
        });
        vocabSize.inner.textContent = raw ? '' : '|V| = ' + vs;
      };
    }
  });
})();
