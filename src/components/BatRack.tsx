import { useEffect, useRef } from "react"
import { useOutletContext } from "react-router"
import { allProducts, getProductImageUrl, homeContent, money, type BatEntry } from "@/data/products"
import { roomFor, type Product, type StorefrontContext } from "@/Storefront"
import { mountBatRack, type BatRackItem } from "./bat-rack-engine.js"
import "./bat-rack.css"

// How each bat type the admin picks is drawn in 3D.
const TYPES: Record<BatEntry["type"], Pick<BatRackItem, "edgeStyle" | "toe" | "typeLabel">> = {
  hardball: { toe: "wood", typeLabel: "Hardball bat" },
  holes: { edgeStyle: "holes", typeLabel: "Tape ball bat · holed edges" },
  plain: { typeLabel: "Tape ball bat" },
}

// Products the admin switched on for the rack (product form → "Bat rack"). Loaded before render (see main.tsx).
const rackProducts: Product[] = []
const rackItems: BatRackItem[] = Object.entries(homeContent.bats).flatMap(([id, entry]) => {
  const product = allProducts.find((p) => p.id === id)
  if (!entry?.on || !(entry.front || entry.back) || !product) return []
  rackProducts.push(product)
  return [{
    name: product.name,
    price: money(product.price),
    front: entry.front ? getProductImageUrl(entry.front) : "",
    back: entry.back ? getProductImageUrl(entry.back) : "",
    sweet: "mid" as const,
    ...(TYPES[entry.type] ?? TYPES.plain),
    sizes: product.sizes.filter((s) => s !== "One size"),
    soldOut: product.stock <= 0,
    href: `#/product/${product.id}`,
  }]
})

export default function BatRack() {
  const { addToBag, bag } = useOutletContext<StorefrontContext>()
  const rootRef = useRef<HTMLDivElement>(null)
  // The rack runs once; it reads the latest bag and cart function through this ref.
  const live = useRef({ addToBag, bag })
  live.current = { addToBag, bag }

  useEffect(() => {
    if (!rootRef.current || rackItems.length === 0) return
    return mountBatRack(rootRef.current, rackItems, {
      onAdd: (index, size) => {
        const product = rackProducts[index]
        const fits = roomFor(product.id, live.current.bag) > 0
        live.current.addToBag(product, size || undefined)
        return fits
      },
    })
  }, [])

  // Hidden until the admin switches at least one bat on.
  if (rackItems.length === 0) return null

  return (
    <section className="br-section" aria-labelledby="bat-rack-title">
      {/* React 19 hoists this into <head>; the font is only used by the rails. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" precedence="default" />
      <div className="collection-intro">
        <div className="intro-heading">
          <p className="section-kicker">PICK YOUR WILLOW</p>
          <h2 id="bat-rack-title">The bat rack.</h2>
        </div>
      </div>
      <div className="br" ref={rootRef}>
        <div className="br-stage">
          <div className="br-spot" />
          <div className="br-top" />
          <div className="br-base" />
        </div>

        <div className="br-foot">
          <div className="br-info" aria-live="polite" />
          <div className="br-progress"><span /></div>
          <div className="br-drag">Drag to browse ⟷</div>
        </div>

        <div className="br-detail" aria-hidden="true">
          <button className="br-close" type="button">Close ✕</button>
          <div className="br-vcol">
            <div className="br-vwrap" />
            <div className="br-views">
              <button type="button" data-a="0">Front</button>
              <button type="button" data-a="180" className="is-active">Back</button>
            </div>
            <div className="br-vhint">Drag to spin · tap the blade to knock</div>
          </div>
          <div className="br-dinfo">
            <div className="br-count" />
            <h3 className="br-name" />
            <div className="br-price" />
            <div className="br-type" />
            <div className="br-label">SIZE</div>
            <div className="br-sizes" />
            <button className="br-cart" type="button">Add to cart</button>
            {/* The product's full page, with all its photos. */}
            <a href="#/shop" className="br-shop">Continue to shop →</a>
          </div>
        </div>
      </div>
    </section>
  )
}
