import type { CSSProperties } from "react"
import { Link, useOutletContext } from "react-router"
import { ArrowRight, Printer, Send } from "lucide-react"
import type { Order, StorefrontContext } from "@/Storefront"
import { getProductImageUrl, money } from "@/data/products"
import "../order-confirmation.css"


// The plane flies this path, looping once around the tick at (50, 100).
const FLIGHT =
  "M -60 178 C -10 196, 70 186, 112 150 C 150 112, 128 34, 58 30 C -2 28, -30 92, 4 134 C 40 178, 200 170, 420 10"

const delay = (seconds: number): CSSProperties => ({
  animationDelay: `${seconds}s`,
})

function OrderTick() {
  return (
    <div className="oc-flight" aria-hidden="true">
      <svg viewBox="0 0 340 200" width="340" height="200">
        <defs>
          <mask
            id="oc-trail-mask"
            maskUnits="userSpaceOnUse"
            x="-100"
            y="-40"
            width="560"
            height="280"
          >
            <path className="oc-trail-reveal" pathLength={1} d={FLIGHT} />
          </mask>
        </defs>
        <path className="oc-trail" d={FLIGHT} mask="url(#oc-trail-mask)" />
        <circle className="oc-ring-fill" cx="50" cy="100" r="44" />
        <circle className="oc-ring" cx="50" cy="100" r="44" pathLength={1} />
        <path className="oc-check" d="M31 101 L45 115 L70 87" pathLength={1} />
      </svg>
      <span className="oc-plane" style={{ offsetPath: `path("${FLIGHT}")` }}>
        <Send size={22} strokeWidth={1.6} fill="#f8f3e9" />
      </span>
    </div>
  )
}

function readStoredOrder(): Order | null {
  try {
    const stored = localStorage.getItem("beast_sports_last_order")
    return stored ? (JSON.parse(stored) as Order) : null
  } catch {
    return null
  }
}

