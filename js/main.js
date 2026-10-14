/* AMO Research and Development: in-page navigation and the hero figure. */
/* In-page links: scroll inside the page rather than navigating. */
(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();

/* Hero figure: one origin, n paths. Ranks are split into ever smaller groups; each line
   travels with its group, so thick shared trunks thin out into single paths. */
(function () {
  var svg = document.getElementById('fan');
  if (!svg || !svg.createSVGPoint) return;

  var NS = 'http://www.w3.org/2000/svg';
  var W = 1000, H = 560, PAD = 18, X0 = 14, X1 = 984, LEVELS = 7, RHO = 0.8;
  var PERIOD = 9000, TRAVEL = 6800, FADE = 500;
  var PHASE = [1800, 4000, 6200];   /* stagger between the three moving dots, in ms */
  var REST = [0.3, 0.56, 0.8];      /* where the dots sit when motion is turned off */
  var countEl = document.getElementById('fan-count');
  var redo = document.getElementById('fan-redo');
  var small = window.matchMedia('(max-width: 40rem)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var seed = (Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0;
  var runners = [], raf = 0, visible = true, t0 = 0;

  function mulberry32(a) {
    return function () {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function f(v) { return Math.round(v * 10) / 10; }
  function dot(x, y) { return 'M' + f(x) + ' ' + f(y) + 'h.01'; }
  function el(cls, d) {
    var n = document.createElementNS(NS, 'path');
    n.setAttribute('class', cls);
    n.setAttribute('d', d);
    return n;
  }
  function toPath(p) {
    var d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
    for (var i = 1; i < p.length; i++) {
      var a = p[i - 1], b = p[i], mx = f((a[0] + b[0]) / 2);
      d += 'C' + mx + ' ' + f(a[1]) + ' ' + mx + ' ' + f(b[1]) + ' ' + f(b[0]) + ' ' + f(b[1]);
    }
    return d;
  }

  function draw() {
    var rand = mulberry32(seed);
    var n = small.matches ? 96 : 160;
    var pitch = (H - 2 * PAD) / (n - 1);
    var denom = 1 - Math.pow(RHO, LEVELS + 1);
    function xAt(d) { return X0 + (X1 - X0) * (1 - Math.pow(RHO, d)) / denom; }
    function yEnd(r) { return PAD + r * pitch; }

    var pts = [], r;
    for (r = 0; r < n; r++) pts.push([[X0, H / 2]]);

    (function place(lo, hi, depth, x) {
      var size = hi - lo, i;
      if (depth > 0) {
        var centre = (yEnd(lo) + yEnd(hi - 1)) / 2;
        var tight = Math.pow(depth / (LEVELS + 1), 1.6);
        for (i = lo; i < hi; i++) pts[i].push([x, centre + (i - (lo + hi - 1) / 2) * pitch * tight]);
      }
      if (size < 2 || depth >= LEVELS) return;
      var cut = lo + Math.max(1, Math.min(size - 1, Math.round(size * (0.36 + 0.28 * rand()))));
      var next = xAt(depth + 1), span = next - xAt(depth);
      place(lo, cut, depth + 1, next + (rand() - 0.5) * 0.3 * span);
      place(cut, hi, depth + 1, next + (rand() - 0.5) * 0.3 * span);
    })(0, n, 0, X0);

    var frag = document.createDocumentFragment();
    for (r = 0; r < n; r++) {
      pts[r].push([X1, yEnd(r)]);
      frag.appendChild(el('fan__line', toPath(pts[r])));
    }
    frag.appendChild(el('fan__origin', dot(X0, H / 2)));

    runners = [];
    [0.10, 0.42, 0.74].forEach(function (base, i) {
      var k = i + 1;
      var rank = Math.min(n - 1, Math.floor(n * (base + 0.16 * rand())));
      var hl = el('fan__hl fan__hl--' + k, toPath(pts[rank]));
      var end = dot(X1, yEnd(rank));
      frag.appendChild(hl);
      frag.appendChild(el('fan__halo', end));
      frag.appendChild(el('fan__end fan__end--' + k, end));
      frag.appendChild(el('fan__core', end));
      runners.push({ path: hl, halo: el('fan__halo', dot(X0, H / 2)), dot: el('fan__run fan__run--' + k, dot(X0, H / 2)), len: 0 });
    });
    runners.forEach(function (rn) { frag.appendChild(rn.halo); frag.appendChild(rn.dot); });

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.appendChild(frag);
    runners.forEach(function (rn) { rn.len = rn.path.getTotalLength(); });
    if (countEl) countEl.textContent = n;
    pose(t0 ? performance.now() - t0 : 0);
  }

  function pose(elapsed) {
    for (var i = 0; i < runners.length; i++) {
      var rn = runners[i], e = REST[i], o = 1;
      if (!still.matches) {
        var t = (elapsed + PHASE[i]) % PERIOD;
        var p = Math.min(1, t / TRAVEL);
        e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        o = Math.max(0, Math.min(1, t / FADE, (PERIOD - t) / FADE));
      }
      var pt = rn.path.getPointAtLength(e * rn.len);
      var d = dot(pt.x, pt.y);
      rn.halo.setAttribute('d', d);
      rn.dot.setAttribute('d', d);
      rn.halo.style.opacity = o;
      rn.dot.style.opacity = o;
    }
  }
  function tick(now) {
    if (!t0) t0 = now;
    pose(now - t0);
    raf = requestAnimationFrame(tick);
  }
  function play() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (still.matches || !visible) return;
    raf = requestAnimationFrame(tick);
  }
  function onChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
  }

  if (redo) redo.addEventListener('click', function () {
    seed = (seed + 0x9E3779B9) >>> 0;
    draw();
  });
  onChange(small, draw);
  onChange(still, function () { pose(0); play(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[entries.length - 1].isIntersecting;
      play();
    }).observe(svg);
  }

  draw();
  play();
})();
