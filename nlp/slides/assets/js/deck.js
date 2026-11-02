/* ==========================================================================
   deck.js — tiny vanilla slide engine for the "Introduction to NLP" deck.
   - 1600x900 stage scaled to the window (letterboxed)
   - <section class="slide"> = one slide; <aside class="notes"> = speaker notes
   - .fragment elements and <div class="anim" data-anim="name"> components are
     stepped in DOM order before moving to the next slide (and reversed with ←)
     An anim can use a sub-range of its steps: data-from="2" data-to="5".
     data-autoplay on an .anim: it loops by itself and takes no navigation step.
   - Keys: → Space PageDown ↓ next · ← PageUp ↑ Shift+Space prev · Home/End
           O overview · N notes · F fullscreen · D dark/light · S short mode
   - <section data-optional> slides get an "optional" tag; short mode (S) skips them.
   - URL hash #N (1-based slide number) deep-links; nothing else is stored.
   ========================================================================== */
(function () {
  'use strict';
  var W = 1600, H = 900;
  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');
  var deckEl = stage.querySelector('.deck');
  var slides = Array.prototype.slice.call(deckEl.querySelectorAll(':scope > section.slide'));
  var N = slides.length;
  var cur = 0, step = 0;
  var shortMode = false; // S: skip slides marked data-optional
  function skipped(i) { return shortMode && slides[i].hasAttribute('data-optional'); }
  function core() { return slides.filter(function (x) { return !x.hasAttribute('data-optional'); }); }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // render KaTeX + code first, so slide titles read cleanly in the overview and notes
  renderExtras();
  // image slots: <div class="nbframe" data-src="path.png"> shows the image; an empty data-src
  // shows a "live demo" badge instead (no request for missing files, no console errors)
  Array.prototype.forEach.call(deckEl.querySelectorAll('.nbframe'), function (f) {
    var src = (f.getAttribute('data-src') || '').trim();
    if (src) { var im = document.createElement('img'); im.src = src; im.alt = 'AI-generated image'; f.appendChild(im); }
    else { f.classList.add('empty'); f.innerHTML = '<span class="ph">live demo</span>'; }
  });

  /* ---------- footer + progress ---------- */
  var footer = document.createElement('div');
  footer.className = 'footer';
  footer.innerHTML = '<span class="f-title">Introduction to NLP · INSA Toulouse</span><span class="f-sec"></span><span class="f-num"></span>';
  var progress = document.createElement('div');
  progress.className = 'progress';
  progress.innerHTML = '<div></div>';
  stage.appendChild(footer); stage.appendChild(progress);
  var fSec = footer.querySelector('.f-sec'), fNum = footer.querySelector('.f-num'), pBar = progress.firstChild;

  /* ---------- per-slide metadata ---------- */
  var section = '';
  var dividers = slides.filter(function (s) { return s.classList.contains('divider') && !s.hasAttribute('data-nomap'); });
  slides.forEach(function (s, i) {
    if (s.dataset.section) section = s.dataset.section;
    s._section = section;
    s._index = i;
    var h = s.querySelector('h1, h2, .dv-title');
    if (h) { h = h.cloneNode(true); Array.prototype.forEach.call(h.querySelectorAll('.katex-mathml'), function (m) { m.remove(); }); }
    s._title = h ? h.textContent.replace(/\s+/g, ' ').trim() : ('Slide ' + (i + 1));
    var notes = s.querySelector('aside.notes');
    s._notes = notes ? notes.innerHTML : '';
    s._items = null; // built lazily (needs Anims registry)
  });

  /* course map on dividers ("you are here") */
  slides.forEach(function (s) {
    var map = s.querySelector('ol.course-map[data-auto]');
    if (!map) return;
    var here = dividers.indexOf(s);
    dividers.forEach(function (d, j) {
      var li = document.createElement('li');
      if (j === here) li.className = 'here'; else if (j < here) li.className = 'done';
      var num = d.querySelector('.dv-num');
      li.innerHTML = '<span class="n">' + (num ? num.textContent.trim() : j) + '</span><span></span>';
      li.lastChild.textContent = d.dataset.section || '';
      map.appendChild(li);
    });
  });

  /* ---------- stepping items ---------- */
  function items(s) {
    if (s._items) return s._items;
    var list = [];
    Array.prototype.forEach.call(s.querySelectorAll('.fragment, .anim'), function (el) {
      if (el.closest('aside.notes')) return;
      if (el.classList.contains('anim')) {
        if (el.hasAttribute('data-autoplay')) return;
        var def = window.Anims && window.Anims[el.dataset.anim];
        if (!def) return;
        var from = +(el.dataset.from || 0);
        var to = el.dataset.to !== undefined ? +el.dataset.to : def.steps - 1;
        el._range = [from, to];
        list.push({ el: el, kind: 'anim', n: Math.max(0, to - from) });
      } else {
        list.push({ el: el, kind: 'frag', n: 1 });
      }
    });
    s._items = list;
    s._total = list.reduce(function (a, b) { return a + b.n; }, 0);
    return list;
  }
  function total(s) { items(s); return s._total; }

  function mountAnims(s) {
    Array.prototype.forEach.call(s.querySelectorAll('.anim'), function (el) {
      if (el._h || el._failed) return;
      var name = el.dataset.anim, def = window.Anims && window.Anims[name];
      if (!def) {
        el._failed = true; el.classList.add('missing'); el.textContent = 'missing animation: ' + name;
        if (window.console) console.warn('deck: missing animation component', name);
        return;
      }
      var opts = {};
      try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { console.warn('deck: bad data-opts on', name); }
      if (el.hasAttribute('data-autoplay') && !reduced) opts.autoplay = true;
      el._h = def.mount(el, opts);
    });
  }

  function apply(s, k) {
    mountAnims(s);
    var rem = k, lastFrag = null;
    items(s).forEach(function (it) {
      if (it.kind === 'frag') {
        var on = rem > 0;
        it.el.classList.toggle('visible', on);
        it.el.classList.remove('current-fragment');
        if (on) lastFrag = it.el;
        rem -= 1;
      } else {
        var used = Math.max(0, Math.min(rem, it.n));
        if (it.el._h) it.el._h.setStep(it.el._range[0] + used);
        rem -= it.n;
      }
    });
    if (lastFrag) lastFrag.classList.add('current-fragment');
  }

  /* ---------- navigation ---------- */
  function go(i, k, fromHash) {
    i = Math.max(0, Math.min(N - 1, i));
    var s = slides[i];
    var t = total(s);
    if (k === 'end') k = t;
    k = Math.max(0, Math.min(t, k || 0));
    if (i !== cur) slides[cur].classList.remove('active');
    cur = i; step = k;
    s.classList.add('active');
    apply(s, k);
    // preload neighbours so their animations are ready
    if (slides[i + 1]) { mountAnims(slides[i + 1]); if (!slides[i + 1].classList.contains('active')) apply(slides[i + 1], 0); }
    fSec.textContent = s._section || '';
    if (shortMode) {
      var cs = core(), k2 = cs.indexOf(s);
      fNum.textContent = (k2 >= 0 ? (k2 + 1) + ' / ' + cs.length : 'optional') + ' · short';
    } else fNum.textContent = (i + 1) + ' / ' + N;
    pBar.style.width = (N > 1 ? (100 * i / (N - 1)) : 100) + '%';
    document.body.classList.toggle('is-title', s.classList.contains('title-slide') || s.classList.contains('divider'));
    if (!fromHash) {
      var h = '#' + (i + 1);
      if (location.hash !== h) { try { history.replaceState(null, '', h); } catch (e) { /* file:// in some browsers */ } }
    }
    updateNotes();
  }
  function nextIndex(i, dir) { var j = i + dir; while (j >= 0 && j < N && skipped(j)) j += dir; return (j >= 0 && j < N) ? j : -1; }
  function next() {
    if (step < total(slides[cur])) go(cur, step + 1);
    else { var j = nextIndex(cur, 1); if (j >= 0) go(j, 0); }
  }
  function prev() {
    if (step > 0) go(cur, step - 1);
    else { var j = nextIndex(cur, -1); if (j >= 0) go(j, 'end'); }
  }
  function toggleShort() {
    shortMode = !shortMode;
    document.body.classList.toggle('short-mode', shortMode);
    say(shortMode ? 'Short mode: ' + core().length + ' of ' + N + ' slides (optional ones skipped)' : 'Full mode: all ' + N + ' slides');
    go(cur, step, true);
  }

  /* ---------- scaling ---------- */
  function fit() {
    var vw = viewport.clientWidth, vh = viewport.clientHeight;
    if (panel && panel.classList.contains('open')) vh = Math.max(200, vh - panel.offsetHeight); // keep the slide visible above the notes
    var sc = Math.min(vw / W, vh / H);
    stage.style.transform = 'translate(' + ((vw - W * sc) / 2) + 'px,' + ((vh - H * sc) / 2) + 'px) scale(' + sc + ')';
  }
  window.addEventListener('resize', fit);

  /* ---------- theme ---------- */
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function toggleTheme() { document.documentElement.setAttribute('data-theme', isDark() ? 'light' : 'dark'); syncPopupTheme(); }

  /* ---------- toast ---------- */
  var toast = document.createElement('div'); toast.id = 'toast'; document.body.appendChild(toast);
  var toastT = null;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('show'); }, 2200); }

  /* ---------- fullscreen ---------- */
  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); return; }
      var r = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
      if (r && r.catch) r.catch(function () { say('Fullscreen was refused by the browser'); });
      else if (!r) say('Fullscreen is not available here');
    } catch (e) { say('Fullscreen is not available here'); }
  }

  /* ---------- overview (O) ---------- */
  var ov = null;
  function buildOverview() {
    ov = document.createElement('div'); ov.id = 'overview';
    ov.innerHTML = '<h1>All slides — click to jump · O or Esc to close</h1><div class="grid"></div>';
    var grid = ov.querySelector('.grid');
    slides.forEach(function (s, i) {
      var th = document.createElement('div'); th.className = 'th' + (s.hasAttribute('data-optional') ? ' opt' : ''); th.dataset.i = i;
      var clip = document.createElement('div'); clip.className = 'clip';
      var c = s.cloneNode(true);
      c.classList.add('active'); c.removeAttribute('id');
      Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (e) { e.removeAttribute('id'); });
      Array.prototype.forEach.call(c.querySelectorAll('.anim'), function (a) {
        if (!a.querySelector('.an-fit')) { a.innerHTML = '<div class="anim-ph">▶ ' + (a.dataset.anim || '') + '</div>'; }
      });
      clip.appendChild(c); th.appendChild(clip);
      var cap = document.createElement('div'); cap.className = 'cap';
      cap.innerHTML = '<b>' + (i + 1) + '</b><span></span>'; cap.lastChild.textContent = s._title;
      th.appendChild(cap);
      th.addEventListener('click', function () { closeOverview(); go(i, 0); });
      grid.appendChild(th);
    });
    document.body.appendChild(ov);
    window.addEventListener('resize', scaleThumbs);
  }
  function scaleThumbs() {
    if (!ov || !ov.classList.contains('open')) return;
    Array.prototype.forEach.call(ov.querySelectorAll('.clip'), function (clip) {
      var sc = clip.clientWidth / W;
      clip.firstChild.style.transform = 'scale(' + sc + ')';
    });
  }
  function openOverview() {
    // mount every animation once so the thumbnails show something
    if (!ov) { slides.forEach(function (s) { mountAnims(s); if (s !== slides[cur]) apply(s, total(s)); }); apply(slides[cur], step); buildOverview(); }
    ov.classList.add('open');
    Array.prototype.forEach.call(ov.querySelectorAll('.th'), function (t) { t.classList.toggle('cur', +t.dataset.i === cur); });
    scaleThumbs();
    var c = ov.querySelector('.th.cur'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' });
  }
  function closeOverview() { if (ov) ov.classList.remove('open'); }
  function overviewOpen() { return ov && ov.classList.contains('open'); }

  /* ---------- notes (N): in-page panel + optional separate window ---------- */
  var panel = document.createElement('div'); panel.id = 'notes-panel';
  panel.innerHTML = '<div class="np-head"><b></b><span class="np-next"></span><button type="button">Open in a separate window ↗</button></div><div class="np-body"></div>';
  document.body.appendChild(panel);
  var popup = null, t0 = Date.now();
  panel.querySelector('button').addEventListener('click', openPopup);
  function notesHTML(i) { return slides[i]._notes || '<p><i>(no notes)</i></p>'; }
  function updateNotes() {
    var s = slides[cur];
    panel.querySelector('.np-head b').textContent = (cur + 1) + ' / ' + N + ' — ' + s._title + (s.hasAttribute('data-optional') ? ' (optional)' : '');
    panel.querySelector('.np-next').textContent = slides[cur + 1] ? 'next: ' + slides[cur + 1]._title : 'last slide';
    panel.querySelector('.np-body').innerHTML = notesHTML(cur);
    if (popup && !popup.closed) {
      try {
        var d = popup.document;
        d.getElementById('t').textContent = (cur + 1) + ' / ' + N + ' — ' + s._title;
        d.getElementById('st').textContent = 'step ' + step + ' / ' + total(s) + (s._section ? ' · ' + s._section : '');
        d.getElementById('nx').textContent = slides[cur + 1] ? 'Next: ' + slides[cur + 1]._title : 'Last slide';
        d.getElementById('n').innerHTML = notesHTML(cur);
      } catch (e) { popup = null; }
    }
  }
  function toggleNotes() { panel.classList.toggle('open'); updateNotes(); fit(); }
  function syncPopupTheme() {
    if (!popup || popup.closed) return;
    try { popup.document.documentElement.setAttribute('data-dark', isDark() ? '1' : '0'); } catch (e) {}
  }
  function openPopup() {
    try { popup = window.open('', 'nlp-notes', 'width=960,height=720'); } catch (e) { popup = null; }
    if (!popup) { say('Popup blocked — notes stay in the panel'); return; }
    var d = popup.document;
    d.open();
    d.write('<!doctype html><html><head><meta charset="utf-8"><title>Speaker notes</title><style>' +
      'body{font:20px/1.5 "Source Sans 3",system-ui,sans-serif;margin:0;padding:18px 26px;background:#fffdf9;color:#2a2621}' +
      'html[data-dark="1"] body{background:#1c1a17;color:#eee7dc}' +
      '#t{font:600 30px "Barlow Condensed",sans-serif;margin:0}#st,#nx{color:#8a8070;font-size:16px}' +
      '#clock{float:right;font:600 28px monospace;color:#b8894a}#n{margin-top:14px;font-size:22px}' +
      '.k{color:#8a8070;font-size:14px;margin-top:20px}</style></head><body>' +
      '<div id="clock">00:00</div><h1 id="t"></h1><div id="st"></div><div id="nx"></div><div id="n"></div>' +
      '<div class="k">Keys here also drive the deck: → / Space next, ← previous. R resets the timer.</div></body></html>');
    d.close();
    syncPopupTheme();
    d.addEventListener('keydown', function (e) {
      if (e.key === 'r' || e.key === 'R') { t0 = Date.now(); return; }
      onKey(e);
    });
    var tick = setInterval(function () {
      if (!popup || popup.closed) { clearInterval(tick); return; }
      var sec = Math.floor((Date.now() - t0) / 1000);
      try { popup.document.getElementById('clock').textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); } catch (e) { clearInterval(tick); }
    }, 1000);
    updateNotes();
  }

  /* ---------- keyboard ---------- */
  function onKey(e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (overviewOpen()) {
      if (k === 'Escape' || k === 'o' || k === 'O') { closeOverview(); e.preventDefault(); }
      return;
    }
    switch (k) {
      case 'ArrowRight': case 'PageDown': case 'ArrowDown': next(); break;
      case ' ': case 'Spacebar': if (e.shiftKey) prev(); else next(); break;
      case 'ArrowLeft': case 'PageUp': case 'ArrowUp': prev(); break;
      case 'Home': go(skipped(0) ? nextIndex(0, 1) : 0, 0); break;
      case 'End': go(skipped(N - 1) ? nextIndex(N - 1, -1) : N - 1, 'end'); break;
      case 's': case 'S': toggleShort(); break;
      case 'o': case 'O': openOverview(); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'd': case 'D': toggleTheme(); break;
      case 'Escape': if (panel.classList.contains('open')) { panel.classList.remove('open'); fit(); } else return; break;
      default: return;
    }
    e.preventDefault();
  }
  document.addEventListener('keydown', onKey);

  /* ---------- touch ---------- */
  var tx = null, ty = null;
  viewport.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; } }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) next(); else prev(); }
  }, { passive: true });

  /* ---------- hash ---------- */
  function fromHash() {
    var m = /^#(\d+)$/.exec(location.hash || '');
    return m ? Math.max(0, Math.min(N - 1, parseInt(m[1], 10) - 1)) : null;
  }
  window.addEventListener('hashchange', function () { var i = fromHash(); if (i !== null && i !== cur) go(i, 0, true); });

  /* ---------- math + code rendering ---------- */
  function renderExtras() {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(deckEl, {
          delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }],
          throwOnError: false, ignoredClasses: ['notes']
        });
      } catch (e) { console.warn('deck: KaTeX render failed', e); }
    }
    if (window.hljs) {
      Array.prototype.forEach.call(deckEl.querySelectorAll('pre.code code[class*="language-"]'), function (c) {
        try { window.hljs.highlightElement(c); } catch (e) { /* ignore */ }
      });
    }
  }

  /* ---------- start ---------- */
  fit();
  var start = fromHash();
  slides.forEach(function (s) { s.classList.remove('active'); });
  cur = start === null ? 0 : start;
  go(cur, 0, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  // small API for testing / the notes window
  window.Deck = {
    next: next, prev: prev, go: go,
    get index() { return cur; }, get step() { return step; },
    count: N, total: function (i) { return total(slides[i === undefined ? cur : i]); },
    slides: slides, toggleTheme: toggleTheme, toggleShort: toggleShort, get shortMode() { return shortMode; }, openOverview: openOverview, closeOverview: closeOverview, toggleNotes: toggleNotes
  };
})();
