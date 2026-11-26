/* anim-bridges — how three other VLM bridges work (the MLP one is anim-vlm-pipeline).
 *   bridge-qformer  (BLIP-2, Li et al. 2023): 32 learned queries cross-attend to frozen ViT features → 32 tokens → frozen LLM
 *   bridge-xattn    (Flamingo, Alayrac et al. 2022): Perceiver Resampler → 64 tokens; gated cross-attention layers inside a frozen LLM, tanh gate starts at 0
 *   bridge-encfree  (Gemma 4 12B, Google, June 2026): no vision encoder; raw 48 × 48 patches → one matmul → LLM width, + x / y position lookups
 * Squares stand for vectors; counts are given in the labels. */
(function () {
  var K = window.AnimKit;
  function cat(parent, x, y, s, grid) {
    var b = K.box(parent, x, y, s, s, '');
    b.style.backgroundImage = (grid ? 'linear-gradient(to right, rgba(255,255,255,.85) 2px, transparent 2px), linear-gradient(to bottom, rgba(255,255,255,.85) 2px, transparent 2px), ' : '') + 'url(assets/img/cat-224.png)';
    b.style.backgroundSize = (grid ? (s / grid) + 'px ' + (s / grid) + 'px, ' + (s / grid) + 'px ' + (s / grid) + 'px, ' : '') + 'cover';
    b.style.borderRadius = '8px';
    return b;
  }
  function block(parent, x, y, w, h, title, sub, cls, fs) {
    var b = K.box(parent, x, y, w, h, 'an-card'); b.style.borderColor = 'var(' + cls + ')'; b.style.background = K.tint(cls, 12);
    K.label(b, w / 2, h / 2 - (sub ? 13 : 0), title, 'an-display', 'c').inner.style.fontSize = (fs || 26) + 'px';
    if (sub) K.label(b, w / 2, h / 2 + 20, sub, 'an-tiny an-muted', 'c');
    return b;
  }
  function squares(parent, x, y, n, colVar, cs, gap, vertical) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var c = K.box(parent, vertical ? x : x + k * (cs + gap), vertical ? y + k * (cs + gap) : y, cs, cs, '');
      c.style.background = K.tint(colVar, 30 + (k * 37) % 55); c.style.borderRadius = '4px'; out.push(c);
    }
    return out;
  }
  function words(parent, x, y, list, cls) {
    var out = [];
    list.forEach(function (s) {
      var w = Math.max(42, s.length * 13 + 22);
      var b = K.box(parent, x, y, w, 34, 'an-tok ' + (cls || ''), s); b.style.fontSize = '18px'; out.push(b); x += w + 8;
    });
    out.end = x; return out;
  }

  /* ---------------- BLIP-2 Q-Former ---------------- */
  K.register('bridge-qformer', {
    steps: 4,
    size: [1440, 600],
    captions: [
      'Frozen ViT (EVA-CLIP ViT-g): one vector per patch (257 of them). The Q-Former starts with <b>32 learned query vectors</b>',
      'Cross-attention: each query looks at <b>all</b> the patch vectors and pulls out what it needs',
      'Out come exactly <b>32 vectors</b>, whatever the image: a fixed-size summary, projected to the LLM width',
      'The 32 visual tokens go in front of the text into a <b>frozen</b> LLM. Only the Q-Former (188M) is trained'
    ],
    build: function (st) {
      var R = st.root, lay = st.layer();
      cat(R, 30, 30, 140, 0);
      var vit = block(R, 200, 45, 200, 110, 'Vision encoder', 'ViT-g · 🔒 frozen', '--accent-2', 24);
      K.path(lay, K.line(176, 100, 194, 100), { color: '--fg', width: 3, arrow: true });
      K.path(lay, K.line(406, 100, 436, 100), { color: '--fg', width: 3, arrow: true });
      var pX = 446, pY = 86, CS = 26, G = 6, NP = 14;
      var patches = squares(R, pX, pY, NP, '--accent-2', CS, G);
      K.label(R, pX + NP * (CS + G) / 2, pY - 22, '257 patch vectors (1408-d)', 'an-mono an-tiny', 'c');
      var qf = K.box(R, 420, 210, 540, 190, 'an-card'); qf.style.borderColor = 'var(--accent)'; qf.style.background = K.tint('--accent', 10);
      K.label(qf, 270, 26, 'Q-Former · ✎ trained (188M)', 'an-small an-b', 'c');
      var qX = 470, qY = 290, QW = 52, QG = 10, NQ = 7;
      var qs = [];
      for (var k = 0; k < NQ; k++) {
        var lab = k === NQ - 2 ? '…' : k === NQ - 1 ? 'q₃₂' : 'q' + '₁₂₃₄₅'.charAt(k);
        var b = K.box(R, qX + k * (QW + QG), qY, QW, 44, 'an-tok ' + (lab === '…' ? 'is-ghost' : 'is-accent'), lab); b.style.fontSize = '18px'; qs.push(b);
      }
      var qL = K.label(R, qX + NQ * (QW + QG) / 2, qY + 70, '32 learned queries', 'an-tiny an-muted', 'c');
      // cross-attention lines
      var lines = K.s('g', { style: 'opacity:0' }, lay);
      for (var i = 0; i < NQ; i++) {
        if (i === NQ - 2) continue;
        for (var j = 0; j < NP; j++) {
          var w = 0.15 + 0.85 * Math.pow(Math.abs(Math.sin((i + 1) * 1.7 + j * 0.9)), 3);
          K.s('line', { x1: qX + i * (QW + QG) + QW / 2, y1: qY - 2, x2: pX + j * (CS + G) + CS / 2, y2: pY + CS + 2,
            style: 'stroke:var(--accent);stroke-width:' + (0.6 + 2.6 * w).toFixed(2) + ';stroke-opacity:' + (0.15 + 0.6 * w).toFixed(2) }, lines);
        }
      }
      var xaL = K.label(R, 980, 250, 'cross-attention:<br>each query → all patches', 'an-small an-accent an-b', 'l');
      // outputs
      var oX = 1010, oY = 290;
      var outs = squares(R, oX, oY, 7, '--accent', 30, 8);
      var oL = K.label(R, oX + 7 * 38 / 2, oY + 66, '32 visual tokens, always', 'an-small an-b', 'c');
      var oA = K.path(lay, K.line(964, 312, 1000, 312), { color: '--fg', width: 3, arrow: true });
      // LLM
      var llm = block(R, 60, 440, 1340, 100, '', '', '--pos');
      var llmL = K.label(R, 84, 458, 'LLM (OPT / FlanT5) · 🔒 frozen', 'an-small an-b', 'l');
      var inV = squares(R, 120, 488, 7, '--accent', 30, 6);
      var dots = K.label(R, 120 + 7 * 36 + 4, 503, '… 32', 'an-mono an-tiny an-muted', 'l');
      var txt = words(R, 120 + 7 * 36 + 70, 486, ['What', 'is', 'in', 'this', 'image', '?']);
      var down = K.path(lay, K.vcurve(oX + 130, oY + 86, 240, 480, 0.5), { color: '--accent', width: 3, arrow: true });
      var neck = K.label(R, 1400, 400, '257 → 32: a bottleneck', 'an-small an-neg an-b', 'r');
      return function (step) {
        lines.style.opacity = step === 1 ? 1 : step >= 2 ? 0.25 : 0; K.vis(xaL, step === 1);
        outs.forEach(function (o) { K.vis(o, step >= 2); }); K.vis(oL, step >= 2); K.draw(oA, step >= 2); K.vis(neck, step >= 2);
        [llm, llmL, dots].concat(inV, txt).forEach(function (e) { K.vis(e, step >= 3); }); K.draw(down, step >= 3);
      };
    }
  });

  /* ---------------- Flamingo gated cross-attention ---------------- */
  K.register('bridge-xattn', {
    steps: 5,
    size: [1440, 600],
    captions: [
      'Flamingo keeps a <b>frozen</b> LLM (Chinchilla 70B): text goes in at the bottom, through its layers, out at the top',
      'Image side: frozen vision encoder → <b>Perceiver Resampler</b> → 64 visual tokens. They do <b>not</b> enter the text sequence',
      'New <b>cross-attention</b> layers are inserted between the frozen LLM layers: text tokens look at the visual tokens there',
      'Each new layer is multiplied by a gate tanh(α) with <b>α = 0 at the start</b>: the model begins as the unchanged LLM',
      'Training learns α (and the new layers, ≈ 10B params): image information flows in, layer after layer'
    ],
    build: function (st) {
      var R = st.root, lay = st.layer();
      // image side
      cat(R, 40, 40, 120, 0);
      var enc = block(R, 30, 190, 140, 80, 'encoder', 'NFNet-F6 · 🔒', '--accent-2', 22);
      var res = block(R, 30, 300, 140, 80, 'Resampler', 'Perceiver · ✎', '--accent', 22);
      K.path(lay, K.line(100, 166, 100, 184), { color: '--fg', width: 3, arrow: true });
      var a2 = K.path(lay, K.line(100, 274, 100, 294), { color: '--fg', width: 3, arrow: true });
      var vis = squares(R, 210, 220, 8, '--accent', 26, 8, true);
      var visL = K.label(R, 223, 530, '64 visual<br>tokens', 'an-tiny an-b', 'c'); visL.inner.style.textAlign = 'center';
      var a3 = K.path(lay, K.line(176, 340, 200, 340), { color: '--fg', width: 3, arrow: true });
      // LLM stack (bottom → top): LM, X, LM, X, LM
      var SX = 560, SW = 420, rows = [], RH = 54, GAP = 12, Y0 = 470;
      var kinds = ['lm', 'x', 'lm', 'x', 'lm'];
      kinds.forEach(function (kd, i) {
        var y = Y0 - i * (RH + GAP) - RH;
        var b = K.box(R, SX, y, SW, RH, 'an-card an-cell');
        b.style.fontSize = '22px';
        if (kd === 'lm') { b.style.borderColor = 'var(--line)'; b.style.background = 'var(--surface-2)'; b.innerHTML = 'LLM layers · 🔒 frozen'; }
        else { b.style.borderColor = 'var(--accent)'; b.style.background = K.tint('--accent', 18); b.innerHTML = '<b>gated cross-attention</b> · ✎ new'; }
        b.kind = kd; b.y = y; rows.push(b);
      });
      var txt = words(R, SX + 20, Y0 + 14, ['What', 'is', 'in', 'this', 'image', '?']);
      var outW = words(R, SX + 20, Y0 - 5 * (RH + GAP) - 40, ['A', 'close-up', 'of', 'a', 'cat'], 'is-pos');
      var flow = K.path(lay, K.line(SX - 24, Y0 + 30, SX - 24, Y0 - 5 * (RH + GAP) - 20), { color: '--muted', width: 3, arrow: true });
      var flowL = K.label(R, SX - 34, Y0 - 140, 'text', 'an-tiny an-muted', 'r');
      // arrows from visual tokens to each x-attn row
      var xr = rows.filter(function (r) { return r.kind === 'x'; });
      var feeds = xr.map(function (r) { return K.path(lay, K.hcurve(250, 340, SX - 6, r.y + RH / 2, 0.5), { color: '--accent', width: 3, arrow: true }); });
      // gates
      var gates = xr.map(function (r) {
        var g = K.box(R, SX + SW + 20, r.y + 8, 190, RH - 16, 'an-tok', ''); g.style.fontSize = '18px'; return g;
      });
      var gateNote = K.label(R, SX + SW + 20, 116, '', 'an-small', 'l');
      return function (step) {
        K.vis(enc, step >= 1); K.vis(res, step >= 1); K.draw(a2, step >= 1); K.draw(a3, step >= 1);
        vis.forEach(function (v) { K.vis(v, step >= 1); }); K.vis(visL, step >= 1);
        rows.forEach(function (r) { K.vis(r, r.kind === 'lm' || step >= 2); });
        feeds.forEach(function (p) { K.draw(p, step >= 2); p.style.strokeWidth = step >= 4 ? 5 : step === 3 ? 1.5 : 3; p.style.opacity = step === 3 ? 0.35 : (step >= 2 ? 1 : 0); });
        gates.forEach(function (g) {
          K.vis(g, step >= 3);
          g.className = 'an-abs an-tok ' + (step >= 4 ? 'is-pos' : 'is-dim');
          g.innerHTML = step >= 4 ? 'tanh(α) ≈ learned' : 'tanh(0) = 0';
        });
        K.vis(gateNote, step >= 3);
        gateNote.inner.innerHTML = step >= 4 ? '<span class="an-pos an-b">image information flows in</span>' : '<span class="an-muted">output = plain LLM</span>';
      };
    }
  });

  /* ---------------- Gemma 4 12B: no vision encoder ---------------- */
  K.register('bridge-encfree', {
    steps: 4,
    size: [1440, 600],
    captions: [
      'No vision encoder at all: the image is cut into <b>raw 48 × 48 pixel patches</b>',
      'Each patch is flattened (48 × 48 × 3 = 6,912 numbers) and multiplied by <b>one matrix</b> to the LLM width: a 35M-parameter “vision embedder”',
      'Position: a learned <b>x</b> vector (column) + a learned <b>y</b> vector (row) are added to each patch token',
      'The patch tokens go straight into the decoder LLM with the text. <b>The LLM does all the vision</b>: ViT’s patch embedding, feeding an LLM'
    ],
    build: function (st) {
      var R = st.root, lay = st.layer();
      var IX = 40, IY = 70, IS = 300, NG = 6, cs = IS / NG;
      var img = cat(R, IX, IY, IS, NG);
      K.label(R, IX + IS / 2, IY - 26, 'raw pixels, 48 × 48 patches', 'an-small', 'c');
      var hl = K.box(R, IX + 2 * cs, IY + 2 * cs, cs, cs, ''); hl.style.border = '4px solid var(--accent)'; hl.style.borderRadius = '4px';
      var noEnc = K.label(R, IX + IS / 2, IY + IS + 32, 'no ViT, no CLIP', 'an-small an-neg an-b', 'c');
      // step 1: flatten + matmul
      var s1 = K.box(R, 0, 0, 1440, 600, '');
      var zoom = K.box(s1, 400, 110, 120, 120, '');
      zoom.style.backgroundImage = 'url(assets/img/cat-224.png)'; zoom.style.backgroundSize = (120 * NG) + 'px ' + (120 * NG) + 'px';
      zoom.style.backgroundPosition = (-2 * 120) + 'px ' + (-2 * 120) + 'px'; zoom.style.border = '3px solid var(--accent)'; zoom.style.borderRadius = '6px';
      K.label(s1, 548, 170, '→', 'an-display an-accent', 'c').inner.style.fontSize = '40px';
      var strip = K.box(s1, 580, 60, 26, 230, ''); strip.style.backgroundImage = 'url(assets/img/cat-224.png)'; strip.style.backgroundSize = '600% 100%';
      strip.style.backgroundPosition = '40% 0'; strip.style.border = '2px solid var(--fg)'; strip.style.borderRadius = '4px';
      K.label(s1, 593, 312, '6,912 numbers', 'an-mono an-tiny', 'c');
      K.label(s1, 650, 175, '×', 'an-display', 'c').inner.style.fontSize = '40px';
      var W = K.box(s1, 680, 95, 160, 160, ''); W.style.border = '2px solid var(--accent)'; W.style.borderRadius = '8px';
      W.style.background = 'repeating-linear-gradient(0deg, ' + K.tint('--accent', 30) + ' 0 8px, ' + K.tint('--accent', 12) + ' 8px 16px)';
      K.label(s1, 760, 280, 'W · one matmul', 'an-small an-b', 'c');
      K.label(s1, 760, 306, '35M params', 'an-tiny an-muted', 'c');
      K.label(s1, 870, 175, '=', 'an-display', 'c').inner.style.fontSize = '40px';
      var e = K.vec(s1, 900, 90, K.randVec('enc-free', 7), { cell: 24, gap: 3, vertical: true, color: '--accent' });
      K.label(s1, 912, 312, 'patch token', 'an-tiny an-b', 'c');
      // step 2: + x + y
      var s2 = K.box(R, 0, 0, 1440, 600, '');
      K.label(s2, 975, 175, '+', 'an-display', 'c').inner.style.fontSize = '40px';
      K.vec(s2, 1010, 90, K.randVec('x2', 7), { cell: 24, gap: 3, vertical: true, color: '--accent-2' });
      K.label(s2, 1022, 312, 'x: col 2', 'an-mono an-tiny an-accent2', 'c');
      K.label(s2, 1090, 175, '+', 'an-display', 'c').inner.style.fontSize = '40px';
      K.vec(s2, 1125, 90, K.randVec('y2', 7), { cell: 24, gap: 3, vertical: true, color: '--k' });
      K.label(s2, 1137, 312, 'y: row 2', 'an-mono an-tiny', 'c');
      K.label(s2, 1300, 140, 'two small tables:<br>one vector per column,<br>one per row', 'an-tiny an-muted', 'c').inner.style.textAlign = 'center';
      // step 3: into the LLM
      var s3 = K.box(R, 0, 0, 1440, 600, '');
      var llm = block(s3, 60, 400, 1340, 150, '', '', '--pos');
      K.label(s3, 84, 418, 'decoder LLM (Gemma 4 12B): text and image tokens in one sequence', 'an-small an-b', 'l');
      var pt = squares(s3, 120, 460, 9, '--accent', 30, 6);
      K.label(s3, 120 + 9 * 36 + 4, 475, '… patches', 'an-mono an-tiny an-muted', 'l');
      words(s3, 120 + 9 * 36 + 132, 458, ['What', 'is', 'in', 'this', 'image', '?']);
      K.path(lay, K.vcurve(1000, 340, 300, 452, 0.5), { color: '--accent', width: 3, arrow: true }).classList.add('s3arrow');
      var s3a = lay.querySelector('.s3arrow');
      return function (step) {
        K.vis(s1, step >= 1); K.vis(s2, step >= 2); K.vis(s3, step >= 3); K.draw(s3a, step >= 3);
        K.vis(noEnc, step === 0);
      };
    }
  });
})();
