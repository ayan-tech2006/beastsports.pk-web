// 3D bat rack: bats stand in a wooden rack, tilt as you drag, and open into a 3D viewer you can
// spin and knock. Kept close to the original hand-written version; BatRack.tsx feeds it products.
// mountBatRack() returns a cleanup function that stops everything and removes what it added.

export function mountBatRack(root, items, hooks) {
  const off = new AbortController();
  const on = { signal: off.signal };
  let cancelled = false;
  let raf = 0;
  let hintTimer = 0, cartTimer = 0;
  let renderer = null, ac = null;
  const blobUrls = [];

  const stage = root.querySelector('.br-stage');
  const spot = root.querySelector('.br-spot');
  const info = root.querySelector('.br-info');
  const thumb = root.querySelector('.br-progress span');
  const detail = root.querySelector('.br-detail');
  const vwrap = detail.querySelector('.br-vwrap');
  const vhint = detail.querySelector('.br-vhint');
  const chips = [...detail.querySelectorAll('.br-views button')];
  const sizesRow = detail.querySelector('.br-sizes');
  const sizesLabel = detail.querySelector('.br-label');
  const cart = detail.querySelector('.br-cart');
  const shop = detail.querySelector('.br-shop');
  const isTouch = matchMedia('(hover: none)').matches;
  const HINT = isTouch ? 'Tap a bat · drag to browse' : 'Hover a bat · click to pick it up';
  const VHINT = 'Drag to spin · tap the blade to knock';
  const EASE = 'cubic-bezier(.22,.8,.2,1)';
  const RACK_FACE = 'back';   // rack mein kaunsi side dikhe: 'back' = BEAST design wali | 'front' = hitting face (plain lakdi)
  const REST = RACK_FACE === 'back' ? 180 : 0;
  const SWEET = { high: .56, mid: .66, low: .76 };  // sweet spot bat ki height ka kitna % neeche
  const EDGE_STICKER = true;  // edge pe bat ke rang ki sticker patti

  // Physics settings (rack mein bat ka hilna)
  const INERTIA = 0.035, AIR = 0.0008, SPRING = 0.03, DAMP = 0.07, MAX_TILT = 7;

  const showHint = () => {
    const s = document.createElement('span');
    s.className = 'br-hint';
    s.textContent = HINT;
    info.replaceChildren(s);
  };

  // One rack slot per product (items come from the admin's "Bat rack" settings).
  const base = items.map((item, i) => {
    const b = document.createElement('div');
    b.className = 'br-bat';
    b._item = item;
    b.dataset.index = String(i);
    stage.appendChild(b);
    return b;
  });
  const N0 = base.length;
  stage.classList.add('is-loading');

  // ===== 1. Photo tayyari: crop + analyse + textures =====
  const PH = 1000;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const load = src => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
  function alphaBox(im) {
    const w = im.naturalWidth, h = im.naturalHeight, x = mk(w, h).getContext('2d');
    x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, w, h).data;
    let l = w, r = -1, t = h, b = -1;
    for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
      if (d[(y * w + i) * 4 + 3] > 24) { if (i < l) l = i; if (i > r) r = i; if (y < t) t = y; if (y > b) b = y; }
    }
    return r < 0 ? { x: 0, y: 0, w, h } : { x: l, y: t, w: r - l + 1, h: b - t + 1 };
  }
  function fit(im, box, W, H) {
    const c = mk(W, H), s = Math.min(H / box.h, W / box.w), dw = box.w * s, dh = box.h * s;
    c.getContext('2d').drawImage(im, box.x, box.y, box.w, box.h, (W - dw) / 2, H - dh, dw, dh);
    return c;
  }
  function analyse(fc) {
    const w = fc.width, h = fc.height, d = fc.getContext('2d').getImageData(0, 0, w, h).data;
    const rows = []; let maxW = 1, top = -1, bot = -1;
    for (let y = 0; y < h; y++) {
      let l = -1, r = -1;
      for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 100) { if (l < 0) l = i; r = i; }
      rows.push([l, r]);
      if (l >= 0) { if (top < 0) top = y; bot = y; maxW = Math.max(maxW, r - l + 1); }
    }
    for (let y = 0; y < h; y++) if (rows[y][0] < 0) rows[y] = rows[Math.min(Math.max(y, top), bot)]; // khaali rows bhar do
    let y0 = rows.findIndex(([l, r], y) => y >= top && r - l + 1 > maxW * 0.45);
    if (y0 < 0) y0 = top;
    // bat ka main rang (sticker ka sab se zyada rang)
    const bins = Array.from({ length: 12 }, () => [0, 0, 0, 0]);
    for (let y = y0; y <= bot; y += 3) for (let i = rows[y][0]; i <= rows[y][1]; i += 3) {
      const k = (y * w + i) * 4, R = d[k], G = d[k + 1], B = d[k + 2];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), s = mx ? (mx - mn) / mx : 0;
      if (s < 0.35 || mx < 60) continue;
      let hue = mx === R ? (G - B) / (mx - mn) : mx === G ? 2 + (B - R) / (mx - mn) : 4 + (R - G) / (mx - mn);
      const bi = Math.floor(((hue * 60 + 360) % 360) / 30), bn = bins[bi];
      bn[0] += R * s; bn[1] += G * s; bn[2] += B * s; bn[3] += s;
    }
    const best = bins.reduce((a, b) => (b[3] > a[3] ? b : a));
    const dom = best[3] ? `rgb(${(best[0] / best[3]) | 0},${(best[1] / best[3]) | 0},${(best[2] / best[3]) | 0})` : '#c62828';
    return { w, h, rows, top, bot, y0, maxW, dom };
  }
  function prof(A) {                                     // bat ki motai ka profile (curved spine)
    const { y0, bot, maxW } = A, L = Math.max(1, bot - y0);
    const THIN = 0.28, BULGE = 0.13;                    // THIN = shoulder/toe ki motai, BULGE = beech mein kitna zyada
    const spine = y => {
      const u = Math.min(1, Math.max(0, (y - y0) / L));
      return (u < 0.62 ? THIN + BULGE * Math.sin(u / 0.62 * Math.PI / 2) : THIN + BULGE - BULGE * Math.pow((u - 0.62) / 0.38, 1.4)) * maxW;
    };
    return { spine, edge: y => spine(y) * 0.62 };       // edge = kinaron ki motai
  }
  // willow lakdi ki texture (grain lambai ki taraf)
  function wood(W, H, seed) {
    const c = mk(W, H), x = c.getContext('2d');
    let s = seed || 7; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const g = x.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#d9b98a'); g.addColorStop(0.5, '#ecd5ab'); g.addColorStop(1, '#d6b483');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < W * 0.6; i++) {
      const px = rnd() * W, a = 0.05 + rnd() * 0.16;
      x.strokeStyle = `rgba(${120 + rnd() * 40 | 0},${78 + rnd() * 30 | 0},${38 + rnd() * 20 | 0},${a})`;
      x.lineWidth = 0.5 + rnd() * 1.6;
      x.beginPath(); x.moveTo(px, 0);
      for (let y = 0; y <= H; y += 40) x.lineTo(px + Math.sin(y * 0.006 + i) * 2.2, y);
      x.stroke();
    }
    return c;
  }
  function woodFace(fc, A) {     // plain lakdi wali side (jab us side ki photo na ho)
    const { w, h, y0, bot, dom } = A, L = bot - y0;
    const c = mk(w, h), x = c.getContext('2d');
    x.drawImage(fc, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.drawImage(wood(w, h, 11), 0, 0);
    x.globalCompositeOperation = 'source-over';
    x.drawImage(fc, 0, 0, w, y0, 0, 0, w, y0);           // handle (grip) wahi rahe
    x.globalCompositeOperation = 'source-atop';
    const g = x.createLinearGradient(0, 0, w, 0);         // spine ki roshni
    g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(0.5, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
    x.fillStyle = g; x.fillRect(0, y0, w, h - y0);
    const yS = y0 + L * 0.1, cx = w / 2;                  // back sticker (chevron)
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, yS - 4); x.lineTo(w, yS - 4); x.lineTo(w, yS + L * 0.05); x.lineTo(cx, yS + L * 0.11); x.lineTo(0, yS + L * 0.05); x.fill();
    x.fillStyle = dom; x.beginPath(); x.moveTo(0, yS); x.lineTo(w, yS); x.lineTo(w, yS + L * 0.04); x.lineTo(cx, yS + L * 0.095); x.lineTo(0, yS + L * 0.04); x.fill();
    x.fillStyle = '#151515';                              // toe binding
    x.fillRect(0, bot - L * 0.09, w, L * 0.012); x.fillRect(0, bot - L * 0.07, w, L * 0.012); x.fillRect(0, bot - L * 0.028, w, L * 0.03);
    return c;
  }
  function sideTex(A, style, color, img, toe) {
    const { h, y0, bot } = A, L = bot - y0, k = 1024 / h;
    if (img) {                                            // asli edge photo: shoulder se toe tak khench kar lagao
      const c = mk(128, 1024), x = c.getContext('2d');
      x.fillStyle = color || '#f2ece2'; x.fillRect(0, 0, 128, 1024);
      const woodToe = toe === 'wood';                     // toe 'wood' = neeche kala toe guard nahi
      const top = (y0 + L * 0.012) * k, end = woodToe ? bot * k : (bot - L * 0.035) * k;
      x.drawImage(img, 0, top, 128, end - top);
      x.fillStyle = '#121212';
      if (!woodToe) x.fillRect(0, end, 128, 1024 - end);  // toe guard
      x.fillRect(0, (y0 - 2) * k, 128, top - (y0 - 2) * k + 1);   // shoulder patti
      return c;
    }
    if (style === 'holes') {                              // safed edge, beech mein gol surakh (Spido jaisa)
      const { edge } = prof(A);
      const c = mk(128, 1024), x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 128, 0);
      g.addColorStop(0, '#d8d1c3'); g.addColorStop(0.5, color || '#f4efe6'); g.addColorStop(1, '#d6cebf');
      x.fillStyle = g; x.fillRect(0, 0, 128, 1024);
      x.fillStyle = '#1a1414'; x.fillRect(0, 0, 8, 1024); x.fillRect(120, 0, 8, 1024);   // dono taraf sticker ki patli lakeer
      const n = 22, HOLE = 0.32;                          // kitne surakh, aur size (edge ki motai ka kitna hissa)
      for (let i = 0; i < n; i++) {
        const y = y0 + L * (0.06 + 0.86 * i / (n - 1));
        const rx = 64 * HOLE, ry = HOLE / 2 * edge(y) * k; // motai ke hisaab se taa ke surakh gol dikhe
        x.fillStyle = '#2b2420'; x.beginPath(); x.ellipse(64, y * k, rx, ry, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.ellipse(64, y * k + ry * 0.25, rx * 0.8, ry * 0.7, 0, 0, Math.PI * 2); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; x.beginPath(); x.ellipse(64, y * k, rx + 1, ry + 1, 0, 0.2, Math.PI - 0.2); x.stroke();
      }
      x.fillStyle = '#121212';
      x.fillRect(0, (bot - L * 0.035) * k, 128, L * 0.04 * k + 4);   // toe guard
      x.fillRect(0, (y0 - 2) * k, 128, L * 0.012 * k + 2);           // shoulder patti
      return c;
    }
    const dom = A.dom, c = wood(128, 1024, 23), x = c.getContext('2d');   // default: lakdi wala edge
    if (EDGE_STICKER) {
      x.fillStyle = '#f4f4f4'; x.fillRect(10, (y0 + L * 0.14) * k - 3, 108, L * 0.38 * k + 6);
      x.fillStyle = color || dom; x.fillRect(10, (y0 + L * 0.14) * k, 108, L * 0.38 * k);
      x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(10, (y0 + L * 0.3) * k, 108, 3);
    }
    if (toe !== 'wood') {                                 // hardball bats have a plain wooden toe
      x.fillStyle = '#151515';
      x.fillRect(0, (bot - L * 0.09) * k, 128, L * 0.012 * k); x.fillRect(0, (bot - L * 0.07) * k, 128, L * 0.012 * k);
      x.fillRect(0, (bot - L * 0.028) * k, 128, L * 0.03 * k + 4);
    }
    return c;
  }
  const url = c => new Promise(res => c.toBlob(b => { const u = URL.createObjectURL(b); blobUrls.push(u); res(u); }, 'image/png'));

  let R = 0.16;
  let THREE = null, scene, cam, holder;

  // Everything below needs the photos (and three.js) first.
  (async () => {
    try {
      const loaded = await Promise.all(base.map(async b => {
        const d = b._item;
        const [fi, bi] = await Promise.all([d.front ? load(d.front) : null, d.back ? load(d.back) : null]);
        return { fi, bi, fbox: fi && alphaBox(fi), bbox: bi && alphaBox(bi) };
      }));
      if (cancelled) return;
      R = Math.max(...loaded.map(o => { const bx = o.bbox || o.fbox; return bx.w / bx.h; })) * 1.08;
      const FW = Math.round(PH * R);
      await Promise.all(base.map(async (b, i) => {
        const o = loaded[i];
        const mainC = o.bi ? fit(o.bi, o.bbox, FW, PH) : fit(o.fi, o.fbox, FW, PH);   // bat ki shape isi se
        const A = analyse(mainC);
        const fc = woodFace(mainC, A);                       // FRONT: plain lakdi, upar photo ho to wo
        if (o.fi) fc.getContext('2d').drawImage(fit(o.fi, o.fbox, FW, PH), 0, 0);
        const bPlain = o.bi ? mainC : woodFace(mainC, A);    // BACK: BEAST photo ya lakdi
        const bc = woodFace(mainC, A);                       // 3D mein peeche se dekhte hain, is liye mirror
        const x = bc.getContext('2d');
        x.save(); x.translate(FW, 0); x.scale(-1, 1); x.drawImage(bPlain, 0, 0); x.restore();
        Object.assign(b, { _fc: fc, _bc: bc, _A: A });
        b._img = { front: await url(fc), back: await url(bPlain) };
      }));
    } catch (err) {
      // photo load na ho (ya CORS allow na ho) to seedhi photo
      base.forEach(b => { const d = b._item; b._img = { front: d.front || d.back, back: d.back || d.front }; });
    }
    if (cancelled) return;
    root.style.setProperty('--R', R.toFixed(4));
    stage.classList.remove('is-loading');

    base.forEach((b, i) => {
      const d = b._item, I = b._img;
      b.style.setProperty('--rest', REST + 'deg');
      b.style.setProperty('--tagY', (i % 3) * 14 + 'px');
      b.innerHTML = `<div class="br-lift"><span class="br-tag"></span>
        <div class="br-3d"><div class="br-obj">
          <img class="br-front" alt="" draggable="false">
          <img class="br-back" alt="" draggable="false">
        </div></div></div>`;
      b.querySelector('.br-tag').textContent = d.price;
      const f = b.querySelector('.br-front'); f.src = I.front; f.alt = d.name;
      b.querySelector('.br-back').src = I.back;
    });
    showHint();

    // ===== 2. 3D bat (three.js): motai, curved spine, edges =====
    try {
      THREE = await import('three');
      if (cancelled) return;
      const glc = document.createElement('canvas');
      glc.className = 'br-gl';
      vwrap.appendChild(glc);
      renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(22, 1, 0.1, 20);
      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const key = new THREE.DirectionalLight(0xfff3e2, 2.2); key.position.set(1.6, 2, 3); scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.9); fill.position.set(-2.5, 0.5, 2); scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffd8a0, 1.6); rim.position.set(-2, 1.5, -3); scene.add(rim);
      holder = new THREE.Group(); scene.add(holder);
    } catch (err) { renderer = null; }
    if (cancelled) return;
    if (!renderer) vwrap.insertAdjacentHTML('beforeend', '<img class="br-flat" alt="">');

    addEventListener('resize', layout, on);
    layout();
    raf = requestAnimationFrame(frame);
  })();

  function sizeGL() {
    if (!renderer) return;
    const vw = vwrap.clientWidth, vh = vwrap.clientHeight;
    if (!vh) return;
    const cw = Math.max(vw * 4, 220), ch = vh * 1.12;
    renderer.domElement.style.width = cw + 'px';
    renderer.domElement.style.height = ch + 'px';
    renderer.setSize(cw, ch, false);
    cam.aspect = cw / ch;
    cam.position.set(0, 0, 0.56 / Math.tan(THREE.MathUtils.degToRad(11)));
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }

  function grid(ys, cols, fn) {
    const pos = [], uv = [], idx = [];
    ys.forEach((y, i) => { for (let j = 0; j < cols; j++) { const o = fn(y, j / (cols - 1), i); pos.push(...o.p); uv.push(...o.uv); } });
    for (let i = 0; i < ys.length - 1; i++) for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  function buildBat(b) {
    const A = b._A, { w, h, rows, top, bot, y0 } = A, d = b._item;
    const S = 1 / h, cx = w / 2, L = Math.max(1, bot - y0), STEP = 4;
    const { spine, edge } = prof(A);
    const backZ = (y, s) => { const xn = s * 2 - 1, te = edge(y), t = spine(y); return -(te + (t - te) * (1 - xn * xn)); };
    const P = (x, y, z) => [(x - cx) * S, (h / 2 - y) * S, z * S];
    const UV = (x, y) => [x / w, 1 - y / h];
    const ext = y => rows[Math.min(h - 1, Math.max(0, Math.round(y)))];
    const ys = []; for (let y = y0; y < bot; y += STEP) ys.push(y); ys.push(bot);
    const hs = []; for (let y = top; y < y0; y += STEP) hs.push(y); hs.push(y0);
    const zc = -spine(y0) / 2;

    const mat = (o) => new THREE.MeshStandardMaterial(Object.assign({ side: THREE.DoubleSide, roughness: 0.55, metalness: 0 }, o));
    const frontM = mat({ map: tex(b._fc), alphaTest: 0.1, roughness: 0.42 });
    const backM = mat({ map: tex(b._bc), alphaTest: 0.1, roughness: 0.6 });
    const sideM = mat({ map: tex(sideTex(A, d.edgeStyle, d.edgeColor, null, d.toe)), roughness: 0.65 });
    const toeM = mat({ color: d.toe === 'wood' ? 0xd8bc90 : 0x151515, roughness: 0.8 });
    const shM = mat({ color: 0x3a2716, roughness: 0.7 });
    const g = new THREE.Group();
    const add = (geo, m) => g.add(new THREE.Mesh(geo, m));

    add(grid(ys, 18, (y, s) => { const [l, r] = ext(y), x = l + (r - l) * s; return { p: P(x, y, 0), uv: UV(x, y) }; }), frontM);
    add(grid(ys, 18, (y, s) => { const [l, r] = ext(y), x = l + (r - l) * s; return { p: P(x, y, backZ(y, s)), uv: UV(x, y) }; }), backM);
    add(grid(ys, 2, (y, s) => { const [l] = ext(y); return { p: P(l, y, -edge(y) * s), uv: [s, 1 - y / h] }; }), sideM);
    add(grid(ys, 2, (y, s) => { const [, r] = ext(y); return { p: P(r, y, -edge(y) * s), uv: [1 - s, 1 - y / h] }; }), sideM);
    const cap = (y, m) => add(grid([y, y], 18, (yy, s, i) => {
      const [l, r] = ext(yy), x = l + (r - l) * s;
      return { p: P(x, yy, i ? backZ(yy, s) : 0), uv: UV(x, yy) };
    }), m);
    cap(bot, toeM); cap(y0, shM);
    // handle: gol cylinder, grip photo se
    add(grid(hs, 25, (y, s) => {
      const [l, r] = ext(y), rad = (r - l) / 2, xc = (l + r) / 2, th = s * Math.PI * 2, x = xc + rad * Math.sin(th);
      return { p: P(x, y, zc + rad * Math.cos(th) * 0.92), uv: UV(x, y) };
    }), mat({ map: frontM.map, roughness: 0.75 }));
    add(grid([top, top], 25, (y, s, i) => {
      const [l, r] = ext(y), rad = i ? (r - l) / 2 : 0, xc = (l + r) / 2, th = s * Math.PI * 2;
      return { p: P(xc + rad * Math.sin(th), y, zc + rad * Math.cos(th) * 0.92), uv: UV(xc, y + 2) };
    }), mat({ map: frontM.map, roughness: 0.75 }));
    g.position.z = spine(y0 + L * 0.6) * S / 2;           // ghoomne ka markaz motai ke beech
    return g;
  }
  function showBat(b) {
    if (!renderer) { const f = vwrap.querySelector('.br-flat'); if (f) f.src = b._img.front; return; }
    holder.clear();
    if (b._A) { b._mesh = b._mesh || buildBat(b); holder.add(b._mesh); }
    sizeGL();
  }

  // ===== 3. Rack =====
  let rack = base.slice();
  let W = 0, B = 0, S = 0, E = 0, BASE = 0, total = 0, spotX = 0;
  let scroll = 0, vel = 0, dragging = false, hovered = null, busy = false, current = null;

  function initItem(el, i) {
    el._i = i;
    if (el._a === undefined) {
      const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      Object.assign(el, { _shift: 0, _a: 0, _w: 0, _vx: 0, _pvx: 0, _px: null, _k: SPRING * (0.85 + r * 0.3), _m: 0.85 + r * 0.3 });
    }
  }
  function layout() {
    if (!stage.clientWidth) return;
    W = stage.clientWidth;
    B = Math.max(230, Math.min(420, W * 0.32)); // bat ki height
    S = B * R * 1.45 + 10;                       // rack mein gap
    E = B * R * 0.35 + 8;                        // hover pe kitni jagah khule
    BASE = B * 0.06 + 16;
    root.style.setProperty('--B', B + 'px');
    root.style.setProperty('--base', BASE + 'px');
    root.style.setProperty('--V', (W <= 640 ? Math.min(B * 1.3, 400) : B * 1.12) + 'px');
    while (rack.length * S < W + B) {
      base.forEach(b => {
        const c = b.cloneNode(true);
        Object.assign(c, { _item: b._item, _img: b._img, _fc: b._fc, _bc: b._bc, _A: b._A, _src: b });
        c.classList.add('br-clone');
        stage.appendChild(c);
        rack.push(c);
      });
    }
    rack.forEach(initItem);
    total = rack.length * S;
    if (!spotX) spotX = W / 2;
    sizeGL();
  }
  const baseX = el => { let x = ((el._i * S - scroll) % total + total) % total; return x >= total / 2 ? x - total : x; };
  const screenX = el => W / 2 + baseX(el) + el._shift;

  let prevT = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!W) { layout(); if (!W) return; }
    const f = Math.min(Math.max((now - prevT) / 16.667, 0.25), 3); prevT = now;
    if (!dragging && vel) { scroll += vel * f; vel *= Math.pow(0.94, f); if (Math.abs(vel) < 0.05) vel = 0; }
    const hx = hovered ? baseX(hovered) : 0;
    rack.forEach(el => {
      const x = baseX(el);
      const target = hovered && el !== hovered ? (x < hx ? -E / 2 : E / 2) : 0;
      el._shift += (target - el._shift) * Math.min(1, 0.14 * f);
      const fx = W / 2 + x + el._shift;
      if (el._px === null || Math.abs(fx - el._px) > W / 2) { el._px = fx; el._vx = el._pvx = 0; }
      const raw = (fx - el._px) / f;
      el._px = fx;
      el._vx += (raw - el._vx) * Math.min(1, 0.5 * f);
      const ax = (el._vx - el._pvx) / f;
      el._pvx = el._vx;
      const acc = -INERTIA * el._m * ax - AIR * el._vx - el._k * el._a - DAMP * el._w;
      el._w += acc * f;
      el._a = Math.max(-MAX_TILT, Math.min(MAX_TILT, el._a + el._w * f));
      el.style.transform = `translate3d(${fx}px,0,0) rotate(${el._a.toFixed(2)}deg)`;
    });
    spotX += ((hovered ? screenX(hovered) : W / 2) - spotX) * Math.min(1, 0.08 * f);
    spot.style.transform = `translateX(${spotX}px)`;
    const p = ((scroll / (N0 * S)) % 1 + 1) % 1;
    thumb.style.transform = `translateX(${p * 80}px)`;
    viewerFrame(f);
  }

  function setHover(b) {
    if (b === hovered) return;
    hovered && hovered.classList.remove('is-up');
    hovered = b;
    stage.classList.toggle('has-hover', !!b);
    if (b) {
      b.classList.add('is-up');
      b._w -= 0.8;
      const box = document.createElement('div');
      const n = document.createElement('strong'); n.textContent = b._item.name;
      const pr = document.createElement('b'); pr.textContent = b._item.price;
      box.append(n, pr);
      info.replaceChildren(box);
    } else showHint();
  }
  stage.addEventListener('pointerover', e => {
    if (dragging || busy || e.pointerType !== 'mouse') return;
    setHover(e.target.closest('.br-bat'));
  }, on);
  stage.addEventListener('pointerleave', () => setHover(null), on);

  let sx = 0, lastX = 0, lastT = 0, moved = 0, downB = null;
  stage.addEventListener('pointerdown', e => {
    if (busy || stage.classList.contains('is-loading')) return;
    dragging = true; moved = 0; vel = 0;
    sx = lastX = e.clientX; lastT = performance.now();
    downB = e.target.closest('.br-bat');
    try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic pointers */ }
  }, on);
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX; lastT = performance.now();
    moved = Math.max(moved, Math.abs(e.clientX - sx));
    if (moved > 6) { stage.classList.add('is-dragging'); setHover(null); }
    scroll -= dx; vel = -dx;
  }, on);
  function release() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    if (performance.now() - lastT > 90) vel = 0;
    if (moved < 6 && downB) { vel = 0; openDetail(downB); }
  }
  stage.addEventListener('pointerup', release, on);
  stage.addEventListener('pointercancel', release, on);
  stage.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); scroll += e.deltaX; vel = 0; }
  }, { passive: false, signal: off.signal });

  // ===== 4. 3D viewer: drag se ghumao, tap se knock =====
  const V = { ang: 0, vel: 0, target: null, kick: 0, ph: 0, t: 0, drag: false };
  function viewerFrame(f) {
    if (!root.classList.contains('br-open')) return;
    if (!V.drag) {
      if (V.target !== null) {
        V.ang += (V.target - V.ang) * Math.min(1, 0.075 * f);
        if (Math.abs(V.target - V.ang) < 0.1) { V.ang = V.target; V.target = null; }
      } else if (V.vel) {
        V.ang += V.vel * f; V.vel *= Math.pow(0.93, f);
        if (Math.abs(V.vel) < 0.02) V.vel = 0;
      }
    }
    V.t += f; V.ph += 0.9 * f; V.kick *= Math.pow(0.88, f);
    if (renderer) {
      holder.rotation.y = THREE.MathUtils.degToRad(V.ang);
      holder.rotation.z = THREE.MathUtils.degToRad(V.kick * Math.sin(V.ph));
      holder.position.y = Math.sin(V.t * 0.035) * 4 / Math.max(1, vwrap.clientHeight);
      renderer.render(scene, cam);
    }
    const n = ((V.ang % 360) + 360) % 360;
    const view = n < 90 || n > 270 ? 0 : 180;
    chips.forEach(c => c.classList.toggle('is-active', +c.dataset.a === view));
  }
  chips.forEach(c => c.addEventListener('click', () => {
    const a = +c.dataset.a;
    V.vel = 0;
    V.target = a + 360 * Math.round((V.ang - a) / 360);
  }, on));

  let vsx = 0, vlx = 0, vlt = 0, vmoved = 0;
  vwrap.addEventListener('pointerdown', e => {
    if (busy) return;
    V.drag = true; V.target = null; V.vel = 0; vmoved = 0;
    vsx = vlx = e.clientX; vlt = performance.now();
    try { vwrap.setPointerCapture(e.pointerId); } catch { /* synthetic pointers */ }
  }, on);
  vwrap.addEventListener('pointermove', e => {
    if (!V.drag) return;
    const dx = e.clientX - vlx;
    vlx = e.clientX; vlt = performance.now();
    vmoved = Math.max(vmoved, Math.abs(e.clientX - vsx));
    V.ang += dx * 0.6; V.vel = dx * 0.6;
  }, on);
  function vrelease(e) {
    if (!V.drag) return;
    V.drag = false;
    if (performance.now() - vlt > 90) V.vel = 0;
    if (vmoved < 5) { V.vel = 0; knock(e); return; }
    V.target = 180 * Math.round((V.ang + V.vel * 12) / 180);  // chhorne pe front ya back pe hi ruke, edge pe nahi
    V.vel = 0;
  }
  vwrap.addEventListener('pointerup', vrelease, on);
  vwrap.addEventListener('pointercancel', () => { V.drag = false; }, on);

  // Knock: blade pe tap karo, sweet spot pe "ping"
  function playKnock(kind) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime;
      const P = { sweet: [880, 520, 0.42, 0.55], knock: [1250, 760, 0.16, 0.4], spine: [1500, 900, 0.12, 0.35], handle: [320, 220, 0.12, 0.35] }[kind];
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(P[0], t);
      o.frequency.exponentialRampToValueAtTime(P[1], t + P[2] * 0.6);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(P[3], t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + P[2]);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + P[2] + 0.02);
      const len = Math.floor(ac.sampleRate * 0.025), buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const nz = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
      nz.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = kind === 'handle' ? 800 : 2600; bp.Q.value = 1.4;
      ng.gain.value = kind === 'sweet' ? 0.25 : 0.5;
      nz.connect(bp).connect(ng).connect(ac.destination);
      nz.start(t);
    } catch (err) { /* audio band ho to bas visual chalega */ }
  }
  function knock(e) {
    const r = vwrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    if (px < -0.4 || px > 1.4 || py < 0 || py > 1) return;
    const n = ((V.ang % 360) + 360) % 360;
    const onFace = n < 50 || n > 310;                   // hitting face saamne hai?
    const sweetAt = SWEET[current._item.sweet] || SWEET.mid;
    const kind = py < 0.33 ? 'handle' : !onFace ? 'spine' : Math.abs(py - sweetAt) < 0.07 ? 'sweet' : 'knock';
    playKnock(kind);
    const rp = document.createElement('span');
    rp.className = 'br-ripple' + (kind === 'sweet' ? ' sweet' : '');
    rp.style.left = (e.clientX - r.left) + 'px';
    rp.style.top = (e.clientY - r.top) + 'px';
    vwrap.appendChild(rp);
    setTimeout(() => rp.remove(), 650);
    V.kick = kind === 'sweet' ? 2 : 3.5;
    vhint.textContent = { sweet: 'Sweet spot! Perfect ping ✓', knock: 'Solid knock · find the sweet spot', spine: 'Back side · flip to Front for the sweet spot', handle: "That's the handle" }[kind];
    vhint.classList.toggle('is-sweet', kind === 'sweet');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { vhint.textContent = VHINT; vhint.classList.remove('is-sweet'); }, 1800);
  }

  // ===== 5. Smooth open / close =====
  function rel(el) {
    const Rr = root.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - Rr.left, y: r.top - Rr.top, w: r.width, h: r.height };
  }
  function rackPose(b) {
    const st = rel(stage);
    const up = b.classList.contains('is-up');
    return { cx: st.x + screenX(b), bottom: st.y + st.h - BASE - (up ? B * 0.1 : 0), h: B * (up ? 1.06 : 1), r: REST };
  }
  function viewPose(ang) {
    const r = rel(vwrap);
    return { cx: r.x + r.w / 2, bottom: r.y + r.h, h: r.h, r: ang };
  }
  function fly(b, from, to, dur, lift) {
    const box = document.createElement('div');
    box.className = 'br-fly';
    box.appendChild(b.querySelector('.br-3d').cloneNode(true));
    const fw = B * R;
    box.style.width = fw + 'px';
    box.style.height = B + 'px';
    root.appendChild(box);
    const obj = box.querySelector('.br-obj');
    obj.style.transition = 'none';
    const T = p => `translate(${p.cx - fw / 2}px,${p.bottom - B}px) scale(${p.h / B})`;
    const mid = { cx: from.cx + (to.cx - from.cx) * 0.4, bottom: Math.min(from.bottom, to.bottom) - B * lift, h: (from.h + to.h) / 2 };
    box.animate([{ transform: T(from) }, { transform: T(mid), offset: 0.4 }, { transform: T(to) }], { duration: dur, easing: EASE, fill: 'forwards' });
    return obj.animate([{ transform: `rotateY(${from.r}deg)` }, { transform: `rotateY(${to.r}deg)` }], { duration: dur, easing: EASE, fill: 'forwards' })
      .finished.catch(() => undefined).then(() => box.remove());
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  let size = '';
  function renderSizes(item) {
    size = item.sizes[0] || '';
    sizesLabel.hidden = sizesRow.hidden = item.sizes.length === 0;
    sizesRow.replaceChildren(...item.sizes.map((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = s;
      btn.className = i === 0 ? 'is-active' : '';
      btn.addEventListener('click', () => {
        size = s;
        sizesRow.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === btn));
      });
      return btn;
    }));
  }

  function openDetail(b) {
    if (busy || root.classList.contains('br-open')) return;
    busy = true; current = b;
    const d = b._item;
    const from = rackPose(b);
    setHover(null);
    detail.querySelector('.br-count').textContent = `${+b.dataset.index + 1} / ${N0}`;
    detail.querySelector('.br-name').textContent = d.name;
    detail.querySelector('.br-price').textContent = d.price;
    detail.querySelector('.br-type').textContent = d.typeLabel;
    renderSizes(d);
    cart.disabled = d.soldOut;
    cart.textContent = d.soldOut ? 'Sold out' : 'Add to cart';
    shop.href = d.href;
    vhint.textContent = VHINT; vhint.classList.remove('is-sweet');
    b.classList.add('is-flying');
    root.classList.add('br-open', 'br-landing');
    void detail.offsetWidth;
    root.classList.add('br-show');
    detail.setAttribute('aria-hidden', 'false');
    V.ang = REST; V.vel = 0; V.target = null;
    showBat(b._src || b);
    fly(b, from, viewPose(REST), 900, 0.35).then(() => {
      root.classList.remove('br-landing');
      V.ang = REST - 360; V.target = REST; // pehunch kar ek poora chakkar
      busy = false;
    });
  }

  async function closeDetail() {
    if (busy || !root.classList.contains('br-open')) return;
    busy = true;
    const b = current;
    V.vel = 0; V.target = REST + 360 * Math.round((V.ang - REST) / 360);   // pehle rack wali side pe ghumao
    for (let i = 0; i < 40 && V.target !== null; i++) await wait(16);
    if (cancelled) return;
    const from = viewPose(REST);
    const inline = getComputedStyle(detail).position !== 'absolute';
    root.classList.add('br-landing');
    root.classList.remove('br-show');
    detail.setAttribute('aria-hidden', 'true');
    if (inline) root.classList.remove('br-open');
    const to = rackPose(b);
    fly(b, from, to, 800, 0.25).then(() => {
      b.classList.remove('is-flying');
      b._w += 1.5;
      root.classList.remove('br-open', 'br-landing');
      busy = false;
    });
  }

  detail.querySelector('.br-close').addEventListener('click', closeDetail, on);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); }, on);
  cart.addEventListener('click', () => {
    if (!current) return;
    if (!hooks.onAdd(+current.dataset.index, size)) return;   // sold out / bag full: the shop shows why
    cart.textContent = 'Added ✓';
    clearTimeout(cartTimer);
    cartTimer = setTimeout(() => { cart.textContent = 'Add to cart'; }, 1400);
  }, on);

  return () => {
    cancelled = true;
    off.abort();
    cancelAnimationFrame(raf);
    clearTimeout(hintTimer);
    clearTimeout(cartTimer);
    if (renderer) { renderer.dispose(); renderer.domElement.remove(); renderer = null; }
    vwrap.querySelectorAll('.br-flat, .br-ripple').forEach(n => n.remove());
    root.querySelectorAll('.br-fly').forEach(n => n.remove());
    stage.querySelectorAll('.br-bat').forEach(n => n.remove());
    root.classList.remove('br-open', 'br-show', 'br-landing');
    stage.classList.remove('is-loading', 'has-hover', 'is-dragging');
    blobUrls.forEach(u => URL.revokeObjectURL(u));
    if (ac) ac.close().catch(() => undefined);
  };
}
