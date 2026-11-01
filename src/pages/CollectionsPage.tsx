import { useState } from "react"
import { Link, useOutletContext, useParams } from "react-router"
import { ArrowRight, ChevronRight } from "lucide-react"
import type { StorefrontContext } from "@/Storefront"
import {
  collectionRoots,
  collectionsById,
  getProductImageUrl,
  type Collection,
} from "@/data/products"

// The URL is the path of collection ids, e.g. /collections/cricket/tape-ball/tape-ball-bats.
const trailOf = (collection?: Collection) => {
  const trail: Collection[] = []
  for (let c = collection; c; c = c.parent) trail.unshift(c)
  return trail
}
const hrefFor = (collection: Collection) =>
  `/collections/${trailOf(collection).map((c) => c.id).join("/")}`
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
const metaFor = (c: Collection) =>
  c.children.length
    ? `${plural(c.children.length, "Collection")} · ${plural(c.products.length, "Product")}`
    : plural(c.products.length, "Product")

const sorters = {
  newest: () => 0,
  "price-asc": (a: { price: number }, b: { price: number }) => a.price - b.price,
  "price-desc": (a: { price: number }, b: { price: number }) => b.price - a.price,
}
type SortKey = keyof typeof sorters

function CollectionTree({
  collections,
  trail,
}: {
  collections: Collection[]
  trail: Collection[]
}) {
  return (
    <ul className="space-y-0.5">
      {collections.map((c) => {
        const onTrail = trail.includes(c)
        const current = trail[trail.length - 1] === c
        return (
          <li key={c.id}>
            <Link
              to={hrefFor(c)}
              aria-current={current ? "page" : undefined}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                current
                  ? "bg-espresso font-semibold text-ivory"
                  : onTrail
                    ? "font-semibold text-espresso hover:bg-parchment"
                    : "text-clay hover:bg-parchment hover:text-espresso"
              }`}
            >
              <span className="min-w-0 truncate">{c.name}</span>
              <span className="shrink-0 text-xs tabular-nums opacity-70">{c.products.length}</span>
            </Link>
            {onTrail && c.children.length > 0 && (
              <div className="ml-3 border-l border-espresso/10 pl-2">
                <CollectionTree collections={c.children} trail={trail} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function CollectionCard({ collection }: { collection: Collection }) {
  const image = collection.image || collection.products[0]?.image || ""
  return (
    <Link
      to={hrefFor(collection)}
      className="group flex flex-col overflow-hidden rounded-xl border border-espresso/10 bg-white transition-shadow hover:shadow-[0_18px_34px_-22px_rgb(38_22_13_/_50%)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-parchment">
        {image && (
          <img
            src={getProductImageUrl(image)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-espresso">{collection.name}</h3>
          <p className="mt-0.5 text-xs text-clay">{metaFor(collection)}</p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-espresso/15 text-espresso transition-colors group-hover:bg-espresso group-hover:text-ivory">
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  )
}

export default function CollectionsPage() {
  const { renderProduct } = useOutletContext<StorefrontContext>()
  const { "*": path = "" } = useParams()
  const [sort, setSort] = useState<SortKey>("newest")

  const ids = path.split("/").filter(Boolean)
  const current = ids.length ? collectionsById.get(ids[ids.length - 1]) : undefined
  const trail = trailOf(current)
  const cards = current ? current.children : collectionRoots
  const products = current ? [...current.products].sort(sorters[sort]) : []

  if (ids.length && !current) {
    return (
      <section className="bg-ivory px-6 py-24 text-center text-espresso">
        <p className="store-eyebrow text-clay">COLLECTION NOT FOUND</p>
        <h1 className="mt-5 font-editorial text-5xl">This collection has moved.</h1>
        <p className="mt-4 text-clay">It may have been renamed or hidden. Browse what’s in stock now.</p>
        <Link className="store-button mt-7" to="/collections">
          All collections
        </Link>
      </section>
    )
  }

  return (
    <section className="bg-ivory text-espresso">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <nav className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs text-clay" aria-label="Breadcrumb">
          <Link className="py-2 hover:underline" to="/">
            Home
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          {current ? (
            <Link className="py-2 hover:underline" to="/collections">
              Collections
            </Link>
          ) : (
            <span className="py-2 text-espresso" aria-current="page">
              Collections
            </span>
          )}
          {trail.map((c) => (
            <span key={c.id} className="flex min-w-0 items-center gap-2">
              <ChevronRight size={12} className="shrink-0" />
              {c === current ? (
                <span className="truncate py-2 text-espresso" aria-current="page">
                  {c.name}
                </span>
              ) : (
                <Link className="truncate py-2 hover:underline" to={hrefFor(c)}>
                  {c.name}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <header className="mt-4 border-b border-espresso/10 pb-6">
          <p className="store-eyebrow text-clay">
            {current ? metaFor(current).toUpperCase() : "SHOP BY COLLECTION"}
          </p>
          <h1 className="mt-3 font-editorial text-4xl tracking-tight sm:text-5xl">
            {current ? current.name : "Collections."}
          </h1>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="All collections">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-clay">Collections</p>
            <CollectionTree collections={collectionRoots} trail={trail} />
          </aside>

          <div className="min-w-0 space-y-12">
            {cards.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                {cards.map((c) => (
                  <CollectionCard key={c.id} collection={c} />
                ))}
              </div>
            )}

            {current && (
              <div>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <h2 className="font-editorial text-3xl tracking-tight">
                    {current.children.length ? `Everything in ${current.name}` : "Products"}
                  </h2>
                  <label className="flex items-center gap-2 text-xs text-clay">
                    Sort by
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="cursor-pointer rounded-full border border-espresso/15 bg-transparent px-3 py-2 text-xs text-espresso"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: low to high</option>
                      <option value="price-desc">Price: high to low</option>
                    </select>
                  </label>
                </div>
                <div className="store-product-grid">{products.map(renderProduct)}</div>
              </div>
            )}

            {!current && cards.length === 0 && (
              <p className="rounded-xl bg-parchment px-6 py-16 text-center text-sm text-clay">
                Collections are on the way. In the meantime,{" "}
                <Link to="/shop" className="font-semibold text-espresso underline underline-offset-4">
                  browse the full shop
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
