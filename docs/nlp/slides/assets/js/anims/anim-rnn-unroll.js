/* anim-rnn-unroll — an RNN reading "I am eating a" token by token. The hidden state is drawn as a
 * stacked bar whose colours show how much of each past word it still contains; last step shows the
 * vanishing contribution of an early word over a long sequence. */
(function () {
  var K = window.AnimKit;
  var COLORS = ['--q', '--k', '--v', '--accent', '--pos', '--accent-2'];

  K.register('rnn-unroll', {
    steps: 7,
    size: [1300, 620],
    labels: ['Unrolled RNN', 't = 1: “I”', 't = 2: “am”', 't = 3: “eating”', 't = 4: “a”', 'Prediction', 'Vanishing information'],
    captions: [
      'The same cell (same weights) is applied at every time step; h<sub>0</sub> = 0',
      'h<sub>1</sub> = tanh(W<sub>x</sub> x<sub>1</sub> + W<sub>h</sub> h<sub>0</sub>): the state now encodes “I”',
      'h<sub>2</sub> mixes the new word with the previous state',
      'Each step blends in the new token… older tokens fade',
      'h<sub>4</sub> summarises the whole prefix in one fixed-size vector',
      'A classifier on the last state predicts the next word',
      'Long sequences: the early word “keys” has almost <b>vanished</b> by the time we must predict “are”'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var words = opts.words || ['I', 'am', 'eating', 'a'];
      var preds = opts.predictions || [['sandwich', .24], ['lot', .15], ['pizza', .11], ['banana', .08]];
      var decay = 0.55;
      var main = K.box(R, 0, 0, 1300, 620, '');
      var msvg = K.s('svg', { class: 'an-svg', viewBox: '0 0 1300 620', width: 1300, height: 620 }, main);
      var CX = words.map(function (w, i) { return 230 + i * 210; });
      var CY = 372, CWd = 120, CH = 76, BY = 116, BH = 170, BW = 44;
      // h0
      var h0 = K.box(main, 60 - BW / 2, BY, BW, BH, '');
      h0.style.border = '2px dashed var(--line)'; h0.style.borderRadius = '6px';
      K.label(main, 60, BY + BH + 24, 'h<sub>0</sub> = 0', 'an-small an-muted', 'c');
      var h0arrow = K.path(msvg, 'M' + 60 + ',' + (BY + BH + 44) + ' L60,' + CY + ' L' + (CX[0] - CWd / 2 - 8) + ',' + CY, { color: '--muted', width: 2.5, arrow: true });
      var cols = words.map(function (w, i) {
        var cx = CX[i];
        var cell = K.box(main, cx - CWd / 2, CY - CH / 2, CWd, CH, 'an-tok an-display');
        cell.style.fontSize = '28px'; cell.style.fontFamily = 'var(--font-display)'; cell.textContent = 'RNN';
        var chip = K.box(main, cx - 70, 490, 140, 52, 'an-tok'); chip.style.fontSize = '28px'; chip.textContent = w;
        chip.style.borderColor = 'var(' + COLORS[i] + ')';
        var xin = K.path(msvg, K.line(cx, 488, cx, CY + CH / 2 + 8), { color: COLORS[i], width: 3, arrow: true });
        var up = K.path(msvg, K.line(cx, CY - CH / 2 - 4, cx, BY + BH + 10), { color: '--muted', width: 2.5, arrow: true });
        var right = i < words.length - 1 ? K.path(msvg, K.line(cx + CWd / 2 + 4, CY, CX[i + 1] - CWd / 2 - 8, CY), { color: '--muted', width: 2.5, arrow: true }) : null;
        var hl = K.label(main, cx + CWd / 2 + 40, CY - 18, 'h<sub>' + (i + 1) + '</sub>', 'an-small an-muted', 'c');
        if (!right) K.vis(hl, false);
        var bar = K.box(main, cx - BW / 2, BY, BW, BH, '');
        bar.style.borderRadius = '6px'; bar.style.overflow = 'hidden'; bar.style.border = '2px solid var(--line)';
        var segs = words.map(function (w2, j) {
          var sg = K.box(bar, 0, 0, BW - 4, 0, ''); sg.style.background = 'var(' + COLORS[j] + ')'; return sg;
        });
        var blbl = K.label(main, cx, BY - 22, 'h<sub>' + (i + 1) + '</sub>', 'an-small', 'c');
        return { cell: cell, chip: chip, xin: xin, up: up, right: right, bar: bar, segs: segs, blbl: blbl };
      });
      // prediction panel
      var PX = CX[3] + 110, PY = 96;
      var predArrow = K.path(msvg, 'M' + (CX[3] + BW / 2 + 8) + ',' + (BY + 40) + ' L' + (PX - 8) + ',' + (BY + 40), { color: '--muted', width: 2.5, arrow: true });
      var predG = K.box(main, PX, PY, 330, 230, '');
      K.label(predG, 0, 0, 'ŷ = softmax(W<sub>y</sub> h<sub>4</sub>)', 'an-small an-muted', 'tl');
      var predBars = preds.map(function (p, i) {
        var y = 44 + i * 46;
        var l = K.label(predG, 0, y + 18, p[0], 'an-mono an-small', 'l');
        var b = K.box(predG, 120, y + 6, 0, 26, 'an-bar'); b.style.background = i === 0 ? 'var(--accent)' : 'color-mix(in srgb, var(--muted) 45%, var(--surface))';
        var n = K.label(predG, 120, y + 18, p[1].toFixed(2), 'an-mono an-tiny an-muted', 'l');
        return { b: b, n: n, p: p[1] };
      });

      // long-sequence panel
      var longP = K.box(R, 0, 0, 1300, 620, 'an-off');
      var lsvg = K.s('svg', { class: 'an-svg', viewBox: '0 0 1300 620', width: 1300, height: 620 }, longP);
      var LW = (opts.longSentence || 'The keys to the cabinet in the old house by the river are').split(' ');
      var KEY = 1, step0 = 1220 / LW.length, LBY = 110, LBH = 290;
      K.label(longP, 40, 40, 'share of h<sub>t</sub> still coming from “keys”', 'an-small an-muted', 'l');
      var lcols = LW.map(function (w, t) {
        var cx = 60 + step0 * (t + 0.5);
        var lbl = K.label(longP, cx, 450, w, '', 'c'); lbl.inner.style.fontSize = '23px';
        if (t === KEY) lbl.inner.style.color = 'var(--accent)', lbl.inner.style.fontWeight = '700';
        if (t === LW.length - 1) lbl.inner.style.fontWeight = '700';
        var bar = K.box(longP, cx - 20, LBY, 40, LBH, '');
        bar.style.border = '2px solid var(--line)'; bar.style.borderRadius = '6px'; bar.style.overflow = 'hidden';
        var share = t < KEY ? 0 : 0.7 * Math.pow(0.72, t - KEY);
        var seg = K.box(bar, 0, LBH - 4, 36, 0, ''); seg.style.background = 'var(--accent)';
        var pct = K.label(longP, cx, LBY - 20, t < KEY ? '' : Math.round(share * 100) + '%', 'an-tiny an-mono', 'c');
        pct.inner.style.color = 'var(--accent)';
        seg.style.transitionDelay = (t * 70) + 'ms';
        return { seg: seg, share: share, pct: pct };
      });
      var c0 = 60 + step0 * (KEY + 0.5), c1 = 60 + step0 * (LW.length - 0.5);
      var dep = K.path(lsvg, 'M' + c0 + ',476 C' + c0 + ',532 ' + c1 + ',532 ' + c1 + ',476', { color: '--neg', width: 2.5, dashed: '7 6', arrow: true });
      var depL = K.label(longP, (c0 + c1) / 2, 545, 'agreement: keys … <b>are</b>', 'an-small an-neg', 'c');

      return function (step) {
        var long = step >= 6;
        K.vis(main, !long); K.vis(longP, long);
        var t = Math.min(step, 4);
        K.draw(h0arrow, step >= 1);
        cols.forEach(function (c, i) {
          var done = i < t, active = i === t - 1;
          c.cell.className = 'an-abs an-tok an-display' + (active ? ' is-accent' : done ? '' : ' is-dim');
          K.draw(c.xin, done); K.draw(c.up, done);
          if (c.right) K.draw(c.right, i < t - 1);
          c.chip.style.background = done ? K.tint(COLORS[i], 18) : 'var(--surface)';
          K.vis(c.bar, done); K.vis(c.blbl, done);
          // composition of h_{i+1}
          var ws = words.map(function (w, j) { return j <= i ? Math.pow(decay, i - j) : 0; });
          var z = ws.reduce(function (a, b) { return a + b; }, 0);
          var y = BH - 4;
          c.segs.forEach(function (sg, j) {
            var hgt = done ? (ws[j] / z) * (BH - 4) : 0;
            y -= hgt;
            sg.style.top = y + 'px'; sg.style.height = hgt + 'px';
          });
        });
        K.draw(predArrow, step >= 5);
        K.vis(predG, step >= 5);
        predBars.forEach(function (p) { p.b.style.width = (step >= 5 ? p.p / 0.3 * 160 : 0) + 'px'; K.pos(p.n, 120 + (step >= 5 ? p.p / 0.3 * 160 : 0) + 10); });
        lcols.forEach(function (c) {
          var hgt = long ? c.share * (LBH - 4) : 0;
          c.seg.style.height = hgt + 'px'; c.seg.style.top = (LBH - 4 - hgt) + 'px';
          K.vis(c.pct, long);
        });
        K.draw(dep, long); K.vis(depL, long);
      };
    }
  });
})();
