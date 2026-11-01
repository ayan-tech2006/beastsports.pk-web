import { useId, useRef, useState, type KeyboardEvent } from "react"
import { Link, useOutletContext, useParams } from "react-router"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import type { Product, StorefrontContext } from "@/Storefront"
import StockNote from "@/components/StockNote"
import { getProductDetails, productGalleryViews } from "@/lib/product-details"
import { getProductImageUrl, money } from "@/data/products"
import "../product.css"

const tabs = [
  { id: "details", label: "Details" },
  { id: "materials", label: "Materials" },
  { id: "fit", label: "Size & fit" },
  { id: "shipping", label: "Shipping & returns" },
] as const
type ProductTab = typeof tabs[number]["id"]

function ProductDetail({
  product,
  store,
}: {
  product: Product
  store: StorefrontContext
}) {
  const details = getProductDetails(product)
  const id = useId().replace(/:/g, "")
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.includes("M") ? "M" : product.sizes[0],
  )
  const [selectedColor, setSelectedColor] = useState(details.colors[0]?.name)
  const [activeTab, setActiveTab] = useState<ProductTab>("details")
  const [zoomed, setZoomed] = useState(false)
  const lightbox = useRef<HTMLDialogElement>(null)
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const imageSrc = getProductImageUrl(product.image)
  // Real photos from the admin panel when there are several; otherwise crops of the one photo.
  const photos = [...new Set([product.image, ...product.gallery].filter(Boolean))]
  const gallery =
    photos.length > 1
      ? photos.map((src, i) => ({
          id: `photo-${i}`,
          label: `Photo ${i + 1}`,
          className: "pdp-view-full",
          src: getProductImageUrl(src),
        }))
      : productGalleryViews.map((view) => ({ ...view, src: imageSrc }))
  const view = gallery[activeImage] ?? gallery[0]
  const isSaved = store.saved.includes(product.id)
  const saving = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0
  const related = store.products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.category === product.category) -
        Number(a.category === product.category),
    )
    .slice(0, 4)

  function onGalleryKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = activeImage
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (activeImage + 1) % gallery.length
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next =
        (activeImage + gallery.length - 1) %
        gallery.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = gallery.length - 1
    else return
    event.preventDefault()
    setActiveImage(next)
    thumbnailRefs.current[next]?.focus()
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = tabs.findIndex((tab) => tab.id === activeTab)
    let next = current
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length
    else if (event.key === "ArrowLeft")
      next = (current + tabs.length - 1) % tabs.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = tabs.length - 1
    else return
    event.preventDefault()
    setActiveTab(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  function openZoom() {
    setZoomed(false)
    lightbox.current?.showModal()
  }

  return (
    <div className="pdp-page">
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-5 sm:px-8 lg:px-10">
        <nav
          className="mb-6 flex min-w-0 items-center gap-2 text-xs text-clay"
          aria-label="Breadcrumb"
        >
          <Link className="shrink-0 py-2 hover:underline" to="/">
            Home
          </Link>
          <ChevronRight className="shrink-0" size={12} />
          <Link className="shrink-0 py-2 hover:underline" to="/shop">
            Shop
          </Link>
          <ChevronRight className="shrink-0" size={12} />
          <span className="truncate text-espresso" aria-current="page">
            {product.name}
          </span>
        </nav>

        <section
          className="grid items-start gap-9 lg:grid-cols-12 lg:gap-12"
          aria-labelledby="product-title"
        >
          <div className="min-w-0 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-7">
              <div className="order-2 sm:order-1 sm:col-span-1">
                <div
                  className="grid grid-cols-4 gap-3 sm:grid-cols-1"
                  role="tablist"
                  aria-label="Product gallery views"
                  aria-orientation="vertical"
                  onKeyDown={onGalleryKeyDown}
                >
                  {gallery.map((image, index) => (
                    <button
                      className="pdp-thumbnail"
                      type="button"
                      role="tab"
                      id={`${id}-image-${index}`}
                      aria-label={`${image.label} of ${product.name}`}
                      aria-selected={activeImage === index}
                      aria-controls={`${id}-gallery-panel`}
                      tabIndex={activeImage === index ? 0 : -1}
                      key={image.id}
                      ref={(node) => {
                        thumbnailRefs.current[index] = node
                      }}
                      onClick={() => setActiveImage(index)}
                    >
                      <img
                        className={`pdp-gallery-photo ${image.className}`}
                        src={image.src}
                        alt=""
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
                <button
                  className="pdp-next-view mx-auto mt-4"
                  type="button"
                  aria-label="Next product view"
                  onClick={() =>
                    setActiveImage(
                      (activeImage + 1) % gallery.length,
                    )
                  }
                >
                  <ChevronDown size={18} strokeWidth={1.5} />
                </button>
              </div>
              <div className="order-1 min-w-0 sm:order-2 sm:col-span-6">
                <div
                  className="pdp-gallery-frame"
                  id={`${id}-gallery-panel`}
                  role="tabpanel"
                  aria-labelledby={`${id}-image-${activeImage}`}
                >
                  <img
                    className={`pdp-gallery-photo ${view.className}`}
                    src={view.src}
                    alt={`${product.name} — ${view.label.toLowerCase()}`}
                    fetchPriority="high"
                  />
                  <button
                    className="pdp-zoom-trigger"
                    type="button"
                    aria-label="Zoom product image"
                    onClick={openZoom}
                  >
                    <ZoomIn size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <p
                  className="mt-3 flex items-center justify-between gap-3 text-xs text-clay"
                  aria-live="polite"
                >
                  <span>{view.label}</span>
                  <span className="tabular-nums">
                    {String(activeImage + 1).padStart(2, "0")} /{" "}
                    {String(gallery.length).padStart(2, "0")}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div id="product-details" className="min-w-0 lg:col-span-5">
            <span className="inline-flex rounded-sm bg-parchment px-3 py-1.5 text-xs">
              {product.badge === "NEW"
                ? "New arrival"
                : product.badge === "BEST SELLER"
                  ? "Best seller"
                  : "The BeastSports edit"}
            </span>
            <h1
              id="product-title"
              className="mt-4 font-editorial text-4xl font-medium leading-none tracking-tight sm:text-5xl"
            >
              {product.name}
            </h1>
            <div
              className="mt-4 flex flex-wrap items-center gap-3 text-xs"
              aria-label={`Rated ${product.rating} out of 5`}
            >
              <span className="flex gap-1 text-clay" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    size={14}
                    strokeWidth={1.5}
                    fill="currentColor"
                  />
                ))}
              </span>
              <span>
                {product.rating}{" "}
                {product.reviewsCount > 0 && (
                  <span className="text-clay">· {product.reviewsCount} reviews</span>
                )}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className="text-3xl font-medium tracking-tight">
                {money(product.price)}
              </p>
              {product.originalPrice && (
                <del className="text-sm text-clay/70">
                  {money(product.originalPrice)}
                </del>
              )}
              {saving > 0 && (
                <span className="rounded-sm bg-espresso px-2.5 py-1 text-xs text-ivory">
                  {saving}% OFF
                </span>
              )}
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-clay">
              {product.description}
            </p>

            <div className="my-6 border-t border-espresso/15" />
            {details.colors.length > 0 && (
            <fieldset>
              <legend className="mb-3 text-xs">
                <span className="font-medium">Color:</span>{" "}
                <span>{selectedColor}</span>
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {details.colors.map((color) => (
                  <button
                    className="pdp-color-choice"
                    type="button"
                    key={color.name}
                    aria-label={`Choose ${color.name} color`}
                    aria-pressed={selectedColor === color.name}
                    onClick={() => setSelectedColor(color.name)}
                  >
                    <span className={`pdp-color-chip ${color.swatch}`} />
                  </button>
                ))}
              </div>
            </fieldset>
            )}

            <fieldset className="mt-5">
              <legend className="sr-only">Choose your size</legend>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs">
                  <span className="font-medium">
                    {product.sizes.length === 1 ? "Fit:" : "Size:"}
                  </span>{" "}
                  {selectedSize}
                </p>
                <button
                  className="flex min-h-10 items-center gap-2 text-xs underline underline-offset-4"
                  type="button"
                  onClick={() => store.helpTopic("Size guide")}
                >
                  <Ruler size={14} strokeWidth={1.5} /> Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    className="pdp-size-choice"
                    type="button"
                    aria-label={`Choose size ${size}`}
                    aria-pressed={selectedSize === size}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>

            <StockNote stock={product.stock} className="mt-6" />
            <div className="mt-3 flex items-stretch gap-3">
              <button
                className="store-button pdp-add-button"
                type="button"
                disabled={product.stock <= 0}
                onClick={() =>
                  store.addToBag(product, selectedSize, selectedColor)
                }
              >
                {product.stock <= 0 ? (
                  "Sold out"
                ) : (
                  <>
                    <ShoppingBag size={20} strokeWidth={1.5} /> Add to bag
                  </>
                )}
              </button>
              <button
                className="pdp-wishlist"
                type="button"
                aria-label={`${isSaved ? "Unsave" : "Save"} ${product.name}`}
                aria-pressed={isSaved}
                onClick={() => store.toggleSaved(product.id)}
              >
                <Heart
                  size={23}
                  strokeWidth={1.5}
                  fill={isSaved ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-espresso/10 pt-5">
              <button
                className="pdp-trust-item"
                type="button"
                onClick={() => store.helpTopic("Shipping & delivery")}
              >
                <Truck size={20} strokeWidth={1.4} />
                <span>
                  <strong>Nationwide delivery</strong>
                  <span>TCS or Post Office</span>
                </span>
              </button>
              <button
                className="pdp-trust-item"
                type="button"
                onClick={() => store.helpTopic("Returns & exchanges")}
              >
                <RotateCcw size={19} strokeWidth={1.4} />
                <span>
                  <strong>Easy returns</strong>
                  <span>30 days to decide</span>
                </span>
              </button>
              <button
                className="pdp-trust-item"
                type="button"
                onClick={() => store.helpTopic("Terms")}
              >
                <ShieldCheck size={20} strokeWidth={1.4} />
                <span>
                  <strong>Pay your way</strong>
                  <span>Cash on delivery or advance</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <section
          className="mt-12 grid min-w-0 items-start gap-8 border-t border-espresso/10 pt-8 md:mt-16 md:grid-cols-2 md:gap-10"
          aria-label="Product information"
        >
          <div className="min-w-0">
            <div
              className="pdp-tab-list"
              role="tablist"
              aria-label="Product information tabs"
              onKeyDown={onTabKeyDown}
            >
              {tabs.map((tab, index) => (
                <button
                  className="pdp-tab"
                  type="button"
                  key={tab.id}
                  role="tab"
                  id={`${id}-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${id}-information-panel`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              id={`${id}-information-panel`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${activeTab}`}
              tabIndex={0}
              className="pt-5"
            >
              <p className="text-sm leading-relaxed text-clay">
                {activeTab === "details"
                  ? product.description
                  : activeTab === "materials"
                    ? details.materials
                    : activeTab === "fit"
                      ? details.fit
                      : `Delivered anywhere in Pakistan. Delivery for this item: ${money(product.delivery.postOffice)} by Post Office or ${money(product.delivery.tcs)} by TCS.`}
              </p>
              {activeTab === "details" || activeTab === "materials" ? (
                <ul className="mt-5 space-y-3">
                  {(activeTab === "details"
                    ? details.features
                    : details.care
                  ).map((feature) => (
                    <li
                      className="flex items-start gap-3 text-xs leading-relaxed"
                      key={feature}
                    >
                      <Check
                        className="mt-0.5 shrink-0 text-clay"
                        size={14}
                        strokeWidth={1.5}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : activeTab === "fit" ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      className="rounded-sm border border-espresso/15 px-3 py-2 text-xs"
                      key={size}
                    >
                      {size}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  <button
                    className="min-h-11 text-xs underline underline-offset-4"
                    type="button"
                    onClick={() => store.helpTopic("Shipping & delivery")}
                  >
                    Shipping information
                  </button>
                  <button
                    className="min-h-11 text-xs underline underline-offset-4"
                    type="button"
                    onClick={() => store.helpTopic("Returns & exchanges")}
                  >
                    Returns & exchanges
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            className="pdp-detail-photo"
            type="button"
            aria-label="View product texture close-up"
            onClick={() => {
              setActiveImage(2)
              openZoom()
            }}
          >
            <img
              className="pdp-gallery-photo pdp-view-texture"
              src={imageSrc}
              alt={`${product.name} — a closer look at the details`}
              loading="lazy"
            />
          </button>
        </section>

        <section
          className="mt-12 sm:mt-16"
          aria-labelledby="related-products-title"
        >
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2
              id="related-products-title"
              className="font-editorial text-3xl font-medium tracking-tight sm:text-4xl"
            >
              You may also like.
            </h2>
            <Link
              className="flex min-h-11 shrink-0 items-center gap-2 text-xs"
              to="/shop"
            >
              View all <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="pdp-related-grid grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
            {related.map(store.renderProduct)}
          </div>
        </section>
      </div>

      <dialog
        className="pdp-lightbox"
        ref={lightbox}
        aria-labelledby={`${id}-zoom-title`}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            event.currentTarget.close()
        }}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <p id={`${id}-zoom-title`} className="truncate text-sm">
            {product.name} · {view.label}
          </p>
          <button
            className="grid size-11 shrink-0 place-items-center"
            type="button"
            aria-label="Close image zoom"
            onClick={() => lightbox.current?.close()}
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <button
          className={`pdp-lightbox-image ${zoomed ? "is-zoomed" : ""}`}
          type="button"
          aria-label={
            zoomed ? "Zoom out product image" : "Zoom in product image"
          }
          aria-pressed={zoomed}
          onClick={() => setZoomed(!zoomed)}
        >
          <img
            className={`pdp-gallery-photo ${view.className}`}
            src={imageSrc}
            alt={`${product.name} — enlarged ${view.label.toLowerCase()}`}
          />
          <span className="pdp-lightbox-hint">
            {zoomed ? (
              <ZoomOut size={19} strokeWidth={1.5} />
            ) : (
              <ZoomIn size={19} strokeWidth={1.5} />
            )}
          </span>
        </button>
      </dialog>
    </div>
  )
}

export default function ProductPage() {
  const { productId } = useParams()
  const store = useOutletContext<StorefrontContext>()
  const product = store.products.find((item) => item.id === productId)
  if (!product) {
    return (
      <section className="px-6 py-20 text-center">
        <p className="store-eyebrow text-clay">A LITTLE OFF THE LINE-UP</p>
        <h1 className="mt-4 font-editorial text-4xl">
          Let’s find your next favourite.
        </h1>
        <p className="mt-4 text-sm text-clay">
          That product isn’t in this collection.
        </p>
        <Link className="store-button mt-6" to="/shop">
          Back to the shop <ArrowRight size={16} />
        </Link>
      </section>
    )
  }
  return <ProductDetail key={product.id} product={product} store={store} />
}
