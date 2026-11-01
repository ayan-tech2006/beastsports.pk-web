import { Link } from "react-router"
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react"

export default function ShippingPolicyPage() {
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

        {/* Hero Section */}
        <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-8 sm:p-12 shadow-xs">
          <p className="store-eyebrow text-[#7f472d] mb-2">DELIVERY INFORMATION</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            Shipping & Delivery Policy.
          </h1>
          <p className="mt-3 text-base text-[#78685e] leading-relaxed">
            Good gear, carefully inspected and securely boxed, straight to your doorstep or sports
            club. Read all details regarding delivery charges, timelines, and Cash on Delivery.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-[rgb(56_28_16_/_10%)] pt-6 text-xs text-[#78685e]">
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <Truck size={15} className="text-[#7f472d]" /> TCS & Post Office
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <Clock size={15} className="text-[#7f472d]" /> 2-4 Days nationwide
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <ShieldCheck size={15} className="text-[#7f472d]" /> Cash on Delivery available
            </span>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="mt-10 space-y-8">
          {/* 1. Delivery Rates & Free Threshold */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                1
              </span>
              Delivery Charges (Shipping Rates)
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-3">
              <p>
                Each product has its own delivery charge for each courier. You see the exact
                total at checkout, before you place the order:
              </p>
              <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-[rgb(56_28_16_/_8%)]">
                  <span className="font-medium text-[#381c10]">Post Office</span>
                  <span className="font-bold text-[#381c10]">Charge shown per product</span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="font-medium text-[#381c10]">TCS</span>
                  <span className="font-bold text-[#381c10]">Charge shown per product</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Delivery Timelines */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                2
              </span>
              Delivery Timeline (Kitne Din Lagenge)
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-4">
              <p>
                All orders are dispatched from our central warehouse and fulfillment centers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                  <p className="font-semibold text-[#381c10] text-sm">Major Cities</p>
                  <p className="text-[11px] text-[#7f472d] mt-1 font-medium">2 to 3 Business Days</p>
                  <p className="mt-2 text-[#78685e]">
                    Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Sialkot, Gujranwala.
                  </p>
                </div>
                <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                  <p className="font-semibold text-[#381c10] text-sm">Regional & Other Cities</p>
                  <p className="text-[11px] text-[#7f472d] mt-1 font-medium">3 to 4 Business Days</p>
                  <p className="mt-2 text-[#78685e]">
                    Peshawar, Multan, Quetta, Abbottabad, Bahawalpur, Hyderabad, Sukkur.
                  </p>
                </div>
                <div className="rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4">
                  <p className="font-semibold text-[#381c10] text-sm">Remote & Tehsils</p>
                  <p className="text-[11px] text-[#7f472d] mt-1 font-medium">4 to 6 Business Days</p>
                  <p className="mt-2 text-[#78685e]">
                    Outlying areas and rural districts served via specialized regional express couriers.
                  </p>
                </div>
              </div>
              <p className="text-xs italic text-[#78685e]">
                Note: Orders confirmed before 3:00 PM (Monday through Saturday) are dispatched on the
                exact same day. Orders placed on Sundays or public holidays are processed the next
                working morning.
              </p>
            </div>
          </section>

          {/* 3. Cash on Delivery Process */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                3
              </span>
              Cash on Delivery (COD) Guidelines
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-3">
              <p>
                To make ordering 100% risk-free, BeastSports offers nationwide Cash on Delivery:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong className="text-[#381c10]">Verification:</strong> Within 24 hours of placing
                  your order, our team will call or message on WhatsApp to confirm the address and
                  gear size.
                </li>
                <li>
                  <strong className="text-[#381c10]">Exact Change:</strong> Please keep the exact
                  amount ready at delivery to help the courier rider expedite your handover.
                </li>
                <li>
                  <strong className="text-[#381c10]">Tamper-Proof Packaging:</strong> All bats and
                  equipment are shipped in BeastSports reinforced boxes with sealed tamper tape. If the
                  outer seal appears cut or opened, please take a quick picture and inform us before
                  accepting.
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Order Tracking */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                4
              </span>
              Order Tracking & Questions
            </h2>
            <div className="mt-4 text-sm text-[#78685e] leading-relaxed space-y-3">
              <p>
                As soon as your package is dispatched, you receive a direct tracking link via SMS and
                WhatsApp. If your parcel is delayed due to weather, road blockades, or courier delays,
                our dedicated dispatch team will proactively assist you.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#381c10] px-5 py-2.5 text-xs font-medium text-[#f8f3e9] hover:bg-[#5e2b16]"
                >
                  Contact Dispatch Team
                </Link>
                <Link
                  to="/return-policy"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(56_28_16_/_20%)] bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#381c10] hover:bg-[#eee9e2]"
                >
                  View Return Policy
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

