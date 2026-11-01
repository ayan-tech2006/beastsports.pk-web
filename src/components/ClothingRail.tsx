import { useEffect, useRef } from "react"
import { useOutletContext } from "react-router"
import { allProducts, getProductImageUrl, homeContent, money } from "@/data/products"
import { roomFor, type Product, type StorefrontContext } from "@/Storefront"
import "./clothing-rail.css"

// Products the admin switched on for the rail (product form → "Clothing rail"), with their
// transparent front/back cut-outs. Products and settings load before the app renders (see main.tsx).
type RailItem = { key: string; name: string; front: string; back: string; product: Product }

const railItems: RailItem[] = Object.entries(homeContent.rail).flatMap(([id, entry]) => {
  const product = allProducts.find((p) => p.id === id)
  return entry?.on && entry.front && product
    ? [{ key: id, name: product.name, front: entry.front, back: entry.back || "", product }]
    : []
})
const priceOf = (item: RailItem) => money(item.product.price)

const HANGER =
  '<svg class="g-hanger" viewBox="0 0 200 46" aria-hidden="true"><rect x="94" y="0" width="12" height="16" rx="3" fill="#7a4b28"/><path d="M30 42 Q100 6 170 42" fill="none" stroke="#8b5a34" stroke-width="8" stroke-linecap="round"/></svg>'
const EASE = "cubic-bezier(.22,.8,.2,1)"

// Physics settings (swing)
const INERTIA = 0.05 // speed badalne pe kitna jhoolay
const AIR = 0.0022 // chalte waqt kapra peeche ki taraf jhuke
const SPRING = 0.012 // wapas seedha hone ki taqat
const DAMP = 0.035 // jhoolna kitni jaldi ruke
const MAX_SWING = 22 // max angle (deg)

type Garment = HTMLDivElement & {
  _i: number
  _shift: number
  _a: number
  _w: number
  _vx: number
  _pvx: number
  _px: number | null
  _k: number
  _m: number
}
type Pose = { cx: number; top: number; r: number; s: number }

const realSizes = (p: Product) => p.sizes.filter((s) => s !== "One size")

