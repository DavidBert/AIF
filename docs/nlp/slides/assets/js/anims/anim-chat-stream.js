/* anim-chat-stream — a generic (brand-free) chat UI: prompt → user bubble → the
 * assistant streams its answer token by token → tokens highlighted.
 * 4 steps. Written for the deck (same API as the other anim-*.js components).
 * opts.prompt, opts.tokens (array of strings, leading spaces kept), opts.speed (ms per token) */
(function () {
  var K = window.AnimKit;
  var PROMPT = 'Explique le TF-IDF en une phrase.';
  var TOKENS = ['Le', ' TF', '-', 'IDF', ' donne', ' plus', ' de', ' poids', ' aux', ' mots', ' fréqu', 'ents', ' dans', ' un',
    ' document', ' mais', ' rares', ' dans', ' le', ' reste', ' du', ' corpus', ' :', ' ce', ' sont', ' eux', ' qui', ' le',
    ' caract', 'éris', 'ent', ' le', ' mieux', '.'];
  K.register('chat-stream', {
    steps: 4,
    size: [1200, 620],
    labels: ['Prompt', 'Sent', 'Streaming', 'Tokens'],
    captions: [
      'You type a prompt…',
      '…the model receives it as a sequence of <b>tokens</b>…',
      '…and writes the answer <b>one token at a time</b> (that is why it “streams”)',
      'Each coloured chunk is one token: <b>predict → sample → append</b>, repeated (illustrative split)'
    ],
    build: function (st, opts) {
      var R = st.root;
      var prompt = opts.prompt || PROMPT, toks = opts.tokens || TOKENS, speed = opts.speed || 85;
      // window
      var win = K.box(R, 150, 10, 900, 552, 'an-card');
      win.style.overflow = 'hidden';
      var bar = K.box(win, 0, 0, 896, 54, '');
      bar.style.background = 'var(--surface-2, var(--surface))'; bar.style.borderBottom = '2px solid var(--line)';
      bar.innerHTML = '<span style="position:absolute;left:22px;top:13px;font-size:22px;color:var(--muted)">● ● ●</span>' +
        '<span style="position:absolute;left:0;right:0;top:11px;text-align:center;font-size:23px;font-weight:600">Assistant</span>';
      // user bubble
      var ub = K.box(win, 430, 84, 440, 0, '');
      ub.style.height = 'auto'; ub.style.padding = '14px 20px'; ub.style.borderRadius = '20px 20px 4px 20px';
      ub.style.background = 'color-mix(in srgb, var(--accent-2) 16%, var(--surface))'; ub.style.fontSize = '26px';
      ub.textContent = prompt;
      // assistant bubble
      var ab = K.box(win, 28, 190, 760, 0, '');
      ab.style.height = 'auto'; ab.style.padding = '16px 22px'; ab.style.borderRadius = '20px 20px 20px 4px';
      ab.style.background = 'var(--surface)'; ab.style.border = '2px solid var(--line)'; ab.style.fontSize = '28px'; ab.style.lineHeight = '1.55';
      var spans = toks.map(function (t, i) {
        var s = K.h('span', { text: t }, ab);
        s.style.whiteSpace = 'pre-wrap'; s.style.borderRadius = '6px'; s.style.transition = 'background-color .4s';
        return s;
      });
      var dots = K.box(win, 28, 190, 110, 56, '');
      dots.style.borderRadius = '20px'; dots.style.border = '2px solid var(--line)';
      dots.innerHTML = '<span style="position:absolute;left:0;right:0;top:6px;text-align:center;font-size:30px;letter-spacing:6px;color:var(--muted)">•••</span>';
      // input box
      var inp = K.box(win, 28, 470, 840, 60, '');
      inp.style.border = '2px solid var(--line)'; inp.style.borderRadius = '30px'; inp.style.background = 'var(--surface)';
      var inTxt = K.h('span', null, inp);
      inTxt.style.position = 'absolute'; inTxt.style.left = '24px'; inTxt.style.top = '12px'; inTxt.style.fontSize = '25px';
      var send = K.box(inp, 790, 8, 40, 40, '');
      send.style.borderRadius = '50%'; send.style.background = 'var(--accent)';
      send.innerHTML = '<span style="position:absolute;left:0;right:0;top:2px;text-align:center;color:var(--surface);font-size:24px;font-weight:700">↑</span>';
      var timer = null, prev = -1;
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function showN(n) { spans.forEach(function (s, i) { s.style.visibility = i < n ? 'visible' : 'hidden'; }); }
      function update(step) {
        stop();
        K.vis(ub, step >= 1);
        inTxt.textContent = step === 0 ? prompt : 'Message…';
        inTxt.style.color = step === 0 ? 'var(--fg)' : 'var(--muted)';
        K.vis(dots, step === 1);
        K.vis(ab, step >= 2);
        spans.forEach(function (s, i) {
          s.style.backgroundColor = step >= 3 ? (i % 2 ? 'color-mix(in srgb, var(--accent-2) 22%, var(--surface))' : 'color-mix(in srgb, var(--accent) 26%, var(--surface))') : 'transparent';
        });
        if (step === 2 && prev < 2 && !K.reduced()) {
          var n = 0; showN(0);
          timer = setInterval(function () { n++; showN(n); if (n >= spans.length) stop(); }, speed);
        } else {
          showN(step >= 2 ? spans.length : 0);
        }
        prev = step;
      }
      return { update: update, destroy: stop };
    }
  });
})();
