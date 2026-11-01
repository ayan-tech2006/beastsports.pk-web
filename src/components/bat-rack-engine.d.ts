export type BatRackItem = {
  name: string
  price: string // already formatted, e.g. "Rs 3,500"
  front: string // hitting face cut-out ("" = drawn as plain willow)
  back: string // BEAST design side cut-out ("" = drawn as plain willow)
  edgeStyle?: "holes" // tape-ball bats with holed edges
  toe?: "wood" // hardball bats: wooden toe, no black toe guard
  sweet?: "high" | "mid" | "low"
  typeLabel: string
  sizes: string[]
  soldOut: boolean
  href: string
}

export function mountBatRack(
  root: HTMLElement,
  items: BatRackItem[],
  hooks: {
    /** Adds the bat to the bag; returns false when it can't (sold out / bag already holds all stock). */
    onAdd: (index: number, size: string) => boolean
  },
): () => void
