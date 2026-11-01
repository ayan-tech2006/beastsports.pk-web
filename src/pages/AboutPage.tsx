import { Link } from "react-router"
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Flame,
  Layers,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#381c10] pb-24 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[#381c10] text-[#f8f3e9] px-6 py-16 sm:px-12 sm:py-24 shadow-md">
          <div className="relative z-10 max-w-2xl">
            <p className="store-eyebrow text-[#a26748] mb-3">OUR HERITAGE & MISSION</p>
            <h1 className="font-editorial text-4xl sm:text-6xl font-normal tracking-tight leading-[1.08]">
              Built for the player who gives everything.
            </h1>
            <p className="mt-5 text-sm sm:text-base text-[#eee9e2]/80 leading-relaxed">
              We started BeastSports with a single conviction: authentic, pro-level sporting equipment
              should not be reserved for sponsored superstars. Every club cricketer, weekend runner,
              and dedicated athlete deserves gear built to perform without compromise.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 rounded-full bg-[#f8f3e9] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#381c10] transition-colors hover:bg-white"
              >
                Explore The Line-Up <ArrowRight size={15} />
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#f8f3e9] transition-colors hover:bg-white/10"
              >
                Our Bat Craft
              </Link>
            </div>
          </div>

          {/* Background Accent Element */}
          <div className="pointer-events-none absolute right-[-5%] top-[-10%] h-[120%] w-[50%] opacity-15">
            <img
              src="/images/cricket.jpg"
              alt="Cricket field"
              className="h-full w-full object-cover filter grayscale contrast-125"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 text-center shadow-xs">
            <p className="font-editorial text-4xl sm:text-5xl font-medium text-[#381c10]">10,000+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7f472d]">
              Athletes Equipped
            </p>
          </div>
          <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 text-center shadow-xs">
            <p className="font-editorial text-4xl sm:text-5xl font-medium text-[#381c10]">100%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7f472d]">
              Genuine Materials
            </p>
          </div>
          <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 text-center shadow-xs">
            <p className="font-editorial text-4xl sm:text-5xl font-medium text-[#381c10]">30-Day</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7f472d]">
              Hassle-Free Exchange
            </p>
          </div>
          <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-6 text-center shadow-xs">
            <p className="font-editorial text-4xl sm:text-5xl font-medium text-[#381c10]">15+</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7f472d]">
              Sports Collections
            </p>
          </div>
        </div>

        {/* The Craft of BeastSports Section */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="store-eyebrow text-[#7f472d] mb-1">THE SIALKOT HERITAGE</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-medium tracking-tight">
                Crafted at the world's sporting heartland.
              </h2>
            </div>
            <p className="text-sm text-[#78685e] leading-relaxed">
              Sialkot produces more than 70% of the world's hand-stitched footballs and iconic
              cricket bats used by international legends. BeastSports was born right here, working
              directly alongside master bat-makers who have shaped willow for three generations.
            </p>
            <p className="text-sm text-[#78685e] leading-relaxed">
              Every English willow cleft is seasoned naturally, individually weighed, and pressed to
              the exact density needed for optimum ping without sacrificing wood longevity. No
              corner cutting, no synthetic weight concealers—just authentic balance and devastating
              hitting power.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#7f472d] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#381c10]">
                  <strong>Hand-Selected English Willow:</strong> Graded for grain straightness,
                  feather-light pickup, and ping resonance.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#7f472d] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#381c10]">
                  <strong>Athletic Ergonomics:</strong> Apparel engineered with breathable,
                  anti-chafing microfibers that flex with intense movement.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#7f472d] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#381c10]">
                  <strong>Player-Tested Durability:</strong> All footballs, footwear, and equipment
                  undergo rigorous match testing on rough pitches and turf.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl bg-[#eee9e2] shadow-xs">
                  <img
                    src="/images/cricket.jpg"
                    alt="Cricket pitch"
                    className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl bg-[#eee9e2] shadow-xs">
                  <img
                    src="/images/football.jpg"
                    alt="Football pitch"
                    className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="overflow-hidden rounded-2xl bg-[#eee9e2] shadow-xs">
                  <img
                    src="/images/running.jpg"
                    alt="Athlete running"
                    className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl bg-[#eee9e2] shadow-xs">
                  <img
                    src="/images/training.jpg"
                    alt="Gym training weights"
                    className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <p className="store-eyebrow text-[#7f472d] mb-1">WHAT DRIVES US</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-medium tracking-tight">
              Our Sporting Principles.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f3e9] text-[#7f472d] mb-5">
                <Award size={24} />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[#381c10]">
                Honest Sports Pricing
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#78685e] leading-relaxed">
                We eliminate multi-tier middlemen and celebrity endorsement costs so you pay strictly
                for Grade 1 materials and genuine manufacturing excellence.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f3e9] text-[#7f472d] mb-5">
                <Flame size={24} />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[#381c10]">
                Zero Compromise Build
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#78685e] leading-relaxed">
                Whether it is a 12-piece cane handle on our cricket bats or reinforced stitching on
                our footballs, every detail is engineered to withstand competitive pressure.
              </p>
            </div>

            <div className="rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-white p-7 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f3e9] text-[#7f472d] mb-5">
                <Users size={24} />
              </div>
              <h3 className="font-editorial text-2xl font-medium text-[#381c10]">
                Player In Your Corner
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#78685e] leading-relaxed">
                Need guidance choosing the right bat weight or shoe fit? Our in-house cricketers and
                trainers are always one message away to help you pick the right gear.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="mt-16 rounded-2xl border border-[rgb(56_28_16_/_12%)] bg-[#f8f3e9] p-8 sm:p-12 text-center shadow-xs">
          <p className="store-eyebrow text-[#7f472d] mb-2">READY FOR YOUR NEXT MATCH?</p>
          <h2 className="font-editorial text-3xl sm:text-4xl font-medium">
            Step onto the pitch with confidence.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#78685e]">
            Browse our full range of handcrafted bats, athletic footwear, and match essentials with
            nationwide Cash on Delivery.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="store-button inline-flex items-center gap-3 rounded-full bg-[#381c10] px-7 py-3.5 text-sm font-semibold text-[#f8f3e9] hover:bg-[#5e2b16]"
            >
              Shop All Gear <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(56_28_16_/_20%)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#381c10] hover:bg-white"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

