/* anim-scaling — parameter counts of language models over time (log scale).
 * Only publicly documented sizes are plotted; closed models are shown as "size undisclosed".
 * Sources: ELMo (Peters+ 2018) 94M; BERT-large (Devlin+ 2018) 340M; GPT-2 (Radford+ 2019) 1.5B;
 * T5 (Raffel+ 2019) 11B; GPT-3 (Brown+ 2020) 175B; Chinchilla (Hoffmann+ 2022) 70B; PaLM (Chowdhery+ 2022) 540B;
 * LLaMA (Touvron+ 2023) 65B; Llama 3.1 (Meta 2024) 405B; DeepSeek-V3 (2024) 671B total / 37B active;
 * Kimi K2 (Moonshot 2025) 1T total / 32B active. */
(function () {
  var K = window.AnimKit;
  // [name, year, params, step, label placement [dx, dy, anchor], moe active params]
  var PTS = [
    ['ELMo', 2018.15, 94e6, 0, [14, 0, 'l']],
    ['BERT-large', 2018.8, 340e6, 0, [14, 0, 'l']],
    ['GPT-2', 2019.13, 1.5e9, 1, [14, 0, 'l']],
    ['T5', 2019.8, 11e9, 1, [14, 0, 'l']],
    ['GPT-3', 2020.4, 175e9, 2, [14, 0, 'l']],
    ['Chinchilla', 2022.25, 70e9, 2, [-14, 0, 'r']],
    ['PaLM', 2022.3, 540e9, 2, [14, 0, 'l']],
    ['LLaMA', 2023.15, 65e9, 3, [14, 0, 'l']],
    ['Llama 3.1', 2024.55, 405e9, 3, [-14, 18, 'r']],
    ['DeepSeek-V3', 2024.98, 671e9, 3, [-14, -20, 'r'], 37e9],
    ['Kimi K2', 2025.53, 1e12, 3, [14, 0, 'l'], 32e9]
  ];
  var CLOSED = [['GPT-4', 2023.2, 'r'], ['Gemini 1.0', 2023.93, 'a'], ['Claude 3', 2024.17, 'l'], ['GPT-5', 2025.6, 'a']];
  function fmt(v) { return v >= 1e12 ? (v / 1e12) + 'T' : v >= 1e9 ? (v / 1e9) + 'B' : Math.round(v / 1e6) + 'M'; }

  K.register('scaling', {
    steps: 5,
    size: [1300, 640],
    labels: ['2018', '2019', '2020–2022', '2023–2025: open models', 'Closed models & trend'],
    captions: [
      '2018: ELMo and BERT — a few hundred million parameters (log scale!)',
      '2019: GPT-2 (1.5B), T5 (11B)',
      'GPT-3 (175B), PaLM (540B)… and <b>Chinchilla</b> (70B): a smaller model trained on more tokens can win',
      'Open-weight models catch up; <b>mixture-of-experts</b> (MoE) models only activate a fraction of their parameters per token',
      'Frontier labs stopped publishing sizes · ELMo → GPT-3: ×1,860 in ~2 years'
    ],
    build: function (st) {
      var R = st.root, svg = st.svg;
      var X0 = 160, X1 = 1180, YA = 2018, YB = 2026, LMIN = 7.6, LMAX = 12.4, PY0 = 150, PY1 = 556;
      var X = function (y) { return X0 + (y - YA) / (YB - YA) * (X1 - X0); };
      var Y = function (v) { return PY1 - (Math.log10(v) - LMIN) / (LMAX - LMIN) * (PY1 - PY0); };
      // grid
      [[1e8, '100M'], [1e9, '1B'], [1e10, '10B'], [1e11, '100B'], [1e12, '1T']].forEach(function (g) {
        K.s('line', { x1: X0, x2: X1, y1: Y(g[0]), y2: Y(g[0]), style: 'stroke:var(--line);stroke-width:1.5' }, svg);
        K.label(R, X0 - 14, Y(g[0]), g[1], 'an-mono an-tiny an-muted', 'r');
      });
      for (var yr = YA; yr <= YB; yr++) {
        K.s('line', { x1: X(yr), x2: X(yr), y1: PY1, y2: PY1 + 8, style: 'stroke:var(--muted);stroke-width:1.5' }, svg);
        K.label(R, X(yr), PY1 + 24, String(yr), 'an-mono an-tiny an-muted', 'c');
      }
      K.s('line', { x1: X0, x2: X1, y1: PY1, y2: PY1, style: 'stroke:var(--muted);stroke-width:2' }, svg);
      K.label(R, 24, (PY0 + PY1) / 2, 'parameters', 'an-tiny an-muted', 'c').inner.style.transform = 'translate(-50%,-50%) rotate(-90deg)';
      // trend line (step 4)
      var tr = K.path(svg, K.line(X(2018.15), Y(94e6), X(2020.4), Y(175e9)), { color: '--neg', width: 2.5, dashed: '8 7' });
      var trL = K.label(R, X(2019.0) - 6, Y(4e9) - 8, '×1,860 in ~2 years', 'an-small an-neg', 'r');
      // closed band
      var band = K.box(R, X0, 34, X1 - X0, 84, 'an-off');
      band.style.background = K.tint('--muted', 10); band.style.borderRadius = '10px'; band.style.border = '1.5px dashed var(--line)';
      K.label(band, 16, 42, 'closed models:<br>size undisclosed', 'an-small an-muted', 'l');
      CLOSED.forEach(function (c) {
        var m = K.box(band, X(c[1]) - X0 - 9, 33, 18, 18, ''); m.style.border = '3px solid var(--fg)'; m.style.borderRadius = '3px'; m.style.background = 'var(--surface)';
        if (c[2] === 'r' || c[2] === 'l') K.label(band, X(c[1]) - X0 + (c[2] === 'r' ? -16 : 16), 42, c[0], 'an-tiny an-b', c[2]);
        else K.label(band, X(c[1]) - X0, c[2] === 'a' ? 16 : 68, c[0], 'an-tiny an-b', 'c');
      });
      // points
      var pts = PTS.map(function (p) {
        var g = K.s('g', null, svg);
        var moe = !!p[5];
        if (moe) {
          K.s('line', { x1: X(p[1]), x2: X(p[1]), y1: Y(p[2]) + 10, y2: Y(p[5]) - 9, style: 'stroke:var(--accent-2);stroke-width:2;stroke-dasharray:4 5' }, g);
          K.s('circle', { cx: X(p[1]), cy: Y(p[5]), r: 8, style: 'fill:var(--surface);stroke:var(--accent-2);stroke-width:3' }, g);
        }
        K.s('circle', { cx: X(p[1]), cy: Y(p[2]), r: 10, style: 'fill:var(' + (moe ? '--accent-2' : '--accent') + ')' }, g);
        var lp = p[4];
        var l = K.label(R, X(p[1]) + lp[0], Y(p[2]) + lp[1], '<b>' + p[0] + '</b> <span class="an-muted">' + fmt(p[2]) + '</span>', 'an-small', lp[2]);
        var al = moe ? K.label(R, X(p[1]) + (p[0] === 'Kimi K2' ? 14 : -14), Y(p[5]), fmt(p[5]) + ' active', 'an-tiny an-accent2', p[0] === 'Kimi K2' ? 'l' : 'r') : null;
        return { g: g, l: l, al: al, s: p[3], name: p[0] };
      });
      // legend
      var leg = K.box(R, 900, 440, 280, 100, '');
      var ls = K.s('svg', { class: 'an-svg', viewBox: '0 0 280 100', width: 280, height: 100 }, leg);
      K.s('circle', { cx: 14, cy: 16, r: 9, style: 'fill:var(--accent)' }, ls);
      K.s('circle', { cx: 14, cy: 50, r: 9, style: 'fill:var(--accent-2)' }, ls);
      K.s('circle', { cx: 14, cy: 84, r: 7, style: 'fill:var(--surface);stroke:var(--accent-2);stroke-width:3' }, ls);
      K.label(leg, 34, 16, 'dense model', 'an-tiny', 'l');
      K.label(leg, 34, 50, 'mixture-of-experts: total', 'an-tiny', 'l');
      K.label(leg, 34, 84, 'MoE: active per token', 'an-tiny', 'l');

      return function (step) {
        pts.forEach(function (p) {
          var on = step >= p.s;
          p.g.style.opacity = on ? 1 : 0; K.vis(p.l, on); if (p.al) K.vis(p.al, on);
          var hl = (step === 2 && p.name === 'Chinchilla');
          p.l.inner.style.color = hl ? 'var(--pos)' : '';
        });
        K.vis(leg, step >= 3);
        K.vis(band, step >= 4);
        K.draw(tr, step >= 4); K.vis(trL, step >= 4);
      };
    }
  });
})();
