/* anim-next-token — autoregressive generation: distribution → sample → append (×4), then temperature.
 * opts.temperature: list of 3 temperatures shown at the end (default [1, 0.2, 2]). Probabilities illustrative. */
(function () {
  var K = window.AnimKit;
  var PROMPT = 'The cat sat on the';
  // [candidates, index sampled]
  var DISTS = [
    [[['mat', .41], ['floor', .18], ['sofa', .12], ['roof', .08], ['table', .06]], 0],
    [[['.', .32], ['and', .27], [',', .15], ['while', .07], ['all', .05]], 1],
    [[['purred', .29], ['fell', .22], ['looked', .14], ['slept', .10], ['started', .08]], 1],
    [[['asleep', .78], ['off', .09], ['down', .05], ['over', .03], ['silent', .02]], 0]
  ];
  K.register('next-token', {
    steps: 12,
    size: [1200, 600],
    labels: ['Prompt', 'Distribution #1', 'Sample “mat”', 'Distribution #2', 'Sample “and”', 'Distribution #3', 'Sample “fell”', 'Distribution #4', 'Sample “asleep”', 'Temperature A', 'Temperature B', 'Temperature C'],
    captions: function (o) {
      var T = o.temperature || [1, 0.2, 2];
      var tc = function (t) {
        return t === 1 ? 'T = 1: the model’s own distribution'
          : t < 1 ? 'T = ' + t + ': sharper → almost greedy, more deterministic'
            : 'T = ' + t + ': flatter → more diverse (and more mistakes)';
      };
      return [
        'A language model reads the prompt…',
        '… and outputs a probability for <b>every</b> token of its vocabulary (top 5 shown)',
        'Sample a token and append it to the text',
        'Feed the longer text back in → a new distribution',
        'Sampling, not arg-max: “and” (p = 0.27) was drawn this time',
        'Repeat, one token at a time…',
        '…',
        '“asleep” is very likely here',
        'That loop is all an LLM does at inference: <b>predict, sample, append</b>',
        'Temperature rescales the logits, p ∝ exp(logit / T) — ' + tc(T[0]),
        tc(T[1]),
        tc(T[2])
      ];
    },
    build: function (st, opts) {
      var R = st.root;
      var T = opts.temperature || [1, 0.2, 2];
      var FS = 36, CW = FS * 0.6, TX = 60, TY = 40;
      var pr = K.box(R, TX, TY, PROMPT.length * CW, 56, 'an-cell'); pr.style.fontSize = FS + 'px'; pr.textContent = PROMPT; pr.style.justifyContent = 'flex-start';
      // generated chips positions
      var x = TX + PROMPT.length * CW + CW;
      var gen = DISTS.map(function (d) {
        var w = d[0][d[1]][0], wd = w.length * CW + 20;
        var it = { w: w, x: x, wd: wd };
        x += wd + CW * 0.6;
        return it;
      });
      var caret = K.box(R, 0, TY + 6, 4, 44, ''); caret.style.background = 'var(--accent)';
      // chart
      var CX = 300, BMAX = 600, RY0 = 196, RDY = 68;
      var title = K.label(R, 60, 150, 'p(next token | text so far)', 'an-small an-muted', 'l');
      var tLbl = K.label(R, 1140, 150, '', 'an-mono', 'r'); tLbl.inner.style.fontSize = '30px';
      var rows = [0, 1, 2, 3, 4].map(function (i) {
        var y = RY0 + i * RDY;
        var lab = K.box(R, 60, y, 210, 52, 'an-tok'); lab.style.fontSize = '28px';
        var bar = K.box(R, CX, y + 10, 0, 32, 'an-bar');
        var num = K.label(R, CX, y + 26, '', 'an-mono an-small', 'l');
        return { lab: lab, bar: bar, num: num, y: y };
      });
      var chips = gen.map(function (g, k) {
        var c = K.box(R, 60, RY0 + DISTS[k][1] * RDY, g.wd, 52, 'an-tok is-accent an-off'); c.style.fontSize = FS - 4 + 'px'; c.textContent = g.w;
        return c;
      });
      function tempProbs(dist, t) {
        var ps = dist.map(function (c) { return c[1]; });
        var other = Math.max(0.01, 1 - ps.reduce(function (a, b) { return a + b; }, 0));
        var logits = ps.concat([other]).map(Math.log);
        return K.softmax(logits, t).slice(0, ps.length);
      }

      return function (step) {
        var temp = step >= 9 ? T[step - 9] : null;
        var k = temp !== null ? 0 : Math.floor((step - 1) / 2); // distribution index
        var sampling = temp === null && step >= 2 && step % 2 === 0;
        var nAppended = temp !== null ? 4 : Math.floor(step / 2);
        var showChart = step >= 1;
        // text
        chips.forEach(function (c, i) {
          var on = i < nAppended;
          K.vis(c, on);
          if (on) K.pos(c, gen[i].x, TY + 2);
          else K.pos(c, 60, RY0 + DISTS[i][1] * RDY);
          c.style.opacity = temp !== null ? 0.3 : '';
        });
        var cx = temp !== null ? TX + PROMPT.length * CW + 6 : (nAppended ? gen[nAppended - 1].x + gen[nAppended - 1].wd + 8 : TX + PROMPT.length * CW + 6);
        K.pos(caret, cx); caret.style.opacity = step === 0 || (!sampling && temp === null) || temp !== null ? 1 : 0;
        // chart
        K.vis(title, showChart);
        tLbl.inner.innerHTML = temp !== null ? 'T = ' + temp : '';
        K.vis(tLbl, temp !== null);
        var dist = DISTS[Math.max(0, Math.min(3, k))];
        var ps = temp !== null ? tempProbs(dist[0], temp) : dist[0].map(function (c) { return c[1]; });
        rows.forEach(function (r, i) {
          K.vis(r.lab, showChart); K.vis(r.num, showChart);
          r.lab.textContent = dist[0][i][0];
          var sampled = sampling && i === dist[1];
          r.lab.className = 'an-abs an-tok' + (sampled ? ' is-accent' : '') + (showChart ? '' : ' an-off');
          var w = showChart ? ps[i] * BMAX : 0;
          r.bar.style.width = w + 'px';
          r.bar.style.background = sampled || (temp !== null && i === 0) ? 'var(--accent)' : 'color-mix(in srgb, var(--muted) 45%, var(--surface))';
          K.pos(r.num, CX + w + 12);
          r.num.inner.innerHTML = showChart ? ps[i].toFixed(2) + (sampled ? '  <span class="an-accent">← sampled</span>' : '') : '';
        });
      };
    }
  });
})();
