/* anim-rlhf — the 3-stage RLHF recipe (InstructGPT, Ouyang et al. 2022), then newer variants
 * (DPO, RL from verifiable rewards for reasoning models). */
(function () {
  var K = window.AnimKit;
  K.register('rlhf', {
    steps: 4,
    size: [1400, 640],
    labels: ['① Supervised fine-tuning', '② Reward model', '③ RL with PPO', 'Newer variants'],
    captions: [
      '① SFT: humans write ideal answers to prompts; fine-tune the pre-trained LLM on them',
      '② Sample several answers, humans <b>rank</b> them; train a reward model to predict the ranking',
      '③ The policy generates, the reward model scores, <b>PPO</b> updates the policy (KL penalty keeps it close to SFT)',
      'Today: <b>DPO</b> learns directly from preference pairs; reasoning models use <b>verifiable rewards</b> (tests, exact answers)'
    ],
    build: function (st) {
      var R = st.root, svg = st.svg;
      var CW = 430, CY = 18, CH = 448, GAP = 25, X = [22, 22 + CW + GAP, 22 + 2 * (CW + GAP)];
      function card(i, title) {
        var c = K.box(R, X[i], CY, CW, CH, 'an-card');
        var t = K.label(c, 24, 30, title, 'an-display', 'l'); t.inner.style.fontSize = '30px';
        return c;
      }
      function bubble(p, x, y, w, h, html, cls) {
        var b = K.box(p, x, y, w, h, 'an-tok ' + (cls || ''));
        b.style.fontFamily = 'var(--font-body)'; b.style.fontSize = '21px'; b.style.whiteSpace = 'normal';
        b.style.padding = '6px 14px'; b.style.lineHeight = '1.2'; b.style.textAlign = 'center'; b.style.borderRadius = '16px';
        b.innerHTML = '<span>' + html + '</span>'; return b;
      }
      function model(p, x, y, w, name, sub, cls) {
        var b = K.box(p, x, y, w, 62, 'an-tok ' + (cls || 'is-accent'));
        b.style.flexDirection = 'column'; b.style.fontFamily = 'var(--font-body)'; b.style.lineHeight = '1.1';
        b.innerHTML = '<span style="font-family:var(--font-display);font-size:26px">' + name + '</span>' + (sub ? '<span class="an-muted" style="font-size:18px">' + sub + '</span>' : '');
        return b;
      }
      function person(p, x, y, label) {
        var s = K.s('svg', { class: 'an-svg', viewBox: '0 0 60 60', width: 52, height: 52, style: 'left:' + x + 'px;top:' + y + 'px' }, p);
        K.s('circle', { cx: 30, cy: 17, r: 11, style: 'fill:var(--muted)' }, s);
        K.s('path', { d: 'M8,58 C8,38 52,38 52,58 Z', style: 'fill:var(--muted)' }, s);
        K.label(p, x + 64, y + 27, label, 'an-small', 'l');
      }
      function down(p, x, y1, y2) {
        var s = K.s('svg', { class: 'an-svg', viewBox: '0 0 ' + CW + ' ' + CH, width: CW, height: CH }, p);
        K.path(s, K.line(x, y1, x, y2), { color: '--muted', width: 2.5, arrow: true });
        return s;
      }
      var M = CW / 2;
      // card 1
      var c1 = card(0, '① Supervised fine-tuning');
      bubble(c1, 40, 70, CW - 80, 62, 'prompt: “Explain the moon landing to a 6-year-old”');
      down(c1, M, 136, 162);
      person(c1, 60, 168, 'labeler writes the answer');
      down(c1, M, 226, 252);
      bubble(c1, 40, 258, CW - 80, 62, '“Some people went to the Moon in a big rocket…”', 'is-pos');
      down(c1, M, 324, 352);
      model(c1, 70, 358, CW - 140, 'SFT model', 'fine-tuned on demonstrations');
      // card 2
      var c2 = card(1, '② Reward model');
      bubble(c2, 40, 70, CW - 80, 62, 'prompt + several sampled answers');
      down(c2, M, 136, 160);
      ['A', 'B', 'C', 'D'].forEach(function (l, i) {
        var b = K.box(c2, 75 + i * 75, 166, 56, 48, 'an-tok an-mono'); b.style.fontSize = '24px'; b.textContent = l;
      });
      person(c2, 60, 226, 'labeler ranks them');
      var rk = K.label(c2, M, 306, 'A > B > C > D', 'an-mono an-accent an-b', 'c'); rk.inner.style.fontSize = '28px';
      down(c2, M, 328, 352);
      model(c2, 70, 358, CW - 140, 'Reward model', 'answer → scalar score r', 'is-accent2');
      // card 3
      var c3 = card(2, '③ RL fine-tuning (PPO)');
      var M3 = 180;
      bubble(c3, 30, 70, 300, 62, 'new prompt: “Write a story about frogs”');
      down(c3, M3, 136, 154);
      model(c3, 40, 160, 280, 'Policy', 'initialised from SFT');
      down(c3, M3, 226, 244);
      bubble(c3, 30, 250, 300, 50, '“Once upon a time, a frog…”');
      down(c3, M3, 304, 322);
      model(c3, 40, 328, 280, 'Reward model', 'r = 0.73', 'is-accent2');
      var ls = K.s('svg', { class: 'an-svg', viewBox: '0 0 ' + CW + ' ' + CH, width: CW, height: CH }, c3);
      K.path(ls, 'M324,359 C424,359 424,191 324,191', { color: '--accent', width: 3, arrow: true });
      var ppo = K.label(c3, 398, 275, 'PPO<br>update', 'an-small an-accent an-b', 'c');
      ppo.inner.style.textAlign = 'center'; ppo.inner.style.background = 'var(--surface)'; ppo.inner.style.padding = '4px 2px';
      K.label(c3, CW / 2, 418, 'KL penalty: stay close to the SFT model', 'an-tiny an-muted', 'c');
      // flow arrows between cards
      var f1 = K.path(svg, K.line(X[0] + CW + 2, 389, X[1] - 2, 389), { color: '--fg', width: 3, arrow: true });
      var f2 = K.path(svg, K.line(X[1] + CW + 2, 389, X[2] - 2, 389), { color: '--fg', width: 3, arrow: true });
      // modern variants band
      var band = K.box(R, 0, 0, 1400, 640, 'an-off');
      var d1 = bubble(band, 22, 484, 668, 98, '<b style="color:var(--accent)">DPO</b> (2023): skip ② and ③ — optimise the policy <b>directly</b> on preferred vs. rejected answers; no reward model, no PPO');
      var d2 = bubble(band, 710, 484, 668, 98, '<b style="color:var(--accent-2)">RL from verifiable rewards</b> (2024–25): reward = automatic check (unit tests pass, maths answer correct) → <b>reasoning</b> models');
      [d1, d2].forEach(function (d) { d.style.textAlign = 'left'; d.style.justifyContent = 'flex-start'; d.style.fontSize = '22px'; });

      return function (step) {
        [c1, c2, c3].forEach(function (c, i) {
          K.vis(c, step >= i);
          c.style.opacity = step >= i ? (step >= 2 || i === step ? 1 : 0.75) : 0;
          c.style.borderColor = i === step ? 'var(--accent)' : 'var(--line)';
        });
        K.draw(f1, step >= 1); K.draw(f2, step >= 2);
        K.vis(band, step >= 3);
      };
    }
  });
})();
