/* anim-vlm-pipeline — a LLaVA-1.5-style VLM: vision encoder → flatten → MLP projector → into the LLM.
 * Shapes are LLaVA-1.5-7B's (CLIP ViT-L/14 at 336 px → 24 × 24 = 576 patch vectors × 1024; MLP → 576 × 4096; Vicuna-7B).
 * 8 squares stand for the 576 vectors. The generated answer is illustrative.
 * Steps: 0 input · 1 vision encoder (2D grid) · 2 flatten (same line) · 3 through the projector · 4 into the LLM · 5 generation */
(function () {
  var K = window.AnimKit;
  K.register('vlm-pipeline', {
    steps: 6,
    size: [1440, 640],
    captions: [
      'Input: an image and a question',
      '<b>Vision encoder</b> (a CLIP ViT, frozen): 336 × 336 px → a 24 × 24 grid of patch vectors (1024-d each)',
      '<b>Flatten</b> the grid: a sequence of 576 vectors, exactly like the patch tokens of a ViT',
      '<b>Projector</b> (2-layer MLP, trained): each vector → 4096-d, the size of the LLM’s word embeddings. These are the <b>visual tokens</b>',
      'The 576 visual tokens go <b>into the LLM</b>, in front of the text tokens: one sequence, ordinary causal self-attention',
      'The LLM generates the answer token by token, exactly as for text (answer illustrative)'
    ],
    build: function (st) {
      var R = st.root, svg = st.layer();
      var MY = 135;                                            // the main line
      var im = K.h('img', { src: 'assets/img/cat.jpg', alt: 'Close-up photo of a tabby cat', class: 'an-abs' }, R);
      K.pos(im, 20, MY - 75, 150, 150); im.style.borderRadius = '10px';
      K.label(R, 20, MY + 100, '“What is in this image?”', 'an-small', 'l');
      function block(x, y, w, h, title, sub, cls) {
        var b = K.box(R, x, y, w, h, 'an-card'); b.style.borderColor = 'var(' + cls + ')'; b.style.background = K.tint(cls, 12);
        K.label(b, w / 2, h / 2 - (sub ? 14 : 0), title, 'an-display', 'c').inner.style.fontSize = '28px';
        if (sub) K.label(b, w / 2, h / 2 + 22, sub, 'an-tiny an-muted', 'c');
        return b;
      }
      var venc = block(200, MY - 65, 220, 130, 'Vision encoder', 'CLIP ViT-L/14 · 🔒 frozen', '--accent-2');
      var a1 = K.path(svg, K.line(176, MY, 194, MY), { color: '--fg', width: 3, arrow: true });
      var a2 = K.path(svg, K.line(426, MY, 446, MY), { color: '--fg', width: 3, arrow: true });
      var N = 8, CS = 24, G = 28;
      var GX = 456, FX = 456, PX0 = 760, PW = 220, VX = 1010, LX = 250, LY = 448;
      // LLM box first, so the tokens slide on top of it
      var llm = block(60, 410, 1340, 166, '', '', '--pos');
      var llmT = K.label(R, 90, 428, 'LLM (Vicuna-7B)', 'an-display', 'l'); llmT.inner.style.fontSize = '24px';
      // patch vectors (stay on the line once flattened)
      var flat = [], vis = [];
      for (var k = 0; k < N; k++) {
        var c = K.box(R, 0, 0, CS, CS, ''); c.style.borderRadius = '4px'; c.style.transitionDelay = (k * 0.04) + 's';
        c.style.background = K.tint('--accent-2', 30 + (k * 37) % 55); flat.push(c);
      }
      for (k = 0; k < N; k++) {
        var v = K.box(R, 0, 0, CS, CS, ''); v.style.borderRadius = '4px'; v.style.transitionDelay = (k * 0.05) + 's';
        v.style.background = K.tint('--accent', 35 + (k * 29) % 55); vis.push(v);
      }
      var gridL = K.label(R, GX + 2 * G - 2, MY - 52, '24 × 24 grid', 'an-mono an-tiny', 'c');
      var flatL = K.label(R, FX + N * G / 2, MY + 34, '576 vectors × 1024', 'an-mono an-tiny', 'c');
      var more1 = K.label(R, FX + N * G + 2, MY, '…', 'an-mono an-small an-muted', 'l');
      // projector, created after the token squares so they pass behind it
      var proj = block(PX0, MY - 65, PW, 130, 'Projector', '2-layer MLP · ✎ trained', '--accent');
      var a3 = K.path(svg, K.line(FX + N * G + 26, MY, PX0 - 8, MY), { color: '--fg', width: 3, arrow: true });
      var a4 = K.path(svg, K.line(PX0 + PW + 6, MY, VX - 8, MY), { color: '--fg', width: 3, arrow: true });
      var visL = K.label(R, VX + N * G / 2, MY + 34, '576 visual tokens × 4096', 'an-mono an-tiny an-accent an-b', 'c');
      var more2 = K.label(R, VX + N * G + 2, MY, '…', 'an-mono an-small an-muted', 'l');
      var down = K.path(svg, K.vcurve(VX + N * G / 2, MY + 52, LX + N * G / 2, LY - 12, 0.5), { color: '--accent', width: 3, arrow: true });
      var causal = K.label(R, 1385, 428, 'causal self-attention over the whole sequence', 'an-tiny an-muted', 'r');
      var inL = K.label(R, 236, LY + 12, 'input →', 'an-tiny an-muted', 'r');
      var more3 = K.label(R, LX + N * G + 2, LY + CS / 2, '… 576', 'an-mono an-tiny an-muted', 'l');
      var wx = LX + N * G + 70;
      var txt = ['What', 'is', 'in', 'this', 'image', '?'].map(function (s) {
        var w = Math.max(44, s.length * 14 + 24);
        var b = K.box(R, wx, LY - 5, w, 34, 'an-tok', s); b.style.fontSize = '19px'; wx += w + 8; return b;
      });
      var ax = LX, outs = ['A', 'close-up', 'of', 'a', 'tabby', 'cat', '.'].map(function (s, i) {
        var w = Math.max(44, s.length * 14 + 24);
        var b = K.box(R, ax, 510, w, 38, 'an-tok is-pos', s); b.style.fontSize = '19px';
        b.style.transitionDelay = (i * 0.25) + 's'; ax += w + 8; return b;
      });
      var genL = K.label(R, 236, 529, 'output →', 'an-tiny an-muted', 'r');
      return function (step) {
        K.vis(venc, step >= 1); K.draw(a1, step >= 1); K.draw(a2, step >= 1);
        flat.forEach(function (c, k) {
          if (step <= 1) K.pos(c, GX + (k % 4) * G, MY - 26 + Math.floor(k / 4) * G);
          else K.pos(c, FX + k * G, MY - CS / 2);
          K.vis(c, step >= 1);
        });
        vis.forEach(function (v, k) {
          if (step <= 2) K.pos(v, FX + k * G, MY - CS / 2);        // start hidden on top of the flattened row
          else if (step === 3) K.pos(v, VX + k * G, MY - CS / 2);  // through the projector
          else K.pos(v, LX + k * G, LY);                           // into the LLM
          K.vis(v, step >= 3);
        });
        K.vis(gridL, step === 1); K.vis(flatL, step >= 2); K.vis(more1, step >= 2);
        K.vis(proj, step >= 3); K.draw(a3, step >= 3); K.draw(a4, step >= 3);
        K.vis(visL, step === 3); K.vis(more2, step === 3);
        K.vis(llm, step >= 4); K.vis(llmT, step >= 4); K.vis(causal, step >= 4); K.vis(inL, step >= 4); K.vis(more3, step >= 4);
        K.draw(down, step === 4);
        txt.forEach(function (b) { K.vis(b, step >= 4); });
        outs.forEach(function (b) { K.vis(b, step >= 5); }); K.vis(genL, step >= 5);
      };
    }
  });
})();