export default function ClothingRail() {
  const { addToBag, bag } = useOutletContext<StorefrontContext>()
  const rootRef = useRef<HTMLDivElement>(null)
  // The rail code below runs once; it reads the latest bag and cart function through this ref.
  const live = useRef({ addToBag, bag })
  live.current = { addToBag, bag }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const off = new AbortController()
    const on = { signal: off.signal }
    const stage = root.querySelector<HTMLElement>(".rail-stage")!
    const tube = root.querySelector(".rail-tube")!
    const shine = root.querySelector(".rail-shine")!
    const info = root.querySelector<HTMLElement>(".rail-info")!
    const thumb = root.querySelector<HTMLElement>(".rail-progress span")!
    const detail = root.querySelector<HTMLElement>(".rail-detail")!
    const fig = detail.querySelector<HTMLElement>(".d-figure")!
    const dImg = fig.querySelector("img")!
    const tabs = detail.querySelector<HTMLElement>(".d-tabs")!
    const sizesRow = detail.querySelector<HTMLElement>(".d-sizes")!
    const sizesLabel = detail.querySelector<HTMLElement>(".d-label")!
    const cart = detail.querySelector<HTMLButtonElement>(".d-cart")!
    const shop = detail.querySelector<HTMLAnchorElement>(".d-shop")!
    const isTouch = matchMedia("(hover: none)").matches
    const hintText = isTouch ? "Tap a piece · drag to browse" : "Hover a piece · click to look closer"
    const showHint = () => {
      info.replaceChildren(Object.assign(document.createElement("span"), { className: "rail-hint", textContent: hintText }))
    }

    const base = [...stage.querySelectorAll<Garment>(".garment")]
    const BASE_N = base.length
    base.forEach((g, i) => {
      const item = railItems[i]
      g.dataset.index = String(i)
      g.innerHTML = `<span class="g-wire"></span><span class="g-tag"></span><div class="g-body">${HANGER}<img alt="" draggable="false"></div>`
      g.querySelector(".g-tag")!.textContent = priceOf(item)
      const img = g.querySelector("img")!
      img.src = getProductImageUrl(item.front)
      img.alt = item.name
    })
    if (!fig.querySelector(".g-hanger")) fig.insertAdjacentHTML("afterbegin", HANGER)
    showHint()

    let items: Garment[] = base.slice()
    let W = 0, F = 0, S = 0, E = 0, SAG = 0, total = 0
    const TOP = 28
    let scroll = 0, vel = 0, dragging = false, busy = false
    let hovered: Garment | null = null
    let current: Garment | null = null
    let currentItem: RailItem | null = null
    let size = ""
    let raf = 0

    function initItem(el: Garment, i: number) {
      el._i = i
      if (el._a === undefined) {
        const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1 // har kapre ka thora alag wazan
        Object.assign(el, { _shift: 0, _a: 0, _w: 0, _vx: 0, _pvx: 0, _px: null, _k: SPRING * (0.85 + r * 0.3), _m: 0.9 + r * 0.25 })
      }
    }

    function layout() {
      if (!stage.clientWidth) return
      W = stage.clientWidth
      F = Math.max(120, Math.min(240, W * 0.19)) // kapre ki width
      S = F * 0.56 // side view mein gap
      E = F * 0.62 // hover pe kitni jagah khule
      SAG = W * 0.045 // rail ka jhukaav
      root!.style.setProperty("--F", F + "px")
      while (items.length * S < W + F * 4) {
        base.forEach((b) => {
          const c = b.cloneNode(true) as Garment
          c.classList.add("rail-clone")
          stage.appendChild(c)
          items.push(c)
        })
      }
      items.forEach(initItem)
      total = items.length * S
      const d = `M0 ${TOP} Q ${W / 2} ${TOP + 2 * SAG} ${W} ${TOP}`
      tube.setAttribute("d", d)
      shine.setAttribute("d", d)
    }
    const railY = (x: number) => { const t = (x - W / 2) / (W / 2); return TOP + SAG * (1 - t * t) }
    const baseX = (el: Garment) => { const x = (((el._i * S - scroll) % total) + total) % total; return x >= total / 2 ? x - total : x }
    const screenX = (el: Garment) => W / 2 + baseX(el) + el._shift

    let prevT = performance.now()
    function frame(now: number) {
      raf = requestAnimationFrame(frame)
      if (!W) { layout(); if (!W) return }
      const f = Math.min(Math.max((now - prevT) / 16.667, 0.25), 3)
      prevT = now
      if (!dragging && vel) { scroll += vel * f; vel *= Math.pow(0.94, f); if (Math.abs(vel) < 0.05) vel = 0 }
      const hx = hovered ? baseX(hovered) : 0
      items.forEach((el) => {
        const x = baseX(el)
        const target = hovered && el !== hovered ? (x < hx ? -E / 2 : E / 2) : 0
        el._shift += (target - el._shift) * Math.min(1, 0.14 * f)
        const fx = W / 2 + x + el._shift

        // --- pendulum physics ---
        if (el._px === null || Math.abs(fx - el._px) > W / 2) { el._px = fx; el._vx = el._pvx = 0 }
        const raw = (fx - el._px) / f
        el._px = fx
        el._vx += (raw - el._vx) * Math.min(1, 0.5 * f)
        const ax = (el._vx - el._pvx) / f
        el._pvx = el._vx
        const acc = INERTIA * el._m * ax + AIR * el._vx - el._k * el._a - DAMP * el._w
        el._w += acc * f
        el._a = Math.max(-MAX_SWING, Math.min(MAX_SWING, el._a + el._w * f))

        el.style.transform = `translate3d(${fx}px,${railY(fx)}px,0) rotate(${el._a.toFixed(2)}deg)`
      })
      const p = (((scroll / (BASE_N * S)) % 1) + 1) % 1
      thumb.style.transform = `translateX(${p * 80}px)`
    }

    function setHover(g: Garment | null) {
      if (g === hovered) return
      hovered?.classList.remove("is-open")
      hovered = g
      if (g) {
        g.classList.add("is-open")
        g._w += 0.6 // hover pe halka sa jhatka
        const item = railItems[+g.dataset.index!]
        const box = document.createElement("div")
        box.append(Object.assign(document.createElement("strong"), { textContent: item.name }), Object.assign(document.createElement("b"), { textContent: priceOf(item) }))
        info.replaceChildren(box)
      } else showHint()
    }

    // Hover: kapra ghoom kar front pe
    stage.addEventListener("pointerover", (e) => {
      if (dragging || busy || e.pointerType !== "mouse") return
      setHover((e.target as HTMLElement).closest<Garment>(".garment"))
    }, on)
    stage.addEventListener("pointerleave", () => setHover(null), on)

    // Drag / swipe: rail pe slide
    let sx = 0, lastX = 0, lastT = 0, moved = 0
    let downG: Garment | null = null
    stage.addEventListener("pointerdown", (e) => {
      if (busy) return
      dragging = true; moved = 0; vel = 0
      sx = lastX = e.clientX; lastT = performance.now()
      downG = (e.target as HTMLElement).closest<Garment>(".garment")
      stage.setPointerCapture(e.pointerId)
    }, on)
    stage.addEventListener("pointermove", (e) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX; lastT = performance.now()
      moved = Math.max(moved, Math.abs(e.clientX - sx))
      if (moved > 6) { stage.classList.add("is-dragging"); setHover(null) }
      scroll -= dx; vel = -dx
    }, on)
    function release() {
      if (!dragging) return
      dragging = false
      stage.classList.remove("is-dragging")
      if (performance.now() - lastT > 90) vel = 0
      if (moved < 6 && downG) { vel = 0; openDetail(downG) }
    }
    stage.addEventListener("pointerup", release, on)
    stage.addEventListener("pointercancel", release, on)
    stage.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); scroll += e.deltaX; vel = 0 }
    }, { passive: false, signal: off.signal })

    // --- Smooth open / close (kapra rail se uth kar detail mein jaye) ---
    function rel(r: DOMRect) { const R = root!.getBoundingClientRect(); return { x: r.left - R.left, y: r.top - R.top, w: r.width } }
    function railPose(g: Garment): Pose {
      const st = rel(stage.getBoundingClientRect())
      const fx = screenX(g)
      const open = g.classList.contains("is-open")
      return { cx: st.x + fx, top: st.y + railY(fx) + F * 0.11, r: open ? 0 : 66, s: open ? 1.07 : 1 }
    }
    function figPose(): Pose {
      const r = rel(dImg.getBoundingClientRect())
      const s = r.w / F
      return { cx: r.x + r.w / 2, top: r.y - F * 0.06 * s, r: 0, s }
    }
    const tf = (p: Pose) => `translate(${p.cx - F / 2}px,${p.top}px) perspective(1100px) rotateY(${p.r}deg) scale(${p.s})`
    function fly(g: Garment, from: Pose, to: Pose, dur: number) {
      const clone = g.querySelector(".g-body")!.cloneNode(true) as HTMLElement
      clone.querySelector("img")!.src = dImg.src || g.querySelector("img")!.src
      clone.classList.add("rail-fly")
      root!.appendChild(clone)
      const mid = { cx: (from.cx + to.cx) / 2, top: Math.min(from.top, to.top) - F * 0.25, r: (from.r + to.r) / 2, s: (from.s + to.s) / 2 }
      const anim = clone.animate([{ transform: tf(from) }, { transform: tf(mid), offset: 0.45 }, { transform: tf(to) }], { duration: dur, easing: EASE, fill: "forwards" })
      return anim.finished.catch(() => undefined).then(() => clone.remove())
    }

    function renderSizes(p: Product) {
      const list = realSizes(p)
      size = list[0] ?? p.sizes[0] ?? ""
      sizesLabel.hidden = sizesRow.hidden = list.length === 0
      sizesRow.replaceChildren(...list.map((s, i) => {
        const b = Object.assign(document.createElement("button"), { type: "button", textContent: s, className: i === 0 ? "is-active" : "" })
        b.addEventListener("click", () => {
          size = s
          sizesRow.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b))
        })
        return b
      }))
    }

    function openDetail(g: Garment) {
      if (busy || root!.classList.contains("detail-open")) return
      busy = true; current = g
      const item = railItems[+g.dataset.index!]
      const p = item.product
      currentItem = item
      const from = railPose(g)
      setHover(null)
      detail.querySelector(".d-count")!.textContent = `${+g.dataset.index! + 1} / ${BASE_N}`
      detail.querySelector(".d-name")!.textContent = item.name
      detail.querySelector(".d-price")!.textContent = priceOf(item)
      const front = getProductImageUrl(item.front)
      detail.dataset.front = front
      detail.dataset.back = item.back ? getProductImageUrl(item.back) : front
      tabs.hidden = !item.back
      dImg.src = front; dImg.alt = item.name
      tabs.querySelectorAll("button").forEach((b, i) => b.classList.toggle("is-active", i === 0))
      renderSizes(p)
      cart.disabled = p.stock <= 0
      cart.textContent = p.stock <= 0 ? "Sold out" : "Add to cart"
      shop.href = `#/product/${p.id}`
      g.classList.add("is-flying")
      root!.classList.add("detail-open", "landing")
      void detail.offsetWidth // reflow taa ke transition chale
      root!.classList.add("detail-show")
      detail.setAttribute("aria-hidden", "false")
      fly(g, from, figPose(), 850).then(() => {
        root!.classList.remove("landing")
        fig.classList.remove("sway"); void fig.offsetWidth; fig.classList.add("sway")
        busy = false
      })
    }

    function closeDetail() {
      if (busy || !root!.classList.contains("detail-open") || !current) return
      busy = true
      const g = current
      const from = figPose()
      const inline = getComputedStyle(detail).position !== "absolute" // mobile layout
      root!.classList.add("landing")
      root!.classList.remove("detail-show")
      detail.setAttribute("aria-hidden", "true")
      if (inline) root!.classList.remove("detail-open")
      g.classList.remove("is-open")
      const to = railPose(g)
      to.r = 66; to.s = 1
      fly(g, from, to, 750).then(() => {
        g.classList.remove("is-flying")
        g._w -= 1.2 // rail pe wapas aa kar thora jhoolay
        root!.classList.remove("detail-open", "landing")
        fig.classList.remove("sway")
        busy = false
      })
    }

    detail.querySelector(".d-close")!.addEventListener("click", closeDetail, on)
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail() }, on)

    // Front / Back flip
    tabs.querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => {
      if (b.classList.contains("is-active")) return
      tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b))
      const src = (b.dataset.side === "back" ? detail.dataset.back : detail.dataset.front) ?? ""
      dImg.animate([{ transform: "perspective(900px) rotateY(0)" }, { transform: "perspective(900px) rotateY(90deg)" }], { duration: 200, easing: "ease-in" })
        .finished.catch(() => undefined).then(() => {
          dImg.src = src
          dImg.animate([{ transform: "perspective(900px) rotateY(-90deg)" }, { transform: "perspective(900px) rotateY(0)" }], { duration: 320, easing: EASE })
        })
    }, on))

    // Add to cart puts it in the real bag (same stock limits as everywhere else).
    let cartTimer = 0
    cart.addEventListener("click", () => {
      const p = currentItem?.product
      if (!p) return
      const fits = roomFor(p.id, live.current.bag) > 0
      live.current.addToBag(p, size || undefined)
      if (!fits) return
      cart.textContent = "Added ✓"
      clearTimeout(cartTimer)
      cartTimer = window.setTimeout(() => { cart.textContent = "Add to cart" }, 1400)
    }, on)

    addEventListener("resize", layout, on)
    layout()
    raf = requestAnimationFrame(frame)

    return () => {
      off.abort()
      cancelAnimationFrame(raf)
      clearTimeout(cartTimer)
      stage.querySelectorAll(".rail-clone").forEach((c) => c.remove())
      root.querySelectorAll(".rail-fly").forEach((c) => c.remove())
      root.classList.remove("detail-open", "detail-show", "landing")
      base.forEach((g) => g.classList.remove("is-open", "is-flying"))
    }
  }, [])

  // Hidden until the admin switches at least one product on (it looks best with 4 or more).
  if (railItems.length === 0) return null

  return (
    <section className="rail-section" aria-labelledby="rail-title">
      {/* React 19 hoists this into <head>; the font is only used by this section. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" precedence="default" />
      <div className="collection-intro">
        <div className="intro-heading">
          <p className="section-kicker">WEAR THE BEAST</p>
          <h2 id="rail-title">On the rail.</h2>
        </div>
      </div>
      <div className="rail" ref={rootRef}>
        <div className="rail-stage">
          <svg className="rail-bar" aria-hidden="true"><path className="rail-tube" /><path className="rail-shine" /></svg>
          {railItems.map((item) => (
            <div className="garment" key={item.key} />
          ))}
        </div>

        <div className="rail-foot">
          <div className="rail-info" aria-live="polite" />
          <div className="rail-progress"><span /></div>
          <div className="rail-drag">Drag to browse ⟷</div>
        </div>

        <div className="rail-detail" aria-hidden="true">
          <button className="d-close" type="button">Close ✕</button>
          <div className="d-figure"><img alt="" /></div>
          <div className="d-info">
            <div className="d-count" />
            <h3 className="d-name" />
            <div className="d-price" />
            <div className="d-tabs">
              <button type="button" className="is-active" data-side="front">Front</button>
              <button type="button" data-side="back">Back</button>
            </div>
            <div className="d-label">SIZE</div>
            <div className="d-sizes" />
            <button className="d-cart" type="button">Add to cart</button>
            {/* The product's full page, with all its photos. */}
            <a href="#/shop" className="d-shop">Continue to shop →</a>
          </div>
        </div>
      </div>
    </section>
  )
}
