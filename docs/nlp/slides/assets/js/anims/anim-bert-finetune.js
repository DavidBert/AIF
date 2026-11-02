/* anim-bert-finetune — one pre-trained BERT body, three task heads:
 * sentence classification ([CLS]), token classification (NER), extractive QA (start/end span). */
(function () {
  var K = window.AnimKit;
  var SETS = {
    gen: ['[CLS]', 'w₁', 'w₂', 'w₃', '…', 'wₙ', '[SEP]'],
    cls: ['[CLS]', 'this', 'movie', 'was', 'great', '!', '[SEP]'],
    ner: ['[CLS]', 'Ada', 'Lovelace', 'was', 'born', 'in', 'London', '[SEP]'],
    qa: ['[CLS]', 'When', 'was', 'Ada', 'born', '?', '[SEP]', 'Ada', 'was', 'born', 'in', 'December', '1815', '.', '[SEP]']
  };
  var TAGS = [null, ['B-PER', '--accent'], ['I-PER', '--accent'], ['O'], ['O'], ['O'], ['B-LOC', '--accent-2'], null];
  K.register('bert-finetune', {
    steps: 5,
    size: [1400, 640],
    labels: ['Pre-trained body', 'Sentence classification', 'Token classification (NER)', 'Extractive QA', 'One body, many heads'],
    captions: [
      'Start from the pre-trained BERT body: one contextual vector T<sub>i</sub> per input token',
      'Sentence classification: a small linear layer on the <b>[CLS]</b> vector (e.g. sentiment)',
      'Token classification: the same linear layer applied to <b>every</b> token vector (e.g. named entities)',
      'Extractive QA: [CLS] question [SEP] passage [SEP] → predict the <b>start</b> and <b>end</b> of the answer span',
      'Only the small head is new: all weights are <b>fine-tuned</b> end-to-end on a few thousand labelled examples'
    ],
    build: function (st) {
      var R = st.root, svg = st.svg;
      var BY = 262, BH = 150, TY = 516, OY = 196;
      var body = K.box(R, 50, BY, 1300, BH, 'an-card');
      body.style.borderColor = 'var(--accent)'; body.style.background = K.tint('--accent', 9);
      for (var l = 1; l < 12; l++) {
        var ln = K.box(body, 20, l * BH / 12, 1256, 1, ''); ln.style.background = K.tint('--accent', 30);
      }
      var bl = K.label(body, 650, BH / 2, 'BERT <span style="font-family:var(--font-body);font-size:24px" class="an-muted">— 12 Transformer layers, pre-trained once (MLM + NSP)</span>', 'an-display', 'c');
      bl.inner.style.fontSize = '34px'; bl.inner.style.background = K.tint('--accent', 9); bl.inner.style.padding = '2px 14px';

      function makeSet(key) {
        var toks = SETS[key], n = toks.length, slot = Math.min(118, 1300 / n), x0 = 700 - slot * n / 2;
        var cx = toks.map(function (t, j) { return x0 + slot * (j + 0.5); });
        var g = K.box(R, 0, 0, 1400, 640, 'an-off');
        var gs = K.s('svg', { class: 'an-svg', viewBox: '0 0 1400 640', width: 1400, height: 640 }, g);
        var chips = toks.map(function (t, j) {
          var b = K.box(g, cx[j] - slot / 2 + 3, TY, slot - 6, 46, 'an-tok');
          b.style.fontFamily = t[0] === '[' ? 'var(--font-mono)' : 'var(--font-body)';
          b.style.fontSize = t[0] === '[' ? '18px' : (t.length > 7 ? '18px' : slot < 95 ? '20px' : '23px');
          if (t[0] === '[') b.style.fontWeight = '600';
          b.textContent = t;
          K.path(gs, K.line(cx[j], TY - 4, cx[j], BY + BH + 8), { color: '--muted', width: 2, arrow: true, arrowSize: 10 });
          K.path(gs, K.line(cx[j], BY - 4, cx[j], OY + 34 + 8), { color: '--muted', width: 2, arrow: true, arrowSize: 10 });
          var o = K.box(g, cx[j] - 17, OY, 34, 34, 'an-cell');
          o.style.borderRadius = '6px'; o.style.background = K.tint('--accent', 40); o.style.fontSize = '17px'; o.style.fontFamily = 'var(--font-body)';
          o.innerHTML = j === 0 ? 'C' : 'T<sub>' + j + '</sub>';
          return b;
        });
        return { g: g, gs: gs, cx: cx, slot: slot, chips: chips };
      }
      var sets = { gen: makeSet('gen'), cls: makeSet('cls'), ner: makeSet('ner'), qa: makeSet('qa') };

      // classification head
      (function (S) {
        var x = S.cx[0];
        var hb = K.box(S.g, x - 90, 96, 180, 48, 'an-tok is-accent2'); hb.style.fontFamily = 'var(--font-body)'; hb.style.fontSize = '22px'; hb.textContent = 'linear + softmax';
        K.path(S.gs, K.line(x, OY - 4, x, 150), { color: '--accent-2', width: 2.5, arrow: true });
        K.path(S.gs, K.line(x + 96, 120, x + 150, 120), { color: '--accent-2', width: 2.5, arrow: true });
        [['positive', .96, '--pos'], ['negative', .04, '--neg']].forEach(function (r, i) {
          var y = 80 + i * 48;
          K.label(S.g, x + 280, y + 16, r[0], 'an-small', 'r');
          var b = K.box(S.g, x + 292, y + 3, r[1] * 260, 26, 'an-bar'); b.style.background = 'var(' + r[2] + ')';
          K.label(S.g, x + 300 + r[1] * 260, y + 16, r[1].toFixed(2), 'an-mono an-small', 'l');
        });
        K.label(S.g, x + 160, 44, 'task: sentiment', 'an-small an-muted', 'l');
      })(sets.cls);
      // NER head
      (function (S) {
        TAGS.forEach(function (t, j) {
          if (!t) return;
          var x = S.cx[j];
          K.path(S.gs, K.line(x, OY - 4, x, 150), { color: '--accent-2', width: 2.5, arrow: true });
          var b = K.box(S.g, x - S.slot / 2 + 6, 98, S.slot - 12, 46, 'an-tok an-mono');
          b.style.fontSize = '20px'; b.textContent = t[0];
          if (t[1]) { b.style.borderColor = 'var(' + t[1] + ')'; b.style.background = K.tint(t[1], 20); b.style.fontWeight = '600'; }
          else b.style.color = 'var(--muted)';
        });
        K.label(S.g, 60, 60, 'one shared linear layer on every T<sub>i</sub> → BIO tag', 'an-small an-muted', 'l');
        K.label(S.g, S.cx[1] + S.slot / 2, 36, 'PERSON', 'an-small an-accent an-b', 'c');
        K.label(S.g, S.cx[6], 36, 'LOCATION', 'an-small an-accent2 an-b', 'c');
      })(sets.ner);
      // QA head
      (function (S) {
        var start = [0, 0, 0, 0, 0, 0, 0, .03, .01, .02, .04, .82, .05, .01, 0];
        var end = [0, 0, 0, 0, 0, 0, 0, .01, .01, .01, .02, .07, .85, .03, 0];
        var rows = [['start', start, 184], ['end', end, 122]];
        rows.forEach(function (r) {
          K.label(S.g, S.cx[6] + 10, r[2] - 12, r[0], 'an-small an-muted', 'r');
          r[1].forEach(function (p, j) {
            if (j < 7 || j === 14) return;
            var h = Math.max(2, p * 50), best = p > 0.5;
            var b = K.box(S.g, S.cx[j] - 14, r[2] - h, 28, h, 'an-bar');
            b.style.background = best ? 'var(--pos)' : 'color-mix(in srgb, var(--muted) 45%, var(--surface))';
            if (best) K.label(S.g, S.cx[j] + 20, r[2] - h + 10, p.toFixed(2), 'an-mono an-tiny an-pos', 'l');
          });
        });
        K.label(S.g, 60, 34, 'two vectors S, E: p<sub>start</sub>(i) = softmax(S·T<sub>i</sub>)', 'an-small an-muted', 'l');
        var ans = K.box(S.g, S.cx[11] - S.slot / 2 - 2, TY - 6, S.slot * 2 + 4, 58, ''); ans.style.border = '3px solid var(--pos)'; ans.style.borderRadius = '12px';
        K.label(S.g, 1340, 34, 'answer: <b class="an-pos">“December 1815”</b>', 'an-small', 'r');
        K.label(S.g, (S.cx[1] + S.cx[5]) / 2, TY + 66, 'question', 'an-tiny an-muted', 'c');
        K.label(S.g, (S.cx[7] + S.cx[13]) / 2, TY + 66, 'passage', 'an-tiny an-muted', 'c');
      })(sets.qa);
      // summary badges
      var badges = K.box(R, 0, 0, 1400, 200, 'an-off');
      [['sentiment', '[CLS] → class'], ['NER', 'every token → tag'], ['QA', 'tokens → start / end'], ['…', 'NLI, similarity, …']].forEach(function (b, i) {
        var x = 130 + i * 290;
        var c = K.box(badges, x, 60, 250, 92, 'an-card an-cell');
        c.style.flexDirection = 'column'; c.style.fontFamily = 'var(--font-body)';
        c.innerHTML = '<div style="font-family:var(--font-display);font-size:28px">' + b[0] + '</div><div class="an-muted" style="font-size:20px">' + b[1] + '</div>';
        c.style.borderColor = 'var(--accent-2)';
        K.path(K.s('svg', { class: 'an-svg', viewBox: '0 0 1400 200', width: 1400, height: 200 }, badges), K.line(x + 125, 156, x + 125 > 700 ? 700 + (x + 125 - 700) * 0.4 : 700 - (700 - x - 125) * 0.4, 196), { color: '--accent-2', width: 2, dashed: '5 5' });
      });

      return function (step) {
        var key = ['gen', 'cls', 'ner', 'qa', 'gen'][step];
        Object.keys(sets).forEach(function (k) { K.vis(sets[k].g, k === key); });
        K.vis(badges, step === 4);
      };
    }
  });
})();
