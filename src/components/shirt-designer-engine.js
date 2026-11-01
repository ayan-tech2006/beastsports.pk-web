// "Design your own shirt": the admin's white shirt photos, recoloured live, with the customer's designs
// on top (upload, ready-made designs, name/number), front and back.
// mountShirtDesigner() returns a cleanup function that stops everything and removes what it added.

const NS = 'http://www.w3.org/2000/svg';
const W = 400, H = 480;   // preview frame (the admin's print areas are % of this)
const FONTS = [['Bold', 'Anton, Impact, sans-serif', 400], ['Script', 'Pacifico, cursive', 400], ['Clean', 'Inter, Arial, sans-serif', 800]];
const INKS = ['#ffffff', '#111111', '#c8102e', '#d4a72c', '#1d2742'];

export function mountShirtDesigner(root, config, hooks) {
  const off = new AbortController();
  const on = { signal: off.signal };
  let cancelled = false;
  const svg = root.querySelector('.sc-svg');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const STYLES = config.styles, COLORS = config.colors.map(c => [c.name, c.hex]), SIZES = config.sizes;
  const PRINT_PRICE = config.printPrice;

  const S = { style: 0, side: 'front', color: COLORS[0][1], cname: COLORS[0][0], size: SIZES.includes('M') ? 'M' : SIZES[0], qty: 1, font: 0, ink: '#111111', inkSet: false, els: [], sel: null };
  const style = () => STYLES[S.style];
  const photo = (side = S.side, st = style()) => (side === 'back' && st.back) || st.front;
  // The print area of a side, in frame units.
  function printRect(side = S.side, st = style()) {
    const a = side === 'back' ? st.printBack : st.printFront;
    return { x: a.x / 100 * W, y: a.y / 100 * H, w: a.w / 100 * W, h: a.h / 100 * H };
  }
  const centerX = () => { const pr = printRect(); return pr.x + pr.w / 2; };

  // Recolour: the shirt photo is white, so "multiply" with the colour keeps its folds and shading.
  svg.innerHTML = `
  <defs>
    <filter id="scTint" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">
      <feFlood class="sc-flood" flood-color="#ffffff" result="ink"/>
      <feComposite in="ink" in2="SourceAlpha" operator="in" result="tint"/>
      <feBlend in="tint" in2="SourceGraphic" mode="multiply" result="shirt"/>
      <feDropShadow in="shirt" dx="0" dy="10" stdDeviation="10" flood-opacity=".18"/>
    </filter>
    <clipPath id="scPClip"><rect class="sc-pclip"/></clipPath>
  </defs>
  <g class="sc-flip">
    <image class="sc-shirt" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet" filter="url(#scTint)"/>
    <g class="sc-layers" clip-path="url(#scPClip)"></g>
    <g class="sc-ui">
      <rect class="sc-parea" pointer-events="none" fill="none" stroke="#8a8a8a" stroke-width="1" stroke-dasharray="5 4" rx="4"/>
      <text class="sc-ptext" pointer-events="none" text-anchor="middle" font-size="11" font-family="Inter, sans-serif" font-weight="600" fill="#8a8a8a">YOUR DESIGN HERE</text>
      <line class="sc-guide" pointer-events="none" stroke="#e0262f" stroke-width="1" stroke-dasharray="4 3" opacity="0"/>
      <g class="sc-sel" style="display:none">
        <rect class="sc-selr" pointer-events="none" fill="none" stroke="#2a7fff"/>
        <g class="sc-h-rot"><circle r="1" fill="#2a7fff" stroke="#fff" stroke-width=".14"/><path d="M-.42 .08A.42 .42 0 1 0 -.12 -.4" fill="none" stroke="#fff" stroke-width=".14" stroke-linecap="round"/><path d="M-.36 -.62L-.08 -.42L-.32 -.18" fill="none" stroke="#fff" stroke-width=".14" stroke-linecap="round" stroke-linejoin="round"/></g>
        <g class="sc-h-del"><circle r="1" fill="#111" stroke="#fff" stroke-width=".14"/><path d="M-.32 -.32L.32 .32M.32 -.32L-.32 .32" stroke="#fff" stroke-width=".15" stroke-linecap="round"/></g>
      </g>
    </g>
  </g>`;
  const layers = svg.querySelector('.sc-layers');
  const shirtImg = svg.querySelector('.sc-shirt');

  function drawShirt() {
    shirtImg.setAttribute('href', photo());
    const pr = printRect();
    ['.sc-pclip', '.sc-parea'].forEach(s => { const r = svg.querySelector(s); r.setAttribute('x', pr.x); r.setAttribute('y', pr.y); r.setAttribute('width', pr.w); r.setAttribute('height', pr.h); });
    const pt = svg.querySelector('.sc-ptext'); pt.setAttribute('x', pr.x + pr.w / 2); pt.setAttribute('y', pr.y + pr.h * .5);
    const gd = svg.querySelector('.sc-guide'); gd.setAttribute('x1', pr.x + pr.w / 2); gd.setAttribute('x2', pr.x + pr.w / 2); gd.setAttribute('y1', pr.y - 6); gd.setAttribute('y2', pr.y + pr.h + 6);
  }

  // ===== Rang =====
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hex = a => '#' + a.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const isDark = h => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) < 140; };
  let colTimer = 0;
  const paintColor = h => svg.querySelector('.sc-flood').setAttribute('flood-color', h);
  function setColor(h, name) {
    const from = rgb(S.color), to = rgb(h), t0 = performance.now();
    S.color = h; S.cname = name;
    $('.sc-cname').textContent = name;
    $$('.sc-sw').forEach(b => b.classList.toggle('is-on', b.dataset.c === h || (b.classList.contains('sc-custom') && !COLORS.some(c => c[1] === h))));
    if (!S.inkSet) { S.ink = inkFor(); markText(); }   // text ka rang khud shirt ke hisaab se
    cancelAnimationFrame(colTimer);
    (function step(now) {
      if (cancelled) return;
      const u = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - u, 3);
      paintColor(hex(from.map((v, i) => v + (to[i] - v) * e)));
      if (u < 1) colTimer = requestAnimationFrame(step);
    })(t0);
    paintPresets();
  }

  // ===== Ready-made designs (khud bane SVG, rang shirt ke hisaab se) =====
  const star = (cx, cy, R, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, m = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + m * Math.cos(a)).toFixed(1) + ' ' + (cy + m * Math.sin(a)).toFixed(1); } return d + 'Z'; };
  const AB = 'font-family="Arial Black, Impact, sans-serif" font-weight="900"';
  const PRESETS = {
    bats: (ink, acc) => [200, 200, `<g fill="${ink}"><g transform="rotate(-32 100 104)"><rect x="94" y="14" width="12" height="46" rx="6"/><path d="M86 60h28l-3 112q-11 9-22 0z"/></g><g transform="rotate(32 100 104)"><rect x="94" y="14" width="12" height="46" rx="6"/><path d="M86 60h28l-3 112q-11 9-22 0z"/></g></g><circle cx="100" cy="170" r="18" fill="${acc}"/><path d="M84 166q16 -7 32 0M84 173q16 -7 32 0" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2.5 2.5"/>`],
    beast: (ink, acc) => [240, 140, `<text x="120" y="78" text-anchor="middle" ${AB} font-size="64" textLength="214" lengthAdjust="spacingAndGlyphs" fill="${ink}">BEAST</text><path d="M40 92h170l-9 24H31z" fill="${acc}"/><text x="120" y="109" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="15" letter-spacing="7" fill="#fff">MODE ON</text>`],
    club: (ink, acc) => [200, 200, `<circle cx="100" cy="100" r="92" fill="none" stroke="${ink}" stroke-width="6"/><circle cx="100" cy="100" r="62" fill="none" stroke="${ink}" stroke-width="2"/><defs><path id="t" d="M28 100a72 72 0 0 1 144 0"/><path id="b" d="M20 100a80 80 0 0 0 160 0"/></defs><text font-family="Arial, sans-serif" font-weight="800" font-size="16" letter-spacing="4" fill="${ink}"><textPath href="#t" startOffset="50%" text-anchor="middle">CRICKET CLUB</textPath></text><text font-family="Arial, sans-serif" font-weight="800" font-size="14" letter-spacing="5" fill="${ink}"><textPath href="#b" startOffset="50%" text-anchor="middle">EST · 2026</textPath></text><path d="${star(100, 100, 34, 14)}" fill="${acc}"/>`],
    number: (ink, acc) => [200, 200, `<text x="100" y="128" text-anchor="middle" ${AB} font-size="132" fill="${acc}" stroke="${ink}" stroke-width="5" paint-order="stroke" textLength="176" lengthAdjust="spacingAndGlyphs">07</text><text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="20" letter-spacing="8" fill="${ink}">CAPTAIN</text>`],
    howzat: (ink, acc) => [220, 150, `<path d="M110 6l16 26 30-14-2 32 34 4-24 22 26 22-34 6 6 32-32-14-20 26-14-30-32 12 4-34-34-8 26-22-22-26 34-2-6-32 32 14z" fill="${acc}"/><text x="110" y="86" text-anchor="middle" ${AB} font-size="30" fill="#fff" stroke="${ink}" stroke-width="3" paint-order="stroke" transform="rotate(-8 110 80)">HOWZAT!</text>`],
    speed: (ink, acc) => [240, 120, `<path d="M58 14h84l-44 92H14z" fill="${acc}"/><path d="M150 14h40l-44 92h-40z" fill="${ink}"/><path d="M198 14h26l-44 92h-26z" fill="${ink}" opacity=".55"/>`],
  };
  const inkFor = () => isDark(S.color) ? '#ffffff' : '#111111';
  const accFor = () => { const [r, g, b] = rgb(S.color); return r > 70 && r > g * 1.8 && r > b * 1.8 ? '#d4a72c' : '#c8102e'; };   // laal/maroon shirt pe gold
  const presetSrc = k => { const [w, h, body] = PRESETS[k](inkFor(), accFor()); return [w, h, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`)]; };
  function paintPresets() {
    $$('.sc-pre').forEach(b => { b.style.background = S.color; b.firstChild.src = presetSrc(b.dataset.k)[2]; });
  }

  // ===== Design layers: add, dikhana, select =====
  let uid = 0;
  function addEl(o) {
    const pr = printRect();
    const e = Object.assign({ id: ++uid, side: S.side, x: pr.x + pr.w / 2, y: pr.y + pr.h * .34, s: 1, r: 0 }, o);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'sc-el'); g.dataset.id = e.id; g._e = e; e.node = g;
    g.appendChild(document.createElementNS(NS, e.kind === 'img' ? 'image' : 'text'));
    layers.appendChild(g);
    S.els.push(e);
    paintEl(e); select(e); refresh();
    pop(e);
    return e;
  }
  function paintEl(e) {
    const c = e.node.firstChild;
    if (e.kind === 'img') {
      c.setAttribute('href', e.src); c.setAttribute('preserveAspectRatio', 'none');
      c.setAttribute('x', -e.w / 2); c.setAttribute('y', -e.h / 2); c.setAttribute('width', e.w); c.setAttribute('height', e.h);
    } else {
      c.textContent = e.text;
      c.setAttribute('text-anchor', 'middle'); c.setAttribute('dominant-baseline', 'central');
      c.setAttribute('font-family', FONTS[e.font][1]); c.setAttribute('font-weight', FONTS[e.font][2]);
      c.setAttribute('font-size', 40); c.setAttribute('fill', e.ink);
    }
    place(e);
  }
  function place(e) {
    e.node.setAttribute('transform', `translate(${e.x.toFixed(2)} ${e.y.toFixed(2)}) rotate(${e.r.toFixed(2)}) scale(${e.s.toFixed(4)})`);
    e.node.style.display = e.side === S.side ? '' : 'none';
  }
  function pop(e) {   // naya design halka sa "pop" ho kar aaye
    const s1 = e.s, t0 = performance.now();
    (function step(now) {
      if (cancelled) return;
      const u = Math.min(1, (now - t0) / 380), b = 1 + Math.sin(u * Math.PI) * .12 * (1 - u);
      e.s = s1 * (u < 1 ? (0.6 + 0.4 * (1 - Math.pow(1 - u, 3))) * b : 1);
      place(e); drawSel();
      if (u < 1) requestAnimationFrame(step); else { e.s = s1; place(e); drawSel(); }
    })(t0);
  }
  const box = e => e.kind === 'img' ? { x: -e.w / 2, y: -e.h / 2, width: e.w, height: e.h } : e.node.firstChild.getBBox();
  const pxk = () => W / (svg.getBoundingClientRect().width || W);   // 1 screen pixel = kitne SVG units

  function select(e) {
    S.sel = e;
    const tools = $('.sc-tools');
    tools.classList.toggle('is-on', !!e);
    if (e) {
      tools.querySelector('[data-act="bg"]').hidden = !(e.kind === 'img' && e.user);
      tools.querySelector('[data-act="bg"]').textContent = e.src !== e.orig ? 'Restore bg' : 'Remove white bg';
      if (e.kind === 'text') { $('.sc-tin').value = e.text; S.font = e.font; S.ink = e.ink; markText(); }
    }
    drawSel(); refresh();
  }
  function drawSel() {
    const e = S.sel, sel = svg.querySelector('.sc-sel');
    if (!sel) return;
    if (!e || e.side !== S.side) { sel.style.display = 'none'; return; }
    sel.style.display = '';
    const b = box(e), k = pxk(), pad = 6 * k, r = 11 * k;
    const x0 = b.x * e.s - pad, y0 = b.y * e.s - pad, w = b.width * e.s + pad * 2, h = b.height * e.s + pad * 2;
    sel.setAttribute('transform', `translate(${e.x} ${e.y}) rotate(${e.r})`);
    const rr = sel.querySelector('.sc-selr');
    rr.setAttribute('x', x0); rr.setAttribute('y', y0); rr.setAttribute('width', w); rr.setAttribute('height', h); rr.setAttribute('stroke-width', 1.5 * k);
    sel.querySelector('.sc-h-rot').setAttribute('transform', `translate(${x0 + w} ${y0 + h}) scale(${r})`);
    sel.querySelector('.sc-h-del').setAttribute('transform', `translate(${x0 + w} ${y0}) scale(${r})`);
  }
  function removeEl(e) {
    if (!e) return;
    e.node.remove();
    S.els = S.els.filter(x => x !== e);
    if (S.sel === e) select(null);
    refresh();
  }
  function clampEl(e) {
    const pr = printRect(e.side);
    e.x = Math.max(pr.x, Math.min(pr.x + pr.w, e.x));
    e.y = Math.max(pr.y, Math.min(pr.y + pr.h, e.y));
    place(e);
  }

  // ===== Price aur hint =====
  const fmt = n => 'Rs ' + n.toLocaleString('en-US');
  const sidesUsed = () => ['front', 'back'].filter(s => S.els.some(e => e.side === s)).length;
  const unit = () => style().price + PRINT_PRICE * sidesUsed();
  function refresh() {
    const n = sidesUsed(), t = style();
    $('.sc-total').textContent = fmt(unit() * S.qty);
    $('.sc-break').textContent = `${t.label} ${fmt(t.price)}` + (n ? ` + print ${n} side${n > 1 ? 's' : ''} ${fmt(PRINT_PRICE * n)}` : '') + (S.qty > 1 ? ` · × ${S.qty}` : '');
    const has = S.els.some(e => e.side === S.side);
    svg.querySelector('.sc-parea').style.opacity = (dragging || S.sel) ? .9 : has ? 0 : .7;
    svg.querySelector('.sc-ptext').style.opacity = has ? 0 : 1;
    $('.sc-hint').textContent = !has ? 'Upload your design or tap a ready-made one'
      : S.sel ? 'Drag to move · pull the blue handle to resize & rotate' : 'Tap your design to edit it';
  }

  // ===== Drag, resize, rotate (mouse + touch) =====
  let dragging = null;
  const toSvg = ev => new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
  const guide = svg.querySelector('.sc-guide');
  svg.addEventListener('pointerdown', ev => {
    if (flipping) return;
    const t = ev.target, p = toSvg(ev);
    if (t.closest('.sc-h-del')) { removeEl(S.sel); return; }
    if (t.closest('.sc-h-rot')) {
      const e = S.sel;
      dragging = { mode: 'rot', e, s0: e.s, r0: e.r, a0: Math.atan2(p.y - e.y, p.x - e.x), d0: Math.hypot(p.x - e.x, p.y - e.y) || 1 };
    } else {
      const g = t.closest('.sc-el');
      if (!g) { select(null); return; }
      select(g._e);
      dragging = { mode: 'move', e: g._e, px: p.x, py: p.y, x0: g._e.x, y0: g._e.y };
    }
    try { svg.setPointerCapture(ev.pointerId); } catch { /* synthetic pointers */ }
    ev.preventDefault();
    refresh();
  }, on);
  svg.addEventListener('pointermove', ev => {
    if (!dragging) return;
    const p = toSvg(ev), D = dragging, e = D.e, k = pxk();
    if (D.mode === 'move') {
      const pr = printRect(), cx = centerX();
      e.x = Math.max(pr.x, Math.min(pr.x + pr.w, D.x0 + p.x - D.px));
      e.y = Math.max(pr.y, Math.min(pr.y + pr.h, D.y0 + p.y - D.py));
      const snap = Math.abs(e.x - cx) < 6 * k;    // beech mein aaye to chipak jaye
      if (snap) e.x = cx;
      guide.setAttribute('opacity', snap ? 1 : 0);
    } else {
      e.s = Math.max(.15, Math.min(5, D.s0 * Math.hypot(p.x - e.x, p.y - e.y) / D.d0));
      let r = D.r0 + (Math.atan2(p.y - e.y, p.x - e.x) - D.a0) * 180 / Math.PI;
      const near = Math.round(r / 90) * 90;
      if (Math.abs(r - near) < 4) r = near;       // seedha (0/90°) pe chipak jaye
      e.r = r;
    }
    place(e); drawSel();
  }, on);
  function endDrag() { if (!dragging) return; dragging = null; guide.setAttribute('opacity', 0); refresh(); }
  svg.addEventListener('pointerup', endDrag, on);
  svg.addEventListener('pointercancel', endDrag, on);
  document.addEventListener('keydown', ev => {
    if (!S.sel || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); removeEl(S.sel); }
  }, on);

  // ===== Style badalna (photo crossfade) + Front/Back flip =====
  let flipping = false;
  function setStyle(i) {
    if (i === S.style) return;
    S.style = i;
    $$('.sc-type').forEach(b => b.classList.toggle('is-on', +b.dataset.i === i));
    drawShirt();
    S.els.forEach(clampEl); drawSel();
    shirtImg.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 380, easing: 'ease-out' });
    refresh();
  }
  function setSide(side) {
    if (side === S.side || flipping) return;
    flipping = true;
    select(null);
    $$('.sc-sides button').forEach(b => b.classList.toggle('is-on', b.dataset.side === side));
    const fl = svg.querySelector('.sc-flip'), t0 = performance.now(), cx = W / 2;
    let swapped = false;
    (function step(now) {
      if (cancelled) return;
      const u = Math.min(1, (now - t0) / 420), sx = Math.max(.02, Math.abs(Math.cos(u * Math.PI)));
      if (!swapped && u >= .5) {
        swapped = true; S.side = side;
        drawShirt(); S.els.forEach(place); refresh();
      }
      fl.setAttribute('transform', `translate(${cx} 0) scale(${sx.toFixed(3)} 1) translate(${-cx} 0)`);
      if (u < 1) requestAnimationFrame(step); else { fl.removeAttribute('transform'); flipping = false; }
    })(t0);
  }

  // ===== Upload + white background hatana =====
  const loadImg = (src, cors) => new Promise((res, rej) => { const i = new Image(); if (cors) i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const readURL = f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  async function addFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    let src = await readURL(file);
    const im = await loadImg(src);
    if (cancelled) return;
    let w = im.naturalWidth || 400, h = im.naturalHeight || 400;
    if (Math.max(w, h) > 1400 && !/svg/.test(file.type)) {          // bari photo choti kar do (fast rahe)
      const k = 1400 / Math.max(w, h), c = mk(Math.round(w * k), Math.round(h * k));
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      src = c.toDataURL('image/png'); w = c.width; h = c.height;
    }
    const pr = printRect(), f = Math.min(pr.w * .78 / w, pr.h * .55 / h);
    addEl({ kind: 'img', src, orig: src, w: w * f, h: h * f, user: true });
  }
  async function stripWhite(src) {    // kinaron se judi safed jagah transparent (andar ka safed design bacha rahe)
    const im = await loadImg(src), w = im.naturalWidth, h = im.naturalHeight;
    const c = mk(w, h), x = c.getContext('2d');
    x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, w, h), p = d.data, seen = new Uint8Array(w * h), q = new Int32Array(w * h);
    let qh = 0, qt = 0;
    const white = i => p[i * 4 + 3] > 0 && p[i * 4] > 222 && p[i * 4 + 1] > 222 && p[i * 4 + 2] > 222;
    const push = i => { if (!seen[i] && white(i)) { seen[i] = 1; q[qt++] = i; } };
    for (let X = 0; X < w; X++) { push(X); push((h - 1) * w + X); }
    for (let Y = 0; Y < h; Y++) { push(Y * w); push(Y * w + w - 1); }
    while (qh < qt) {
      const i = q[qh++], X = i % w;
      p[i * 4 + 3] = 0;
      if (X > 0) push(i - 1); if (X < w - 1) push(i + 1); if (i >= w) push(i - w); if (i < w * (h - 1)) push(i + w);
    }
    for (let i = 0; i < w * h; i++) {               // kinare naram
      if (seen[i]) continue;
      const X = i % w;
      if ((X > 0 && seen[i - 1]) || (X < w - 1 && seen[i + 1]) || (i >= w && seen[i - w]) || (i < w * (h - 1) && seen[i + w])) {
        const m = Math.min(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]);
        if (m > 160) p[i * 4 + 3] = Math.min(p[i * 4 + 3], Math.round((255 - m) / 95 * 255));
      }
    }
    x.putImageData(d, 0, 0);
    return c.toDataURL('image/png');
  }

  // ===== Final full-shirt picture (download + order), drawn on a canvas at 2× =====
  async function exportPNG(side) {
    if (document.fonts) await document.fonts.ready;
    const K = 2, c = mk(W * K, H * K), x = c.getContext('2d');
    x.fillStyle = '#f2f2f0'; x.fillRect(0, 0, c.width, c.height);
    const im = await loadImg(photo(side), true);
    const s = Math.min(c.width / im.naturalWidth, c.height / im.naturalHeight);
    const dw = im.naturalWidth * s, dh = im.naturalHeight * s, dx = (c.width - dw) / 2, dy = (c.height - dh) / 2;
    const tint = mk(c.width, c.height), t = tint.getContext('2d');     // white photo × colour, keeping its shape
    t.drawImage(im, dx, dy, dw, dh);
    t.globalCompositeOperation = 'multiply'; t.fillStyle = S.color; t.fillRect(0, 0, c.width, c.height);
    t.globalCompositeOperation = 'destination-in'; t.drawImage(im, dx, dy, dw, dh);
    x.save(); x.shadowColor = 'rgba(0,0,0,.18)'; x.shadowBlur = 20 * K; x.shadowOffsetY = 10 * K; x.drawImage(tint, 0, 0); x.restore();
    const pr = printRect(side);
    x.save(); x.scale(K, K);
    x.beginPath(); x.rect(pr.x, pr.y, pr.w, pr.h); x.clip();
    for (const e of S.els.filter(el => el.side === side)) {
      x.save(); x.translate(e.x, e.y); x.rotate(e.r * Math.PI / 180); x.scale(e.s, e.s);
      if (e.kind === 'img') {
        const di = await loadImg(e.src, !e.src.startsWith('data:'));
        x.drawImage(di, -e.w / 2, -e.h / 2, e.w, e.h);
      } else {
        x.font = `${FONTS[e.font][2]} 40px ${FONTS[e.font][1]}`; x.fillStyle = e.ink; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(e.text, 0, 0);
      }
      x.restore();
    }
    x.restore();
    return c;
  }
  const toBlob = c => new Promise(res => c.toBlob(res, 'image/png'));

  // ===== Panel buttons banana + events =====
  $('.sc-types').innerHTML = STYLES.map((t, i) =>
    `<button type="button" class="sc-type${i === S.style ? ' is-on' : ''}" data-i="${i}"><img src="${t.front}" alt=""><span></span><small>${fmt(t.price)}</small></button>`).join('');
  $$('.sc-type span').forEach((n, i) => { n.textContent = STYLES[i].label; });
  $('.sc-colors').innerHTML = COLORS.map(([n, c]) => `<button type="button" class="sc-sw" data-c="${c}" style="background:${c}"></button>`).join('')
    + `<label class="sc-sw sc-custom" title="Custom color"><input type="color" value="#ff6a00" aria-label="Custom color"></label>`;
  $$('.sc-sw[data-c]').forEach((b, i) => { b.title = COLORS[i][0]; b.setAttribute('aria-label', COLORS[i][0]); });
  $('.sc-presets').innerHTML = Object.keys(PRESETS).map(k => `<button type="button" class="sc-pre" data-k="${k}" aria-label="Add ${k} design"><img alt=""></button>`).join('');
  $('.sc-fonts').innerHTML = FONTS.map((f, i) => `<button type="button" class="sc-font" data-f="${i}" style="font-family:${f[1]};font-weight:${f[2]}">${f[0]}</button>`).join('');
  $('.sc-inks').innerHTML = INKS.map(c => `<button type="button" class="sc-ink" data-ink="${c}" aria-label="Text colour ${c}" style="background:${c}"></button>`).join('');
  $('.sc-sizes').innerHTML = SIZES.map(() => `<button type="button" class="sc-size"></button>`).join('');
  $$('.sc-size').forEach((b, i) => { b.textContent = SIZES[i]; b.classList.toggle('is-on', SIZES[i] === S.size); });
  const NOTE = `Printing ${fmt(PRINT_PRICE)} per side with a design. Front and back both printable.`;
  $('.sc-note').textContent = NOTE;

  function markText() {
    $$('.sc-font').forEach(b => b.classList.toggle('is-on', +b.dataset.f === S.font));
    $$('.sc-ink').forEach(b => b.classList.toggle('is-on', b.dataset.ink === S.ink));
  }
  const selText = () => S.sel && S.sel.kind === 'text' ? S.sel : null;

  $('.sc-types').addEventListener('click', ev => { const b = ev.target.closest('.sc-type'); if (b) setStyle(+b.dataset.i); }, on);
  $('.sc-colors').addEventListener('click', ev => { const b = ev.target.closest('.sc-sw[data-c]'); if (b) setColor(b.dataset.c, b.title); }, on);
  $('.sc-custom input').addEventListener('input', ev => setColor(ev.target.value, 'Custom'), on);
  $('.sc-sides').addEventListener('click', ev => { const b = ev.target.closest('button'); if (b) setSide(b.dataset.side); }, on);
  $('.sc-presets').addEventListener('click', ev => {
    const b = ev.target.closest('.sc-pre'); if (!b) return;
    const [w, h, src] = presetSrc(b.dataset.k), pr = printRect(), f = Math.min(pr.w * .7 / w, pr.h * .5 / h);
    addEl({ kind: 'img', src, orig: src, w: w * f, h: h * f });
  }, on);
  $('.sc-upload input').addEventListener('change', ev => { addFile(ev.target.files[0]); ev.target.value = ''; }, on);
  const stage = $('.sc-stage');
  stage.addEventListener('dragover', ev => { ev.preventDefault(); stage.classList.add('is-drop'); }, on);
  stage.addEventListener('dragleave', () => stage.classList.remove('is-drop'), on);
  stage.addEventListener('drop', ev => { ev.preventDefault(); stage.classList.remove('is-drop'); addFile(ev.dataTransfer.files[0]); }, on);

  $('.sc-tadd').addEventListener('click', () => {
    const v = $('.sc-tin').value.trim() || 'YOUR NAME';
    addEl({ kind: 'text', text: v, font: S.font, ink: S.ink });
  }, on);
  $('.sc-tin').addEventListener('keydown', ev => { if (ev.key === 'Enter') $('.sc-tadd').click(); }, on);
  $('.sc-tin').addEventListener('input', ev => { const e = selText(); if (e) { e.text = ev.target.value || ' '; paintEl(e); drawSel(); } }, on);
  $('.sc-fonts').addEventListener('click', ev => {
    const b = ev.target.closest('.sc-font'); if (!b) return;
    S.font = +b.dataset.f; markText();
    const e = selText(); if (e) { e.font = S.font; paintEl(e); drawSel(); }
  }, on);
  $('.sc-inks').addEventListener('click', ev => {
    const b = ev.target.closest('.sc-ink'); if (!b) return;
    S.ink = b.dataset.ink; S.inkSet = true; markText();
    const e = selText(); if (e) { e.ink = S.ink; paintEl(e); }
  }, on);
  $('.sc-tools').addEventListener('click', async ev => {
    const b = ev.target.closest('button'), e = S.sel; if (!b || !e) return;
    const a = b.dataset.act;
    if (a === 'del') removeEl(e);
    if (a === 'center') { const pr = printRect(); e.x = pr.x + pr.w / 2; e.y = pr.y + pr.h * .34; place(e); drawSel(); }
    if (a === 'front') { S.els = S.els.filter(x => x !== e).concat(e); layers.appendChild(e.node); }
    if (a === 'bg') {
      b.textContent = 'Working…';
      if (e.src === e.orig) { e.clean = e.clean || await stripWhite(e.orig); e.src = e.clean; } else e.src = e.orig;
      if (cancelled) return;
      paintEl(e); select(e);
    }
  }, on);
  $('.sc-sizes').addEventListener('click', ev => {
    const b = ev.target.closest('.sc-size'); if (!b) return;
    S.size = b.textContent; $$('.sc-size').forEach(x => x.classList.toggle('is-on', x === b));
  }, on);
  $('.sc-qty').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    S.qty = Math.max(1, Math.min(99, S.qty + +b.dataset.q));
    $('.sc-qty span').textContent = S.qty; refresh();
  }, on);
  $('.sc-dl').addEventListener('click', async () => {
    try {
      const a = document.createElement('a');
      a.href = (await exportPNG(S.side)).toDataURL('image/png'); a.download = `my-shirt-${S.side}.png`; a.click();
    } catch (err) { $('.sc-hint').textContent = 'Preview download is not supported in this browser'; }
  }, on);

  // Add to cart: hooks.onAdd gets the full design (final pictures as PNG blobs); it returns an error message or nothing.
  let noteTimer = 0, busy = false;
  const showNote = (text) => {
    $('.sc-note').textContent = text;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { $('.sc-note').textContent = NOTE; }, 7000);
  };
  $('.sc-cart').addEventListener('click', async ev => {
    if (busy) return;
    if (!S.els.length) { showNote('Add a design, a name or a number first.'); return; }
    busy = true;
    const btn = ev.currentTarget, st = style();
    btn.textContent = 'Saving your design…';
    let message;
    try {
      const front = await toBlob(await exportPNG('front'));
      const back = await toBlob(await exportPNG('back'));
      if (cancelled) return;
      message = await hooks.onAdd({
        style: st.label, color: S.color, colorName: S.cname, size: S.size, qty: S.qty,
        unitPrice: unit(), printedSides: sidesUsed(),
        designs: S.els.map(e => ({ side: e.side, kind: e.kind, src: e.kind === 'img' ? e.src : undefined, text: e.text, font: e.kind === 'text' ? FONTS[e.font][0] : undefined, color: e.kind === 'text' ? e.ink : undefined, x: Math.round(e.x), y: Math.round(e.y), scale: +e.s.toFixed(3), rotate: Math.round(e.r) })),
        preview: { front, back },
      });
    } catch (err) {
      message = 'We could not save your design. Check your internet and try again.';
    }
    busy = false;
    if (cancelled) return;
    if (message) { btn.textContent = 'Add to cart'; showNote(message); return; }
    btn.textContent = 'Added ✓';
    setTimeout(() => { if (!cancelled) btn.textContent = 'Add to cart'; }, 1500);
  }, on);

  addEventListener('resize', drawSel, on);
  if (document.fonts) document.fonts.ready.then(() => { if (!cancelled) drawSel(); });

  // shuru
  drawShirt();
  paintColor(S.color);
  $('.sc-cname').textContent = S.cname;
  $$('.sc-sw[data-c]')[0].classList.add('is-on');
  paintPresets(); markText(); refresh();

  return () => {
    cancelled = true;
    off.abort();
    cancelAnimationFrame(colTimer);
    clearTimeout(noteTimer);
    svg.innerHTML = '';
    ['.sc-types', '.sc-colors', '.sc-presets', '.sc-fonts', '.sc-inks', '.sc-sizes'].forEach(s => { $(s).innerHTML = ''; });
  };
}
