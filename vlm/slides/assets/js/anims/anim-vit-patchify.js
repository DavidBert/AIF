/* anim-vit-patchify — how ViT turns an image into tokens (Dosovitskiy et al. 2021).
 * Real data: the 224×224 cat crop (assets/img/cat-224.png) and the pixel values of one patch
 * (window.VIT_DATA.patch, exported from the same file). Steps:
 *   0 image · 1 14×14 grid · 2 zoom on one patch · 3 flatten to 768 numbers · 4 × W → embedding · 5 all 196 patches = sequence
 * opts.img: image path (default assets/img/cat-224.png) */
(function () {
  var K = window.AnimKit;
  K.register('vit-patchify', {
    steps: 9,
    size: [1440, 640],
    captions: [
      'A 224 × 224 RGB image: 150,528 numbers',
      'Cut it into a 14 × 14 grid of <b>16 × 16 patches</b> → 196 patches',
      'One patch = 16 × 16 pixels × 3 colour channels',
      '<b>Flatten</b> it: 16 × 16 × 3 = <b>768</b> raw pixel values',
      'Multiply by a <b>learned</b> matrix W (768 × 768): the patch becomes a 768-d embedding, exactly like a word embedding',
      'Same W for every patch → a sequence of <b>196 tokens</b>, ready for a standard Transformer',
      'The sequence (+ positions, + a [CLS] token) enters a <b>Transformer block</b>, exactly as words would',
      'Self-attention: a 197 × 197 matrix. Real ViT-B/16, layer 2: bright diagonals = each patch looks at its <b>neighbours</b> (±1 left/right, ±14 above/below)',
      'One row = one query. The eye patch’s row, folded back onto the 14 × 14 grid: it attends to the patches <b>around it</b>'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg, D = window.VIT_DATA || {};
      var P = D.patch || { r: 5, c: 3, px: [] };
      var src = opts.img || 'assets/img/cat-224.png';
      var IX = 40, IY = 70, IS = 448, G = 14, CS = IS / G;
      var img = K.h('img', { src: src, alt: 'Close-up photo of a tabby cat (CC0)', class: 'an-abs' }, R);
      K.pos(img, IX, IY, IS, IS); img.style.borderRadius = '6px'; img.style.imageRendering = 'auto';
      var top = st.layer();
      var dims = K.label(R, IX + IS / 2, IY - 26, '224 × 224 × 3', 'an-mono an-small an-muted', 'c');
      // grid
      var grid = K.s('g', { style: 'opacity:0' }, top);
      for (var i = 0; i <= G; i++) {
        K.s('line', { x1: IX + i * CS, x2: IX + i * CS, y1: IY, y2: IY + IS, style: 'stroke:#fff;stroke-width:1.5;stroke-opacity:.85' }, grid);
        K.s('line', { y1: IY + i * CS, y2: IY + i * CS, x1: IX, x2: IX + IS, style: 'stroke:#fff;stroke-width:1.5;stroke-opacity:.85' }, grid);
      }
      var gridL = K.label(R, IX + IS / 2, IY + IS + 26, '14 × 14 = 196 patches', 'an-small an-b', 'c');
      var hl = K.s('rect', { x: IX + P.c * CS, y: IY + P.r * CS, width: CS, height: CS, style: 'fill:none;stroke:var(--accent);stroke-width:5;opacity:0' }, top);
      // zoomed patch (pixel grid drawn from the real values)
      var ZX = 560, ZY = 110, ZS = 256, zc = ZS / 16;
      var zoom = K.box(R, ZX, ZY, ZS, ZS, '');
      zoom.style.border = '3px solid var(--accent)'; zoom.style.borderRadius = '6px'; zoom.style.overflow = 'hidden';
      (P.px || []).forEach(function (h, k) {
        var c = K.box(zoom, (k % 16) * zc, Math.floor(k / 16) * zc, zc, zc, ''); c.style.background = '#' + h;
      });
      var zl = K.label(R, ZX + ZS / 2, ZY + ZS + 26, 'one patch: 16 × 16 × 3', 'an-small', 'c');
      var zoomLine1 = K.path(top, K.line(IX + (P.c + 1) * CS, IY + P.r * CS, ZX, ZY), { color: '--accent', width: 2, dashed: '6 6' });
      var zoomLine2 = K.path(top, K.line(IX + (P.c + 1) * CS, IY + (P.r + 1) * CS, ZX, ZY + ZS), { color: '--accent', width: 2, dashed: '6 6' });
      // flattened strip: 256 pixels (× 3 channels) as one long column of thin rows
      var FX = 900, FY = 60, FW = 34, FH = 448, fh = FH / 256;
      var flat = K.box(R, FX, FY, FW, FH, '');
      flat.style.border = '2px solid var(--fg)'; flat.style.borderRadius = '4px'; flat.style.overflow = 'hidden';
      (P.px || []).forEach(function (h, k) {
        var c = K.box(flat, 0, k * fh, FW, fh + 0.6, ''); c.style.background = '#' + h;
      });
      var first = P.first || [];
      var flatL = K.label(R, FX + FW / 2, FY + FH + 26, 'x ∈ ℝ<sup>768</sup>', 'an-small an-b', 'c');
      var flatV = K.label(R, FX + FW + 14, FY + 24, '[' + first.slice(0, 3).join(', ') + ',<br>&nbsp;' + first.slice(3, 6).join(', ') + ', …]', 'an-mono an-tiny an-muted', 'l');
      var flatArrow = K.path(svg, K.line(ZX + ZS + 16, ZY + ZS / 2, FX - 14, ZY + ZS / 2), { color: '--fg', width: 3, arrow: true });
      var flatTag = K.label(R, (ZX + ZS + FX) / 2, ZY + ZS / 2 - 22, 'flatten', 'an-tiny an-muted', 'c');
      // × W
      var times = K.label(R, FX + FW + 34, FY + FH / 2, '×', 'an-display', 'c'); times.inner.style.fontSize = '44px';
      var WX = FX + FW + 64, WS = 200;
      var W = K.box(R, WX, FY + FH / 2 - WS / 2, WS, WS, '');
      W.style.borderRadius = '8px'; W.style.border = '2px solid var(--accent-2)';
      W.style.background = 'repeating-linear-gradient(0deg, ' + K.tint('--accent-2', 34) + ' 0 9px, ' + K.tint('--accent-2', 14) + ' 9px 18px)';
      var WL = K.label(R, WX + WS / 2, FY + FH / 2 + WS / 2 + 26, 'W  (768 × 768, learned)', 'an-small', 'c');
      var eq = K.label(R, WX + WS + 30, FY + FH / 2, '=', 'an-display', 'c'); eq.inner.style.fontSize = '44px';
      var EX = WX + WS + 60;
      var emb = K.vec(R, EX, FY + 40, K.randVec('cat-eye-emb', 16), { cell: 22, gap: 3, vertical: true, color: '--accent' });
      var embL = K.label(R, EX + 11, FY + 40 + emb.h + 26, 'e ∈ ℝ<sup>768</sup>', 'an-small an-b', 'c');
      // sequence of tokens along the bottom
      var SY = 556, seq = K.box(R, 0, 0, 1440, 640, '');
      var nTok = 11, TW = 62, gap = 10, SX = 640;
      for (var t = 0; t < nTok; t++) {
        var lab = t === nTok - 2 ? '…' : 'p' + (t === nTok - 1 ? 196 : t + 1);
        var tk = K.box(seq, SX + t * (TW + gap), SY - 24, TW, 46, 'an-tok ' + (t === nTok - 2 ? 'is-ghost' : 'is-accent'), lab);
        tk.style.fontSize = '19px';
      }
      var seqL = K.label(R, SX - 16, SY, '196 tokens:', 'an-small an-b', 'r');
      var convNote = K.label(R, 1400, 30, 'in code: one Conv2d(3, 768, kernel=16, stride=16)', 'an-mono an-tiny an-muted', 'r');
      // ---- steps 6-8: Transformer block + real attention matrix (window.VIT_DATA.attn)
      var AT = D.attn || null;
      var blk = K.box(R, 0, 0, 1440, 640, '');
      var BX = 540, BY = 110, BW = 230;
      var bframe = K.box(blk, BX, BY, BW, 300, 'an-card'); bframe.style.borderStyle = 'dashed';
      K.label(blk, BX + BW / 2, BY - 22, 'Transformer block × 12', 'an-small an-b', 'c');
      var lys = [['LayerNorm', '--pos', 8], ['Self-attention', '--accent', 22], ['+ residual', '--pos', 8], ['LayerNorm', '--pos', 8], ['MLP', '--accent-2', 18], ['+ residual', '--pos', 8]];
      var attnLy = null;
      lys.slice().reverse().forEach(function (L, k) {
        var b = K.box(blk, BX + 14, BY + 14 + k * 46, BW - 28, 38, 'an-cell'); b.style.borderRadius = '8px';
        b.style.border = '2px solid var(--line)'; b.style.background = K.tint(L[1], L[2]); b.style.fontSize = '19px'; b.textContent = L[0];
        if (L[0] === 'Self-attention') attnLy = b;
      });
      var up = K.path(st.layer(), K.vcurve(820, 528, BX + BW / 2, BY + 304, 0.5), { color: '--accent', width: 3, arrow: true });
      var MX = 860, MY = 52, MS = 430;
      var mwrap = K.box(R, 0, 0, 1440, 640, '');
      var cv = K.h('canvas', { width: 197, height: 197, class: 'an-abs' }, mwrap); K.pos(cv, MX, MY, MS, MS);
      cv.style.imageRendering = 'pixelated'; cv.style.border = '1px solid var(--line)';
      K.label(mwrap, MX + MS / 2, MY - 20, 'keys: [CLS], p1 … p196 →', 'an-tiny an-muted', 'c');
      var ql = K.label(mwrap, MX - 14, MY + MS / 2, 'queries ↓', 'an-tiny an-muted', 'r');
      K.label(mwrap, MX + MS / 2, MY + MS + 22, 'real ViT-B/16 · layer 2 · mean of 12 heads', 'an-tiny an-muted', 'c');
      var link = K.path(st.layer(), K.line(BX + BW + 6, BY + 14 + 4 * 46 + 19, MX - 8, MY + MS / 2), { color: '--accent', width: 2.5, dashed: '6 6' });
      var rowY = AT ? MY + (AT.eye + 0.5) * MS / AT.n : MY;
      var rowHL = K.box(R, MX - 6, rowY - 6, MS + 12, 12, 'an-off'); rowHL.style.border = '3px solid var(--accent-2)'; rowHL.style.borderRadius = '4px';
      var rowL = K.label(R, MX + MS + 14, rowY, 'eye patch', 'an-tiny an-accent2 an-b', 'l');
      // eye-row overlay on the cat
      var heat = K.s('g', null, st.layer());
      if (AT) AT.eyeRow.forEach(function (v, k) {
        K.s('rect', { x: IX + (k % 14) * CS, y: IY + Math.floor(k / 14) * CS, width: CS, height: CS,
          style: 'fill:#000;fill-opacity:' + (0.85 * (1 - Math.pow(v, 0.6))).toFixed(3) }, heat);
      });
      var drawn = '';
      function paint() {
        if (!AT || !cv.getContext) return;
        var col = getComputedStyle(st.root).getPropertyValue('--accent').trim() || '#b8894a';
        if (drawn === col) return; drawn = col;
        var ctx = cv.getContext('2d'); ctx.fillStyle = col;
        var raw = atob(AT.b64), img = ctx.createImageData(197, 197);
        var tmp = document.createElement('canvas').getContext('2d'); tmp.fillStyle = col; tmp.fillRect(0, 0, 1, 1);
        var c = tmp.getImageData(0, 0, 1, 1).data;
        for (var i = 0; i < raw.length; i++) { img.data[4 * i] = c[0]; img.data[4 * i + 1] = c[1]; img.data[4 * i + 2] = c[2]; img.data[4 * i + 3] = Math.min(255, Math.round(1.35 * raw.charCodeAt(i))); }
        ctx.putImageData(img, 0, 0);
      }
      return function (step) {
        var late = step >= 6;
        K.vis(blk, late); K.draw(up, late); K.vis(mwrap, step >= 7); K.draw(link, step >= 7);
        if (step >= 7) paint();
        if (attnLy) attnLy.style.borderColor = step >= 7 ? 'var(--fg)' : 'var(--line)';
        K.vis(rowHL, step === 8); K.vis(rowL, step === 8); heat.style.opacity = step === 8 ? 1 : 0;
        grid.style.opacity = step >= 1 ? 1 : 0; K.vis(gridL, step >= 1 && step < 5);
        hl.style.opacity = step >= 2 ? 1 : 0;
        K.vis(zoom, step >= 2 && step < 5); K.vis(zl, step >= 2 && step < 5);
        K.draw(zoomLine1, step >= 2 && step < 5); K.draw(zoomLine2, step >= 2 && step < 5);
        [flat, flatV].forEach(function (e) { K.vis(e, step >= 3 && !late); }); K.vis(flatL, step >= 3 && step < 5);
        K.draw(flatArrow, step >= 3 && step < 5);
        K.vis(flatTag, step >= 3 && step < 5);
        [times, W, WL, eq, emb].forEach(function (e) { K.vis(e, step >= 4 && !late); }); K.vis(embL, step === 4);
        K.vis(seq, step >= 5); K.vis(seqL, step >= 5); K.vis(convNote, step === 5);
        K.vis(dims, step === 0);
      };
    }
  });
})();
