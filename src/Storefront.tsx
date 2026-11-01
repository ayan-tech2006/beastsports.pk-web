import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Link, Outlet, useLocation } from "react-router"
import TimedDeal from "@/components/ui/timed-deal"
import StockNote from "@/components/StockNote"
import SiteHeader from "@/components/SiteHeader"
import { getProductDetails } from "@/lib/product-details"
import { useScrollReveal } from "@/lib/reveal"
import "./storefront.css"

import { allProducts, collectionRoots, collectionsById, homeContent, type Collection, getProductImageUrl, type Product as ProductType, type SportCategory, money } from "@/data/products"

type Category = "All" | "Men" | "Women" | "Equipment" | "Accessories"
export type Product = ProductType
export type BagItem = {
  id: string
  size: string
  quantity: number
  color?: string
}
// Same choices as the app's checkout.
export type PaymentMethod = "Cash on Delivery" | "Easypaisa" | "JazzCash" | "Bank transfer"
export type DeliveryAgency = "Post Office" | "TCS"
export type Order = {
  id: string
  date: string
  customer: {
    fullName: string
    phone: string
    email?: string
    city: string
    address: string
    notes?: string
  }
  paymentMethod: PaymentMethod
  deliveryAgency: DeliveryAgency
  items: Array<{
    id: string
    name: string
    price: number
    image: string
    size: string
    color?: string
    quantity: number
  }>
  subtotal: number
  shipping: number
  total: number
}
type Story = {
  title: string
  category: string
  image?: string
  body: string[]
}
type IconName = "arrow" | "heart" | "bag" | "close" | "plus" | "minus" | "truck" | "return" | "shield" | "support"
type ShopIconProps = {
  name: IconName
  size?: number
}
export type StorefrontContext = {
  products: Product[]
  renderProduct: (product: Product) => ReactNode
  saved: string[]
  bag: BagItem[]
  bagCount: number
  bagTotal: number
  openBag: () => void
  helpTopic: (title: string) => void
  addToBag: (product: Product, size?: string, color?: string) => void
  changeQuantity: (id: string, size: string, amount: number, color?: string) => void
  removeFromBag: (id: string, size: string, color?: string) => void
  clearBag: () => void
  toggleSaved: (id: string) => void
  lastOrder: Order | null
  setLastOrder: (order: Order | null) => void
}
const products: Product[] = allProducts

// How many more of a product fit in the bag before it passes the stock.
export function roomFor(id: string, bag: BagItem[]) {
  const stock = products.find((p) => p.id === id)?.stock ?? 0
  const inBag = bag.reduce((sum, item) => (item.id === id ? sum + item.quantity : sum), 0)
  return Math.max(0, stock - inBag)
}

const discount = (p: Product) =>
  p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0

// A match-day kit from the live catalog: a bat, a ball and something to protect them.
const kitPicks: [include: RegExp, exclude?: RegExp][] = [
  [/\bbat\b/, /cover|sheet|grip|glove|deal|kit|set|wicket|ball and/],
  [/rubber ball|cricket balls/],
  [/bat cover|protector sheet/],
]
const kitProducts = kitPicks
  .map(([include, exclude]) =>
    products.find((p) => {
      const name = p.name.toLowerCase()
      return include.test(name) && !exclude?.test(name)
    }),
  )
  .filter((p, i, list): p is Product => !!p && list.indexOf(p) === i)
const kitTotal = kitProducts.reduce((sum, product) => sum + product.price, 0)
const kitOriginalTotal = kitProducts.reduce(
  (sum, product) => sum + (product.originalPrice ?? product.price),
  0,
)
const biggestSale = [...products].sort((a, b) => discount(b) - discount(a))[0]
const maxSaleOff = Math.round(discount(biggestSale) * 100)

const collectionPath = (c: Collection): string =>
  c.parent ? `${collectionPath(c.parent)}/${c.id}` : `/collections/${c.id}`

