/* present.js — presentation mode for the deck (load after deck.js).
 * A "Present" button (top-right, shows when the mouse moves) or the P key:
 *   - asks the browser for full screen (falls back to an in-page presentation mode if refused),
 *   - black letterbox around the slide, hidden cursor and button after 2 s without mouse movement,
 *   - click on the right two thirds of the screen = next, left third = previous.
 * Leaves with P, Esc, or the button. */
(function () {
  'use strict';
  var root = document.documentElement, body = document.body;
  var btn = document.createElement('button');
  btn.id = 'present-btn'; btn.type = 'button';
  btn.setAttribute('aria-label', 'Start presentation mode (P)');
  btn.innerHTML = '<span aria-hidden="true">▶</span> Present';
  body.appendChild(btn);
  var toast = document.getElementById('toast');
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }
  function presenting() { return body.classList.contains('presenting'); }
  function label() {
    btn.innerHTML = presenting() ? '<span aria-hidden="true">✕</span> Exit' : '<span aria-hidden="true">▶</span> Present';
    btn.setAttribute('aria-label', presenting() ? 'Exit presentation mode (P)' : 'Start presentation mode (P)');
  }
  function fit() { window.dispatchEvent(new Event('resize')); }
  function enter() {
    body.classList.add('presenting'); label(); fit(); wake();
    var ok = false;
    try {
      var r = root.requestFullscreen ? root.requestFullscreen() : (root.webkitRequestFullscreen ? root.webkitRequestFullscreen() : null);
      if (r && r.then) { r.then(fit).catch(function () { say('Full screen is blocked in this view: presentation mode is on in the window (open the deck in its own tab for full screen)'); }); ok = true; }
      else if (root.webkitRequestFullscreen) ok = true;
    } catch (e) { ok = false; }
    if (!ok) say('Full screen is not available here: presentation mode is on in the window');
  }
  function leave() {
    body.classList.remove('presenting', 'idle'); label();
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {}); } catch (e) {}
    fit();
  }
  function toggle() { if (presenting()) leave(); else enter(); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); btn.blur(); });
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && presenting()) leave(); fit(); });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'p' || e.key === 'P') { toggle(); e.preventDefault(); }
    else if (e.key === 'Escape' && presenting() && !document.fullscreenElement) leave();
  });
  // show the button (and cursor) when the mouse moves, hide after 2 s
  var idleT = null;
  function wake() {
    body.classList.add('pointer-active'); body.classList.remove('idle');
    clearTimeout(idleT);
    idleT = setTimeout(function () { body.classList.remove('pointer-active'); if (presenting()) body.classList.add('idle'); }, 2000);
  }
  document.addEventListener('mousemove', wake, { passive: true });
  btn.addEventListener('focus', function () { body.classList.add('pointer-active'); });
  // click to advance while presenting
  var vp = document.getElementById('viewport');
  if (vp) vp.addEventListener('click', function (e) {
    if (!presenting() || !window.Deck) return;
    if (e.target.closest && e.target.closest('a, button, #overview, #notes-panel')) return;
    if (e.clientX < window.innerWidth / 3) window.Deck.prev(); else window.Deck.next();
  });
  label();
})();
