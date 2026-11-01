import { useEffect, useRef } from "react"
import { Link, useOutletContext } from "react-router"
import { homeContent } from "@/data/products"
import { supabase } from "@/lib/supabase"
import type { StorefrontContext } from "@/Storefront"
import { mountShirtDesigner } from "@/components/shirt-designer-engine.js"
import "@/components/shirt-designer.css"

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" }

// Saves one picture of a design under custom-shirts/<design id>/ in the public "products" bucket.
async function save(folder: string, name: string, file: Blob) {
  const path = `custom-shirts/${folder}/${name}.${EXT[file.type] ?? "png"}`
  const { error } = await supabase.storage.from("products").upload(path, file, { contentType: file.type || "image/png" })
  if (error) throw error
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl
}

export default function ShirtDesignerPage() {
  const { addCustomShirt } = useOutletContext<StorefrontContext>()
  const rootRef = useRef<HTMLElement>(null)
  const addRef = useRef(addCustomShirt)
  addRef.current = addCustomShirt
  const config = homeContent.designer

  useEffect(() => {
    document.title = "Design your own shirt | BeastSports"
    if (!rootRef.current || !config) return
    return mountShirtDesigner(rootRef.current, config, {
      // Upload the finished pictures and every design file first, so the bag (and later the order) only keeps links.
      onAdd: async (draft) => {
        if (!draft.preview.front) return "We could not draw your shirt. Please try again."
        const folder = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
        const [front, back] = await Promise.all([
          save(folder, "final-front", draft.preview.front),
          draft.preview.back ? save(folder, "final-back", draft.preview.back) : Promise.resolve(""),
        ])
        const designs = await Promise.all(
          draft.designs.map(async (d, i) =>
            d.src ? { ...d, src: await save(folder, `design-${i + 1}-${d.side}`, await (await fetch(d.src)).blob()) } : d,
          ),
        )
        addRef.current(
          {
            style: draft.style,
            colorName: draft.colorName,
            colorHex: draft.color,
            unitPrice: draft.unitPrice,
            printedSides: draft.printedSides,
            preview: { front, back },
            designs,
            delivery: config.delivery,
          },
          draft.size,
          draft.qty,
        )
      },
    })
  }, [config])

  return (
    <>
      {/* React 19 hoists this into <head>; these fonts are used by the designer's text styles. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Anton&family=Pacifico&display=swap"
        precedence="default"
      />
      <nav className="mx-auto flex max-w-[1240px] items-center gap-2 px-4 pt-6 text-xs text-clay sm:px-10" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="text-espresso">Design your own shirt</span>
      </nav>
      {!config ? (
        <section className="sc">
          <div className="sc-off">
            <div className="sc-eyebrow">Customize your shirt</div>
            <h1 className="sc-title">Coming very soon.</h1>
            <p className="sc-note">We're getting the shirts ready. Check back shortly to design your own.</p>
            <Link to="/shop" className="store-button mt-6 inline-flex">Shop the collection</Link>
          </div>
        </section>
      ) : (
        <section className="sc" ref={rootRef} aria-label="Shirt designer">
          <div className="sc-in">
            <div className="sc-stage">
              <div className="sc-bar">
                <div className="sc-seg sc-sides">
                  <button type="button" data-side="front" className="is-on">Front</button>
                  <button type="button" data-side="back">Back</button>
                </div>
                <button type="button" className="sc-ghost sc-dl">Download preview</button>
              </div>
              <svg className="sc-svg" viewBox="0 0 400 480" aria-label="Shirt preview" />
              <div className="sc-tools">
                <button type="button" data-act="center">Center</button>
                <button type="button" data-act="front">Bring forward</button>
                <button type="button" data-act="bg">Remove white bg</button>
                <button type="button" data-act="del">Delete</button>
              </div>
              <div className="sc-hint" aria-live="polite" />
            </div>

            <div className="sc-panel">
              <div className="sc-eyebrow">Customize your shirt</div>
              <h1 className="sc-title">Design it. We print it.</h1>
              <div className="sc-price"><span className="sc-total" /><span className="sc-break" /></div>

              <div className="sc-step">
                <div className="sc-label">Style</div>
                <div className="sc-types" />
              </div>

              <div className="sc-step">
                <div className="sc-label">Color <span className="sc-cname" /></div>
                <div className="sc-colors" />
              </div>

              <div className="sc-step">
                <div className="sc-label">Your design</div>
                <label className="sc-upload">
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden />
                  <span className="sc-up-ic">↑</span>
                  <span><b>Upload your design</b><small>PNG or JPG · or drop it on the shirt</small></span>
                </label>
                <div className="sc-sub">Or pick a ready-made one</div>
                <div className="sc-presets" />
                <div className="sc-sub">Add name or number</div>
                <div className="sc-textrow">
                  <input className="sc-tin" type="text" maxLength={18} placeholder="e.g. AYAN 07" aria-label="Name or number" />
                  <button type="button" className="sc-tadd">Add text</button>
                </div>
                <div className="sc-topts"><div className="sc-fonts" /><div className="sc-inks" /></div>
              </div>

              <div className="sc-step">
                <div className="sc-label">Size</div>
                <div className="sc-sizes" />
              </div>

              <div className="sc-buy">
                <div className="sc-qty">
                  <button type="button" data-q="-1" aria-label="Less">−</button>
                  <span>1</span>
                  <button type="button" data-q="1" aria-label="More">+</button>
                </div>
                <button type="button" className="sc-cart">Add to cart</button>
              </div>
              <p className="sc-note" aria-live="polite" />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
