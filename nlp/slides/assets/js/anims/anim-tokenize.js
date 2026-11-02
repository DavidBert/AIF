/* anim-tokenize — whitespace → whitespace+punctuation → subword tokenization, with token IDs. */
(function () {
  var K = window.AnimKit;
  var METHOD_NAME = {
    raw: 'raw text', ws: 'split on whitespace', wsp: 'whitespace + punctuation',
    sub: 'subword (WordPiece / BPE)', word: 'word-level vocabulary'
  };
  // IDs shown only for the last row: real bert-base-uncased IDs of 'annoying' and '##ly'
  var IDS = { annoying: 15703, '##ly': 2135, annoyingly: '[UNK]' };
  var ROWS = [
    {
      text: 'This is an example of tokenization.', y: 120,
      m: {
        raw: ['This is an example of tokenization.'],
        ws: ['This', 'is', 'an', 'example', 'of', 'tokenization.'],
        wsp: ['This', 'is', 'an', 'example', 'of', 'tokenization', '.'],
        sub: ['This', 'is', 'an', 'example', 'of', 'token', '##ization', '.']
      },
      flag: { ws: { 'tokenization.': 'is-neg' }, wsp: { 'tokenization': 'is-pos', '.': 'is-pos' }, sub: { 'token': 'is-accent2', '##ization': 'is-accent2' } }
    },
    {
      text: "That's a problem...", y: 270,
      m: {
        raw: ["That's a problem..."],
        ws: ["That's", 'a', 'problem...'],
        wsp: ['That', "'", 's', 'a', 'problem', '.', '.', '.'],
        sub: ['That', "'s", 'a', 'problem', '...']
      },
      flag: { ws: { "That's": 'is-neg', 'problem...': 'is-neg' }, wsp: { "'": 'is-neg', s: 'is-neg', '.': 'is-neg' }, sub: { "'s": 'is-pos', '...': 'is-pos' } }
    },
    {
      text: 'annoyingly', y: 420,
      m: { word: ['annoyingly'], sub: ['annoying', '##ly'] },
      flag: { word: { annoyingly: 'is-neg' }, sub: { annoying: 'is-accent2', '##ly': 'is-accent2' } }
    }
  ];
  // method per row, per step
  var PLAN = [
    ['raw', 'raw', null],
    ['ws', 'ws', null],
    ['wsp', 'wsp', null],
    ['sub', 'sub', null],
    ['sub', 'sub', 'word'],
    ['sub', 'sub', 'sub']
  ];

  K.register('tokenize', {
    steps: 6,
    size: [1200, 600],
    labels: ['Raw text', 'Whitespace split', 'Whitespace + punctuation', 'Subword tokens + IDs', 'Unknown word → [UNK]', 'Unknown word → subwords'],
    captions: [
      'A document is just a <b>string of characters</b>. How do we cut it into tokens?',
      'Whitespace: punctuation stays <b>glued</b> to words (“tokenization.” ≠ “tokenization”)',
      'Whitespace + punctuation fixes the first sentence… but “That’s a problem…” falls apart',
      'Subwords: frequent words stay whole, rarer ones split into <b>known pieces</b> of a fixed vocabulary',
      'A word-level vocabulary has never seen “annoyingly” → it becomes <b>[UNK]</b>',
      'annoyingly = <b>annoying</b> + <b>##ly</b>, each piece with its vocabulary <b>ID</b> → no unknown words'
    ],
    build: function (st) {
      var R = st.root, FS = 30, CW = FS * 0.6, PAD = 14, GAP = 14, BH = 58, X0 = 60;
      var pill = K.box(R, 40, 26, null, 44, 'an-tok is-strong an-display');
      pill.style.fontSize = '26px'; pill.style.padding = '0 18px'; pill.style.fontFamily = 'var(--font-display)';
      var pillTxt = K.h('span', null, pill);
      var idNote = K.label(R, 1160, 48, 'IDs: bert-base-uncased vocabulary (30,522 entries)', 'an-muted an-small', 'r');

      // build keyed token elements
      var els = {};
      ROWS.forEach(function (row, ri) {
        Object.keys(row.m).forEach(function (mk) {
          var cur = 0;
          row.m[mk].forEach(function (tok) {
            var surf = tok.indexOf('##') === 0 ? tok.slice(2) : tok;
            var s = row.text.indexOf(surf, cur);
            cur = s + surf.length;
            var key = ri + ':' + s + ':' + cur + ':' + tok;
            if (!els[key]) {
              var w = tok.length * CW + 2 * PAD;
              var b = K.box(R, 0, row.y, w, BH, 'an-tok an-off');
              b.style.fontSize = FS + 'px';
              b.innerHTML = tok.indexOf('##') === 0
                ? '<span class="an-muted">##</span>' + tok.slice(2)
                : tok.replace(/ /g, ' ');
              var idl = K.box(R, 0, row.y + BH + 6, w, 26, 'an-sub an-off');
              idl.textContent = IDS[tok] !== undefined ? IDS[tok] : '';
              els[key] = { b: b, id: idl, w: w, row: ri, tok: tok, placed: false };
            }
            (row._layout = row._layout || {})[mk] = row._layout[mk] || [];
            row._layout[mk].push(key);
          });
        });
        // compute x positions per method
        row._x = {};
        Object.keys(row._layout).forEach(function (mk) {
          var x = X0;
          row._layout[mk].forEach(function (key) {
            row._x[mk + '|' + key] = x;
            x += els[key].w + GAP;
          });
        });
      });
      // initial placement: first method each element appears in
      ROWS.forEach(function (row) {
        Object.keys(row._layout).forEach(function (mk) {
          row._layout[mk].forEach(function (key) {
            var e = els[key];
            if (!e.placed) { e.b.style.left = row._x[mk + '|' + key] + 'px'; e.id.style.left = e.b.style.left; e.placed = true; }
          });
        });
      });

      return function (step) {
        var plan = PLAN[step];
        var shown = {};
        ROWS.forEach(function (row, ri) {
          var mk = plan[ri];
          if (!mk) return;
          row._layout[mk].forEach(function (key) {
            var e = els[key], x = row._x[mk + '|' + key];
            shown[key] = true;
            e.b.style.left = x + 'px'; e.id.style.left = x + 'px';
            var fl = (row.flag[mk] && row.flag[mk][e.tok]) || '';
            e.b.className = 'an-abs an-tok ' + (mk === 'raw' ? 'is-raw ' : '') + fl;
            var showId = (mk === 'sub' || mk === 'word') && e.id.textContent !== '';
            K.vis(e.id, showId);
            K.cls(e.id, 'an-neg', mk === 'word');
          });
        });
        Object.keys(els).forEach(function (k) {
          if (!shown[k]) { K.vis(els[k].b, false); K.vis(els[k].id, false); }
        });
        var m = plan[2] === 'word' ? 'word' : plan[0];
        pillTxt.textContent = METHOD_NAME[m];
        K.vis(idNote, step >= 4);
      };
    }
  });
})();
