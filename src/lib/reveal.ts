import { useEffect, type RefObject } from "react"

// Text, cards and photos that fade/slide in as they scroll into view.
const REVEAL_SELECTOR = [
  "h1",
  "h2",
  ".store-eyebrow",
  ".section-kicker",
  ".intro-copy",
  ".kit-description",
  ".store-product",
  ".store-benefit",
  ".editorial-card",
  ".kit-product",
  ".pdp-trust-item",
  ".pdp-gallery-frame",
  ".pdp-detail-photo",
  ".brand-wordmarks > span",
  ".shop-community",
  ".catalog-empty",
].join(",")

// These areas already animate on their own (or are modals).
const SKIP = "dialog, .hero, .bat-hero, .tilt-section, .shop-poster, .oc-page"

export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current
    if (!container || matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add("is-visible")
          io.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    )

    // Per-effect set (not the class) so a StrictMode re-run observes everything again.
    const seen = new WeakSet<Element>()
    const register = (scope: Element) => {
      const found = scope.matches(REVEAL_SELECTOR) ? [scope] : []
      found.push(...scope.querySelectorAll(REVEAL_SELECTOR))
      for (const el of found) {
        if (seen.has(el) || el.classList.contains("is-visible") || el.closest(SKIP)) continue
        seen.add(el)
        // Stagger siblings (grid cards, wordmarks) so they cascade in.
        const index = [...(el.parentElement?.children ?? [])].indexOf(el)
        ;(el as HTMLElement).style.setProperty("--reveal-delay", `${(index % 6) * 90}ms`)
        el.classList.add("reveal")
        io.observe(el)
      }
    }

    register(container)
    // Pages, filters and pagination render new cards later.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof Element) register(node)
        }
      }
    })
    mo.observe(container, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [root])
}
