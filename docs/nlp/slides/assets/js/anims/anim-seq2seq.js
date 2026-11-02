/* anim-seq2seq — RNN encoder–decoder translating "Bonne journée" → "Have a nice day".
 * Steps: 0 source, 1 encode, 2 context vector z, 3..7 decode one token per step, 8 bottleneck. */
(function () {
  var K = window.AnimKit;
  K.register('seq2seq', {
    steps: 9,
    size: [1360, 600],
    labels: ['Source sentence', 'Encode', 'Context vector z', 'Decode: have', 'Decode: a', 'Decode: nice', 'Decode: day', 'Decode: <eos>', 'The bottleneck'],
    captions: [
      'Source sentence, framed by <b>&lt;sos&gt;</b> and <b>&lt;eos&gt;</b> tokens',
      'The encoder RNN reads the source token by token: h<sub>1</sub> … h<sub>4</sub>',
      'Its last hidden state becomes the <b>context vector z</b>',
      'The decoder starts from z and the &lt;sos&gt; token, and emits the first word',
      'Each generated word is fed back as the next input (autoregressive)',
      '… one token per step …',
      '… until …',
      '… the decoder emits <b>&lt;eos&gt;</b>: translation complete',
      'The whole source sentence must squeeze through one fixed-size vector z → motivates <b>attention</b>'
    ],
    build: function (st, opts) {
      var R = st.root, svg = st.svg;
      var src = opts.source || ['<sos>', 'bonne', 'journée', '<eos>'];
      var tgt = opts.target || ['have', 'a', 'nice', 'day', '<eos>'];
      var EX = src.map(function (s, i) { return 90 + i * 128; });
      var ZX = EX[EX.length - 1] + 150;
      var DX = tgt.map(function (s, i) { return ZX + 150 + i * 128; });
      var CY = 300, CWd = 96, CH = 76, INY = 440, OUTY = 96, CHW = 118, CHH = 52;
      function chip(x, y, t, cls) {
        var b = K.box(R, x - CHW / 2, y, CHW, CHH, 'an-tok ' + (cls || '')); b.style.fontSize = '25px'; b.textContent = t; return b;
      }
      function cell(x, t) {
        var b = K.box(R, x - CWd / 2, CY - CH / 2, CWd, CH, 'an-tok'); b.style.fontSize = '27px'; b.style.fontFamily = 'var(--font-body)';
        b.innerHTML = t; return b;
      }
      // group frames
      var encF = K.box(R, EX[0] - 70, CY - 60, EX[EX.length - 1] - EX[0] + 140, 120, ''); encF.style.border = '2px dashed var(--line)'; encF.style.borderRadius = '18px';
      var decF = K.box(R, DX[0] - 70, CY - 60, DX[DX.length - 1] - DX[0] + 140, 120, ''); decF.style.border = '2px dashed var(--line)'; decF.style.borderRadius = '18px';
      var encL = K.label(R, (EX[0] + EX[EX.length - 1]) / 2, INY + 84, 'Encoder', 'an-display an-accent2', 'c'); encL.inner.style.fontSize = '32px';
      var decL = K.label(R, (DX[0] + DX[DX.length - 1]) / 2, INY + 84, 'Decoder', 'an-display an-accent', 'c'); decL.inner.style.fontSize = '32px';
      // encoder
      var enc = src.map(function (s, i) {
        var c = cell(EX[i], 'h<sub>' + (i + 1) + '</sub>');
        var ch = chip(EX[i], INY, s);
        var up = K.path(svg, K.line(EX[i], INY - 4, EX[i], CY + CH / 2 + 8), { color: '--muted', width: 2.5, arrow: true });
        var rt = K.path(svg, K.line(EX[i] + CWd / 2 + 4, CY, (i + 1 < src.length ? EX[i + 1] - CWd / 2 : ZX - 34) - 8, CY), { color: '--accent-2', width: 2.5, arrow: true });
        [c, up, rt].forEach(function (e) { e.style.transitionDelay = (i * 160) + 'ms'; });
        return { c: c, ch: ch, up: up, rt: rt };
      });
      // z
      var zc = K.s('circle', { cx: ZX, cy: CY, r: 34, style: 'fill:var(--surface);stroke:var(--fg);stroke-width:2.5' }, svg);
      var zl = K.label(R, ZX, CY, '<i style="font-family:Georgia,serif">z</i>', '', 'c'); zl.inner.style.fontSize = '30px';
      var zvec = K.vec(R, ZX - 13, CY + 56, K.randVec('z-ctx', 5), { cell: 22, gap: 2, vertical: true });
      var zring = K.s('circle', { cx: ZX, cy: CY, r: 50, style: 'fill:none;stroke:var(--neg);stroke-width:3;stroke-dasharray:6 6' }, svg);
      var zNote = K.label(R, ZX, CY - 112, 'fixed-size<br>bottleneck', 'an-small an-neg', 'c'); zNote.inner.style.textAlign = 'center';
      var zArrow = K.path(svg, K.line(ZX + 38, CY, DX[0] - CWd / 2 - 8, CY), { color: '--accent', width: 2.5, arrow: true });
      // decoder
      var decIn = ['<sos>'].concat(tgt.slice(0, -1));
      var dec = tgt.map(function (t, i) {
        var c = cell(DX[i], 's<sub>' + (i + 1) + '</sub>');
        var ich = chip(DX[i], INY, decIn[i]);
        var och = chip(DX[i], OUTY, t, 'is-accent');
        var up = K.path(svg, K.line(DX[i], INY - 4, DX[i], CY + CH / 2 + 8), { color: '--muted', width: 2.5, arrow: true });
        var out = K.path(svg, K.line(DX[i], CY - CH / 2 - 4, DX[i], OUTY + CHH + 8), { color: '--accent', width: 2.5, arrow: true });
        var rt = i + 1 < tgt.length ? K.path(svg, K.line(DX[i] + CWd / 2 + 4, CY, DX[i + 1] - CWd / 2 - 8, CY), { color: '--accent', width: 2.5, arrow: true }) : null;
        var fb = i + 1 < tgt.length ? K.path(svg,
          'M' + (DX[i] + 30) + ',' + (OUTY + CHH + 2) + ' C' + (DX[i] + 64) + ',' + (OUTY + 120) + ' ' + (DX[i] + 54) + ',' + (INY - 110) + ' ' + (DX[i + 1] - 34) + ',' + (INY - 4),
          { color: '--muted', width: 2, dashed: '5 6', arrow: true }) : null;
        if (fb) fb._op = 0.8;
        return { c: c, ich: ich, och: och, up: up, out: out, rt: rt, fb: fb };
      });

      return function (step) {
        var encOn = step >= 1, zOn = step >= 2, nDec = Math.max(0, Math.min(tgt.length, step - 2));
        enc.forEach(function (e) {
          e.c.className = 'an-abs an-tok' + (encOn ? ' is-accent2' : ' is-dim');
          K.draw(e.up, encOn); K.draw(e.rt, encOn);
        });
        encF.style.borderColor = encOn ? 'var(--accent-2)' : 'var(--line)';
        zc.style.opacity = zOn ? 1 : 0; K.vis(zl, zOn); K.vis(zvec, zOn);
        zc.style.stroke = step === 8 ? 'var(--neg)' : 'var(--fg)';
        zring.style.opacity = step === 8 ? 1 : 0; K.vis(zNote, step === 8);
        K.draw(zArrow, zOn && step >= 3);
        K.vis(decF, zOn); K.vis(decL, zOn);
        decF.style.borderColor = nDec ? 'var(--accent)' : 'var(--line)';
        dec.forEach(function (d, i) {
          var on = i < nDec, cur = i === nDec - 1 && step <= 7;
          K.vis(d.c, zOn);
          d.c.className = 'an-abs an-tok' + (on ? (cur ? ' is-fill' : ' is-accent') : ' is-dim') + (zOn ? '' : ' an-off');
          d.c.style.color = on && cur ? 'var(--surface)' : '';
          K.vis(d.ich, on); K.draw(d.up, on);
          K.vis(d.och, on); K.draw(d.out, on);
          d.och.className = 'an-abs an-tok' + (i === tgt.length - 1 ? ' is-pos' : ' is-accent') + (on ? '' : ' an-off');
          if (d.rt) K.draw(d.rt, i + 1 < nDec);
          if (d.fb) K.draw(d.fb, i + 1 < nDec);
        });
      };
    }
  });
})();