// The two picture cards: the admin's pair, or else the two largest top-level collections
// (skipping catch-alls like "All Product" that hold nearly the whole catalog).
const featureCards =
  homeContent.featureCards.length === 2
    ? homeContent.featureCards.map((card) => ({
        ...card,
        href: collectionPath(collectionsById.get(card.collectionId)!),
      }))
    : [...collectionRoots]
        .filter((c) => c.products.length < products.length * 0.9)
        .sort((a, b) => b.products.length - a.products.length)
        .slice(0, 2)
        .map((c) => ({
          eyebrow: `${c.products.length} PRODUCTS`,
          title: c.name,
          image: c.image || c.products[0]?.image || "",
          href: collectionPath(c),
        }))

// The countdown deal set in the admin panel; hidden when none is set or its time is up.
const deal = homeContent.deal
const dealProduct = deal ? products.find((p) => p.id === deal.productId) : undefined
const showDeal = Boolean(deal && dealProduct && Date.parse(deal.endsAt) > Date.now())

const image = (name: string) => getProductImageUrl(name)

function bagColor(item: Pick<BagItem, "id" | "color">) {
  const product = products.find((product) => product.id === item.id)
  if (item.color || !product) return item.color
  return getProductDetails(product).colors[0]?.name
}

function closeOnBackdropClick(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return
  const bounds = event.currentTarget.getBoundingClientRect()
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) {
    event.currentTarget.close()
  }
}

