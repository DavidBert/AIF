/* anim-receptive-field — CNN receptive field grows layer by layer; a ViT patch sees the whole image at layer 1.
 * Last step: real attention rollout (Abnar & Zuidema 2020) of the [CLS] token in ViT-B/16 on the cat crop
 * (window.VIT_DATA.rollout, computed 2026-11-11). */
(function () {
  var K = window.AnimKit;
  K.register('receptive-field', {
    steps: 5,
    size: [1320, 600],
    captions: [
      'Same input grid, one region of interest (the cat’s eye)',
      'Layer 1 · CNN: a 3 × 3 neighbourhood · ViT: <b>every patch, already</b>',
      'Layer 3 · CNN: 7 × 7 — context grows by one ring per 3 × 3 layer',
      'Layer 7 · CNN finally covers the grid · ViT had global context from the start',
      'Real ViT-B/16: where the [CLS] token looks (attention rollout over the 12 layers)'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg, D = window.VIT_DATA || {};
      var G = 14, CS = 30, S = G * CS, Y = 90, LX = 120, RX = 780, F = { r: 5, c: 3 };
      function grid(x, title) {
        var cells = [];
        for (var k = 0; k < G * G; k++) {
          var c = K.box(R, x + (k % G) * CS, Y + Math.floor(k / G) * CS, CS, CS, '');
          c.style.border = '1px solid var(--line)'; c.style.background = 'var(--surface-2)';
          cells.push(c);
        }
        var t = K.label(R, x + S / 2, Y - 34, title, 'an-display', 'c'); t.inner.style.fontSize = '32px';
        return cells;
      }
      var L = grid(LX, 'CNN (3 × 3 convolutions)'), Rg = grid(RX, 'Vision Transformer');
      var layerL = K.label(R, LX + S / 2, Y + S + 30, '', 'an-small an-b', 'c');
      var layerR = K.label(R, RX + S / 2, Y + S + 30, '', 'an-small an-b', 'c');
      // ViT attention lines from the focus patch
      var fx = RX + F.c * CS + CS / 2, fy = Y + F.r * CS + CS / 2;
      var lineLayer = st.layer();
      var lines = [[0, 0], [0, 13], [13, 0], [13, 13], [0, 7], [13, 7], [7, 13], [10, 10], [2, 11]].map(function (p) {
        return K.path(lineLayer, K.line(fx, fy, RX + p[1] * CS + CS / 2, Y + p[0] * CS + CS / 2), { color: '--accent-2', width: 2.5 });
      });
      // rollout overlay
      var img = K.h('img', { src: 'assets/img/cat-224.png', alt: '', class: 'an-abs' }, R); K.pos(img, RX, Y, S, S);
      var heat = K.s('g', null, st.layer()), ro = D.rollout || [];
      for (var r = 0; r < G; r++) for (var c = 0; c < G; c++) {
        var v = ro[r] ? ro[r][c] : 0;
        K.s('rect', { x: RX + c * CS, y: Y + r * CS, width: CS, height: CS, style: 'fill:#000;fill-opacity:' + (0.82 * (1 - Math.pow(v, 0.7))).toFixed(3) }, heat);
      }
      return function (step) {
        var rad = [0, 1, 3, 7, 7][step];
        L.forEach(function (c, k) {
          var r = Math.floor(k / G), cc = k % G, d = Math.max(Math.abs(r - F.r), Math.abs(cc - F.c));
          var on = d <= rad;
          c.style.background = (r === F.r && cc === F.c) ? 'var(--accent)' : on ? K.tint('--accent', 40 - 3 * d) : 'var(--surface-2)';
        });
        Rg.forEach(function (c, k) {
          var r = Math.floor(k / G), cc = k % G, isF = r === F.r && cc === F.c;
          c.style.background = isF ? 'var(--accent-2)' : step >= 1 ? K.tint('--accent-2', 22) : 'var(--surface-2)';
          c.style.opacity = step === 4 ? 0 : 1;
        });
        lines.forEach(function (p) { K.draw(p, step >= 1 && step < 4); });
        layerL.inner.textContent = ['', 'layer 1: sees 3 × 3', 'layer 3: sees 7 × 7', 'layer 7: sees 15 × 15', ''][step];
        layerR.inner.textContent = ['', 'layer 1: sees 14 × 14', 'layer 3: sees 14 × 14', 'layer 7: sees 14 × 14', 'learned, not hand-designed'][step];
        K.vis(img, step === 4); heat.style.opacity = step === 4 ? 1 : 0;
        L.forEach(function (c) { c.style.opacity = step === 4 ? 0.35 : 1; });
      };
    }
  });
})();
