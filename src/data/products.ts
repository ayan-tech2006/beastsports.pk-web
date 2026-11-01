import { supabase } from "@/lib/supabase"

export type SportCategory =
  | "All"
  | "Cricket"
  | "Football"
  | "Running"
  | "Training"
  | "Basketball"
  | "Badminton"
  | "Sportswear"
  | "Accessories"

export type DepartmentCategory = "Men" | "Women" | "Equipment" | "Accessories"

export type Product = {
  id: string
  name: string
  category: DepartmentCategory
  sport: SportCategory
  type: string
  price: number
  originalPrice?: number
  image: string
  badge?: string
  sizes: string[]
  description: string
  colors: string[]
  gallery: string[]
  rating: number
  reviewsCount: number
  stock: number
  delivery: { postOffice: number; tcs: number }
  // Every collection name from the admin panel, lowercased, used to place it in collections.
  collectionNames: string[]
}

export type Collection = {
  id: string
  name: string
  image: string
  parent?: Collection
  children: Collection[]
  // This collection's own products plus everything in its sub-collections, newest first.
  products: Product[]
}

export function getProductImageUrl(imageName: string): string {
  if (imageName.startsWith("http") || imageName.startsWith("/")) {
    return imageName
  }
  if (imageName.startsWith("bats/")) {
    return `/images/${imageName}.png`
  }
  if (imageName.endsWith(".png") || imageName.endsWith(".jpg")) {
    return `/images/${imageName}`
  }
  return `/images/${imageName}.jpg`
}

// Prices are Pakistani rupees, same as the app.
export const money = (price: number) =>
  `Rs ${Math.round(price).toLocaleString("en-PK")}`

// Matches the app: each bag line adds that product's charge for the chosen courier.
// shortcut: charged per line, not per unit (app orders seen so far are all x1); confirm with the app's checkout code.
export function deliveryCharge(ids: string[], agency: "Post Office" | "TCS") {
  return ids.reduce((sum, id) => {
    const product = findProduct(id)
    if (!product) return sum
    return sum + (agency === "TCS" ? product.delivery.tcs : product.delivery.postOffice)
  }, 0)
}

// Filled once by loadProducts() before the app renders (see main.tsx).
export const allProducts: Product[] = []

// ===== Custom shirts from "Design your own shirt" =====
// They live only in the bag (never in the shop), so the bag, cart and checkout find them here.
export type CustomDesign = {
  side: "front" | "back"
  kind: "img" | "text"
  src?: string // uploaded file or ready-made design (stored URL)
  text?: string
  font?: string
  color?: string
  x: number
  y: number
  scale: number
  rotate: number
}
export type CustomShirt = {
  style: string
  colorName: string
  colorHex: string
  unitPrice: number
  printedSides: number
  preview: { front: string; back: string } // the finished full-shirt pictures
  designs: CustomDesign[]
  delivery: { postOffice: number; tcs: number }
}
export const customProducts = new Map<string, Product>()

export function registerCustomShirt(id: string, shirt: CustomShirt, size: string) {
  customProducts.set(id, {
    id,
    name: `Custom ${shirt.style}`,
    category: "Men",
    sport: "Sportswear",
    type: "Custom shirt",
    price: shirt.unitPrice,
    image: shirt.preview.front,
    sizes: [size],
    description: "Designed by you on BeastSports.",
    colors: [shirt.colorName],
    gallery: shirt.preview.back ? [shirt.preview.back] : [],
    rating: 0,
    reviewsCount: 0,
    stock: 99,
    delivery: shirt.delivery,
    collectionNames: [],
  })
}

export const findProduct = (id: string) => allProducts.find((p) => p.id === id) ?? customProducts.get(id)

type ProductRow = {
  id: string
  title: string
  description: string | null
  price: number | string
  original_price: number | string | null
  category: string | null
  image_url: string | null
  rating: number | string | null
  reviews_count: number | null
  quantity_available: number | null
  gallery_images: unknown
  available_colors: unknown
  available_sizes: unknown
  delivery_charge_post_office: number | string | null
  delivery_charge_tsc: number | string | null
  is_flash_sale: boolean | null
  created_at: string
}

const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "")
    : []

// The app tags every product "For You" and "All Product"; the rest are real groupings.
const GENERIC_TAGS = ["for you", "all product"]

