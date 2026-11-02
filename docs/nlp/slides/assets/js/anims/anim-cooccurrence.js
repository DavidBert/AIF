/* anim-cooccurrence — slide a ±2 context window over the (stop-word filtered) course sentences
 * and fill the co-occurrence matrix cell by cell. Steps: 0 setup, 1..10 window positions, 11 read a row. */
(function () {
  var K = window.AnimKit;
  var SENTS = [
    'For breakfast I eat eggs and fruits',
    'Go buy some eggs at the supermarket',
    'There were no eggs left at the supermarket'
  ];
  var STOP = ['for', 'i', 'and', 'go', 'some', 'at', 'the', 'there', 'were', 'no'];
  var VOCAB = ['eggs', 'fruits', 'supermarket', 'breakfast', 'eat', 'buy', 'left'];
  var WIN = 2;

  K.register('cooccurrence', {
    steps: 12,
    size: [1320, 640],
    labels: ['Setup', 'Window 1', 'Window 2', 'Window 3', 'Window 4', 'Window 5', 'Window 6', 'Window 7', 'Window 8', 'Window 9', 'Window 10', 'Read a row'],
    captions: (function () {
      var c = ['Remove stop words, then slide a <b>context window</b> (±2 words) over every sentence'];
      for (var i = 1; i <= 10; i++) c.push(i === 1 ? 'Centre word × each context word → +1 in the matrix' : i < 10 ? 'Slide the window… counts accumulate' : 'Last window: the matrix is symmetric');
      c.push('Each <b>row</b> is a word vector: “eggs” co-occurs with “supermarket” twice, never “fruits” with “supermarket”');
      return c;
    })(),
    build: function (st) {
      var R = st.root, FS = 24, CW = FS * 0.6, SX = 84;
      // sentences
      var content = []; // global list of {s, i(content idx), el}
      var sentW = SENTS.map(function (s, si) {
        var y = 40 + si * 74, idx = 0, cw = [];
        K.label(R, 30, y + 22, '(' + (si + 1) + ')', 'an-mono an-muted an-small', 'l');
        s.split(' ').forEach(function (w) {
          var x = SX + idx * CW;
          var stop = STOP.indexOf(w.toLowerCase()) >= 0;
          var b = K.box(R, x - 5, y, w.length * CW + 10, 44, 'an-tok' + (stop ? ' is-ghost' : ''));
          b.style.fontSize = FS + 'px'; b.textContent = w;
          b.style.borderRadius = '8px';
          if (stop) b.style.textDecoration = 'line-through';
          if (!stop) { var it = { s: si, i: cw.length, el: b, w: w.toLowerCase(), x: x - 5, r: x + w.length * CW + 5, y: y }; cw.push(it); content.push(it); }
          idx += w.length + 1;
        });
        return cw;
      });
      // window highlight boxes (one per sentence, behind tokens)
      var winEls = SENTS.map(function (s, si) {
        var e = K.box(R, 0, 40 + si * 74 - 8, 10, 60, 'an-off');
        e.style.borderRadius = '14px'; e.style.border = '2px solid var(--accent-2)';
        e.style.background = K.tint('--accent-2', 8);
        R.insertBefore(e, R.children[1]);
        return e;
      });
      var pairTxt = K.label(R, 30, 290, '', 'an-small', 'l');
      var pairTxt2 = K.label(R, 30, 330, '', 'an-small an-muted', 'l');

      // matrix
      var N = VOCAB.length, CELL = 56, GX = 930, GY = 210;
      var gridCells = [];
      for (var r = 0; r < N; r++) {
        K.label(R, GX - 14, GY + r * CELL + CELL / 2, VOCAB[r], 'an-small', 'r');
        var p = K.label(R, GX + r * CELL + CELL / 2 - 6, GY - 10, VOCAB[r], 'an-small', 'bl');
        p.inner.style.transformOrigin = '0 100%';
        p.inner.style.transform = 'translate(0,-100%) rotate(-42deg)';
        var row = [];
        for (var c = 0; c < N; c++) {
          var cell = K.box(R, GX + c * CELL, GY + r * CELL, CELL, CELL, 'an-cell');
          cell.style.border = '1px solid var(--line)'; cell.style.fontSize = '24px';
          if (r === c) { cell.textContent = '–'; cell.style.color = 'var(--muted)'; }
          row.push(cell);
        }
        gridCells.push(row);
      }
      var rowHL = K.box(R, GX - 3, GY - 3, N * CELL + 6, CELL + 6, 'an-off');
      rowHL.style.border = '3px solid var(--accent)'; rowHL.style.borderRadius = '6px';

      // precompute counts after each window position
      var M = [], snapshots = [], touched = [];
      for (var a = 0; a < N; a++) { M.push([]); for (var b = 0; b < N; b++) M[a].push(0); }
      snapshots.push(M.map(function (r) { return r.slice(); })); touched.push([]);
      content.forEach(function (it) {
        var cw = sentW[it.s], t = [];
        var wi = VOCAB.indexOf(it.w);
        for (var j = Math.max(0, it.i - WIN); j <= Math.min(cw.length - 1, it.i + WIN); j++) {
          if (j === it.i) continue;
          var ci = VOCAB.indexOf(cw[j].w);
          if (wi < 0 || ci < 0) continue;
          M[wi][ci] += 1; t.push([wi, ci]);
        }
        snapshots.push(M.map(function (r) { return r.slice(); })); touched.push(t);
      });

      return function (step) {
        var k = Math.min(step, content.length); // window index (1-based), 0 = none
        var cur = step >= 1 && step <= content.length ? content[step - 1] : null;
        // tokens
        content.forEach(function (it) {
          var cls = 'an-abs an-tok';
          if (cur && it === cur) cls += ' is-fill';
          else if (cur && it.s === cur.s && Math.abs(it.i - cur.i) <= WIN) cls += ' is-accent2';
          it.el.className = cls;
        });
        winEls.forEach(function (e, si) {
          var on = cur && cur.s === si;
          K.vis(e, !!on);
          if (on) {
            var cw = sentW[si], lo = cw[Math.max(0, cur.i - WIN)], hi = cw[Math.min(cw.length - 1, cur.i + WIN)];
            K.pos(e, lo.x - 10, null, hi.r - lo.x + 20);
          }
        });
        if (cur) {
          var cw = sentW[cur.s], ctx = [];
          for (var j = Math.max(0, cur.i - WIN); j <= Math.min(cw.length - 1, cur.i + WIN); j++) if (j !== cur.i) ctx.push(cw[j].w);
          pairTxt.inner.innerHTML = 'centre <b class="an-accent">' + cur.w + '</b>  ·  context <span class="an-accent2">' + ctx.join(', ') + '</span>';
          pairTxt2.inner.innerHTML = ctx.map(function (c) { return '(' + cur.w + ', ' + c + ') +1'; }).join('   ');
        } else {
          pairTxt.inner.innerHTML = step === 0 ? 'window = ±' + WIN + ' content words' : 'row “eggs” → [ – , 1, 2, 1, 1, 1, 1 ]';
          pairTxt2.inner.innerHTML = step === 0 ? 'stop words are ignored' : 'similar rows ⇒ similar contexts ⇒ similar meaning';
        }
        var S = snapshots[k], T = touched[k] || [];
        var final = step > content.length;
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          if (r === c) continue;
          var cell = gridCells[r][c], v = S[r][c];
          var hit = !final && T.some(function (p) { return p[0] === r && p[1] === c; });
          cell.textContent = v ? v : (final ? '0' : '');
          var key = final && r === 0 && (c === 1 || c === 2);
          var key2 = final && ((r === 1 && c === 2) || (r === 2 && c === 1));
          cell.style.background = hit ? K.tint('--accent', 45) : key ? K.tint('--accent', 30) : key2 ? K.tint('--accent-2', 18)
            : v ? K.tint('--accent', 8 + 10 * v) : 'transparent';
          cell.style.color = v ? 'var(--fg)' : 'var(--muted)';
          cell.style.fontWeight = hit || key ? '700' : '400';
        }
        K.vis(rowHL, final);
        if (final) pairTxt.inner.innerHTML = 'row <b class="an-accent">eggs</b> = [ – , ' + S[0].slice(1).join(', ') + ' ]';
      };
    }
  });
})();
