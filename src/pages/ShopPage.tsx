import { useEffect, useId, useRef, useState } from "react"
import { Link, useOutletContext, useSearchParams } from "react-router"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react"
import type { Product, StorefrontContext } from "@/Storefront"
import { money } from "@/data/products"
import "../shop.css"

const categories = [
  { value: "all", label: "All products" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "equipment", label: "Equipment" },
  { value: "accessories", label: "Accessories" },
]
const edits = [
  { value: "all", label: "Shop all" },
  { value: "new", label: "New arrivals" },
  { value: "featured", label: "Best sellers" },
  { value: "sale", label: "The sale edit" },
]
const PAGE_SIZE = 12
const recommendationOrder = [
  "training-pack",
  "velocity-shoes",
  "seamless-set",
  "court-ball",
  "flow-bra",
  "sport-watch",
]
const sizeOrder = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "7",
  "8",
  "9",
  "10",
  "11",
  "Size 7",
  "Size 5",
  "Short Handle",
  "Long Handle",
  "Harrow",
  "Size 6",
  "Standard 5.5oz",
  "One size",
]

type Filters = {
  category: string
  edit: string
  search: string
  sizes: string[]
  price: number
  sort: string
  savedOnly: boolean
}

function scrollToProducts() {
  document.getElementById("shop-products")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  })
}