function sportOf(text: string): SportCategory {
  if (/badminton|shuttle|racket/.test(text)) return "Badminton"
  if (/football/.test(text)) return "Football"
  if (/wear|shirt|tee\b|trouser|jersey|track/.test(text)) return "Sportswear"
  if (/bat|cricket|ball|hardball|helmet|pad|glove|wicket|stump/.test(text)) return "Cricket"
  return "Accessories"
}

function departmentOf(text: string): DepartmentCategory {
  if (/beast wear|shirt|tee\b|trouser|jersey|track/.test(text)) return "Men"
  if (/cover|sheet|grip|bag|protector|cap\b|bottle|band\b|tape/.test(text)) return "Accessories"
  return "Equipment"
}

function toProduct(row: ProductRow): Product {
  const allTags = (row.category ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  const tags = allTags.filter((tag) => !GENERIC_TAGS.includes(tag.toLowerCase()))
  const text = `${row.title} ${tags.join(" ")}`.toLowerCase()
  const price = Number(row.price)
  const original = Number(row.original_price)
  const sport = sportOf(text)
  const sizes = strings(row.available_sizes)

  return {
    id: row.id,
    name: row.title.trim(),
    category: departmentOf(text),
    sport,
    type: tags[0] ?? `${sport} gear`,
    price,
    originalPrice: original > price ? original : undefined,
    image: row.image_url ?? "",
    sizes: sizes.length ? sizes : ["One size"],
    description: row.description?.trim() ?? "",
    colors: strings(row.available_colors),
    gallery: strings(row.gallery_images),
    rating: Number(row.rating ?? 4.8),
    reviewsCount: row.reviews_count ?? 0,
    stock: row.quantity_available ?? 0,
    delivery: {
      postOffice: Number(row.delivery_charge_post_office ?? 0),
      tcs: Number(row.delivery_charge_tsc ?? 0),
    },
    badge: row.is_flash_sale ? "FLASH SALE" : undefined,
    collectionNames: allTags.map((tag) => tag.toLowerCase()),
  }
}

// Rows arrive newest first: the newest few are "NEW", the most-reviewed few are "BEST SELLER".
function withBadges(products: Product[]) {
  const bestSellers = new Set(
    [...products]
      .filter((p) => p.reviewsCount > 0)
      .sort((a, b) => b.reviewsCount - a.reviewsCount)
      .slice(0, 4)
      .map((p) => p.id),
  )
  return products.map((p, index) => ({
    ...p,
    badge: bestSellers.has(p.id) ? "BEST SELLER" : index < 6 ? "NEW" : p.badge,
  }))
}

type CategoryRow = {
  id: string
  name: string
  image_url: string | null
  parent_id: string | null
  sort_order: number | null
  is_active: boolean | null
}

// Filled by loadProducts(): top-level collections and every visible collection by id.
export const collectionRoots: Collection[] = []
export const collectionsById = new Map<string, Collection>()

// Builds the tree from the admin panel's categories. Hidden collections hide their whole branch;
// a missing parent makes the collection top-level; empty collections are left out.
function buildCollections(rows: CategoryRow[], products: Product[]) {
  const visible = new Map(
    rows
      .filter((row) => row.is_active !== false)
      .map((row) => [row.id, row]),
  )
  const hidden = new Set(rows.filter((row) => row.is_active === false).map((row) => row.id))
  const childrenOf = (parentId: string | null) =>
    [...visible.values()]
      .filter((row) =>
        parentId
          ? row.parent_id === parentId
          : !row.parent_id || (!visible.has(row.parent_id) && !hidden.has(row.parent_id)),
      )
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name))

  const build = (row: CategoryRow, parent: Collection | undefined, seen: Set<string>): Collection | null => {
    const node: Collection = {
      id: row.id,
      name: row.name.trim(),
      image: row.image_url ?? "",
      parent,
      children: [],
      products: [],
    }
    const nextSeen = new Set(seen).add(row.id)
    node.children = childrenOf(row.id)
      .filter((child) => !nextSeen.has(child.id))
      .map((child) => build(child, node, nextSeen))
      .filter((child): child is Collection => child !== null)
    const names = new Set([node.name.toLowerCase()])
    const inChildren = new Set(node.children.flatMap((child) => child.products.map((p) => p.id)))
    node.products = products.filter(
      (p) => inChildren.has(p.id) || p.collectionNames.some((name) => names.has(name)),
    )
    if (!node.products.length) return null
    collectionsById.set(node.id, node)
    return node
  }

  collectionsById.clear()
  const roots = childrenOf(null)
    .map((row) => build(row, undefined, new Set()))
    .filter((node): node is Collection => node !== null)
  collectionRoots.splice(0, collectionRoots.length, ...roots)
}

