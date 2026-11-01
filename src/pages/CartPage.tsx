import { Link, useOutletContext } from "react-router"
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react"
import { roomFor, type StorefrontContext } from "@/Storefront"
import { deliveryCharge, findProduct, getProductImageUrl, money } from "@/data/products"
import { getProductDetails } from "@/lib/product-details"

export default function CartPage() {
  const { bag, bagTotal, changeQuantity, removeFromBag } =
    useOutletContext<StorefrontContext>()

  const ids = bag.map((item) => item.id)
  const postOfficeFee = deliveryCharge(ids, "Post Office")
  const tcsFee = deliveryCharge(ids, "TCS")
  const finalTotal = bagTotal + postOfficeFee

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10] pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#7f472d] uppercase transition-colors hover:text-[#381c10]"
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>
          <span className="text-xs text-[#78685e] tracking-widest uppercase">
            Step 1 of 3 · Shopping Bag
          </span>
        </div>

        {/* Page Heading */}
        <div className="mb-10 text-center sm:text-left">
          <p className="store-eyebrow text-[#7f472d] mb-2">YOUR SELECTION</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            Shopping Bag.
          </h1>
          <p className="mt-2 text-sm text-[#78685e]">
            Review your gear, update sizes or quantities, and proceed to guest checkout.
          </p>
        </div>

        {bag.length === 0 ? (
          /* Empty Bag State */
          <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-[#f8f3e9] p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(56_28_16_/_6%)] text-[#7f472d]">
              <ShoppingBag size={28} strokeWidth={1.5} />
            </div>
            <h2 className="font-editorial text-3xl font-medium">Your bag is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#78685e]">
              Looks like you haven’t added any sports gear to your bag yet. Explore our handcrafted
              cricket bats, running shoes, and training essentials.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shop"
                className="store-button inline-flex items-center gap-3 rounded-full bg-[#381c10] px-6 py-3.5 text-sm font-medium text-[#f8f3e9] transition-all hover:bg-[#5e2b16]"
              >
                Browse Shop <ArrowRight size={16} />
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(56_28_16_/_20%)] bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#381c10] transition-colors hover:bg-[rgb(56_28_16_/_5%)]"
              >
                Browse collections
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Cart Layout */
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* Items Column */}
            <div className="space-y-6 lg:col-span-8">
              {/* Delivery options */}
              <div className="flex items-center gap-2.5 rounded-xl border border-[rgb(56_28_16_/_12%)] bg-[#f8f3e9] p-4 text-xs font-medium text-[#381c10] sm:text-sm">
                <Truck size={18} className="shrink-0 text-[#7f472d]" />
                <span>
                  Delivery for this bag: <strong>{money(postOfficeFee)}</strong> by Post Office or{" "}
                  <strong>{money(tcsFee)}</strong> by TCS. You choose at checkout.
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[rgb(56_28_16_/_10%)] rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white shadow-xs">
                {bag.map((item) => {
                  const product = findProduct(item.id)
                  if (!product) return null
                  const details = getProductDetails(product)
                  const itemColor = item.color || details.colors[0]?.name || "Standard"
                  const itemSubtotal = product.price * item.quantity

                  return (
                    <article
                      key={`${item.id}-${item.size}-${itemColor}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 transition-colors hover:bg-[#fbf9f6]/60"
                    >
                      {/* Product Thumbnail + Info */}
                      <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                        <Link
                          to={`/product/${product.id}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#eee9e2] border border-[rgb(56_28_16_/_8%)]"
                        >
                          <img
                            src={getProductImageUrl(product.image)}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7f472d]">
                            {product.category} · {product.sport || product.type}
                          </p>
                          <Link
                            to={`/product/${product.id}`}
                            className="font-editorial text-lg sm:text-xl font-medium text-[#381c10] hover:underline"
                          >
                            {product.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#78685e]">
                            <span className="rounded-md bg-[#eee9e2] px-2 py-0.5 font-medium text-[#381c10]">
                              Size: {item.size}
                            </span>
                            {itemColor && (
                              <span className="rounded-md bg-[#eee9e2] px-2 py-0.5 text-[#381c10]">
                                {itemColor}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-[#381c10] sm:hidden">
                            {money(product.price)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgb(56_28_16_/_8%)]">
                        {/* Quantity Pill */}
                        <div className="inline-flex items-center rounded-full border border-[rgb(56_28_16_/_20%)] bg-[#f8f3e9] px-2 py-1">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(item.id, item.size, -1, item.color)
                            }
                            aria-label={`Decrease ${product.name} quantity`}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#381c10] transition-colors hover:bg-[rgb(56_28_16_/_10%)]"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-8 text-center text-xs font-semibold text-[#381c10]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(item.id, item.size, 1, item.color)
                            }
                            disabled={roomFor(item.id, bag) <= 0}
                            aria-label={`Increase ${product.name} quantity`}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#381c10] transition-colors hover:bg-[rgb(56_28_16_/_10%)] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right min-w-[70px]">
                          <p className="text-base font-semibold text-[#381c10]">
                            {money(itemSubtotal)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-[#78685e]">
                              {money(product.price)} each
                            </p>
                          )}
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromBag(item.id, item.size, item.color)
                          }
                          aria-label={`Remove ${product.name} from bag`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#78685e] transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Security & Reassurance */}
              <div className="flex items-center gap-3 rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9]/60 p-4 text-xs text-[#78685e]">
                <ShieldCheck size={20} className="shrink-0 text-[#7f472d]" />
                <p>
                  <strong className="text-[#381c10]">Cash on Delivery available:</strong> pay the
                  rider when your parcel arrives, or pay in advance by Easypaisa, JazzCash or bank.
                </p>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 rounded-2xl border border-[rgb(56_28_16_/_14%)] bg-[#f8f3e9] p-6 shadow-xs">
                <h2 className="font-editorial text-2xl font-medium tracking-tight text-[#381c10]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-3 text-sm border-b border-[rgb(56_28_16_/_12%)] pb-5">
                  <div className="flex items-center justify-between text-[#78685e]">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-[#381c10]">{money(bagTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#78685e]">
                    <span>Delivery (from, Post Office)</span>
                    <span className="font-medium text-[#381c10]">{money(postOfficeFee)}</span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#78685e] font-medium">
                      Estimated Total
                    </p>
                    <p className="font-editorial text-3xl font-medium text-[#381c10]">
                      {money(finalTotal)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[rgb(56_28_16_/_8%)] px-3 py-1 text-[11px] font-semibold text-[#7f472d] uppercase">
                    COD Ready
                  </span>
                </div>

                {/* Checkout CTA */}
                <div className="mt-6 space-y-3">
                  <Link
                    to="/checkout"
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[#381c10] px-6 py-4 text-center text-sm font-semibold tracking-wide text-[#f8f3e9] shadow-sm transition-all hover:bg-[#5e2b16] active:scale-[0.99]"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/shop"
                    className="block text-center text-xs text-[#7f472d] underline underline-offset-4 hover:text-[#381c10]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