export default function OrderConfirmationPage() {
  const { lastOrder } = useOutletContext<StorefrontContext>()
  const order = lastOrder ?? readStoredOrder()

  if (!order) {
    return (
      <section className="bg-[#fbf9f6] px-6 py-24 text-center text-[#381c10]">
        <p className="store-eyebrow text-[#7f472d]">NO RECENT ORDER</p>
        <h1 className="mt-5 font-editorial text-5xl">Nothing to confirm yet.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-[#78685e]">
          Place an order from your bag and its receipt will show up here.
        </p>
        <Link className="store-button mt-7" to="/shop">
          Explore the shop
        </Link>
      </section>
    )
  }

  const firstName = order.customer.fullName.split(" ")[0]
  const isCod = order.paymentMethod === "Cash on Delivery"
  const phone = <strong className="text-[#381c10]">{order.customer.phone}</strong>
  const total = <strong className="text-[#381c10]">{money(order.total)}</strong>
  const steps = [
    {
      title: isCod ? "Confirmation call" : "Payment check",
      body: isCod ? (
        <>We call you on {phone} to confirm the order.</>
      ) : (
        <>
          We check your {order.paymentMethod} screenshot, then call you on {phone}.
        </>
      ),
    },
    {
      title: "Packed and sent",
      // Orders saved before the courier choice existed have no agency.
      body: `Once confirmed, we pack your gear and hand it to ${order.deliveryAgency ?? "the courier"}.`,
    },
    {
      title: "At your door",
      body: isCod ? (
        <>Check your gear, then pay the rider {total} in cash.</>
      ) : (
        <>Already paid. Just receive your parcel.</>
      ),
    },
  ]

  return (
    <div className="oc-page overflow-x-clip bg-[#fbf9f6] px-4 py-10 text-[#381c10] sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ── Left: the moment, what happens next, where it's going ── */}
        <div className="min-w-0 lg:col-span-7">
          <OrderTick />

          <p className="oc-rise store-eyebrow mt-2 text-[#7f472d]" style={delay(0.9)}>
            ORDER <span className="font-mono tracking-normal">{order.id}</span> · {order.date}
          </p>
          <h1
            className="oc-rise mt-4 font-editorial text-5xl leading-[1.02] tracking-tight sm:text-6xl"
            style={delay(1)}
          >
            That’s in the bag, {firstName}.
          </h1>
          <p
            className="oc-rise mt-5 max-w-lg text-sm leading-relaxed text-[#78685e] sm:text-base"
            style={delay(1.1)}
          >
            {isCod
              ? "Your order is placed. Nothing to pay now: you pay the rider in cash when it arrives."
              : "Your order is placed with your payment screenshot. We’ll confirm it once we’ve checked the payment."}
          </p>

          <ol className="mt-10 border-l border-[rgb(56_28_16_/_15%)]">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="oc-rise relative pb-7 pl-8 last:pb-0"
                style={delay(1.25 + i * 0.12)}
              >
                <span className="absolute -left-[13px] top-0 grid size-[26px] place-items-center rounded-full border border-[rgb(56_28_16_/_20%)] bg-[#fbf9f6] text-[11px] font-semibold tabular-nums">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#78685e]">{step.body}</p>
              </li>
            ))}
          </ol>

          <dl
            className="oc-rise mt-10 grid gap-x-6 gap-y-2.5 border-t border-[rgb(56_28_16_/_10%)] pt-6 text-sm sm:grid-cols-[7rem_1fr]"
            style={delay(1.6)}
          >
            <dt className="font-semibold">Deliver to</dt>
            <dd className="text-[#78685e]">
              {order.customer.fullName}
              <br />
              {order.customer.address}, {order.customer.city}
            </dd>
            {order.customer.email && (
              <>
                <dt className="font-semibold">Email</dt>
                <dd className="text-[#78685e]">{order.customer.email}</dd>
              </>
            )}
            {order.customer.notes && (
              <>
                <dt className="font-semibold">Your note</dt>
                <dd className="italic text-[#78685e]">“{order.customer.notes}”</dd>
              </>
            )}
          </dl>

          <div className="oc-rise mt-10 flex flex-wrap items-center gap-3" style={delay(1.7)}>
            <Link className="store-button" to="/shop">
              Keep shopping <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgb(56_28_16_/_16%)] px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#eee9e2]"
            >
              <Printer size={14} /> Print receipt
            </button>
            <Link
              to="/contact"
              className="text-xs text-[#78685e] underline underline-offset-4 hover:text-[#381c10]"
            >
              Need to change something?
            </Link>
          </div>
        </div>

        {/* ── Right: the receipt ── */}
        <div className="oc-rise min-w-0 lg:col-span-5 lg:pt-10" style={delay(0.6)}>
          <div className="rounded-t-2xl border border-b-0 border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-6 sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-editorial text-3xl">Receipt</h2>
              <span className="font-mono text-xs text-[#78685e]">{order.id}</span>
            </div>
            <p className="mt-1 text-xs text-[#78685e]">
              {order.date} · {order.paymentMethod}
            </p>

            <ul className="mt-5 max-h-[320px] space-y-4 overflow-y-auto border-t border-dashed border-[rgb(56_28_16_/_20%)] pt-5 pr-1">
              {order.items.map((item, idx) => (
                <li key={`${item.id}-${idx}`} className="flex items-center gap-3 text-xs">
                  <img
                    src={getProductImageUrl(item.image)}
                    alt=""
                    className="size-14 shrink-0 rounded-xl border border-[rgb(56_28_16_/_8%)] bg-[#eee9e2] object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#78685e]">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-[11px] text-[#78685e] tabular-nums">Qty {item.quantity}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {money(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-dashed border-[rgb(56_28_16_/_20%)] pt-4 text-xs text-[#78685e] tabular-nums">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-[#381c10]">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="font-medium text-[#381c10]">
                  {order.shipping === 0 ? "Free" : money(order.shipping)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-[rgb(56_28_16_/_15%)] pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isCod ? "Pay on delivery" : "Paid in advance"}
              </span>
              <span className="font-editorial text-3xl font-medium tabular-nums">
                {money(order.total)}
              </span>
            </div>
          </div>

          {/* Torn-paper bottom edge */}
          <svg
            viewBox="0 0 400 14"
            preserveAspectRatio="none"
            className="-mt-px block h-3.5 w-full text-[#f8f3e9]"
            aria-hidden="true"
          >
            <polygon
              points="0,0 10,14 20,0 30,14 40,0 50,14 60,0 70,14 80,0 90,14 100,0 110,14 120,0 130,14 140,0 150,14 160,0 170,14 180,0 190,14 200,0 210,14 220,0 230,14 240,0 250,14 260,0 270,14 280,0 290,14 300,0 310,14 320,0 330,14 340,0 350,14 360,0 370,14 380,0 390,14 400,0"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