// Home page content edited in the admin panel's "Website Home" screen (app_settings JSON keys).
// Same shapes as the admin panel's src/lib/website-home.ts.
export type HeroSlide = {
  image: string
  productId: string
  price: number
  oldPrice: number
  c1: string
  c2: string
}
export type FeatureCard = { eyebrow: string; title: string; image: string; collectionId: string }
export type WebDeal = { productId: string; title: string; endsAt: string }
// Clothing rail entries, keyed by product id; set in the admin's product form.
export type RailEntry = { on: boolean; front: string; back: string }
// 3D bat rack entries, keyed by product id; the type decides how edges and toe are drawn.
export type BatEntry = { on: boolean; type: "hardball" | "holes" | "plain"; front: string; back: string }

// "Design your own shirt" settings from the admin's Shirt Designer screen (same shape as the admin panel).
export type PrintArea = { x: number; y: number; w: number; h: number } // % of the 400×480 frame
export type ShirtStyle = {
  id: string
  label: string
  price: number
  front: string
  back: string
  printFront: PrintArea
  printBack: PrintArea
}
export type ShirtDesigner = {
  enabled: boolean
  styles: ShirtStyle[]
  colors: { name: string; hex: string }[]
  sizes: string[]
  printPrice: number
  delivery: { postOffice: number; tcs: number }
}

export const homeContent: {
  heroSlides: HeroSlide[]
  featureCards: FeatureCard[]
  deal: WebDeal | null
  rail: Record<string, RailEntry>
  bats: Record<string, BatEntry>
  designer: ShirtDesigner | null
} = { heroSlides: [], featureCards: [], deal: null, rail: {}, bats: {}, designer: null }

const HOME_KEYS = {
  hero: "web_hero_slides_json",
  cards: "web_feature_cards_json",
  deal: "web_deal_json",
  rail: "web_rail_json",
  bats: "web_bat_rack_json",
  designer: "web_shirt_designer_json",
}

function parseSetting<T>(rows: { key: string; value: string | null }[], key: string, fallback: T): T {
  const value = rows.find((row) => row.key === key)?.value
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export async function loadProducts() {
  const [productsResult, categoriesResult, settingsResult] = await Promise.all([
    supabase
      .from("custom_products")
      .select(
        "id,title,description,price,original_price,category,image_url,rating,reviews_count,quantity_available,gallery_images,available_colors,available_sizes,delivery_charge_post_office,delivery_charge_tsc,is_flash_sale,created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("custom_categories")
      .select("id,name,image_url,parent_id,sort_order,is_active"),
    supabase
      .from("app_settings")
      .select("key,value")
      .in("key", Object.values(HOME_KEYS)),
  ])
  const { data, error } = productsResult
  if (error) throw error
  if (!data?.length) throw new Error("No products returned from Supabase.")
  allProducts.splice(0, allProducts.length, ...withBadges(data.map(toProduct)))
  // Collections are a bonus: the shop still works if they fail to load.
  if (categoriesResult.error) console.error(categoriesResult.error)
  buildCollections(categoriesResult.data ?? [], allProducts)

  // Home content is optional too: each section falls back to its built-in version when empty.
  const settings = settingsResult.data ?? []
  homeContent.heroSlides = parseSetting<HeroSlide[]>(settings, HOME_KEYS.hero, []).filter(
    (slide) => slide?.image,
  )
  homeContent.featureCards = parseSetting<FeatureCard[]>(settings, HOME_KEYS.cards, []).filter(
    (card) => card?.image && card.title && collectionsById.has(card.collectionId),
  )
  homeContent.deal = parseSetting<WebDeal | null>(settings, HOME_KEYS.deal, null)
  homeContent.rail = parseSetting<Record<string, RailEntry>>(settings, HOME_KEYS.rail, {})
  homeContent.bats = parseSetting<Record<string, BatEntry>>(settings, HOME_KEYS.bats, {})
  // The designer opens only when the admin switched it on and gave it at least one shirt photo.
  const designer = parseSetting<ShirtDesigner | null>(settings, HOME_KEYS.designer, null)
  homeContent.designer =
    designer?.enabled && designer.styles?.some((s) => s.front) && designer.colors?.length && designer.sizes?.length
      ? { ...designer, styles: designer.styles.filter((s) => s.front) }
      : null
}
