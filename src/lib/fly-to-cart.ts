// "Fly to cart": the added product's picture flies from where the shopper tapped to the
// header bag icon (marked with data-cart-target), and the icon gives a small bounce.

// The add can come from any button (product page, quick view, rails), so start where the last tap was.
let lastPoint: { x: number; y: number } | null = null
addEventListener("pointerdown", (e) => { lastPoint = { x: e.clientX, y: e.clientY } }, { capture: true, passive: true })

export function flyToCart(imageSrc: string) {
  const target = document.querySelector<HTMLElement>("[data-cart-target]")
  if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const to = target.getBoundingClientRect()
  if (!to.width) return
  const from = lastPoint ?? { x: innerWidth / 2, y: innerHeight / 2 }
  const SIZE = 76

  const img = document.createElement("img")
  img.src = imageSrc
  img.alt = ""
  img.setAttribute("aria-hidden", "true")
  Object.assign(img.style, {
    position: "fixed",
    left: `${from.x - SIZE / 2}px`,
    top: `${from.y - SIZE / 2}px`,
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    objectFit: "cover",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 14px 30px rgb(38 22 13 / 35%)",
    zIndex: "9999",
    pointerEvents: "none",
  })
  document.body.append(img)

  // A curved path: it lifts a little first, then dives into the bag while shrinking.
  const dx = to.left + to.width / 2 - from.x
  const dy = to.top + to.height / 2 - from.y
  const flight = img.animate(
    [
      { transform: "translate(0, 0) scale(.6) rotate(0deg)", opacity: 0 },
      { transform: "translate(0, -18px) scale(1) rotate(-6deg)", opacity: 1, offset: 0.15 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.75) rotate(8deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.15) rotate(20deg)`, opacity: 0.4 },
    ],
    { duration: 850, easing: "cubic-bezier(.45,0,.25,1)" },
  )
  flight.finished
    .then(() => {
      target.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.3) rotate(-8deg)" }, { transform: "scale(.92)" }, { transform: "scale(1)" }],
        { duration: 450, easing: "ease-out" },
      )
    })
    .catch(() => undefined)
    .finally(() => img.remove())
}