function FilterPanel({
  filters,
  products,
  maxPrice,
  update,
  toggleSize,
  clear,
  onSizeGuide,
}: {
  filters: Filters
  products: Product[]
  maxPrice: number
  update: (key: string, value: string) => void
  toggleSize: (size: string) => void
  clear: () => void
  onSizeGuide: () => void
}) {
  const id = useId()
  const availableSizes = sizeOrder.filter((size) =>
    products.some((product) => product.sizes.includes(size)),
  )

  return (
    <div className="shop-filter-panel">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Category</h3>
        <button
          className="min-h-11 text-xs text-clay underline underline-offset-4"
          type="button"
          onClick={clear}
        >
          Reset all
        </button>
      </div>

      <fieldset>
        <legend className="sr-only">Product category</legend>
        <div className="space-y-1">
          {categories.map((category) => {
            const count = products.filter(
              (product) =>
                category.value === "all" ||
                product.category.toLowerCase() === category.value,
            ).length
            return (
              <label
                className={`shop-category-option ${
                  category.value === "all"
                    ? "shop-category-root"
                    : "shop-category-child"
                }`}
                key={category.value}
              >
                <input
                  className="size-3.5 accent-espresso"
                  type="radio"
                  name={`${id}-category`}
                  value={category.value}
                  checked={filters.category === category.value}
                  onChange={() => update("category", category.value)}
                />
                <span
                  className={
                    filters.category === category.value
                      ? "font-medium"
                      : "text-clay"
                  }
                >
                  {category.label}
                </span>
                <span
                  className={
                    category.value === "all"
                      ? "shop-category-total"
                      : "ml-auto tabular-nums text-clay"
                  }
                >
                  {count}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div
        className="my-5 space-y-1 border-y border-espresso/10 py-4"
        role="group"
        aria-label="Shop edits"
      >
        {edits
          .filter((edit) => edit.value !== "all")
          .map((edit) => (
            <button
              className="shop-edit-tab"
              type="button"
              key={edit.value}
              data-edit={edit.value}
              aria-pressed={filters.edit === edit.value}
              onClick={() =>
                update("edit", filters.edit === edit.value ? "all" : edit.value)
              }
            >
              {edit.label}
              <ChevronRight size={13} strokeWidth={1.5} />
            </button>
          ))}
      </div>

      <details className="shop-filter-details group">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium">
          Price range
          <ChevronDown
            className="transition-transform group-open:rotate-180"
            size={13}
            strokeWidth={1.5}
          />
        </summary>
        <div className="pb-5 pt-2">
          <label className="sr-only" htmlFor={`${id}-price`}>
            Maximum price
          </label>
          <input
            id={`${id}-price`}
            className="w-full cursor-pointer accent-espresso"
            type="range"
            min={0}
            max={maxPrice}
            step={100}
            value={filters.price}
            aria-valuetext={`Up to ${money(filters.price)}`}
            onChange={(event) => update("price", event.target.value)}
          />
          <div className="mt-3 flex justify-between text-xs tabular-nums text-clay">
            <span>{money(0)}</span>
            <span>Up to {money(filters.price)}</span>
          </div>
        </div>
      </details>

      <details className="shop-filter-details group border-t border-espresso/10">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium">
          Size &amp; fit
          <ChevronDown
            className="transition-transform group-open:rotate-180"
            size={13}
            strokeWidth={1.5}
          />
        </summary>
        <fieldset className="pb-5">
          <legend className="sr-only">Filter by size</legend>
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Size</p>
            <button
              className="min-h-11 text-xs text-clay underline underline-offset-4"
              type="button"
              onClick={onSizeGuide}
            >
              Size guide
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {availableSizes.map((size) => (
              <button
                className={`shop-size-choice ${
                  size.length > 2 ? "col-span-2" : ""
                }`}
                type="button"
                key={size}
                aria-pressed={filters.sizes.includes(size)}
                onClick={() => toggleSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      </details>
    </div>
  )
}

export default function ShopPage() {
  const { products, renderProduct, bagCount, saved, openBag, helpTopic } =
    useOutletContext<StorefrontContext>()
  const [params, setParams] = useSearchParams()
  const filterDialog = useRef<HTMLDialogElement>(null)
  const recommendationRail = useRef<HTMLDivElement>(null)
  const [railState, setRailState] = useState({ left: false, right: false })

  useEffect(() => {
    const rail = recommendationRail.current
    if (!rail) return
    const sync = () => {
      const next = {
        left: rail.scrollLeft > 2,
        right: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      }
      setRailState((current) =>
        current.left === next.left && current.right === next.right
          ? current
          : next,
      )
    }
    const observer = new ResizeObserver(sync)
    observer.observe(rail)
    rail.addEventListener("scroll", sync, { passive: true })
    sync()
    return () => {
      observer.disconnect()
      rail.removeEventListener("scroll", sync)
    }
  }, [])

  function scrollRecommendations(direction: number) {
    const rail = recommendationRail.current
    if (!rail) return
    rail.scrollBy({
      left: rail.clientWidth * 0.8 * direction,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }
  const maxPrice =
    Math.ceil(Math.max(...products.map((product) => product.price)) / 100) * 100
  const category = params.get("category") ?? "all"
  const edit = params.get("edit") ?? "all"
  const price = Number(params.get("price") ?? maxPrice)
  const filters: Filters = {
    category: categories.some((item) => item.value === category)
      ? category
      : "all",
    edit: edits.some((item) => item.value === edit) ? edit : "all",
    search: params.get("q") ?? "",
    sizes: [...new Set(params.getAll("size"))].filter((size) =>
      sizeOrder.includes(size),
    ),
    price: Number.isFinite(price)
      ? Math.max(0, Math.min(maxPrice, price))
      : maxPrice,
    sort: params.get("sort") ?? "featured",
    savedOnly: params.get("saved") === "true",
  }

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (
      !value ||
      value === "all" ||
      (key === "sort" && value === "featured") ||
      (key === "page" && value === "1") ||
      (key === "price" && Number(value) === maxPrice)
    )
      next.delete(key)
    else next.set(key, value)
    if (key !== "page") next.delete("page")
    setParams(next, {
      preventScrollReset: true,
      replace: key === "q" || key === "price",
    })
  }

  function toggleSize(size: string) {
    const next = new URLSearchParams(params)
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((item) => item !== size)
      : [...filters.sizes, size]
    next.delete("size")
    next.delete("page")
    sizes.forEach((item) => next.append("size", item))
    setParams(next, { preventScrollReset: true })
  }

  function clear() {
    setParams({}, { preventScrollReset: true })
  }

  const searchWords = filters.search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const results = products
    .filter((product) => {
      const searchable =
        `${product.name} ${product.type} ${product.category} ${product.description}`.toLowerCase()
      return (
        (filters.category === "all" ||
          product.category.toLowerCase() === filters.category) &&
        (filters.edit === "all" ||
          (filters.edit === "new" && product.badge === "NEW") ||
          (filters.edit === "featured" && product.badge === "BEST SELLER") ||
          (filters.edit === "sale" &&
            (product.originalPrice ?? product.price) > product.price)) &&
        searchWords.every((word) => searchable.includes(word)) &&
        (!filters.sizes.length ||
          filters.sizes.some((size) => product.sizes.includes(size))) &&
        product.price <= filters.price &&
        (!filters.savedOnly || saved.includes(product.id))
      )
    })
    .sort((a, b) => {
      if (filters.sort === "price-low") return a.price - b.price
      if (filters.sort === "price-high") return b.price - a.price
      if (filters.sort === "name") return a.name.localeCompare(b.name)
      if (filters.sort === "newest")
        return Number(b.badge === "NEW") - Number(a.badge === "NEW")
      return (
        Number(b.badge === "BEST SELLER") - Number(a.badge === "BEST SELLER")
      )
    })

  const activeCount =
    Number(filters.category !== "all") +
    Number(filters.edit !== "all") +
    Number(filters.price < maxPrice) +
    filters.sizes.length
  const hasFilters =
    activeCount > 0 ||
    filters.edit !== "all" ||
    Boolean(filters.search) ||
    filters.savedOnly
  const filterProps = {
    filters,
    products,
    maxPrice,
    update,
    toggleSize,
    clear,
    onSizeGuide: () => helpTopic("Size guide"),
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const requestedPage = Number(params.get("page") ?? 1)
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(requestedPage)))
    : 1
  const firstResult = (currentPage - 1) * PAGE_SIZE
  const pageProducts = results.slice(firstResult, firstResult + PAGE_SIZE)
  const recommendations = recommendationOrder.flatMap((id) => {
    const product = products.find((item) => item.id === id)
    return product ? [product] : []
  })

  function changePage(page: number) {
    update("page", String(page))
    scrollToProducts()
  }

  return (
    <div className="shop-page text-espresso">
      <section
        className="shop-poster relative h-72 overflow-hidden sm:h-96 lg:h-112"
        aria-labelledby="shop-title"
      >
        <img
          className="shop-poster-image absolute inset-0"
          src="/images/hero-court.jpg"
          alt="A tennis player on a warm, sunlit terracotta court"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-espresso/20" />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 pt-5 text-ivory sm:px-10">
          <nav
            className="flex items-center gap-2 text-xs"
            aria-label="Breadcrumb"
          >
            <Link className="py-2 hover:underline" to="/">
              Home
            </Link>
            <ChevronRight size={12} strokeWidth={1.5} />
            <span aria-current="page">Shop</span>
          </nav>
          <button
            className="flex min-h-11 items-center gap-2 text-xs"
            type="button"
            onClick={openBag}
            aria-label={`Open shopping bag, ${bagCount} items`}
          >
            <ShoppingBag size={16} strokeWidth={1.5} /> Your bag{" "}
            <span className="ml-1 rounded-full border border-ivory/30 px-2 py-0.5 tabular-nums">
              {bagCount}
            </span>
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          <h1
            id="shop-title"
            className="shop-poster-title font-editorial text-9xl font-medium tracking-tight text-ivory"
          >
            Shop
          </h1>
        </div>
      </section>

      <div className="shop-catalog-shell relative z-10 mx-4 -mt-12 rounded-t-xl px-4 pb-12 pt-6 sm:mx-8 sm:px-7 sm:pt-7 lg:mx-auto lg:-mt-16 lg:max-w-7xl lg:px-10">
        <div className="flex flex-col gap-5 border-b border-espresso/10 pb-6 md:flex-row md:items-center md:justify-between">
          <h2 className="font-editorial text-3xl font-medium tracking-tight lg:text-4xl">
            All you need to play.
          </h2>
          <form
            className="shop-search-form md:w-1/2 md:max-w-md"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              scrollToProducts()
            }}
          >
            <Search
              className="shrink-0 text-clay"
              size={15}
              strokeWidth={1.5}
            />
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search products</span>
              <input
                className="min-h-10 w-full min-w-0 bg-transparent py-2 text-xs placeholder:text-clay/80"
                type="search"
                placeholder="Search the BeastSports shop"
                value={filters.search}
                onChange={(event) => update("q", event.target.value)}
              />
            </label>
            <button className="shop-search-submit" type="submit">
              Search
            </button>
          </form>
        </div>

        <section
          id="shop-products"
          className="mt-7 grid gap-8 lg:grid-cols-12 lg:gap-9"
          aria-label="Shop product catalog"
        >
          <aside
            className="hidden self-start lg:col-span-3 lg:block xl:col-span-2"
            aria-label="Product filters"
          >
            <FilterPanel {...filterProps} />
          </aside>
          <div className="min-w-0 lg:col-span-9 xl:col-span-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p
                className="text-xs text-clay"
                aria-live="polite"
                aria-atomic="true"
              >
                {results.length ? (
                  <>
                    Showing {firstResult + 1}–
                    {Math.min(firstResult + PAGE_SIZE, results.length)} of{" "}
                    <span className="font-medium text-espresso">
                      {results.length}
                    </span>{" "}
                    essentials
                  </>
                ) : (
                  "No matching essentials"
                )}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="shop-filter-trigger"
                  type="button"
                  onClick={() => filterDialog.current?.showModal()}
                  aria-label="Open product filters"
                >
                  <SlidersHorizontal size={14} strokeWidth={1.5} /> Filters{" "}
                  {activeCount > 0 && <span>({activeCount})</span>}
                </button>
                <button
                  className="shop-saved-toggle"
                  type="button"
                  aria-pressed={filters.savedOnly}
                  onClick={() =>
                    update("saved", filters.savedOnly ? "" : "true")
                  }
                >
                  {filters.savedOnly && <Check size={12} strokeWidth={1.5} />}{" "}
                  Saved <span className="tabular-nums">({saved.length})</span>
                </button>
                <label className="flex items-center gap-2 text-xs text-clay">
                  Sort by
                  <span className="relative">
                    <select
                      className="min-h-11 max-w-full cursor-pointer appearance-none bg-transparent py-2 pl-2 pr-6 font-medium text-espresso"
                      aria-label="Sort products"
                      value={filters.sort}
                      onChange={(event) => update("sort", event.target.value)}
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest arrivals</option>
                      <option value="price-low">Price: low to high</option>
                      <option value="price-high">Price: high to low</option>
                      <option value="name">Name: A–Z</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
                      size={13}
                      strokeWidth={1.5}
                    />
                  </span>
                </label>
              </div>
            </div>
            {hasFilters && (
              <div
                className="mb-6 flex flex-wrap items-center gap-2"
                aria-label="Active filters"
              >
                {filters.category !== "all" && (
                  <button
                    className="shop-filter-chip"
                    type="button"
                    onClick={() => update("category", "all")}
                  >
                    {
                      categories.find((item) => item.value === filters.category)
                        ?.label
                    }
                    <X size={12} />
                    <span className="sr-only">Remove category filter</span>
                  </button>
                )}
                {filters.price < maxPrice && (
                  <button
                    className="shop-filter-chip"
                    type="button"
                    onClick={() => update("price", String(maxPrice))}
                  >
                    Under {money(filters.price)}
                    <X size={12} />
                    <span className="sr-only">Remove price filter</span>
                  </button>
                )}
                {filters.edit !== "all" && (
                  <button
                    className="shop-filter-chip"
                    type="button"
                    onClick={() => update("edit", "all")}
                  >
                    {edits.find((item) => item.value === filters.edit)?.label}
                    <X size={12} />
                    <span className="sr-only">Remove shop edit filter</span>
                  </button>
                )}
                {filters.sizes.map((size) => (
                  <button
                    className="shop-filter-chip"
                    type="button"
                    key={size}
                    onClick={() => toggleSize(size)}
                  >
                    {size === "One size" || size.startsWith("Size ")
                      ? size
                      : `Size ${size}`}
                    <X size={12} />
                    <span className="sr-only">Remove size filter</span>
                  </button>
                ))}
                <button
                  className="min-h-10 px-2 text-xs text-clay underline underline-offset-4"
                  type="button"
                  onClick={clear}
                >
                  Clear all
                </button>
              </div>
            )}
            {results.length ? (
              <div className="shop-product-grid grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 md:gap-y-10 lg:grid-cols-3">
                {pageProducts.map(renderProduct)}
              </div>
            ) : (
              <div
                className="rounded-md bg-parchment px-6 py-20 text-center"
                role="status"
              >
                <Search
                  className="mx-auto mb-5 text-clay"
                  size={24}
                  strokeWidth={1.25}
                />
                <h2 className="font-editorial text-4xl">
                  A fresh start for your search.
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-clay">
                  We haven’t found a match for this line-up. Try a different
                  size, category, or a little less filtering.
                </p>
                <button
                  className="store-button mx-auto mt-6"
                  type="button"
                  onClick={clear}
                >
                  Explore all essentials{" "}
                  <ArrowRight size={15} strokeWidth={1.5} />
                </button>
              </div>
            )}
            {results.length > 0 && (
              <nav
                className="mt-10 flex items-center justify-between gap-2 sm:gap-3 border-t border-espresso/10 pt-5"
                aria-label="Product pagination"
              >
                <button
                  className="shop-page-step"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  <ArrowLeft size={14} strokeWidth={1.5} />
                  <span className="max-sm:sr-only">Previous</span>
                </button>
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* First, last and the pages around the current one, so the row fits on a phone. */}
                  {[...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
                    .filter((page) => page >= 1 && page <= totalPages)
                    .sort((a, b) => a - b)
                    .flatMap((page, index, pages) =>
                      index > 0 && page - pages[index - 1] > 1 ? [-page, page] : [page],
                    )
                    .map((page) => page < 0 ? (
                    <span key={page} className="text-xs text-espresso/50" aria-hidden="true">…</span>
                  ) : (
                    <button
                      className="shop-page-number"
                      key={page}
                      type="button"
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                      onClick={() => changePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="shop-page-step"
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  <span className="max-sm:sr-only">Next</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </nav>
            )}
          </div>
        </section>

        <section
          className="mt-16 sm:mt-20"
          aria-labelledby="shop-recommendations-title"
        >
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="shop-recommendations-title"
              className="min-w-0 font-editorial text-2xl font-medium tracking-tight sm:text-4xl"
            >
              Explore our recommendations.
            </h2>
            <div
              className="flex shrink-0 gap-2 self-end"
              role="group"
              aria-label="Recommendation controls"
            >
              <button
                className="shop-rail-button"
                type="button"
                disabled={!railState.left}
                onClick={() => scrollRecommendations(-1)}
                aria-label="Previous recommendations"
                aria-controls="shop-recommendations"
              >
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                className="shop-rail-button"
                type="button"
                disabled={!railState.right}
                onClick={() => scrollRecommendations(1)}
                aria-label="Next recommendations"
                aria-controls="shop-recommendations"
              >
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <div
            id="shop-recommendations"
            className="shop-recommendations-track"
            ref={recommendationRail}
            role="group"
            aria-label="Recommended products"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault()
                scrollRecommendations(event.key === "ArrowLeft" ? -1 : 1)
              }
            }}
          >
            {recommendations.map(renderProduct)}
          </div>
        </section>

        <section
          className="shop-community mt-14 grid gap-8 rounded-xl bg-espresso px-6 py-9 text-ivory sm:mt-20 sm:px-10 sm:py-11 md:grid-cols-2 md:items-end"
          aria-labelledby="shop-community-title"
        >
          <div>
            <h2
              id="shop-community-title"
              className="font-editorial text-4xl font-medium leading-none tracking-tight sm:text-5xl"
            >
              Ready for your
              <br />
              next move?
            </h2>
            <a
              className="shop-community-link"
              href="mailto:hello@beastsports.com?subject=Keep%20me%20in%20the%20loop"
              aria-label="Email BeastSports to join the community"
            >
              <span>Stay in the loop</span>
              <span className="shop-community-link-action">
                Say hello <ArrowRight size={13} strokeWidth={1.5} />
              </span>
            </a>
            <p className="mt-3 text-xs text-ivory/60">Opens your email app.</p>
          </div>
          <div className="max-w-sm md:justify-self-end">
            <p className="store-eyebrow text-ivory">FOR THE LOVE OF THE GAME</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              New collections, fresh perspectives, and a little motivation for
              the everyday athlete. Good things are ahead.
            </p>
          </div>
        </section>
      </div>

      <dialog
        className="shop-filter-dialog fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-sm overflow-y-auto bg-ivory p-6 text-espresso backdrop:bg-espresso/50"
        ref={filterDialog}
        aria-labelledby="filter-dialog-title"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 id="filter-dialog-title" className="font-editorial text-3xl">
            Your line-up.
          </h2>
          <button
            className="grid size-11 shrink-0 place-items-center"
            type="button"
            onClick={() => filterDialog.current?.close()}
            aria-label="Close product filters"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>
        <FilterPanel {...filterProps} />
        <div className="sticky -bottom-6 mt-6 border-t border-espresso/15 bg-ivory py-5">
          <button
            className="store-button"
            type="button"
            onClick={() => filterDialog.current?.close()}
          >
            Show {results.length} products{" "}
            <ArrowRight size={15} strokeWidth={1.5} />
          </button>
        </div>
      </dialog>
    </div>
  )
}
