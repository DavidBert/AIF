/* anim-vgg-rf — VGG-16 (Simonyan & Zisserman 2014): receptive field of one neuron grows with depth.
 * Receptive fields are computed exactly (3 × 3 convs stride 1, 2 × 2 max-pool stride 2):
 * end of block 1 → 6 px, block 2 → 16, block 3 → 44, block 4 → 100, block 5 → 212 px (input 224 × 224).
 * Steps: 0 architecture · 1 first conv (3 px) · 2–6 end of blocks 1–5 */
(function () {
  var K = window.AnimKit;
  var BLOCKS = [
    { s: 224, c: 64, n: 2, rf: 6 }, { s: 112, c: 128, n: 2, rf: 16 }, { s: 56, c: 256, n: 3, rf: 44 },
    { s: 28, c: 512, n: 3, rf: 100 }, { s: 14, c: 512, n: 3, rf: 212 }
  ];
  K.register('vgg-rf', {
    steps: 7,
    size: [1440, 620],
    captions: [
      'VGG-16: 13 convolutions 3 × 3 in 5 blocks; each block ends with a 2 × 2 max-pool that halves the resolution',
      'First convolution: one output neuron sees a <b>3 × 3 px</b> window of the image',
      'End of block 1 (2 convs + pool): receptive field <b>6 × 6 px</b>',
      'End of block 2: <b>16 × 16 px</b>. Pooling doubles how fast the window grows',
      'End of block 3: <b>44 × 44 px</b>: about an eye',
      'End of block 4: <b>100 × 100 px</b>: half the face',
      'End of block 5, after 13 convs: <b>212 × 212 px</b>. Only now does one neuron see (almost) the whole image'
    ],
    build: function (st) {
      var R = st.root, top = null;
      var IX = 40, IY = 130, IS = 336, sc = IS / 224;
      var img = K.h('img', { src: 'assets/img/cat-224.png', alt: 'Close-up photo of a tabby cat', class: 'an-abs' }, R);
      K.pos(img, IX, IY, IS, IS); img.style.borderRadius = '4px';
      K.label(R, IX + IS / 2, IY - 24, 'input 224 × 224 × 3', 'an-small an-muted', 'c');
      // slabs
      var x = 440, mid = IY + IS / 2, slabs = [];
      BLOCKS.forEach(function (b, i) {
        var h = 40 + 300 * Math.pow(b.s / 224, 0.7), w = 16 + 52 * (Math.log(b.c / 32) / Math.log(16));
        var s = K.box(R, x, mid - h / 2, w, h, '');
        s.style.background = K.tint('--accent-2', 22); s.style.border = '2px solid var(--accent-2)'; s.style.borderRadius = '4px';
        s.style.boxShadow = '10px -10px 0 ' + K.tint('--accent-2', 10);
        var lab = K.label(R, x + w / 2, mid + h / 2 + 22, b.s + '×' + b.s + '×' + b.c, 'an-mono an-tiny', 'c');
        var lab2 = K.label(R, x + w / 2, mid - h / 2 - 34, 'block ' + (i + 1) + '<br><span class="an-muted">' + b.n + ' conv + pool</span>', 'an-tiny', 'c');
        lab2.inner.style.textAlign = 'center';
        slabs.push({ el: s, x: x, w: w, h: h, cx: x + w / 2 });
        x += w + 92 - i * 6;
      });
      // FC head
      var fc = K.box(R, x, mid - 70, 120, 140, 'an-cell'); fc.style.border = '2px solid var(--line)'; fc.style.borderRadius = '10px';
      fc.style.background = 'var(--surface-2)'; fc.style.fontSize = '20px'; fc.style.textAlign = 'center';
      fc.innerHTML = 'FC 4096<br>FC 4096<br>→ 1000';
      top = st.layer();
      // first-conv slab marker (thin) inside block 1
      var c0 = slabs[0];
      var cx = 56, cy = 88;                                  // centre of the eye patch, in 224-px coordinates
      var rfBox = K.s('rect', { style: 'fill:' + 'none' + ';stroke:var(--accent);stroke-width:3;opacity:0' }, top);
      var rfFill = K.s('rect', { style: 'fill:var(--accent);fill-opacity:.18;opacity:0' }, top);
      var cone1 = K.s('line', { style: 'stroke:var(--accent);stroke-width:2;stroke-dasharray:6 5;opacity:0' }, top);
      var cone2 = K.s('line', { style: 'stroke:var(--accent);stroke-width:2;stroke-dasharray:6 5;opacity:0' }, top);
      var dot = K.s('circle', { r: 8, style: 'fill:var(--accent);stroke:var(--surface);stroke-width:2;opacity:0' }, top);
      var rfL = K.label(R, IX, IY + IS + 62, '', 'an-small an-b', 'l');
      var shade = K.s('path', { style: 'fill:#000;fill-opacity:.45;fill-rule:evenodd;opacity:0' }, top);
      return function (step) {
        var rf = step === 1 ? 3 : step >= 2 ? BLOCKS[step - 2].rf : 0;
        var on = step >= 1;
        slabs.forEach(function (s, i) { s.el.style.opacity = !on || i === Math.max(0, step - 2) ? 1 : 0.45; });
        var half = rf / 2, x0 = Math.max(0, cx - half), y0 = Math.max(0, cy - half), x1 = Math.min(224, cx + half), y1 = Math.min(224, cy + half);
        [rfBox, rfFill].forEach(function (r) {
          r.setAttribute('x', IX + x0 * sc); r.setAttribute('y', IY + y0 * sc);
          r.setAttribute('width', Math.max(4, (x1 - x0) * sc)); r.setAttribute('height', Math.max(4, (y1 - y0) * sc));
          r.style.opacity = on ? 1 : 0;
        });
        var X0 = IX + x0 * sc, Y0 = IY + y0 * sc, X1 = IX + x1 * sc, Y1 = IY + y1 * sc;
        shade.setAttribute('d', 'M' + IX + ',' + IY + 'h' + IS + 'v' + IS + 'h' + (-IS) + 'z M' + X0 + ',' + Y0 + 'H' + X1 + 'V' + Y1 + 'H' + X0 + 'z');
        shade.style.opacity = on ? 1 : 0;
        var s = slabs[Math.max(0, step - 2)], dx = s.cx, dy = mid - s.h / 2 + (cy / 224) * s.h;
        if (step === 1) { dx = c0.x + 6; dy = mid - c0.h / 2 + (cy / 224) * c0.h; }
        dot.setAttribute('cx', dx); dot.setAttribute('cy', dy); dot.style.opacity = on ? 1 : 0;
        cone1.setAttribute('x1', dx); cone1.setAttribute('y1', dy); cone1.setAttribute('x2', IX + x1 * sc); cone1.setAttribute('y2', IY + y0 * sc);
        cone2.setAttribute('x1', dx); cone2.setAttribute('y1', dy); cone2.setAttribute('x2', IX + x1 * sc); cone2.setAttribute('y2', IY + y1 * sc);
        cone1.style.opacity = cone2.style.opacity = on ? 1 : 0;
        rfL.inner.innerHTML = on ? 'receptive field of one neuron: <span class="an-accent">' + rf + ' × ' + rf + ' px</span>' : '';
      };
    }
  });
})();
