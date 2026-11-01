// Stock line above "Add to bag": sold out, or a nudge when only a few are left (same stock as the app).
export default function StockNote({ stock, className = "" }: { stock: number; className?: string }) {
  if (stock > 5) return null
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wider ${stock <= 0 ? "text-[#a3341f]" : "text-[#7f472d]"} ${className}`}
      role="status"
    >
      {stock <= 0 ? "Sold out" : `Only ${stock} left in stock`}
    </p>
  )
}
