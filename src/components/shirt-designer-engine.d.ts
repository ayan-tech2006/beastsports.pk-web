import type { ShirtDesigner } from "@/data/products"

export type ShirtDesignDraft = {
  style: string
  color: string // hex
  colorName: string
  size: string
  qty: number
  unitPrice: number
  printedSides: number
  designs: {
    side: "front" | "back"
    kind: "img" | "text"
    src?: string // data: URL for uploads and ready-made designs
    text?: string
    font?: string
    color?: string
    x: number
    y: number
    scale: number
    rotate: number
  }[]
  /** The finished full-shirt pictures (PNG). */
  preview: { front: Blob | null; back: Blob | null }
}

export function mountShirtDesigner(
  root: HTMLElement,
  config: ShirtDesigner,
  hooks: {
    /** Saves the design and adds it to the bag; returns an error message to show, or nothing when added. */
    onAdd: (design: ShirtDesignDraft) => Promise<string | void>
  },
): () => void
