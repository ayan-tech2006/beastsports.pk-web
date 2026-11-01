import { useState, type FormEvent } from "react"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
} from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.message) return
    setSubmitted(true)
  }

  const inputClass =
    "w-full border-b border-[rgb(56_28_16_/_15%)] bg-transparent py-3 text-sm text-[#381c10] placeholder:text-[#bcaa99] outline-none transition-colors focus:border-[#7f472d]"

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10]">
      {/* ── Hero heading section ── */}
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8 sm:px-8 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Left: kicker + heading */}
          <div>
            <p className="store-eyebrow text-[#7f472d] mb-4">GET IN TOUCH</p>
            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.95]">
              Contact Us
            </h1>
          </div>
          {/* Right: description */}
          <p className="max-w-xs text-[13px] leading-relaxed text-[#78685e] lg:pb-2">
            Tell us about your gear needs and we'll get back to you within 24
            hours. Our sports advisors are here to help.
          </p>
        </div>
      </div>

      {/* ── Form + Image section ── */}
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 pb-20">
        {submitted ? (
          /* ── Success state ── */
          <div className="rounded-2xl border border-[rgb(56_28_16_/_10%)] bg-white p-10 sm:p-14 text-center max-w-2xl mx-auto mt-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ebe4] text-[#7f472d]">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="font-editorial text-3xl font-medium text-[#381c10]">
              Message Sent!
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#78685e] leading-relaxed">
              Thank you, <strong className="text-[#381c10]">{formData.name}</strong>. We
              have received your message regarding "{formData.topic || "General Inquiry"}".
              Our team will reach out within 2–4 hours.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  topic: "",
                  message: "",
                })
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#381c10] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-[#f8f3e9] hover:bg-[#5e2b16] transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* ── LEFT: Form ── */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-7 space-y-0"
            >
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div className="py-1">
                  <label className="block text-xs font-medium text-[#381c10] mb-0.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
                <div className="py-1">
                  <label className="block text-xs font-medium text-[#381c10] mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 2: Phone + Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-5">
                <div className="py-1">
                  <label className="block text-xs font-medium text-[#381c10] mb-0.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+92 300 1234567"
                    className={inputClass}
                  />
                </div>
                <div className="py-1 relative">
                  <label className="block text-xs font-medium text-[#381c10] mb-0.5">
                    Select Your Topic
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className={`${inputClass} appearance-none cursor-pointer pr-8`}
                  >
                    <option value="">Choose your topic...</option>
                    <option value="Bat Advice / Selection">
                      Cricket Bat Selection &amp; Advice
                    </option>
                    <option value="Bat Knocking Service">
                      Bat Knocking &amp; Oiling
                    </option>
                    <option value="Order Status & Tracking">
                      Order Status &amp; Tracking
                    </option>
                    <option value="Size Exchange & Return">
                      Size Exchange or Return
                    </option>
                    <option value="Club / Team Bulk Order">
                      Club / Academy Bulk Order
                    </option>
                    <option value="Other">Other</option>
                  </select>
                  {/* Dropdown chevron */}
                  <svg
                    className="pointer-events-none absolute right-0 bottom-3.5 h-4 w-4 text-[#78685e]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Row 3: Message (full width) */}
              <div className="mt-5 py-1">
                <label className="block text-xs font-medium text-[#381c10] mb-0.5">
                  Message / Special Requests
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Anything else we should know?"
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Submit button row */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  type="submit"
                  className="rounded-full !bg-[#381c10] px-7 py-3 text-xs font-semibold uppercase tracking-wider !text-[#f8f3e9] hover:!bg-[#5e2b16] transition-colors cursor-pointer"
                  style={{ backgroundColor: "#381c10", color: "#f8f3e9" }}
                >
                  Send Your Inquiry
                </button>
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-full !bg-[#381c10] !text-[#f8f3e9] hover:!bg-[#5e2b16] transition-colors cursor-pointer"
                  style={{ backgroundColor: "#381c10", color: "#f8f3e9" }}
                  aria-label="Submit"
                >
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </form>

            {/* ── RIGHT: Image with badge ── */}
            <div className="lg:col-span-5 relative mt-2 lg:mt-0">
              <div className="overflow-hidden rounded-2xl aspect-[4/5]">
                <img
                  src="/images/cricket.jpg"
                  alt="BeastSports cricket gear"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Badge overlay */}
              <div className="absolute top-5 right-5 rounded-lg bg-[#381c10]/85 backdrop-blur-sm px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f8f3e9]">
                  Your Gear Expert
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Contact Info Cards ── */}
      <div className="border-t border-[rgb(56_28_16_/_8%)] bg-[#fbf9f6]">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {/* Call & WhatsApp */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(56_28_16_/_12%)]">
                <Phone size={18} className="text-[#381c10]" />
              </div>
              <h3 className="font-editorial text-lg font-medium text-[#381c10]">
                Call &amp; WhatsApp
              </h3>
              <div className="mt-2 space-y-0.5 text-[13px] text-[#78685e]">
                <p>+92 300 123 4567</p>
                <p>+92 52 456 7890</p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(56_28_16_/_12%)]">
                <Clock size={18} className="text-[#381c10]" />
              </div>
              <h3 className="font-editorial text-lg font-medium text-[#381c10]">
                Working Hours
              </h3>
              <div className="mt-2 space-y-0.5 text-[13px] text-[#78685e]">
                <p>Mon – Sat: 9 AM – 8 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            {/* Write to Us */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[rgb(56_28_16_/_12%)]">
                <Mail size={18} className="text-[#381c10]" />
              </div>
              <h3 className="font-editorial text-lg font-medium text-[#381c10]">
                Write to Us
              </h3>
              <div className="mt-2 space-y-0.5 text-[13px] text-[#78685e]">
                <p>hello@beastsports.com</p>
                <p>orders@beastsports.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
