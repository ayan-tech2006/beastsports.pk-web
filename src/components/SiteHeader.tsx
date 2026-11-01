import { useEffect, useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { NavBarDemo } from "@/components/ui/demo"
import { Search, ShoppingBag, Truck, X } from "lucide-react"

// Shop search needs every word to match, so keep these to words the catalog uses.
const popularSearches = ["Bat", "Running shoes", "Football", "Training"]
const shopSearchUrl = (q: string) =>
  `/shop?q=${encodeURIComponent(q.trim())}#shop-products`

export default function SiteHeader({
  bagCount = 0,
  onOpenBag,
}: {
  bagCount?: number
  onOpenBag?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [scrolled, setScrolled] = useState(() => window.scrollY > 90)
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const innerPage = pathname !== "/"
  const isProductPage = pathname.startsWith("/product/")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close the search bar after any navigation, and on Escape.
  useEffect(() => setSearchOpen(false), [pathname, search])
  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [searchOpen])

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(shopSearchUrl(query))
  }

  return (
    <>
      <div className="pdp-announcement">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
          <span className="hidden w-12 sm:block" aria-hidden="true" />
          <p className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap text-[#381c10]">
            <Truck size={14} strokeWidth={1.5} className="shrink-0 text-[#7f472d]" />
            <span className="sm:hidden">TCS & Post Office · COD available</span>
            <span className="hidden sm:inline">
              Delivery across Pakistan by TCS & Post Office · Cash on Delivery available
            </span>
          </p>
          <span className="hidden sm:inline font-mono text-[11px] text-[#78685e]">BEAST AUTHENTIC</span>
        </div>
      </div>
      <header
        className={`site-header ${innerPage ? "shop-site-header" : ""} ${
          innerPage || scrolled || menuOpen || searchOpen ? "solid" : ""
        }`}
      >
        <div className="navigation">
          <Link
            className="wordmark"
            to="/"
            aria-label="BeastSports home"
            onClick={() => setMenuOpen(false)}
          >
            <img className="wordmark-logo" src="/logo-mark.png" alt="" width={32} height={32} />
            BEASTSPORTS<span>®</span>
          </Link>
          <NavBarDemo mobileOpen={menuOpen} onMobileOpenChange={setMenuOpen} />
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className="relative grid size-10 shrink-0 cursor-pointer place-items-center text-inherit hover:opacity-80 transition-opacity"
              aria-label={searchOpen ? "Close search" : "Search sports gear"}
              aria-expanded={searchOpen}
              aria-controls="site-search"
            >
              {searchOpen ? (
                <X size={19} strokeWidth={1.5} />
              ) : (
                <Search size={19} strokeWidth={1.5} />
              )}
            </button>

            <button
              className="relative grid size-10 shrink-0 place-items-center text-inherit hover:opacity-80 transition-opacity"
              type="button"
              onClick={onOpenBag}
              aria-label={`Open shopping bag, ${bagCount} ${
                bagCount === 1 ? "item" : "items"
              }`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {bagCount > 0 && (
                <span className="absolute top-0.5 right-0.5 grid min-w-4 h-4 place-items-center rounded-full bg-[#a26748] px-1 text-[10px] font-bold leading-none text-white">
                  {bagCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {searchOpen && (
          <div
            id="site-search"
            className="absolute inset-x-0 top-full origin-top animate-[drop-in_.35s_cubic-bezier(.2,.8,.2,1)_both] border-b border-espresso/10 bg-ivory text-espresso shadow-[0_18px_30px_-24px_rgb(38_22_13_/_45%)]"
          >
            <div className="mx-auto max-w-3xl px-6 py-5 sm:px-10">
              <form
                role="search"
                onSubmit={submitSearch}
                className="group relative flex animate-[drop-in_.4s_.06s_cubic-bezier(.2,.8,.2,1)_both] items-center gap-3 pb-2"
              >
                {/* Underline draws itself left to right as the bar opens. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left animate-[draw-line_.6s_.12s_cubic-bezier(.2,.8,.2,1)_both] bg-espresso/30 group-focus-within:bg-espresso"
                />
                <Search className="shrink-0 text-clay" size={18} strokeWidth={1.5} />
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Search products</span>
                  <input
                    autoFocus
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search bats, shoes, kits…"
                    className="w-full min-w-0 bg-transparent py-2 text-base outline-none placeholder:text-clay/70"
                  />
                </label>
                <button
                  type="submit"
                  className="shrink-0 cursor-pointer text-xs font-semibold uppercase tracking-[.14em] disabled:opacity-40"
                  disabled={!query.trim()}
                >
                  Search
                </button>
              </form>
              <div className="mt-3 flex animate-[drop-in_.4s_.16s_cubic-bezier(.2,.8,.2,1)_both] flex-wrap items-center gap-x-4 gap-y-1 text-xs text-clay">
                <span>Popular:</span>
                {popularSearches.map((term) => (
                  <Link
                    key={term}
                    to={shopSearchUrl(term)}
                    className="underline-offset-4 hover:text-espresso hover:underline"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