function ShopIcon({ name, size = 20 }: ShopIconProps) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    heart: (
      <path d="M20.2 4.8a5.4 5.4 0 0 0-7.6 0l-.6.6-.6-.6a5.4 5.4 0 0 0-7.6 7.6L12 21l8.2-8.6a5.4 5.4 0 0 0 0-7.6Z" />
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    truck: (
      <>
        <path d="M2 5h13v12H2V5ZM15 9h4l3 4v4h-7" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    return: (
      <>
        <path d="M4 10a8 8 0 1 1 0 6M4 4v6h6" />
        <path d="m10 14 2 2 4-4" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    support: (
      <>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1M20 17v2a2 2 0 0 1-2 2h-5" />
        <rect x="2" y="11" width="4" height="7" rx="2" />
        <rect x="18" y="11" width="4" height="7" rx="2" />
      </>
    ),
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function ProductCard({
  product,
  saved,
  onSave,
  onPreview,
}: {
  product: Product
  saved: boolean
  onSave: () => void
  onPreview: () => void
}) {
  return (
    <article className="store-product">
      <div className={`store-product-photo photo-${product.id}`}>
        <Link
          className="product-preview"
          to={`/product/${product.id}`}
          aria-label={`View ${product.name}`}
        >
          <img src={image(product.image)} alt={product.name} loading="lazy" />
        </Link>
        {product.stock <= 0 ? (
          <span className="product-badge">SOLD OUT</span>
        ) : (
          product.badge && <span className="product-badge">{product.badge}</span>
        )}
        <button
          className={`product-save ${saved ? "is-saved" : ""}`}
          type="button"
          aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          <ShopIcon name="heart" size={16} />
        </button>
      </div>
      <div className="store-product-copy">
        <p className="product-kind">{product.type}</p>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-price">
          {money(product.price)}{" "}
          {product.originalPrice && <del>{money(product.originalPrice)}</del>}
        </p>
        <button
          className="store-button product-add"
          type="button"
          disabled={product.stock <= 0}
          onClick={onPreview}
        >
          {product.stock <= 0 ? (
            "Sold out"
          ) : (
            <>
              Quick add <ShopIcon name="plus" size={13} />
            </>
          )}
        </button>
      </div>
    </article>
  )
}

export default function Storefront() {
  const { pathname, hash } = useLocation()
  const isHome = pathname === "/"
  const isProductPage = pathname.startsWith("/product/")
  const [category, setCategory] = useState<Category>("All")
  const [showAllSale, setShowAllSale] = useState(false)
  const [kitSize, setKitSize] = useState("M")
  const [saved, setSaved] = useState<string[]>([])
  const [bag, setBag] = useState<BagItem[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem("beast_sports_bag")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem("beast_sports_last_order")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [notice, setNotice] = useState("")
  const productDialog = useRef<HTMLDialogElement>(null)
  const bagDialog = useRef<HTMLDialogElement>(null)
  const storyDialog = useRef<HTMLDialogElement>(null)
  const storefrontRoot = useRef<HTMLDivElement>(null)
  useScrollReveal(storefrontRoot)
  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0)
  const bagTotal = bag.reduce(
    (sum, item) =>
      sum +
      (products.find((product) => product.id === item.id)?.price ?? 0) *
        item.quantity,
    0,
  )
  const categoryProducts = products.filter(
    (product) => category === "All" || product.category === category,
  )
  const newProducts = categoryProducts.filter(
    (product) => product.badge === "NEW",
  )
  const saleProducts = categoryProducts
    .filter(
      (product) =>
        product.originalPrice && product.originalPrice > product.price,
    )
    .sort((a, b) => Number(a.badge === "NEW") - Number(b.badge === "NEW"))
  const visibleSaleProducts = showAllSale
    ? saleProducts
    : saleProducts.slice(0, 4)

  useEffect(() => {
    const pageProduct = products.find(
      (product) => pathname === `/product/${product.id}`,
    )
    document.title = pageProduct
      ? `${pageProduct.name} | BeastSports`
      : isHome
        ? "BeastSports | Premium Sports Gear"
        : "Shop | BeastSports"
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: "instant" })
      } else {
        window.scrollTo({ top: 0, behavior: "instant" })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash, isHome])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(""), 5000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  function shopCategory(nextCategory: Category) {
    setCategory(nextCategory)
    setShowAllSale(false)
  }

  function openProduct(product: Product) {
    setActiveProduct(product)
    setSelectedSize(product.sizes.includes("M") ? "M" : product.sizes[0])
    productDialog.current?.showModal()
  }

  function openStory(story: Story) {
    setActiveStory(story)
    storyDialog.current?.showModal()
  }

  // The bag never holds more of a product than is in stock (same stock as the app).
  function addBagItems(items: BagItem[]) {
    setBag((current) => {
      const next = [...current]
      for (const item of items) {
        const addition = { ...item, quantity: Math.min(item.quantity, roomFor(item.id, next)) }
        if (addition.quantity <= 0) continue
        const color = bagColor(addition)
        const index = next.findIndex(
          (item) =>
            item.id === addition.id &&
            item.size === addition.size &&
            bagColor(item) === color,
        )
        if (index === -1) next.push({ ...addition, color })
        else
          next[index] = {
            ...next[index],
            quantity: next[index].quantity + addition.quantity,
          }
      }
      return next
    })
  }

  useEffect(() => {
    try {
      localStorage.setItem("beast_sports_bag", JSON.stringify(bag))
    } catch {
      // ignore
    }
  }, [bag])

  function addToBag(product: Product, size?: string, color?: string) {
    if (roomFor(product.id, bag) <= 0) {
      setNotice(
        product.stock <= 0
          ? `${product.name} is sold out.`
          : `Only ${product.stock} of ${product.name} in stock, and they're all in your bag.`,
      )
      return
    }
    const chosenSize = size || selectedSize || (product.sizes.includes("M") ? "M" : product.sizes[0])
    addBagItems([{ id: product.id, size: chosenSize, color, quantity: 1 }])
    productDialog.current?.close()
    setNotice(`${product.name} added to your bag.`)
  }

  function removeFromBag(id: string, size: string, color?: string) {
    setBag((current) =>
      current.filter(
        (item) =>
          !(
            item.id === id &&
            item.size === size &&
            (!color || bagColor(item) === color)
          ),
      ),
    )
  }

  function clearBag() {
    setBag([])
  }

  function addKitToBag() {
    addBagItems(
      kitProducts.filter((product) => roomFor(product.id, bag) > 0).map((product) => ({
        id: product.id,
        size: product.sizes.includes(kitSize) ? kitSize : product.sizes[0],
        quantity: 1,
      })),
    )
    setNotice(`All ${kitProducts.length} kit items added to your bag.`)
  }

  function changeQuantity(
    id: string,
    size: string,
    amount: number,
    color?: string,
  ) {
    setBag((current) =>
      current
        .map((item) =>
          item.id === id &&
          item.size === size &&
          bagColor(item) === bagColor({ id, color })
            ? { ...item, quantity: item.quantity + Math.min(amount, roomFor(id, current)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function helpTopic(title: string) {
    const content: Record<string, string[]> = {
      "Shipping & delivery": [
        "We deliver across Pakistan with TCS or Post Office.",
        "Each product has its own delivery charge for each courier. You see the exact charge at checkout, before you place the order.",
      ],
      "Returns & exchanges": [
        "Something not right with your order? Contact us with your order number and we’ll sort it out.",
        "The full details are on our Return & exchange policy page.",
      ],
      "Size guide": [
        "Each product shows only the sizes it comes in.",
        "Not sure which size to pick? Contact us before ordering and we’ll help.",
      ],
      Privacy: [
        "Your bag and saved products are kept in this browser only.",
        "When you place an order, we use your name, phone and address only to confirm and deliver it.",
      ],
      Terms: [
        "Prices are in Pakistani rupees and include current sale discounts. Delivery is added at checkout.",
        "Orders are confirmed by our team. For advance payments, we check your payment screenshot first.",
      ],
    }
    openStory({
      title,
      category: "HERE TO HELP",
      body: content[title] ?? [
        "Have a question? Email hello@beastsports.com and let’s talk.",
      ],
    })
  }

  function renderProduct(product: Product) {
    return (
      <ProductCard
        key={product.id}
        product={product}
        saved={saved.includes(product.id)}
        onSave={() => toggleSaved(product.id)}
        onPreview={() => openProduct(product)}
      />
    )
  }

  function toggleSaved(id: string) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return (
    <main className="site-canvas" id="home">
      <Link
        className="skip-link"
        to={
          isHome
            ? "/#collections"
            : isProductPage
              ? `${pathname}#product-details`
              : "/shop#shop-products"
        }
      >
        Skip to{" "}
        {isHome
          ? "collections"
          : isProductPage
            ? "product details"
            : "products"}
      </Link>
      <SiteHeader
        bagCount={bagCount}
        onOpenBag={() => bagDialog.current?.showModal()}
      />
      <div className="storefront" ref={storefrontRoot}>
        <Outlet
          context={
            {
              products,
              renderProduct,
              saved,
              bag,
              bagCount,
              bagTotal,
              openBag: () => bagDialog.current?.showModal(),
              helpTopic,
              addToBag,
              changeQuantity,
              removeFromBag,
              clearBag,
              toggleSaved,
              lastOrder,
              setLastOrder,
            } satisfies StorefrontContext
          }
        />
        {isHome && (
          <>
            <section
              className="arrivals-section store-section"
              id="new-arrivals"
              aria-labelledby="arrivals-title"
            >
              <div className="store-section-heading">
                <p className="store-eyebrow">FRESH IN. GAME ON.</p>
                <h2 id="arrivals-title">The everyday line-up.</h2>
                <p>Made for your next session. And everything in between.</p>
              </div>
              <section
                className="catalog-block new-arrivals-block"
                aria-labelledby="new-products-title"
              >
                <div className="catalog-block-heading">
                  <div>
                    <h3 id="new-products-title">
                      {category === "All"
                        ? "New Arrivals."
                        : `New Arrivals · ${category}`}
                    </h3>
                  </div>
                  {category === "All" ? (
                    <span>Fresh gear. Fresh possibilities.</span>
                  ) : (
                    <button
                      className="catalog-reset"
                      type="button"
                      onClick={() => shopCategory("All")}
                    >
                      Clear selection <ShopIcon name="close" size={13} />
                    </button>
                  )}
                </div>
                {newProducts.length ? (
                  <div className="store-product-grid">
                    {newProducts.map(renderProduct)}
                  </div>
                ) : (
                  <div className="catalog-empty">
                    <p>New arrivals for this collection are on the way.</p>
                    <button type="button" onClick={() => shopCategory("All")}>
                      Explore all new arrivals{" "}
                      <ShopIcon name="arrow" size={15} />
                    </button>
                  </div>
                )}
              </section>
              <section
                className="catalog-block sale-products-block"
                id="sale-products"
                aria-labelledby="sale-products-title"
              >
                <div className="catalog-block-heading">
                  <div>
                    <p className="store-eyebrow">MORE GAME. LESS SPEND.</p>
                    <h3 id="sale-products-title">
                      {category === "All"
                        ? "Sale Products."
                        : `Sale Products · ${category}`}
                    </h3>
                  </div>
                  <span className="catalog-sale-label">UP TO {maxSaleOff}% OFF</span>
                </div>
                {visibleSaleProducts.length ? (
                  <div className="store-product-grid">
                    {visibleSaleProducts.map(renderProduct)}
                  </div>
                ) : (
                  <div className="catalog-empty">
                    <p>No sale products in this collection right now.</p>
                    <button type="button" onClick={() => shopCategory("All")}>
                      Explore all sale products{" "}
                      <ShopIcon name="arrow" size={15} />
                    </button>
                  </div>
                )}
                {saleProducts.length > 4 && (
                  <button
                    className="catalog-show-more"
                    type="button"
                    aria-expanded={showAllSale}
                    onClick={() => setShowAllSale(!showAllSale)}
                  >
                    {showAllSale
                      ? "Show fewer sale products"
                      : `View all ${saleProducts.length} sale products`}
                    <ShopIcon name={showAllSale ? "minus" : "plus"} size={15} />
                  </button>
                )}
              </section>
            </section>

            {featureCards.length === 2 && (
              <section
                className="editorial-collections"
                id="collection-edit"
                aria-label="Featured collections"
              >
                {featureCards.map((card, index) => {
                  const photo = (
                    <div className="editorial-photo">
                      <img src={image(card.image)} alt="" loading="lazy" />
                    </div>
                  )
                  return (
                    <Link
                      key={card.href}
                      className={`editorial-card ${index === 0 ? "editorial-women" : "editorial-court"}`}
                      to={card.href}
                    >
                      {index === 0 && photo}
                      <div className="editorial-copy">
                        <div>
                          {card.eyebrow && <p className="store-eyebrow">{card.eyebrow}</p>}
                          <h2>{card.title}</h2>
                        </div>
                        <span className="editorial-arrow">
                          <ShopIcon name="arrow" size={25} />
                        </span>
                      </div>
                      {index === 1 && photo}
                    </Link>
                  )
                })}
              </section>
            )}

            <section
              className="featured-section store-section"
              id="featured"
              aria-labelledby="featured-title"
            >
              <div className="store-section-heading">
                <p className="store-eyebrow">THE ONES YOU COME BACK FOR</p>
                <h2 id="featured-title">Featured favourites.</h2>
                <p>Good gear earns its place in your everyday.</p>
              </div>
              <div className="store-product-grid">
                {[products[0], products[4], products[1], products[6]].map(
                  renderProduct,
                )}
              </div>
            </section>

            {showDeal && deal && dealProduct && (
              <TimedDeal
                product={{
                  name: dealProduct.name,
                  image: image(dealProduct.image),
                  price: dealProduct.price,
                  originalPrice: dealProduct.originalPrice ?? dealProduct.price,
                }}
                title={deal.title || dealProduct.name}
                endsAt={deal.endsAt}
                onShop={() => openProduct(dealProduct)}
                onBrowseSale={() => shopCategory("All")}
              />
            )}

            <section
              className="brand-section store-section"
              aria-label="Sports brands"
            >
              <p className="store-eyebrow">THE NAMES THAT KNOW THE GAME</p>
              <div className="brand-wordmarks">
                <span className="brand-nike">NIKE</span>
                <span className="brand-adidas">adidas</span>
                <span className="brand-puma">PUMA</span>
                <span className="brand-asics">asics</span>
                <span className="brand-reebok">Reebok</span>
                <span className="brand-nb">
                  new
                  <br />
                  balance
                </span>
              </div>
            </section>

            <section
              className="complete-kit-section store-section"
              id="complete-your-kit"
              aria-labelledby="complete-kit-title"
            >
              <div className="kit-visual">
                <p className="store-eyebrow">
                  EVERYTHING FOR YOUR NEXT INNINGS.
                </p>
                <div className="kit-product-grid">
                  {kitProducts.map((product, index) => (
                    <article
                      className={`kit-product kit-product-${index}`}
                      key={product.id}
                    >
                      <button
                        type="button"
                        onClick={() => openProduct(product)}
                        aria-label={`View ${product.name}`}
                      >
                        <img
                          src={image(product.image)}
                          alt={product.name}
                          loading="lazy"
                        />
                      </button>
                      <h3>{product.name}</h3>
                      <p>{money(product.price)}</p>
                    </article>
                  ))}
                </div>
                <span className="kit-visual-caption">
                  PICK IT UP. PLAY. DO IT AGAIN.
                </span>
              </div>
              <div className="kit-copy">
                <p className="store-eyebrow">THE MATCH-DAY KIT</p>
                <h2 id="complete-kit-title">Complete your kit.</h2>
                <p className="kit-description">
                  The bat, the ball and the gear that keeps them match-ready,
                  picked from this week’s line-up.
                </p>
                {kitProducts[0].sizes.length > 1 && (
                <fieldset className="product-sizes kit-size">
                  <legend>Choose your size</legend>
                  <div>
                    {kitProducts[0].sizes.map((size) => (
                      <label
                        className={kitSize === size ? "is-selected" : ""}
                        key={size}
                      >
                        <input
                          type="radio"
                          name="kit-size"
                          value={size}
                          checked={kitSize === size}
                          onChange={() => setKitSize(size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </fieldset>
                )}
                <div className="kit-price-summary">
                  <strong>{money(kitTotal)}</strong>
                  <del>{money(kitOriginalTotal)}</del>
                  <span>Save {money(kitOriginalTotal - kitTotal)}</span>
                </div>
                <button
                  className="store-button kit-add"
                  type="button"
                  onClick={addKitToBag}
                >
                  Add all {kitProducts.length} to bag <ShopIcon name="plus" size={16} />
                </button>
                <p className="kit-note">
                  Includes current sale prices. Delivery is added at checkout.
                </p>
              </div>
            </section>
          </>
        )}

        <section
          className="store-benefits store-section"
          aria-label="The BeastSports promise"
        >
          {([
            {
              icon: "truck",
              title: "Good gear. Delivered.",
              detail: "TCS or Post Office, anywhere in Pakistan.",
            },
            {
              icon: "return",
              title: "No-sweat returns.",
              detail: "A little peace of mind. 30 days to decide.",
            },
            {
              icon: "shield",
              title: "Only the real deal.",
              detail: "Authentic gear. No compromises.",
            },
            {
              icon: "support",
              title: "Real people. Real help.",
              detail: "We’re in your corner.",
            },
          ] as const).map((benefit) => (
            <div className="store-benefit" key={benefit.title}>
              <ShopIcon name={benefit.icon} size={27} />
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.detail}</p>
              </div>
            </div>
          ))}
        </section>

        <footer className="store-footer" id="footer">
          <div className="store-footer-top">
            <div className="footer-brand">
              <Link className="wordmark" to="/">
                <img className="wordmark-logo" src="/logo-mark.png" alt="" width={32} height={32} />
                BEASTSPORTS<span>®</span>
              </Link>
              <p>
                For the early starts.
                <br />
                For the love of the game.
                <br />
                For the beast in you.
              </p>
              <a className="footer-contact" href="mailto:hello@beastsports.com">
                Say hello <ShopIcon name="arrow" size={15} />
              </a>
            </div>
            <div className="store-footer-links">
              <h3>The collections</h3>
              {collectionRoots.slice(0, 5).map((c) => (
                <Link key={c.id} to={`/collections/${c.id}`}>
                  {c.name}
                </Link>
              ))}
              <Link to="/collections">All collections</Link>
              <Link to="/shop?edit=sale">The sale edit</Link>
            </div>
            <div className="store-footer-links">
              <h3>In your corner</h3>
              <Link to="/shipping-policy">Shipping & delivery</Link>
              <Link to="/return-policy">Returns & exchanges</Link>
              <Link to="/size-guide">Size guide</Link>
              <Link to="/faq">FAQs</Link>
              <Link to="/contact">Contact us</Link>
              <Link to="/cart">Your bag ({bagCount})</Link>
            </div>
            <div className="footer-community">
              <p className="store-eyebrow">GOOD THINGS ARE IN THE WORKS</p>
              <h2>
                Be part of
                <br />
                the next move.
              </h2>
              <p>
                New collections, fresh perspectives, and a little motivation for
                the everyday.
              </p>
              <a
                className="community-link"
                href="mailto:hello@beastsports.com?subject=Keep%20me%20in%20the%20loop"
              >
                Join the community <ShopIcon name="arrow" size={17} />
              </a>
              <span>Email us to hear what’s next.</span>
            </div>
          </div>
          <div className="store-footer-bottom">
            <p>© {new Date().getFullYear()} BeastSports.</p>
            <div className="flex items-center gap-4">
              <Link to="/about">About Us</Link>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
            <p className="footer-signoff">EVERY SPORT. EVERY AMBITION.</p>
          </div>
        </footer>

        <dialog
          className="store-dialog product-dialog"
          ref={productDialog}
          onClose={() => setActiveProduct(null)}
          onClick={closeOnBackdropClick}
          aria-labelledby="product-dialog-title"
        >
          {activeProduct && (
            <>
              <button
                className="dialog-close"
                type="button"
                aria-label="Close product details"
                onClick={() => productDialog.current?.close()}
              >
                <ShopIcon name="close" />
              </button>
              <div className="product-dialog-image">
                <img
                  src={image(activeProduct.image)}
                  alt={activeProduct.name}
                />
              </div>
              <div className="product-dialog-copy">
                <p className="store-eyebrow">
                  {activeProduct.category} / {activeProduct.type}
                </p>
                <h2 id="product-dialog-title">{activeProduct.name}</h2>
                <p className="product-price">
                  {money(activeProduct.price)}{" "}
                  {activeProduct.originalPrice && (
                    <del>{money(activeProduct.originalPrice)}</del>
                  )}
                </p>
                <p className="product-description">
                  {activeProduct.description}
                </p>
                <fieldset className="product-sizes">
                  <legend>
                    {activeProduct.sizes[0] === "One size"
                      ? "Fit"
                      : "Choose your size"}
                  </legend>
                  <div>
                    {activeProduct.sizes.map((size) => (
                      <label
                        key={size}
                        className={selectedSize === size ? "is-selected" : ""}
                      >
                        <input
                          type="radio"
                          name="product-size"
                          value={size}
                          checked={selectedSize === size}
                          onChange={() => setSelectedSize(size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <StockNote stock={activeProduct.stock} />
                <button
                  className="store-button"
                  type="button"
                  disabled={activeProduct.stock <= 0}
                  onClick={() => addToBag(activeProduct)}
                >
                  {activeProduct.stock <= 0 ? (
                    "Sold out"
                  ) : (
                    <>
                      Add to bag <ShopIcon name="plus" size={17} />
                    </>
                  )}
                </button>
                <Link
                  className="product-full-details-link"
                  to={`/product/${activeProduct.id}`}
                  onClick={() => productDialog.current?.close()}
                >
                  View full details <ShopIcon name="arrow" size={14} />
                </Link>
              </div>
            </>
          )}
        </dialog>

        <dialog
          className="store-dialog bag-dialog"
          ref={bagDialog}
          onClick={closeOnBackdropClick}
          aria-labelledby="bag-dialog-title"
        >
          <div className="bag-heading">
            <div>
              <p className="store-eyebrow">GOOD THINGS, ALL TOGETHER</p>
              <h2 id="bag-dialog-title">
                Your bag <span>({bagCount})</span>
              </h2>
            </div>
            <button
              type="button"
              className="dialog-close"
              aria-label="Close shopping bag"
              onClick={() => bagDialog.current?.close()}
            >
              <ShopIcon name="close" />
            </button>
          </div>
          {bag.length ? (
            <>
              <div className="bag-items">
                {bag.map((item) => {
                  const product = products.find(
                    (product) => product.id === item.id,
                  )!
                  return (
                    <article
                      className="bag-item"
                      key={`${item.id}-${item.size}-${bagColor(item)}`}
                    >
                      <img src={image(product.image)} alt={product.name} />
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {item.size === "One size"
                            ? item.size
                            : `Size ${item.size}`}
                        </p>
                        <p>Color: {bagColor(item)}</p>
                        <strong>{money(product.price)}</strong>
                        <div className="quantity-control">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            onClick={() =>
                              changeQuantity(item.id, item.size, -1, item.color)
                            }
                          >
                            <ShopIcon name="minus" size={13} />
                          </button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            onClick={() =>
                              changeQuantity(item.id, item.size, 1, item.color)
                            }
                            disabled={roomFor(item.id, bag) <= 0}
                          >
                            <ShopIcon name="plus" size={13} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="bag-remove"
                        type="button"
                        aria-label={`Remove ${product.name}`}
                        onClick={() =>
                          setBag((current) =>
                            current.filter((line) => line !== item),
                          )
                        }
                      >
                        <ShopIcon name="close" size={15} />
                      </button>
                    </article>
                  )
                })}
              </div>
              <div className="bag-summary">
                <p>
                  <span>Subtotal</span>
                  <strong>{money(bagTotal)}</strong>
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <Link
                    to="/checkout"
                    className="store-button w-full justify-center text-center"
                    onClick={() => bagDialog.current?.close()}
                  >
                    Proceed to Checkout <ShopIcon name="arrow" size={17} />
                  </Link>
                  <Link
                    to="/cart"
                    className="text-center text-xs font-semibold uppercase tracking-wider text-[#7f472d] underline hover:text-[#381c10] py-1"
                    onClick={() => bagDialog.current?.close()}
                  >
                    View Full Shopping Bag
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-bag">
              <ShopIcon name="bag" size={42} />
              <h3>Your next favourite is out there.</h3>
              <p>Explore the collection and find something that moves you.</p>
              <Link
                className="store-button"
                to="/shop"
                onClick={() => {
                  shopCategory("All")
                  bagDialog.current?.close()
                }}
              >
                Find your gear <ShopIcon name="arrow" size={16} />
              </Link>
            </div>
          )}
        </dialog>

        <dialog
          className="store-dialog reading-dialog"
          ref={storyDialog}
          onClose={() => setActiveStory(null)}
          onClick={closeOnBackdropClick}
          aria-labelledby="story-dialog-title"
        >
          {activeStory && (
            <>
              <button
                className="dialog-close"
                type="button"
                aria-label="Close article"
                onClick={() => storyDialog.current?.close()}
              >
                <ShopIcon name="close" />
              </button>
              {activeStory.image && (
                <img
                  className="reading-image"
                  src={image(activeStory.image)}
                  alt=""
                />
              )}
              <div className="reading-copy">
                <p className="store-eyebrow">{activeStory.category}</p>
                <h2 id="story-dialog-title">{activeStory.title}</h2>
                {activeStory.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <button
                  className="help-back-link"
                  type="button"
                  onClick={() => storyDialog.current?.close()}
                >
                  Back to BeastSports <ShopIcon name="arrow" size={15} />
                </button>
              </div>
            </>
          )}
        </dialog>

        {notice && (
          <div className="store-toast" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => {
                setNotice("")
                bagDialog.current?.showModal()
              }}
            >
              View bag <ShopIcon name="arrow" size={15} />
            </button>
            <button
              className="toast-close"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <ShopIcon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
