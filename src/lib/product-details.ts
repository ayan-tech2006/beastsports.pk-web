import type { Product } from "@/Storefront"

export type ProductColor = {
  name: string
  swatch: string
}

export const productGalleryViews = [
  { id: "full", label: "Full view", className: "pdp-view-full" },
  { id: "close", label: "Close-up", className: "pdp-view-close" },
  { id: "texture", label: "Texture detail", className: "pdp-view-texture" },
  { id: "detail", label: "Finishing detail", className: "pdp-view-detail" },
] as const

// Swatches for the color names the admin panel uses; unknown names get a neutral chip.
const colorSwatches: Record<string, string> = {
  red: "bg-[#c62f2f]",
  crimson: "bg-[#a61b2b]",
  blue: "bg-[#2f6fd0]",
  green: "bg-[#2f9a5a]",
  yellow: "bg-[#e6b81e]",
  orange: "bg-[#ec7a2c]",
  black: "bg-[#1d1714]",
  carbon: "bg-[#2b2b2b]",
  white: "bg-white",
  grey: "bg-[#8d8780]",
  gray: "bg-[#8d8780]",
  pink: "bg-[#e57aa3]",
  purple: "bg-[#7a4fb3]",
  brown: "bg-[#7a4a2a]",
}

export function getProductDetails(product: Product) {
  const clothing = product.category === "Men" || product.category === "Women"
  const footwear = product.id === "velocity-shoes"

  return {
    // Only the colors the product really comes in; empty means no color choice.
    colors: product.colors.map((name) => ({
      name,
      swatch: colorSwatches[name.trim().toLowerCase()] ?? "bg-canvas",
    })),
    features: [
      "Made for everyday movement",
      "An easy addition to your kit",
      "Designed around your routine",
    ],
    materials:
      clothing && !footwear
        ? "A soft-touch, easy-wearing finish for your everyday line-up. The focus is simple: comfortable movement, a clean silhouette, and less distraction."
        : "A considered everyday essential, chosen for its clean profile and uncomplicated feel. Made to find its place in your regular routine.",
    care:
      clothing && !footwear
        ? [
            "Wash with similar colors on a gentle cycle.",
            "Air-dry and keep away from direct heat.",
            "Always follow the final garment care label.",
          ]
        : [
            "Wipe gently after use and allow to air-dry.",
            "Store in a cool, dry place between sessions.",
            "Follow the product’s final care instructions.",
          ],
    fit: footwear
      ? "Footwear sizes in this preview are US sizes. Choose your usual running-shoe size, or check the size guide if you’re between sizes."
      : clothing
        ? "Choose your usual size for a comfortable everyday fit. Prefer a little more room? Go one size up. The right fit should leave you free to move."
        : "This essential uses the size selection shown above. Keep it simple, make it yours, and check the size guide if you need a little help.",
  }
}
