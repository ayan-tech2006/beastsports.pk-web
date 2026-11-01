import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Search,
} from "lucide-react"

type FaqItem = {
  id: string
  category: "Orders & COD" | "Cricket Bats" | "Sizing" | "Shipping" | "Returns"
  question: string
  answer: string
}

const faqList: FaqItem[] = [
  {
    id: "cod-guest",
    category: "Orders & COD",
    question: "Do I need to create an account or login to order?",
    answer:
      "No! BeastSports operates an open guest checkout. Simply add your items to the bag, provide your name, delivery address, phone number, and city, and your order will be placed instantly via Cash on Delivery.",
  },
  {
    id: "cod-payment",
    category: "Orders & COD",
    question: "How does Cash on Delivery (COD) work?",
    answer:
      "When you place an order, no payment is required online. We verify your address and gear selection via call or WhatsApp. The parcel is then handed to our courier partner. You pay the exact invoice amount in cash directly to the courier rider upon delivery at your doorstep.",
  },
  {
    id: "cod-open-parcel",
    category: "Orders & COD",
    question: "Can I inspect the parcel upon delivery?",
    answer:
      "All BeastSports orders are dispatched in branded, tamper-evident boxes. You can inspect the outer packaging to verify seals are intact. If you have any concerns after opening the box, you are protected by our 30-Day Hassle-Free Exchange & Return Policy.",
  },
  {
    id: "bat-knocking",
    category: "Cricket Bats",
    question: "Are Beast cricket bats pre-knocked and match-ready?",
    answer:
      "All Beast English Willow cricket bats receive extensive machine pressing and factory edge conditioning at our workshop. While they are semi-knocked, we recommend 1 to 2 hours of light mallet work around the edges and toe, followed by a few sessions with an old cricket ball in the nets before facing competitive match bowling.",
  },
  {
    id: "bat-willow-grades",
    category: "Cricket Bats",
    question: "What is the difference between Grade 1 English Willow and standard bats?",
    answer:
      "Grade 1 English willow is selected from top-tier clefts featuring 7 to 10 straight grains, minimal blemishes, and optimum natural moisture. This provides superior rebound ping, an expansive sweet spot, and feather-light pickup balance compared to heavier standard willow.",
  },
  {
    id: "bat-weight-tolerance",
    category: "Cricket Bats",
    question: "Can I request a specific bat weight (e.g. 2.8 lbs or 2.9 lbs)?",
    answer:
      "Yes! You can specify your preferred weight in the 'Order Notes' field during checkout or message our bat technicians on WhatsApp immediately after ordering. We will hand-select the cleft that matches your exact ounce preference.",
  },
  {
    id: "shoe-sizing",
    category: "Sizing",
    question: "Are your shoe sizes standard US sizes?",
    answer:
      "Yes, footwear sizes displayed are standard US athletic sizing. If you have wide feet or plan to wear heavy double cricket socks, we recommend choosing half a size larger. Please consult our detailed Size Guide for foot length in centimeters.",
  },
  {
    id: "apparel-fit",
    category: "Sizing",
    question: "How do your training tees and sets fit?",
    answer:
      "Our training apparel is cut for an athletic silhouette with four-way stretch. If you prefer a loose, relaxed fit for casual wear, order one size up. Check the chest and waist measurements on our Size Guide page.",
  },
  {
    id: "shipping-charges",
    category: "Shipping",
    question: "What are your delivery charges?",
    answer:
      "We deliver across Pakistan by TCS or Post Office. Each product has its own delivery charge for each courier, shown on the product page. Your exact total appears at checkout before you place the order.",
  },
  {
    id: "delivery-timeline",
    category: "Shipping",
    question: "Kitne din lagenge (How many days for delivery)?",
    answer:
      "Orders placed before 3:00 PM are dispatched on the same day. Major cities (Karachi, Lahore, Islamabad, Rawalpindi, Sialkot, Faisalabad) receive parcels within 2 to 3 business days. Other cities and regional towns take 3 to 5 business days.",
  },
  {
    id: "return-window",
    category: "Returns",
    question: "How long do I have to return or exchange an item?",
    answer:
      "You have 30 calendar days from the date of delivery to request a return or size exchange. Items must be in clean, unwashed, and original condition with tags attached.",
  },
  {
    id: "exchange-process",
    category: "Returns",
    question: "How do I request an exchange if the size does not fit?",
    answer:
      "Simply message our support team on WhatsApp (+92 300 1234567) or email hello@beastsports.com with your Order ID. We arrange a reverse courier pickup from your home and dispatch your replacement size without hassle.",
  },
]

const categories = [
  "All",
  "Orders & COD",
  "Cricket Bats",
  "Sizing",
  "Shipping",
  "Returns",
] as const

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [openIds, setOpenIds] = useState<string[]>(["cod-guest", "bat-knocking"])

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const filteredFaqs = faqList.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10] pb-24 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[#7f472d] uppercase transition-colors hover:text-[#381c10]"
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>

        {/* Hero */}
        <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-8 sm:p-12 shadow-xs text-center sm:text-left">
          <p className="store-eyebrow text-[#7f472d] mb-2">FREQUENTLY ASKED QUESTIONS</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            How can we help?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#78685e] max-w-xl">
            Clear answers about Cash on Delivery, cricket bat selection, knocking instructions,
            shipping timelines, and sizing.
          </p>

          {/* Quick Search */}
          <div className="relative mt-6 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. knocking, COD, shipping)..."
              className="w-full rounded-full border border-[rgb(56_28_16_/_18%)] bg-[#fbf9f6] py-3 pl-11 pr-4 text-xs sm:text-sm text-[#381c10] placeholder-[#78685e]/60 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#7f472d]"
            />
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-3.5 text-[#78685e]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#381c10] text-[#f8f3e9] shadow-xs"
                  : "bg-white text-[#381c10] border border-[rgb(56_28_16_/_12%)] hover:bg-[#eee9e2]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion Questions List */}
        <div className="mt-8 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-12 text-center text-sm text-[#78685e]">
              <HelpCircle size={32} className="mx-auto mb-3 text-[#7f472d]" />
              <p className="font-medium text-[#381c10]">No matching questions found.</p>
              <p className="mt-1">
                Try searching for something else or contact our customer team directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="mt-4 text-xs font-semibold text-[#7f472d] underline hover:text-[#381c10]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id)
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors hover:bg-[#fbf9f6]"
                  >
                    <span className="font-editorial text-lg sm:text-xl font-medium text-[#381c10]">
                      {faq.question}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f8f3e9] text-[#7f472d]">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[rgb(56_28_16_/_8%)] bg-[#fbf9f6]/40 p-5 sm:p-6 pt-4 text-xs sm:text-sm text-[#78685e] leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Help Banner */}
        <div className="mt-12 rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-[#f8f3e9] p-8 text-center sm:text-left shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-editorial text-2xl font-medium text-[#381c10]">
              Still have questions?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#78685e]">
              Can't find the answer you're looking for? Message our sports gear experts.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#381c10] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#f8f3e9] hover:bg-[#5e2b16]"
          >
            <MessageCircle size={15} /> Talk to an Expert
          </Link>
        </div>
      </div>
    </div>
  )
}

