import { useLayoutEffect, useRef, useState } from "react"
import "./tilt-carousel.css"

export type TiltCarouselImage = {
  src: string
  alt: string
  label?: string
  // Opened when the centered card is clicked (or Enter is pressed).
  href?: string
}

type TiltCarouselProps = {
  images: TiltCarouselImage[]
  onOpen?: (href: string) => void
}

export default function TiltCarousel({ images, onOpen }: TiltCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // Cards are cloned outside React, so they carry data-href and call the latest onOpen via a ref.
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen
  const moveRef = useRef<(direction: number) => void>(() => {})
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const pausedRef = useRef(paused)

  function setAutoplayPaused(value: boolean) {
    pausedRef.current = value
    setPaused(value)
  }

  function move(direction: number) {
    setAutoplayPaused(true)
    moveRef.current(direction)
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !root.children.length) return

    // Keep the supplied carousel's geometry, timing, and drag physics intact.
    const TILT = 47
    const AUTOPLAY = 2600
    const MIN_CARDS = 9

    let cards = Array.from(root.children) as HTMLDivElement[]
    const base = cards.slice()
    while (cards.length < MIN_CARDS) {
      base.forEach((card) => {
        const clone = card.cloneNode(true) as HTMLDivElement
        clone.setAttribute("aria-hidden", "true")
        root.appendChild(clone)
      })
      cards = (Array.from(root.children) as HTMLDivElement[])
    }
    const N = cards.length

    let W = 0,
      pos = 0,
      target = 0,
      vel = 0,
      dragging = false,
      hover = false
    let startX = 0,
      startPos = 0,
      lastX = 0,
      lastT = 0,
      moved = 0
    let downCard: HTMLDivElement | null = null
    let lastAuto = Date.now()
    let frame = 0
    let previousIndex = -1
    let inView = true
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    )
    let reducedMotion = motionPreference.matches

    function size() {
      W = Math.max(110, Math.min(root!.clientWidth * 0.29, 280))
      root!.style.setProperty("--w", W + "px")
      root!.style.height = W * 1.5 * 1.15 + "px"
    }

    function render() {
      for (let i = 0; i < N; i++) {
        let o = (((i - pos) % N) + N) % N
        if (o > N / 2) o -= N
        const a = Math.abs(o),
          s = Math.sign(o)
        const x = s * (a <= 1 ? a * 0.9 * W : 0.9 * W + (a - 1) * 0.775 * W)
        const r = -s * Math.min(a, 1) * TILT
        const c = cards[i].style
        c.transform = `translate(-50%,-50%) translateX(${x}px) perspective(${W * 4.3}px) rotateY(${r}deg)`
        c.zIndex = String(100 - Math.round(a * 10))
        c.opacity = String(Math.max(0, Math.min(1, N / 2 - a)))
        cards[i].toggleAttribute("data-centered", a < 0.5)
      }
      const index =
        ((Math.round(pos) % images.length) + images.length) % images.length
      if (index !== previousIndex) {
        previousIndex = index
        setActiveIndex(index)
      }
    }

    let prev = performance.now()
    function tick(now: number) {
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      if (!inView || document.hidden) {
        frame = requestAnimationFrame(tick)
        return
      }
      if (!dragging) {
        if (reducedMotion) {
          pos = target
          vel = 0
        } else {
          const k = 7
          vel += (-k * k * (pos - target) - 2 * k * vel) * dt
          pos += vel * dt
        }
      }
      render()
      frame = requestAnimationFrame(tick)
    }

    function pointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) return
      dragging = true
      moved = 0
      vel = 0
      startX = lastX = event.clientX
      startPos = pos
      lastT = performance.now()
      downCard = (event.target as Element).closest<HTMLDivElement>(".tilt-card")
      root!.setPointerCapture(event.pointerId)
    }

    function pointerMove(event: PointerEvent) {
      if (!dragging) return
      const unit = W * 0.85,
        t = performance.now()
      pos = startPos - (event.clientX - startX) / unit
      moved = Math.max(moved, Math.abs(event.clientX - startX))
      vel =
        -(event.clientX - lastX) / unit / Math.max((t - lastT) / 1000, 0.016)
      lastX = event.clientX
      lastT = t
    }

    function release() {
      if (!dragging) return
      dragging = false
      if (performance.now() - lastT > 120) vel = 0
      vel = Math.max(-8, Math.min(8, vel))
      if (moved < 6 && downCard) {
        let o = (((cards.indexOf(downCard) - target) % N) + N) % N
        if (o > N / 2) o -= N
        // A tap on the centered card opens it; a tap on any other card brings it to the center.
        if (Math.round(o) === 0 && downCard.dataset.href) onOpenRef.current?.(downCard.dataset.href)
        target += Math.round(o)
        vel = 0
      } else target = Math.round(pos + vel * 0.12)
      lastAuto = Date.now()
    }

    function cancelDrag() {
      if (!dragging) return
      dragging = false
      target = Math.round(pos)
      vel = 0
      downCard = null
      lastAuto = Date.now()
    }

    function pointerEnter(event: PointerEvent) {
      if (event.pointerType === "mouse") hover = true
    }

    function pointerLeave() {
      hover = false
    }

    function onMotionPreferenceChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches
      if (reducedMotion) {
        pausedRef.current = true
        setPaused(true)
        pos = target
        vel = 0
        render()
      }
    }

    moveRef.current = (direction) => {
      target = Math.round(target) + direction
      vel = 0
      lastAuto = Date.now()
      if (reducedMotion) {
        pos = target
        render()
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) {
        prev = performance.now()
        lastAuto = Date.now()
      }
    })
    observer.observe(root)
    motionPreference.addEventListener("change", onMotionPreferenceChange)

    root.addEventListener("pointerdown", pointerDown)
    root.addEventListener("pointermove", pointerMove)
    root.addEventListener("pointerup", release)
    root.addEventListener("pointercancel", cancelDrag)
    root.addEventListener("pointerenter", pointerEnter)
    root.addEventListener("pointerleave", pointerLeave)

    const interval = window.setInterval(() => {
      if (
        dragging ||
        hover ||
        pausedRef.current ||
        !inView ||
        document.hidden ||
        Date.now() - lastAuto < AUTOPLAY
      )
        return
      target++
      lastAuto = Date.now()
    }, 200)

    window.addEventListener("resize", size)
    size()
    render()
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(interval)
      observer.disconnect()
      motionPreference.removeEventListener("change", onMotionPreferenceChange)
      moveRef.current = () => {}
      window.removeEventListener("resize", size)
      root.removeEventListener("pointerdown", pointerDown)
      root.removeEventListener("pointermove", pointerMove)
      root.removeEventListener("pointerup", release)
      root.removeEventListener("pointercancel", cancelDrag)
      root.removeEventListener("pointerenter", pointerEnter)
      root.removeEventListener("pointerleave", pointerLeave)
      cards.slice(base.length).forEach((card) => card.remove())
    }
  }, [images])

  return (
    <section
      className="tilt-section"
      aria-label="Sports collection carousel"
      onFocusCapture={(event) => {
        if ((event.target as HTMLElement).matches(":focus-visible")) {
          setAutoplayPaused(true)
        }
      }}
    >
      <div
        className="tilt-carousel"
        id="tiltCarousel"
        ref={rootRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Sports collections. Use the left and right arrow keys to explore, and Enter to open."
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            move(event.key === "ArrowLeft" ? -1 : 1)
          } else if (event.key === "Enter") {
            const href = rootRef.current?.querySelector<HTMLElement>("[data-centered]")?.dataset.href
            if (href) onOpenRef.current?.(href)
          }
        }}
      >
        {images.map((image) => (
          <div
            className={`tilt-card group ${image.href ? "cursor-pointer" : ""}`}
            key={image.href ?? image.src}
            data-href={image.href}
          >
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              loading="lazy"
            />
            {image.label && (
              <span className="pointer-events-none invisible absolute inset-x-2 bottom-1/6 text-center font-editorial text-lg font-medium leading-none tracking-tight text-ivory drop-shadow-md drop-shadow-espresso/80 group-data-[centered]:visible sm:text-3xl lg:text-4xl">
                {image.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
