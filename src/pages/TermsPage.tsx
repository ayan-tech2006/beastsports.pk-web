import { Link } from "react-router"
import { ArrowLeft, BookOpen, FileCheck, Scale, ShieldAlert } from "lucide-react"

export default function TermsPage() {
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
          <p className="store-eyebrow text-[#7f472d] mb-2">STORE AGREEMENT</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            Terms & Conditions.
          </h1>
          <p className="mt-3 text-base text-[#78685e] leading-relaxed">
            Welcome to BeastSports. By browsing our collections, placing an order, or interacting with
            our services, you agree to the following terms and sporting equipment standards.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-[rgb(56_28_16_/_10%)] pt-6 text-xs text-[#78685e]">
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <Scale size={15} className="text-[#7f472d]" /> Fair Athletic Standards
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <FileCheck size={15} className="text-[#7f472d]" /> Cash on Delivery Integrity
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <ShieldAlert size={15} className="text-[#7f472d]" /> 6-Month Handle Warranty
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-8 text-sm text-[#78685e] leading-relaxed">
          {/* Section 1 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                1
              </span>
              Product Accuracy & Natural Willow Variations
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                We take immense pride in crafting genuine sports equipment. However, please note:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong className="text-[#381c10]">Natural Willow Grains:</strong> English and Kashmir
                  willow are natural organic woods. Grains, heartwood coloring, and natural speck marks
                  vary between clefts. These are natural signatures of premium wood and do not affect
                  performance.
                </li>
                <li>
                  <strong className="text-[#381c10]">Weight Tolerance:</strong> Handcrafted cricket bats
                  carry a weight tolerance of approximately ±15 grams (or ±0.5 oz) due to natural
                  atmospheric moisture variations.
                </li>
                <li>
                  <strong className="text-[#381c10]">Color & Photography:</strong> While our studio
                  photos represent actual products, screen calibrations may cause subtle hue
                  differences.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                2
              </span>
              Cash on Delivery (COD) Commitment
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                Cash on Delivery is provided as a convenience to ensure honest, risk-free transactions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  By clicking <strong>"Place Order"</strong>, you confirm your legal intent to receive
                  the package and pay the courier rider the stated invoice amount upon arrival.
                </li>
                <li>
                  Unjustified refusal of parcels upon delivery causes significant freight damage and
                  losses. Customers who place bogus orders or repeatedly refuse confirmed deliveries
                  without valid cause will have their phone numbers and addresses blacklisted from
                  future service.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                3
              </span>
              Cricket Bat Warranty & Care Policy
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                Cricket bats face intense kinetic impact from cricket balls traveling at high speeds.
                Our warranty terms reflect professional cricketing standards:
              </p>
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4 text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-[#381c10]">
                  6-Month Handle Manufacturing Warranty:
                </p>
                <p>
                  We offer a full 6-month repair or replacement warranty against cane handle
                  detachment or internal handle glue failure caused by manufacturing defects.
                </p>
                <p className="font-semibold text-[#381c10] pt-2">What Is NOT Covered Under Warranty:</p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>
                    Toe cracks caused by digging out fast yorkers or striking hard concrete/stones.
                  </li>
                  <li>
                    Surface ball seam marks, natural surface denting, or minor edge chipping that
                    naturally occurs when playing with hard 156g cricket balls.
                  </li>
                  <li>Bats damaged by bowling machines, hard plastic balls, or water logging.</li>
                  <li>Unknocked bats used directly in competitive fast-pitch matches.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                4
              </span>
              Intellectual Property & Trademarks
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                The BEASTSPORTS® wordmark, logos, custom bat decal artwork, product photography, and
                text descriptions are the exclusive intellectual property of BeastSports.
                Unauthorized commercial duplication or reproduction is strictly prohibited.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 border-t border-[rgb(56_28_16_/_10%)] pt-4">
                <Link
                  to="/return-policy"
                  className="text-xs font-semibold text-[#7f472d] underline hover:text-[#381c10]"
                >
                  Return & Exchange Policy
                </Link>
                <Link
                  to="/privacy-policy"
                  className="text-xs font-semibold text-[#7f472d] underline hover:text-[#381c10]"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/contact"
                  className="text-xs font-semibold text-[#7f472d] underline hover:text-[#381c10]"
                >
                  Contact Legal & Support
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

