import { Link } from "react-router"
import { ArrowLeft, Check, EyeOff, Lock, Shield, UserCheck } from "lucide-react"

export default function PrivacyPolicyPage() {
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
          <p className="store-eyebrow text-[#7f472d] mb-2">HONEST DATA PRACTICES</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            Privacy Policy.
          </h1>
          <p className="mt-3 text-base text-[#78685e] leading-relaxed">
            We value your trust as much as the quality of our sports gear. Here is an honest,
            straightforward explanation of how BeastSports collects, uses, and safeguards your
            personal details.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-[rgb(56_28_16_/_10%)] pt-6 text-xs text-[#78685e]">
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <EyeOff size={15} className="text-[#7f472d]" /> Never sold to advertisers
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <Lock size={15} className="text-[#7f472d]" /> Zero credit card storage
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#381c10]">
              <Shield size={15} className="text-[#7f472d]" /> Secure dispatch protocols
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
              Information We Collect
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                When you place an order or message us for sports gear consultation, we only ask for
                the bare minimum necessary to deliver your package:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong className="text-[#381c10]">Delivery Details:</strong> Your full name, delivery
                  address, city, and mobile phone number.
                </li>
                <li>
                  <strong className="text-[#381c10]">Order Preferences:</strong> Chosen product sizes,
                  bat models, custom weight notes, and color variations.
                </li>
                <li>
                  <strong className="text-[#381c10]">Customer Inquiries:</strong> Any questions or notes
                  you send via email or WhatsApp regarding bat knocking or sizing.
                </li>
              </ul>
              <p className="text-xs bg-[#f8f3e9] p-3 rounded-xl border border-[rgb(56_28_16_/_10%)] text-[#381c10]">
                <strong>We do NOT store payment cards:</strong> Because we operate on Cash on Delivery
                and encrypted gateways, we never store or see your debit card numbers, credit card CVVs,
                or banking pins.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                2
              </span>
              How We Use Your Information
            </h2>
            <div className="mt-4 space-y-3">
              <p>Your details are used exclusively for:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Fulfilling, boxing, and dispatching your sports equipment orders.</li>
                <li>
                  Sending you order confirmation updates and courier tracking numbers via SMS or
                  WhatsApp.
                </li>
                <li>Contacting you if an item is out of stock or requires weight verification.</li>
                <li>Processing returns, size exchanges, or bat warranty assessments.</li>
              </ul>
              <p>
                We do not spam you with unsolicited promotional phone calls, nor do we sell or rent
                customer phone lists to telemarketers or third parties.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                3
              </span>
              Local Storage & Site Cookies
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                BeastSports uses minimal local browser storage to keep your shopping bag active while
                you browse between cricket bats, shoes, and workout apparel. This data remains on your
                device and is not transmitted to external marketing networks.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-editorial text-2xl font-medium text-[#381c10] flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f8f3e9] text-xs font-bold text-[#7f472d]">
                4
              </span>
              Your Privacy Rights & Contact
            </h2>
            <div className="mt-4 space-y-3">
              <p>
                You can ask us at any time to delete your past order history, update your phone
                number, or remove your contact details from our records:
              </p>
              <div className="mt-3 rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-4 text-xs">
                <p className="font-semibold text-[#381c10]">Privacy Officer Contact:</p>
                <p className="mt-1">
                  Email:{" "}
                  <a href="mailto:privacy@beastsports.com" className="text-[#7f472d] underline">
                    privacy@beastsports.com
                  </a>{" "}
                  or{" "}
                  <a href="mailto:hello@beastsports.com" className="text-[#7f472d] underline">
                    hello@beastsports.com
                  </a>
                </p>
                <p className="mt-1">Headquarters: Sports Industrial Zone, Sialkot, Pakistan.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

