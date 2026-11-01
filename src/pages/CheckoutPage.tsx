import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useOutletContext } from "react-router"
import {
  CheckCircle2,
  Lock,
  Package,
  Truck,
  Upload,
} from "lucide-react"
import type {
  DeliveryAgency,
  Order,
  PaymentMethod,
  StorefrontContext,
} from "@/Storefront"
import { deliveryCharge, findProduct, getProductImageUrl, money, type CustomShirt } from "@/data/products"
import { supabase } from "@/lib/supabase"

const agencies: DeliveryAgency[] = ["Post Office", "TCS"]

// Same options as the app; account details come from app_settings so the admin panel stays the source.
const paymentOptions: { method: PaymentMethod; settingKey?: string }[] = [
  { method: "Cash on Delivery" },
  { method: "Easypaisa", settingKey: "easypaisa_details" },
  { method: "JazzCash", settingKey: "jazzcash_details" },
  { method: "Bank transfer", settingKey: "bank_details" },
]

const MAX_SCREENSHOT_MB = 5

// Pakistani mobile numbers: 03XXXXXXXXX or +923XXXXXXXXX.
const isValidPhone = (phone: string) =>
  /^(\+?92|0)3\d{9}$/.test(phone.replace(/[\s-]/g, ""))

// Same shape as app order numbers, e.g. BST-261031-60D0A.
function newOrderId() {
  const now = new Date()
  const date = [now.getFullYear() % 100, now.getMonth() + 1, now.getDate()]
    .map((n) => String(n).padStart(2, "0"))
    .join("")
  const bytes = crypto.getRandomValues(new Uint8Array(3))
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 5)
    .toUpperCase()
  return `BST-${date}-${hex}`
}

// The admin panel reads order details from screenshot_url as key=value pairs joined by "|||", in this order.
function packOrderDetails(fields: [string, string | number][]) {
  return fields
    .map(([key, value]) => `${key}=${String(value).split("|||").join(" ")}`)
    .join("|||")
}

// Same wording as the app, e.g. "Bat Name (Size: L, Color: Red x1)".
// A designed shirt also links its finished pictures, so the app's admin screen can see the design too.
function summaryLine(item: { name: string; size: string; color?: string; quantity: number; custom?: CustomShirt }) {
  const options = [
    item.size !== "One size" ? `Size: ${item.size}` : "",
    item.color ? `Color: ${item.color}` : "",
  ].filter(Boolean)
  const line = `${item.name} (${options.length ? `${options.join(", ")} ` : ""}x${item.quantity})`
  if (!item.custom) return line
  const pictures = [item.custom.preview.front, item.custom.preview.back].filter(Boolean).join(" | ")
  return `${line} Design: ${pictures}`
}

const popularCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Sialkot",
  "Faisalabad",
  "Multan",
  "Peshawar",
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { bag, bagTotal, clearBag, setLastOrder, removeFromBag } =
    useOutletContext<StorefrontContext>()

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [agency, setAgency] = useState<DeliveryAgency>("Post Office")
  const [payment, setPayment] = useState<PaymentMethod>("Cash on Delivery")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [accountDetails, setAccountDetails] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key,value")
      .in("key", ["easypaisa_details", "jazzcash_details", "bank_details"])
      .then(({ data }) =>
        setAccountDetails(
          Object.fromEntries((data ?? []).map((row) => [row.key, row.value])),
        ),
      )
  }, [])

  const shippingFee = deliveryCharge(
    bag.map((item) => item.id),
    agency,
  )
  const finalTotal = bagTotal + shippingFee
  const isAdvance = payment !== "Cash on Delivery"
  const selectedOption = paymentOptions.find((option) => option.method === payment)
  const selectedDetails = selectedOption?.settingKey
    ? accountDetails[selectedOption.settingKey]
    : undefined

  /* ── Empty bag state ── */
  if (bag.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] text-[#381c10] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[rgb(56_28_16_/_12%)]">
            <Package size={28} strokeWidth={1.5} className="text-[#7f472d]" />
          </div>
          <h1 className="font-editorial text-4xl font-normal tracking-tight">
            Your bag is empty
          </h1>
          <p className="mt-3 text-sm text-[#78685e]">
            Add some gear to your bag before checking out.
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-block rounded-full bg-[#381c10] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-[#f8f3e9] hover:bg-[#5e2b16] transition-colors"
          >
            Explore Shop
          </Link>
        </div>
      </div>
    )
  }

  /* ── Validation ── */
  function validate() {
    const err: Record<string, string> = {}
    if (!formData.fullName.trim()) err.fullName = "Please enter your full name."
    if (!formData.phone.trim()) {
      err.phone = "Phone number is required for delivery contact."
    } else if (!isValidPhone(formData.phone)) {
      err.phone = "Enter a Pakistani mobile number, like 0300 1234567."
    }
    if (!formData.city.trim()) err.city = "Please specify your city."
    if (!formData.address.trim()) {
      err.address = "Complete delivery address is required."
    }
    if (isAdvance) {
      if (!screenshot) err.screenshot = "Upload a screenshot of your payment."
      else if (!screenshot.type.startsWith("image/"))
        err.screenshot = "The screenshot must be an image (JPG or PNG)."
      else if (screenshot.size > MAX_SCREENSHOT_MB * 1024 * 1024)
        err.screenshot = `The screenshot must be smaller than ${MAX_SCREENSHOT_MB} MB.`
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  /* ── Submit ── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || !validate()) return

    setSubmitting(true)
    setSubmitError("")

    const orderItems = bag
      .map((item) => {
        const product = findProduct(item.id)
        if (!product) return null
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          custom: item.custom,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    const orderId = newOrderId()
    const fullName = formData.fullName.trim()
    const [firstName, ...otherNames] = fullName.split(/\s+/)
    const phone = formData.phone.trim()
    const email = formData.email.trim()
    const city = formData.city.trim()
    const address = formData.address.trim()
    const note = formData.notes.trim()
    const fullAddress = `${address}, ${city}${note ? ` (Note: ${note})` : ""}`

    try {
      let paymentProof = "Cash on Delivery"
      if (isAdvance && screenshot) {
        const ext = screenshot.name.split(".").pop()?.toLowerCase() || "jpg"
        // No customer details in the path: files in this bucket are public.
        const path = `web-payments/${orderId}-${Date.now()}.${ext}`
        const upload = await supabase.storage
          .from("products")
          .upload(path, screenshot, { contentType: screenshot.type })
        if (upload.error) throw upload.error
        paymentProof = supabase.storage.from("products").getPublicUrl(path).data.publicUrl
      }

      // Designed shirts: save the full design next to the order (custom-orders/<order id>.json) so the
      // admin panel can show every uploaded file and the finished pictures. Done first so it is never missing.
      const customItems = orderItems.filter((item) => item.custom)
      if (customItems.length) {
        const manifest = {
          orderId,
          createdAt: new Date().toISOString(),
          items: customItems.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            ...item.custom,
          })),
        }
        const saved = await supabase.storage
          .from("products")
          .upload(`custom-orders/${orderId}.json`, new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }), {
            contentType: "application/json",
          })
        if (saved.error) throw saved.error
      }

      // Same stock as the app: reserve the whole bag in one go, or nothing if any line ran out.
      // Designed shirts are made to order, so they have no stock to reserve.
      const stockItems = orderItems.filter((item) => !item.custom)
      const stock = stockItems.length
        ? await supabase.rpc("verify_and_decrement_cart_stock", {
            p_items: stockItems.map((item) => ({
              product_id: item.id,
              quantity: item.quantity,
              size: item.size === "One size" ? "" : item.size,
            })),
          })
        : { data: { success: true }, error: null }
      if (stock.error) throw stock.error
      if (!stock.data?.success) {
        const short = findProduct(stock.data?.product_id)
        if (short) short.stock = Math.max(0, Number(stock.data?.available) || 0)
        setSubmitError(
          `${stock.data?.message || "An item in your bag just sold out."} Please update your bag and try again.`,
        )
        setSubmitting(false)
        return
      }
      for (const item of stockItems) {
        const product = findProduct(item.id)
        if (product) product.stock = Math.max(0, product.stock - item.quantity)
      }

      // shortcut: if this insert fails the reserved stock is not given back; the admin adjusts it by hand.
      const { error } = await supabase.from("orders").insert({
        order_id: orderId,
        items_summary: orderItems.map(summaryLine).join(", "),
        total_price: finalTotal,
        subtotal: bagTotal,
        status: "Processing",
        user_email: email || null,
        customer_name: fullName,
        customer_phone: phone,
        customer_address: fullAddress,
        first_name: firstName,
        last_name: otherNames.join(" ") || null,
        address,
        city,
        delivery_agency: agency,
        delivery_charge: shippingFee,
        screenshot_url: packOrderDetails([
          ["email", email],
          ["name", fullName],
          ["phone", phone],
          ["address", fullAddress],
          ["url", paymentProof],
          ["agency", agency],
          ["charge", shippingFee],
          ["subtotal", bagTotal],
          ["couponCode", ""],
          ["couponDiscount", 0],
          ["coinsUsed", 0],
          ["coinsDiscount", 0],
        ]),
      })
      if (error) throw error
    } catch (error) {
      console.error(error)
      setSubmitError(
        "We couldn’t place your order. Check your internet connection and try again. Your bag is still saved.",
      )
      setSubmitting(false)
      return
    }

    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      customer: {
        fullName,
        phone,
        email: email || undefined,
        city,
        address,
        notes: note || undefined,
      },
      paymentMethod: payment,
      deliveryAgency: agency,
      items: orderItems,
      subtotal: bagTotal,
      shipping: shippingFee,
      total: finalTotal,
    }

    setLastOrder(newOrder)
    try {
      localStorage.setItem("beast_sports_last_order", JSON.stringify(newOrder))
    } catch {
      // The confirmation page still has the order in memory.
    }
    clearBag()
    navigate("/order-confirmation")
  }

  /* ── Shared input class (bottom-border style) ── */
  const inputBase =
    "w-full border-b bg-transparent py-3 text-sm text-[#381c10] placeholder:text-[#bcaa99] outline-none transition-colors focus:border-[#7f472d]"
  const borderNormal = "border-[rgb(56_28_16_/_15%)]"
  const borderError = "border-red-400"

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10]">
      {/* ── Giant CHECKOUT heading ── */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 pt-10 pb-10">
        <p className="store-eyebrow text-[#7f472d] mb-3">ORDERING</p>
        <h1 className="font-editorial text-6xl sm:text-7xl md:text-8xl lg:text-[110px] font-normal tracking-tight leading-[0.9]">
          CHECKOUT
        </h1>
      </div>

      {/* ── Main content ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* ════════════════════════════════════════
                LEFT COLUMN — Form
               ════════════════════════════════════════ */}
            <div className="lg:col-span-7 space-y-10">
              {/* ── PERSONAL INFORMATION ── */}
              <section>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight mb-1">
                  PERSONAL INFORMATION
                </h2>
                <div className="h-px bg-[rgb(56_28_16_/_12%)] mb-6" />

                {/* Row: Name | Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#78685e] mb-0.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Your full name"
                      className={`${inputBase} ${errors.fullName ? borderError : borderNormal}`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#78685e] mb-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className={`${inputBase} ${borderNormal}`}
                    />
                  </div>
                </div>

                {/* Row: Phone */}
                <div className="mt-5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#78685e] mb-0.5">
                    Phone / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+92 300 1234567"
                    className={`${inputBase} ${errors.phone ? borderError : borderNormal}`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </section>

              {/* ── SHIPPING INFORMATION ── */}
              <section>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight mb-1">
                  SHIPPING INFORMATION
                </h2>
                <div className="h-px bg-[rgb(56_28_16_/_12%)] mb-6" />

                {/* Row: City */}
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#78685e] mb-0.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Enter your city"
                    className={`${inputBase} ${errors.city ? borderError : borderNormal}`}
                  />
                  {/* Quick city chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {popularCities.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, city: c })}
                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          formData.city.toLowerCase() === c.toLowerCase()
                            ? "bg-[#381c10] text-[#f8f3e9]"
                            : "bg-[#eee9e2] text-[#381c10] hover:bg-[#bcaa99]/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Row: Address */}
                <div className="mt-5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#78685e] mb-0.5">
                    Complete Address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="House/Apt, Street, Sector/Area, Landmark"
                    className={`${inputBase} resize-y ${errors.address ? borderError : borderNormal}`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Row: Notes */}
                <div className="mt-5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#78685e] mb-0.5">
                    Order Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="e.g. Call before delivery, deliver between 2-5 PM"
                    className={`${inputBase} ${borderNormal}`}
                  />
                </div>
              </section>

              {/* ── DELIVERY ── */}
              <section>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight mb-1">
                  DELIVERY
                </h2>
                <div className="h-px bg-[rgb(56_28_16_/_12%)] mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agencies.map((option) => {
                    const selected = agency === option
                    const fee = deliveryCharge(
                      bag.map((item) => item.id),
                      option,
                    )
                    return (
                      <label key={option} className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      selected
                        ? "border-[#381c10] bg-[#f8f3e9]"
                        : "border-[rgb(56_28_16_/_12%)] bg-white hover:bg-[#fbf9f6]"
                    }`}>
                        <input
                          type="radio"
                          name="agency"
                          value={option}
                          checked={selected}
                          onChange={() => setAgency(option)}
                          className="mt-0.5 accent-[#381c10]"
                        />
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#381c10]">
                            {option}
                          </span>
                          <p className="text-[11px] text-[#78685e] mt-0.5">
                            {money(fee)} for this bag
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </section>

              {/* ── PAYMENT ── */}
              <section>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight mb-1">
                  PAYMENT
                </h2>
                <div className="h-px bg-[rgb(56_28_16_/_12%)] mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentOptions.map(({ method }) => {
                    const selected = payment === method
                    return (
                      <label key={method} className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      selected
                        ? "border-[#381c10] bg-[#f8f3e9]"
                        : "border-[rgb(56_28_16_/_12%)] bg-white hover:bg-[#fbf9f6]"
                    }`}>
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={selected}
                          onChange={() => setPayment(method)}
                          className="mt-0.5 accent-[#381c10]"
                        />
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#381c10]">
                            {method}
                          </span>
                          <p className="text-[11px] text-[#78685e] mt-0.5">
                            {method === "Cash on Delivery"
                              ? "Pay the rider when it arrives"
                              : "Pay now, upload a screenshot"}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {isAdvance && (
                  <div className="mt-5 rounded-xl border border-[rgb(56_28_16_/_12%)] bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#381c10]">
                      Send {money(finalTotal)} to
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#381c10]">
                      {selectedDetails?.trim() || "Loading account details…"}
                    </p>

                    <label
                      htmlFor="payment-screenshot"
                      className="mt-5 block text-[11px] font-medium uppercase tracking-wider text-[#78685e]"
                    >
                      Payment screenshot <span className="text-red-500">*</span>
                    </label>
                    <label
                      className={`mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm transition-colors hover:bg-[#fbf9f6] ${
                        errors.screenshot ? "border-red-400" : "border-[rgb(56_28_16_/_25%)]"
                      }`}
                    >
                      <Upload size={18} className="shrink-0 text-[#7f472d]" />
                      <span className="min-w-0 truncate text-[#381c10]">
                        {screenshot ? screenshot.name : "Choose an image (JPG or PNG, up to 5 MB)"}
                      </span>
                      <input
                        id="payment-screenshot"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {errors.screenshot && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.screenshot}</p>
                    )}
                    <p className="mt-3 text-[11px] text-[#78685e]">
                      We check your screenshot before dispatching the order.
                    </p>
                  </div>
                )}
              </section>

              {/* ── Place Order Button ── */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full !bg-[#381c10] px-12 py-4 text-xs sm:text-sm font-semibold uppercase tracking-[1.5px] !text-[#f8f3e9] shadow-md transition-all hover:!bg-[#5e2b16] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                  style={{
                    backgroundColor: "#381c10",
                    color: "#f8f3e9",
                  }}
                >
                  {submitting ? (
                    "Placing your order…"
                  ) : (
                    <>
                      <Lock size={15} /> Place order · {money(finalTotal)}
                    </>
                  )}
                </button>
                {submitError && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {submitError}
                  </p>
                )}

                <p className="mt-4 text-[11px] text-[#78685e] leading-normal">
                  By continuing, you agree to the{" "}
                  <Link
                    to="/terms"
                    className="underline hover:text-[#381c10]"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="underline hover:text-[#381c10]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* ════════════════════════════════════════
                RIGHT COLUMN — Order Summary (sticky)
               ════════════════════════════════════════ */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-6">
                {/* ── Product cards ── */}
                <div className="space-y-6 max-h-[420px] overflow-y-auto pr-1">
                  {bag.map((item) => {
                    const product = findProduct(item.id)
                    if (!product) return null
                    return (
                      <div
                        key={`${item.id}-${item.size}-${item.color}`}
                        className="flex gap-4"
                      >
                        {/* Product image */}
                        <div className="w-24 h-28 sm:w-28 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-[#eee9e2]">
                          <img
                            src={getProductImageUrl(product.image)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Product details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#381c10] truncate">
                            {product.name}
                          </h3>
                          <div className="mt-1.5 space-y-0.5 text-[11px] uppercase tracking-wider text-[#78685e]">
                            <p>
                              Quantity:{" "}
                              <span className="font-semibold text-[#381c10]">
                                {item.quantity}
                              </span>
                            </p>
                            {item.color && (
                              <p>
                                Color:{" "}
                                <span className="font-semibold text-[#381c10]">
                                  {item.color}
                                </span>
                              </p>
                            )}
                            <p>
                              Size:{" "}
                              <span className="font-semibold text-[#381c10]">
                                {item.size}
                              </span>
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#381c10]">
                              {money(product.price * item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeFromBag(item.id, item.size, item.color)
                              }
                              className="text-[11px] text-[#78685e] underline hover:text-[#381c10] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ── Pricing breakdown ── */}
                <div className="border-t border-[rgb(56_28_16_/_12%)] pt-5 space-y-2.5">
                  <div className="flex justify-between text-xs uppercase tracking-wider text-[#78685e]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#381c10]">
                      {money(bagTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-wider text-[#78685e]">
                    <span>Delivery ({agency})</span>
                    <span className="font-medium text-[#381c10]">
                      {money(shippingFee)}
                    </span>
                  </div>
                </div>

                {/* ── Total ── */}
                <div className="border-t border-[rgb(56_28_16_/_12%)] pt-5 flex justify-between items-baseline">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#381c10]">
                    Total Amount
                  </span>
                  <span className="font-editorial text-2xl sm:text-3xl font-medium text-[#381c10]">
                    {money(finalTotal)}
                  </span>
                </div>

                {/* Dispatch promise */}
                <div className="flex items-center gap-2.5 rounded-xl border border-[rgb(56_28_16_/_10%)] bg-white/70 p-3 text-[11px] text-[#78685e]">
                  <Truck
                    size={16}
                    className="text-[#7f472d] shrink-0"
                  />
                  <span>
                    Delivered anywhere in Pakistan by {agency}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
