import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { allProducts, homeContent, money } from "@/data/products"
import "./bat-hero.css"

type Bat = {
  image: string
  alt: string
  c1: string
  c2: string
  price: string
  oldPrice: string
  href?: string
}

// Built-in bats, shown until the admin panel's "Website Home" screen has at least 3 slides.
const fallbackBats: Bat[] = [
  { image: "/images/bats/bat-red.png", alt: "Beast cricket bat red and white", c1: "#d23a2f", c2: "#4a0d0b", price: "", oldPrice: "" },
  { image: "/images/bats/bat-blue.png", alt: "Beast cricket bat blue and green", c1: "#2f6fd0", c2: "#0b1d45", price: "", oldPrice: "" },
  { image: "/images/bats/bat-orange.png", alt: "Beast cricket bat orange and pink", c1: "#ec7a2c", c2: "#4a1606", price: "", oldPrice: "" },
  { image: "/images/bats/bat-black.png", alt: "Beast cricket bat black with red and blue", c1: "#2a9bb8", c2: "#0a2430", price: "", oldPrice: "" },
  { image: "/images/bats/bat-yellow.png", alt: "Beast cricket bat yellow and black", c1: "#e0a422", c2: "#3b2504", price: "", oldPrice: "" },
]

// Slides come from Supabase before the app renders (see main.tsx), so this runs once with real data.
const bats: Bat[] =
  homeContent.heroSlides.length >= 3
    ? homeContent.heroSlides.map((slide) => {
        const product = allProducts.find((p) => p.id === slide.productId)
        return {
          image: slide.image,
          alt: product ? product.name : "Featured BeastSports product",
          c1: slide.c1 || "#d23a2f",
          c2: slide.c2 || "#4a0d0b",
          price: slide.price > 0 ? money(slide.price) : "",
          oldPrice: slide.oldPrice > slide.price ? money(slide.oldPrice) : "",
          href: product ? `/product/${product.id}` : undefined,
        }
      })
    : fallbackBats
const hasPrices = bats.some((bat) => bat.price)

const ORDER = ["prev", "active", "next", "queue"]
const DELAY = 4000 // auto-slide time (ms)

export default function BatHero() {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const heroRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const priceRef = useRef<HTMLDivElement>(null)
  const oldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    const card = cardRef.current
    const items = itemRefs.current.slice(0, bats.length).filter((el) => el !== null)
    if (!hero || !card || items.length !== bats.length) return

    const N = items.length
    let active = 0
    let timer: number | undefined
    const timeouts = new Set<number>()

    function stateOf(i: number) {
      const o = (((i - active) % N) + N) % N
      return o === 0 ? "active" : o === 1 ? "next" : o === N - 1 ? "prev" : "queue"
    }

    function render(instant?: boolean) {
      items.forEach((el, i) => {
        const s = stateOf(i)
        const old = el.dataset.state
        if (instant || (old && Math.abs(ORDER.indexOf(s) - ORDER.indexOf(old)) > 1)) {
          el.style.transition = "none"
          el.dataset.state = !instant && s === "next" ? "queue" : s
          void el.offsetWidth
          el.style.transition = ""
        }
        el.dataset.state = s
      })
      const bat = bats[active]
      hero!.style.setProperty("--c1", bat.c1)
      hero!.style.setProperty("--c2", bat.c2)
      for (const [el, v] of [
        [priceRef.current, bat.price],
        [oldRef.current, bat.oldPrice],
      ] as const) {
        if (!el || el.textContent === v) continue
        el.classList.add("bat-hero-swap")
        const t = window.setTimeout(() => {
          timeouts.delete(t)
          el.textContent = v
          el.classList.remove("bat-hero-swap")
        }, 300)
        timeouts.add(t)
      }
    }

    function go(dir: number) {
      active = (active + dir + N) % N
      render()
      restart()
    }

    function restart() {
      clearInterval(timer)
      timer = window.setInterval(() => {
        if (!document.hidden) go(1)
      }, DELAY)
    }

    // A tap (not a swipe) on the centered product opens its page; on the small next one it slides in.
    let swiped = false
    const onItemClick = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      if (swiped) return
      if (el.dataset.state === "next") go(1)
      else if (el.dataset.state === "active" && el.dataset.href) navigateRef.current(el.dataset.href)
    }
    items.forEach((el) => el.addEventListener("click", onItemClick))

    let sx: number | null = null
    const onPointerDown = (e: PointerEvent) => {
      sx = e.clientX
      swiped = false
    }
    const onPointerUp = (e: PointerEvent) => {
      if (sx === null) return
      const dx = e.clientX - sx
      sx = null
      swiped = Math.abs(dx) > 10
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    card.addEventListener("pointerdown", onPointerDown)
    card.addEventListener("pointerup", onPointerUp)
    document.addEventListener("keydown", onKeyDown)

    render(true)
    restart()

    return () => {
      clearInterval(timer)
      timeouts.forEach(clearTimeout)
      items.forEach((el) => el.removeEventListener("click", onItemClick))
      card.removeEventListener("pointerdown", onPointerDown)
      card.removeEventListener("pointerup", onPointerUp)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <section className="bat-hero" ref={heroRef}>
      {/* React 19 hoists this into <head>; the font is only used by this hero. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap"
        precedence="default"
      />
      <div className="bat-hero-card" ref={cardRef}>
        {/* Bats: transparent PNG + each bat's own background color and price */}
        <div className="bat-hero-stage">
          {bats.map((bat, i) => (
            <figure
              key={bat.image}
              className="bat-hero-product"
              data-href={bat.href}
              data-c1={bat.c1}
              data-c2={bat.c2}
              data-price={bat.price}
              data-old={bat.oldPrice}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
            >
              <img src={bat.image} alt={bat.alt} />
            </figure>
          ))}
        </div>

        <div className="bat-hero-copy">
          <p className="bat-hero-eyebrow">Black Bear Edition</p>
          <h1 className="bat-hero-title">
            Unleash
            <br /> the Beast.
          </h1>
          <p className="bat-hero-text">
            Hand-finished willow bats, built for big hits and long innings.
          </p>
        </div>

        {hasPrices && (
          <div className="bat-hero-price-box">
            <div className="bat-hero-price" ref={priceRef}>
              {bats[0].price}
            </div>
            <div className="bat-hero-old" ref={oldRef}>
              {bats[0].oldPrice}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
