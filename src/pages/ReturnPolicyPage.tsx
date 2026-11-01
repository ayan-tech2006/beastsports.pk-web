import { Link } from "react-router"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10] pb-24 pt-10">
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
        <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-8 sm:p-12 shadow-xs">
          <p className="store-eyebrow text-[#7f472d] mb-2">HASSLE-FREE GUARANTEE</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            Return & Exchange Policy.
          </h1>
          <p className="mt-3 text-base text-[#78685e] leading-relaxed">
            Finding the right weight, grip, and fit is essential for any athlete. If your gear
            doesn’t feel 100% right, we provide a smooth 30-day return and exchange policy.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-[rgb(56_28_16_/_10%)] pt-6 text-xs text-[#78685e]">
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <RotateCcw size={15} className="text-[#7f472d]" /> 30-Day Window
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <RefreshCw size={15} className="text-[#7f472d]" /> Free Size Exchanges
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <ShieldCheck size={15} className="text-[#7f472d]" /> Genuine Equipment Guarantee
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-8">
          {/* 1. Policy Overview */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                1
              </span>
              The 30-Day Return & Exchange Promise
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-3">
              <p>
                From the day you receive your parcel, you have <strong>30 calendar days</strong> to
                try the fit, test the pickup of your cricket bat, or inspect the craftsmanship of
                your gear in the comfort of your home.
              </p>
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4 text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-[#381c10]">What We Cover:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                    <span>Free size exchanges for footwear & apparel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                    <span>Bat weight or pickup adjustments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                    <span>Manufacturing defects or material flaws</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                    <span>Damage during courier transit</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Eligible Conditions */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                2
              </span>
              Conditions for Return & Exchange
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-3">
              <p>
                To qualify for a full exchange or refund, returned items must be in restockable
                condition:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Cricket Bats:</strong> Must not be used in matches or outdoor nets with hard
                  cricket balls. Ball marks or seam indentations indicate active pitch play and cannot
                  be accepted for return. Please test the bat pickup indoors with light shadow swings.
                </li>
                <li>
                  <strong>Shoes & Spikes:</strong> Must be tried indoors on clean carpets or clean
                  floors. Soles must be spotless and free of outdoor mud or grass stains.
                </li>
                <li>
                  <strong>Apparel & Kits:</strong> Must be unwashed, unworn, and have all original
                  hangtags and barcodes attached.
                </li>
                <li>
                  <strong>Original Packaging:</strong> Please retain the original BeastSports box and
                  protective bubble sleeves.
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Step-by-Step Procedure */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                3
              </span>
              How to Request an Exchange (4 Simple Steps)
            </h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                <span className="font-mono text-xs font-bold text-[#7f472d]">STEP 01</span>
                <p className="mt-1 font-semibold text-[#381c10] text-sm">Message Us</p>
                <p className="mt-1 text-[#78685e]">
                  Send your Order ID (BST-...) on WhatsApp (+92 300 1234567) or email.
                </p>
              </div>
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                <span className="font-mono text-xs font-bold text-[#7f472d]">STEP 02</span>
                <p className="mt-1 font-semibold text-[#381c10] text-sm">Specify Exchange</p>
                <p className="mt-1 text-[#78685e]">
                  Tell us your preferred replacement size, weight, or model.
                </p>
              </div>
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                <span className="font-mono text-xs font-bold text-[#7f472d]">STEP 03</span>
                <p className="mt-1 font-semibold text-[#381c10] text-sm">Courier Pickup</p>
                <p className="mt-1 text-[#78685e]">
                  We schedule a reverse courier rider to collect the item from your doorstep.
                </p>
              </div>
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                <span className="font-mono text-xs font-bold text-[#7f472d]">STEP 04</span>
                <p className="mt-1 font-semibold text-[#381c10] text-sm">New Item Sent</p>
                <p className="mt-1 text-[#78685e]">
                  Your new item is dispatched within 24 hours of inspection.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Non-Returnable Exceptions */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                4
              </span>
              Exceptions & Non-Returnable Items
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-3">
              <p>
                For athletic safety and hygiene, a few specific items cannot be returned once
                opened:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  Customized cricket bats with personal laser engraving or custom weight shaving.
                </li>
                <li>Mouthguards, groin protectors, and compression underwear (hygiene standards).</li>
                <li>Clearance sale items marked as "Final Sale / As-is".</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-4 pt-2">
                <Link
                  to="/size-guide"
                  className="inline-flex items-center gap-2 rounded-full bg-[#381c10] px-5 py-2.5 text-xs font-medium text-[#f8f3e9] hover:bg-[#5e2b16]"
                >
                  Check Size Guide First
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(56_28_16_/_20%)] bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#381c10] hover:bg-[#eee9e2]"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

