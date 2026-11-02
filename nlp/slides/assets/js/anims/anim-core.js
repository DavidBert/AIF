/* anim-core.js — shared helpers for the NLP deck animation components.
 * Load this BEFORE any anim-<name>.js file (and load anims.css).
 *
 * Every component registers:
 *   window.Anims[name] = { steps, labels, size:[W,H], mount(container, opts) -> {setStep(i), destroy(), steps} }
 * Each component draws on a fixed "design canvas" (W x H logical px) that is
 * scaled to fit its container (contain + centered), so layouts are pixel-exact
 * and scale cleanly. Colours come exclusively from CSS custom properties.
 *
 * Common opts (all components):
 *   step      initial step (default 0)
 *   autoplay  loop through steps automatically (ignored with prefers-reduced-motion)
 *   interval  autoplay delay in ms (default 2600)
 *   caption   false to hide the built-in caption line under the animation
 *   crop      [y0, y1]: show only this vertical band of the design canvas (drops empty space)
 */
(function () {
  'use strict';
  var K = (window.AnimKit = window.AnimKit || {});
  window.Anims = window.Anims || {};
  var SVGNS = 'http://www.w3.org/2000/svg';
  var uidN = 0;

  K.uid = function (p) { return (p || 'an') + '-' + (++uidN); };
  K.reduced = function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  K.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  function applyAttrs(el, attrs, isSvg) {
    if (!attrs) return el;
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v === undefined || v === null) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') {
        for (var s in v) { if (s.indexOf('--') === 0) el.style.setProperty(s, v[s]); else el.style[s] = v[s]; }
      } else if (k === 'class') el.setAttribute('class', v);
      else el.setAttribute(k, v);
    }
    return el;
  }
  /** HTML element */
  K.h = function (tag, attrs, parent) {
    var el = applyAttrs(document.createElement(tag), attrs, false);
    if (parent) parent.appendChild(el);
    return el;
  };
  /** SVG element */
  K.s = function (tag, attrs, parent) {
    var el = applyAttrs(document.createElementNS(SVGNS, tag), attrs, true);
    if (parent) parent.appendChild(el);
    return el;
  };

  /** absolutely positioned div */
  K.box = function (parent, x, y, w, h, cls, text) {
    var el = K.h('div', { class: 'an-abs ' + (cls || '') }, parent);
    K.pos(el, x, y, w, h);
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  };
  K.pos = function (el, x, y, w, h) {
    if (x !== undefined && x !== null) el.style.left = x + 'px';
    if (y !== undefined && y !== null) el.style.top = y + 'px';
    if (w !== undefined && w !== null) el.style.width = w + 'px';
    if (h !== undefined && h !== null) el.style.height = h + 'px';
    return el;
  };
  /** A label pinned at (x,y). anchor: c (center), l (left-middle), r (right-middle),
   *  t (top-center), b (bottom-center), tl (top-left) */
  K.label = function (parent, x, y, html, cls, anchor) {
    var pin = K.h('div', { class: 'an-pin an-a-' + (anchor || 'c') }, parent);
    K.pos(pin, x, y);
    var inner = K.h('div', { class: 'an-pin-in ' + (cls || ''), html: html }, pin);
    pin.inner = inner;
    return pin;
  };
  K.vis = function (el, on) { if (el) el.classList.toggle('an-off', !on); return el; };
  K.cls = function (el, c, on) { if (el) el.classList.toggle(c, !!on); return el; };
  K.mw = function (str, px) { return String(str).length * px * 0.6; }; // monospace width

  /** tint helper: mix a CSS var colour into the surface. pct in [0,100] */
  K.tint = function (cssVar, pct) {
    pct = Math.round(K.clamp(pct, 0, 100));
    return 'color-mix(in srgb, var(' + cssVar + ') ' + pct + '%, var(--surface))';
  };
  /** diverging colour: positive -> posVar, negative -> negVar, |v|<=1 */
  K.div = function (v, posVar, negVar) {
    var a = K.clamp(Math.abs(v), 0, 1);
    return K.tint(v >= 0 ? (posVar || '--accent') : (negVar || '--accent-2'), 8 + 82 * a);
  };

  /** Seeded pseudo-random numbers (deterministic visuals) */
  K.rng = function (seed) {
    var s = 0;
    seed = String(seed);
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    s = s || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return (s % 100000) / 100000;
    };
  };
  K.randVec = function (seed, n) {
    var r = K.rng(seed), v = [];
    for (var i = 0; i < n; i++) v.push(r() * 2 - 1);
    return v;
  };
  K.softmax = function (xs, T) {
    T = T || 1;
    var m = Math.max.apply(null, xs), e = xs.map(function (x) { return Math.exp((x - m) / T); });
    var z = e.reduce(function (a, b) { return a + b; }, 0);
    return e.map(function (x) { return x / z; });
  };
  K.fmt = function (v, d) { return (d === undefined ? v.toFixed(2) : v.toFixed(d)); };

  /** Vector strip of coloured cells. opts: {cell, gap, color (css var) | diverging:true, vertical, max} */
  K.vec = function (parent, x, y, values, o) {
    o = o || {};
    var cell = o.cell || 22, gap = o.gap === undefined ? 3 : o.gap;
    var n = values.length;
    var w = o.vertical ? cell : n * cell + (n - 1) * gap;
    var h = o.vertical ? n * cell + (n - 1) * gap : cell;
    var wrap = K.box(parent, x, y, w, h, 'an-vec ' + (o.cls || ''));
    wrap.cells = [];
    for (var i = 0; i < n; i++) {
      var c = K.h('div', { class: 'an-vcell' }, wrap);
      c.style.width = cell + 'px'; c.style.height = cell + 'px';
      c.style.left = (o.vertical ? 0 : i * (cell + gap)) + 'px';
      c.style.top = (o.vertical ? i * (cell + gap) : 0) + 'px';
      wrap.cells.push(c);
    }
    wrap.set = function (vals, color) {
      for (var i = 0; i < wrap.cells.length; i++) {
        var v = vals[i];
        wrap.cells[i].style.background = color
          ? K.tint(color, 12 + 80 * Math.min(1, Math.abs(v)))
          : K.div(v, o.pos, o.neg);
      }
    };
    wrap.set(values, o.color);
    wrap.w = w; wrap.h = h;
    return wrap;
  };

  /** Arrow marker (cached per svg + colour var) */
  K.marker = function (svg, colorVar, size) {
    svg._markers = svg._markers || {};
    var key = colorVar + '|' + (size || 12);
    if (svg._markers[key]) return svg._markers[key];
    var defs = svg.querySelector('defs') || K.s('defs', null, svg);
    var id = K.uid('mk');
    var sz = size || 12;
    var m = K.s('marker', {
      id: id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: sz, markerHeight: sz,
      markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse'
    }, defs);
    K.s('path', { d: 'M0,0.5 L10,5 L0,9.5 L2.5,5 z', style: 'fill:var(' + colorVar + ')' }, m);
    svg._markers[key] = 'url(#' + id + ')';
    return svg._markers[key];
  };
  /** Path with draw-on animation. Use K.draw(path, on). */
  K.path = function (svg, d, o) {
    o = o || {};
    var color = o.color || '--fg';
    var p = K.s('path', {
      d: d, pathLength: o.dashed ? null : 1,
      class: 'an-path ' + (o.cls || ''),
      style: 'fill:none;stroke:var(' + color + ');stroke-width:' + (o.width || 2.5) + ';stroke-linecap:round;stroke-linejoin:round;' +
        (o.dashed ? 'stroke-dasharray:' + o.dashed + ';' : 'stroke-dasharray:1;stroke-dashoffset:0;') + (o.style || '')
    }, svg);
    if (o.arrow) p.setAttribute('marker-end', K.marker(svg, color, o.arrowSize));
    if (o.arrowStart) p.setAttribute('marker-start', K.marker(svg, color, o.arrowSize));
    p._dashed = !!o.dashed;
    return p;
  };
  K.draw = function (p, on) {
    if (!p) return;
    if (!p._dashed) p.style.strokeDashoffset = on ? '0' : '1';
    p.style.opacity = on ? (p._op || 1) : 0;
  };
  K.line = function (x1, y1, x2, y2) { return 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2; };
  /** cubic curve from (x1,y1) to (x2,y2) with vertical tangents */
  K.vcurve = function (x1, y1, x2, y2, k) {
    var dy = (y2 - y1) * (k === undefined ? 0.5 : k);
    return 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + (y1 + dy) + ' ' + x2 + ',' + (y2 - dy) + ' ' + x2 + ',' + y2;
  };
  K.hcurve = function (x1, y1, x2, y2, k) {
    var dx = (x2 - x1) * (k === undefined ? 0.5 : k);
    return 'M' + x1 + ',' + y1 + ' C' + (x1 + dx) + ',' + y1 + ' ' + (x2 - dx) + ',' + y2 + ' ' + x2 + ',' + y2;
  };

  /** Fit a W x H design canvas into the container */
  K.stage = function (container, W, H) {
    container.classList.add('an-host');
    var fitEl = K.h('div', { class: 'an-fit' }, container);
    var root = K.h('div', { class: 'an-stage' }, fitEl);
    root.style.width = W + 'px';
    root.style.height = H + 'px';
    var svg = K.s('svg', { class: 'an-svg', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H }, root);
    var st = { root: root, svg: svg, W: W, H: H, fitEl: fitEl };
    st.fit = function () {
      var cw = fitEl.clientWidth, ch = fitEl.clientHeight;
      if (!cw) return;
      // optional vertical crop of the design canvas (opts.crop = [y0, y1]) to drop empty bands
      var y0 = st.crop ? st.crop[0] : 0, VH = st.crop ? st.crop[1] - st.crop[0] : H;
      if (ch < 20) { fitEl.style.height = Math.round(cw * VH / W) + 'px'; ch = fitEl.clientHeight; }
      var s = Math.min(cw / W, ch / VH);
      root.style.transform = 'translate(' + ((cw - W * s) / 2) + 'px,' + ((ch - VH * s) / 2 - y0 * s) + 'px) scale(' + s + ')';
    };
    /** an extra SVG layer on top of everything created so far */
    st.layer = function () {
      return K.s('svg', { class: 'an-svg', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H }, root);
    };
    var ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(st.fit); ro.observe(fitEl); }
    else window.addEventListener('resize', st.fit);
    st.fit();
    st.destroy = function () {
      if (ro) ro.disconnect(); else window.removeEventListener('resize', st.fit);
      if (fitEl.parentNode) fitEl.parentNode.removeChild(fitEl);
      container.classList.remove('an-host');
    };
    return st;
  };

  /**
   * Register a component.
   * def = { steps, size:[W,H], labels:[...], captions:[...], build(st, opts) -> update(step) | {update, destroy} }
   */
  K.register = function (name, def) {
    window.Anims[name] = {
      steps: def.steps,
      labels: def.labels || [],
      size: def.size,
      mount: function (container, opts) {
        opts = opts || {};
        var W = def.size[0], H = def.size[1];
        var st = K.stage(container, W, H);
        st.opts = opts;
        if (opts.crop && opts.crop.length === 2) st.crop = opts.crop;
        st.root.classList.add('an-instant');
        if (K.reduced()) st.root.classList.add('an-reduced');
        var cap = null;
        var caps = (typeof def.captions === 'function') ? def.captions(opts) : def.captions;
        if (opts.caption !== false && caps) cap = K.h('div', { class: 'an-cap' }, st.root);
        var built = def.build(st, opts);
        var update = typeof built === 'function' ? built : built.update;
        var n = def.steps, cur = -1, timer = null, alive = true;
        function setStep(i) {
          if (!alive) return;
          i = K.clamp(Math.round(+i || 0), 0, n - 1);
          cur = i;
          st.fit();
          update(i);
          if (cap) cap.innerHTML = '<span>' + (caps[i] || '') + '</span>';
        }
        setStep(opts.step || 0);
        // enable transitions after the first paint
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          if (!K.reduced()) st.root.classList.remove('an-instant');
        }); });
        if (opts.autoplay && !K.reduced()) {
          timer = setInterval(function () { setStep((cur + 1) % n); }, opts.interval || 2600);
        }
        return {
          steps: n,
          setStep: setStep,
          getStep: function () { return cur; },
          destroy: function () {
            alive = false;
            if (timer) clearInterval(timer);
            if (built && built.destroy) built.destroy();
            st.destroy();
          }
        };
      }
    };
  };
})();
