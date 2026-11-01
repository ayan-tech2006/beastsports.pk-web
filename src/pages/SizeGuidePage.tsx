import { useState } from "react"
import { Link } from "react-router"
import {
  ArrowLeft,
  Check,
  Compass,
  Footprints,
  Info,
  Ruler,
  Shirt,
} from "lucide-react"

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<"bats" | "apparel" | "footwear">("bats")

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10] pb-24 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
          <p className="store-eyebrow text-[#7f472d] mb-2">PRECISION ATHLETIC FIT</p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-medium tracking-tight">
            Comprehensive Size Guide.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#78685e] max-w-2xl leading-relaxed">
            The right equipment transforms your game. Find your exact cricket bat size and weight,
            training apparel measurements, and athletic footwear conversions.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-[rgb(56_28_16_/_10%)] pt-6">
            <button
              type="button"
              onClick={() => setActiveTab("bats")}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "bats"
                  ? "bg-[#381c10] text-[#f8f3e9] shadow-xs"
                  : "bg-[#f8f3e9] text-[#381c10] hover:bg-[#eee9e2]"
              }`}
            >
              <Ruler size={14} /> 1. Cricket Bat Size & Weight
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("apparel")}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "apparel"
                  ? "bg-[#381c10] text-[#f8f3e9] shadow-xs"
                  : "bg-[#f8f3e9] text-[#381c10] hover:bg-[#eee9e2]"
              }`}
            >
              <Shirt size={14} /> 2. Apparel (Kapde)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("footwear")}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "footwear"
                  ? "bg-[#381c10] text-[#f8f3e9] shadow-xs"
                  : "bg-[#f8f3e9] text-[#381c10] hover:bg-[#eee9e2]"
              }`}
            >
              <Footprints size={14} /> 3. Shoes (Footwear)
            </button>
          </div>
        </div>

        {/* Tab 1: Cricket Bats */}
        {activeTab === "bats" && (
          <div className="mt-10 space-y-10">
            {/* Bat Size vs Height Table */}
            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgb(56_28_16_/_10%)] pb-4">
                <div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#381c10]">
                    Bat Size According to Player Height
                  </h2>
                  <p className="text-xs text-[#78685e] mt-1">
                    Choosing the right bat length ensures comfortable stance and maximum hand speed.
                  </p>
                </div>
                <span className="rounded-full bg-[#f8f3e9] px-3 py-1 text-[11px] font-semibold text-[#7f472d] uppercase">
                  Junior to Adult
                </span>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(56_28_16_/_12%)] text-[#7f472d] font-semibold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 pr-4">Bat Size</th>
                      <th className="pb-3 px-4">Player Height (Feet & Inches)</th>
                      <th className="pb-3 px-4">Player Height (Centimeters)</th>
                      <th className="pb-3 pl-4">Bat Total Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(56_28_16_/_8%)] text-[#381c10]">
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Size 1</td>
                      <td className="py-3 px-4 text-[#78685e]">Up to 4' 0"</td>
                      <td className="py-3 px-4 text-[#78685e]">Up to 122 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs">25.25 in</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Size 2</td>
                      <td className="py-3 px-4 text-[#78685e]">4' 0" – 4' 3"</td>
                      <td className="py-3 px-4 text-[#78685e]">122 – 130 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs">27.75 in</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Size 3</td>
                      <td className="py-3 px-4 text-[#78685e]">4' 3" – 4' 6"</td>
                      <td className="py-3 px-4 text-[#78685e]">130 – 137 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs">28.75 in</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Size 4</td>
                      <td className="py-3 px-4 text-[#78685e]">4' 6" – 4' 9"</td>
                      <td className="py-3 px-4 text-[#78685e]">137 – 145 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs">29.75 in</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Size 5</td>
                      <td className="py-3 px-4 text-[#78685e]">4' 9" – 5' 0"</td>
                      <td className="py-3 px-4 text-[#78685e]">145 – 152 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs">30.75 in</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Size 6</td>
                      <td className="py-3 px-4 text-[#78685e]">5' 0" – 5' 4"</td>
                      <td className="py-3 px-4 text-[#78685e]">152 – 163 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs">31.75 in</td>
                    </tr>
                    <tr className="bg-[#f8f3e9]/40">
                      <td className="py-3 pr-4 font-semibold text-[#7f472d]">Harrow</td>
                      <td className="py-3 px-4 text-[#381c10] font-medium">5' 4" – 5' 8"</td>
                      <td className="py-3 px-4 text-[#381c10]">163 – 173 cm</td>
                      <td className="py-3 pl-4 font-mono text-xs font-medium">32.75 in</td>
                    </tr>
                    <tr className="bg-[#f8f3e9]/70 font-semibold">
                      <td className="py-3.5 pr-4 text-[#381c10]">
                        Short Handle (SH)
                        <span className="block text-[10px] text-[#7f472d] uppercase">
                          Standard Adult
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#381c10]">5' 8" – 6' 2"</td>
                      <td className="py-3.5 px-4 text-[#381c10]">173 – 188 cm</td>
                      <td className="py-3.5 pl-4 font-mono text-xs">33.50 in</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">Long Handle (LH)</td>
                      <td className="py-3 px-4 text-[#78685e]">6' 2" and above</td>
                      <td className="py-3 px-4 text-[#78685e]">188 cm+</td>
                      <td className="py-3 pl-4 font-mono text-xs">34.25 in</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bat Weight & Playing Style Guide */}
            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#381c10] border-b border-[rgb(56_28_16_/_10%)] pb-4">
                Bat Weight & Pickup Guide (Wazan Ki Tafseelat)
              </h2>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-[rgb(56_28_16_/_12%)] bg-[#fbf9f6] p-5">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                    Light Weight
                  </span>
                  <p className="mt-2 text-xl font-editorial font-medium text-[#381c10]">
                    2 lbs 7 oz – 2 lbs 8 oz
                  </p>
                  <p className="text-xs font-mono text-[#78685e]">1,100g – 1,140g</p>
                  <p className="mt-3 text-xs text-[#78685e] leading-relaxed">
                    <strong>Ideal for:</strong> Stroke makers, wristy players, cut & pull specialists.
                    Lightning quick pickup and effortless bat speed.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-[#381c10] bg-[#f8f3e9] p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#381c10] px-2.5 py-0.5 text-[10px] font-bold text-[#f8f3e9] uppercase">
                      Most Popular
                    </span>
                    <span className="text-[10px] text-[#7f472d] font-semibold">Medium Weight</span>
                  </div>
                  <p className="mt-2 text-xl font-editorial font-medium text-[#381c10]">
                    2 lbs 9 oz – 2 lbs 10 oz
                  </p>
                  <p className="text-xs font-mono text-[#78685e]">1,160g – 1,190g</p>
                  <p className="mt-3 text-xs text-[#78685e] leading-relaxed">
                    <strong>Ideal for:</strong> Complete all-round batsman. Perfect harmony between
                    power driving and feather-light touch.
                  </p>
                </div>

                <div className="rounded-xl border border-[rgb(56_28_16_/_12%)] bg-[#fbf9f6] p-5">
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                    Heavy / Power Hitter
                  </span>
                  <p className="mt-2 text-xl font-editorial font-medium text-[#381c10]">
                    2 lbs 11 oz – 2 lbs 13 oz
                  </p>
                  <p className="text-xs font-mono text-[#78685e]">1,220g – 1,300g</p>
                  <p className="mt-3 text-xs text-[#78685e] leading-relaxed">
                    <strong>Ideal for:</strong> T20 power hitters and lower-order boundary clearers.
                    Massive 42mm edges for monster rebound ping.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Apparel (Kapde) */}
        {activeTab === "apparel" && (
          <div className="mt-10 space-y-10">
            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#381c10] border-b border-[rgb(56_28_16_/_10%)] pb-4">
                Men's & Unisex Training Apparel Sizing
              </h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(56_28_16_/_12%)] text-[#7f472d] font-semibold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 pr-4">Size Tag</th>
                      <th className="pb-3 px-4">Chest (Inches)</th>
                      <th className="pb-3 px-4">Chest (cm)</th>
                      <th className="pb-3 px-4">Waist (Inches)</th>
                      <th className="pb-3 pl-4">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(56_28_16_/_8%)] text-[#381c10]">
                    <tr>
                      <td className="py-3 pr-4 font-semibold">S (Small)</td>
                      <td className="py-3 px-4 text-[#78685e]">36" – 38"</td>
                      <td className="py-3 px-4 text-[#78685e]">91 – 96 cm</td>
                      <td className="py-3 px-4 text-[#78685e]">30" – 32"</td>
                      <td className="py-3 pl-4 text-[#78685e]">27.5"</td>
                    </tr>
                    <tr className="bg-[#f8f3e9]/50 font-medium">
                      <td className="py-3 pr-4 font-semibold text-[#7f472d]">M (Medium)</td>
                      <td className="py-3 px-4 text-[#381c10]">38" – 40"</td>
                      <td className="py-3 px-4 text-[#381c10]">97 – 102 cm</td>
                      <td className="py-3 px-4 text-[#381c10]">32" – 34"</td>
                      <td className="py-3 pl-4 text-[#381c10]">28.5"</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">L (Large)</td>
                      <td className="py-3 px-4 text-[#78685e]">41" – 43"</td>
                      <td className="py-3 px-4 text-[#78685e]">104 – 109 cm</td>
                      <td className="py-3 px-4 text-[#78685e]">34" – 36"</td>
                      <td className="py-3 pl-4 text-[#78685e]">29.5"</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">XL (Extra Large)</td>
                      <td className="py-3 px-4 text-[#78685e]">44" – 46"</td>
                      <td className="py-3 px-4 text-[#78685e]">111 – 117 cm</td>
                      <td className="py-3 px-4 text-[#78685e]">36" – 38"</td>
                      <td className="py-3 pl-4 text-[#78685e]">30.5"</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">XXL (2XL)</td>
                      <td className="py-3 px-4 text-[#78685e]">47" – 50"</td>
                      <td className="py-3 px-4 text-[#78685e]">119 – 127 cm</td>
                      <td className="py-3 px-4 text-[#78685e]">39" – 42"</td>
                      <td className="py-3 pl-4 text-[#78685e]">31.5"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* How to Measure Tip */}
              <div className="mt-8 rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-5 text-xs text-[#78685e] space-y-2">
                <p className="font-semibold text-[#381c10] text-sm">How to Measure Your Size:</p>
                <p>
                  <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the
                  tape horizontal under your arms.
                </p>
                <p>
                  <strong>Waist:</strong> Measure around your natural waistline where athletic shorts
                  rest comfortably.
                </p>
                <p className="text-[#7f472d] italic">
                  Tip: If your measurement falls between two sizes, choose the smaller size for a
                  snug performance fit, or the larger size for a relaxed training fit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Footwear (Shoes) */}
        {activeTab === "footwear" && (
          <div className="mt-10 space-y-10">
            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#381c10] border-b border-[rgb(56_28_16_/_10%)] pb-4">
                Athletic Shoes & Cricket Spikes Size Chart
              </h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(56_28_16_/_12%)] text-[#7f472d] font-semibold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 pr-4">US Men</th>
                      <th className="pb-3 px-4">UK Size</th>
                      <th className="pb-3 px-4">EU Size</th>
                      <th className="pb-3 pl-4">Foot Length (Centimeters)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(56_28_16_/_8%)] text-[#381c10]">
                    <tr>
                      <td className="py-3 pr-4 font-semibold">US 7</td>
                      <td className="py-3 px-4 text-[#78685e]">UK 6.5</td>
                      <td className="py-3 px-4 text-[#78685e]">EU 40</td>
                      <td className="py-3 pl-4 font-mono text-xs">25.0 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">US 8</td>
                      <td className="py-3 px-4 text-[#78685e]">UK 7.5</td>
                      <td className="py-3 px-4 text-[#78685e]">EU 41</td>
                      <td className="py-3 pl-4 font-mono text-xs">26.0 cm</td>
                    </tr>
                    <tr className="bg-[#f8f3e9]/50 font-medium">
                      <td className="py-3 pr-4 font-semibold text-[#7f472d]">US 9</td>
                      <td className="py-3 px-4 text-[#381c10]">UK 8.5</td>
                      <td className="py-3 px-4 text-[#381c10]">EU 42.5</td>
                      <td className="py-3 pl-4 font-mono text-xs text-[#381c10]">27.0 cm</td>
                    </tr>
                    <tr className="bg-[#f8f3e9]/50 font-medium">
                      <td className="py-3 pr-4 font-semibold text-[#7f472d]">US 10</td>
                      <td className="py-3 px-4 text-[#381c10]">UK 9.5</td>
                      <td className="py-3 px-4 text-[#381c10]">EU 44</td>
                      <td className="py-3 pl-4 font-mono text-xs text-[#381c10]">28.0 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">US 11</td>
                      <td className="py-3 px-4 text-[#78685e]">UK 10.5</td>
                      <td className="py-3 px-4 text-[#78685e]">EU 45</td>
                      <td className="py-3 pl-4 font-mono text-xs">29.0 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold">US 12</td>
                      <td className="py-3 px-4 text-[#78685e]">UK 11.5</td>
                      <td className="py-3 px-4 text-[#78685e]">EU 46</td>
                      <td className="py-3 pl-4 font-mono text-xs">30.0 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Shoes Tip */}
              <div className="mt-8 rounded-xl border border-[rgb(56_28_16_/_10%)] bg-[#f8f3e9] p-5 text-xs text-[#78685e] space-y-2">
                <p className="font-semibold text-[#381c10] text-sm">Cricket & Running Footwear Advice:</p>
                <p>
                  Cricket players usually wear thick cushion socks or double socks when bowling or
                  batting for long sessions. If you are in between sizes, we strongly recommend going
                  up by half a size to give your toes breathing room during high-impact stops.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Support Prompt */}
        <div className="mt-12 text-center border-t border-[rgb(56_28_16_/_10%)] pt-8">
          <p className="text-xs text-[#78685e]">
            Still unsure about your bat balance or clothing size?
          </p>
          <div className="mt-3 flex justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#381c10] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#f8f3e9] hover:bg-[#5e2b16]"
            >
              Ask Our Gear Specialist
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(56_28_16_/_20%)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#381c10] hover:bg-[#eee9e2]"
            >
              Explore Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

