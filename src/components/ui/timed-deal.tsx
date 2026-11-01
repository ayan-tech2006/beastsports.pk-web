import { useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { money } from "@/data/products"
import "./timed-deal.css"

// The deal comes from the admin panel's Website Home screen (product, discount and end time).
type TimedDealProps = {
  product: {
    name: string
    image: string
    price: number
    originalPrice: number
  }
  title: string
  endsAt: string
  onShop: () => void
  onBrowseSale: () => void
}

export default function TimedDeal({
  product,
  title,
  endsAt,
  onShop,
  onBrowseSale,
}: TimedDealProps) {
  const [now, setNow] = useState(() => Date.now())
  const parsedDeadline = Date.parse(endsAt)
  const deadline = Number.isFinite(parsedDeadline) ? parsedDeadline : 0
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000))
  const expired = remaining === 0
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  const saving = product.originalPrice - product.price
  const discount = Math.round((saving / product.originalPrice) * 100)
  const endLabel = deadline
    ? new Intl.DateTimeFormat("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Karachi",
      }).format(deadline)
    : "the configured deadline"

  useEffect(() => {
    if (deadline <= Date.now()) return
    const interval = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= deadline) window.clearInterval(interval)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [deadline])

  return (
    <section
      className="timed-deal store-section"
      id="season-sale"
      aria-labelledby="timed-deal-title"
      data-expired={expired}
    >
      <div className="deal-product-stage">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="deal-discount">SAVE {discount}%</span>
        <span className="deal-stage-caption">BEAST FLASH DEAL</span>
      </div>
      <div className="deal-details">
        <div className="deal-kicker-row">
          <p className="store-eyebrow">THE LIMITED-TIME DEAL</p>
        </div>
        <h2 id="timed-deal-title">{title}</h2>
        <p className="deal-description">
          A flash price on {product.name} for a short time only. When the
          timer runs out, the price goes back up.
        </p>
        <div className="deal-price">
          <strong>{money(product.price)}</strong>
          <del>{money(product.originalPrice)}</del>
          <span>Save {money(saving)}</span>
        </div>
        <p className="deal-timer-label">
          {expired
            ? "THIS DEAL HAS ENDED"
            : "A GOOD TIME TO MAKE YOUR MOVE"}
        </p>
        <div
          className="deal-countdown"
          role="timer"
          aria-live="off"
          aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
        >
          {[
            { label: "Days", value: days },
            { label: "Hours", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map((part) => (
            <div className="deal-time-unit" key={part.label}>
              <span>{String(part.value).padStart(2, "0")}</span>
              <small>{part.label}</small>
            </div>
          ))}
        </div>
        <p className="deal-end-date">
          {expired ? "Ended" : "Ends"}{" "}
          <time dateTime={endsAt}>{endLabel} (PKT)</time>
        </p>
        <div className="deal-actions">
          <button
            className="store-button store-button-light deal-action"
            type="button"
            disabled={expired}
            onClick={onShop}
          >
            {expired ? "Offer ended" : "Shop this deal"}
            <ArrowRight size={17} strokeWidth={1.4} />
          </button>
          <Link to="/#sale-products" onClick={onBrowseSale}>
            All sale products <ArrowRight size={15} strokeWidth={1.4} />
          </Link>
        </div>
      </div>
    </section>
  )
}
