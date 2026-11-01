import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { homeContent } from "@/data/products"

// Two "make it yours" cards under the bat rack. The shirt designer is live; the bat one is next.

export default function DesignCards() {
  return (
    <section className="bg-ivory px-4 py-16 sm:px-10" aria-labelledby="design-cards-title">
      <div className="mx-auto max-w-[1240px]">
        <p className="section-kicker">MAKE IT YOURS</p>
        <h2 id="design-cards-title" className="font-editorial text-4xl tracking-wide text-espresso">
          Design your own.
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            to="/design/shirt"
            className="group relative flex min-h-[340px] overflow-hidden rounded-3xl bg-espresso p-7 text-ivory transition-transform duration-300 hover:-translate-y-1 sm:p-9"
          >
            <div className="relative z-10 flex max-w-[60%] flex-col">
              <span className="text-[10px] font-semibold tracking-[.2em] text-[#e8c27a]">
                {homeContent.designer ? "NEW · LIVE PREVIEW" : "COMING SOON"}
              </span>
              <h3 className="mt-3 font-editorial text-4xl leading-none sm:text-5xl">Design your own shirt</h3>
              <p className="mt-4 text-sm leading-relaxed text-ivory/75">
                Pick a style and colour, upload your logo or add a name and number. Front and back.
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-ivory px-5 py-3 text-xs font-semibold text-espresso transition-colors group-hover:bg-[#e8c27a]">
                Start designing <ArrowRight size={14} />
              </span>
            </div>
            {/* Warm light behind the black shirt so it stands out on the dark card */}
            <div
              aria-hidden="true"
              className="absolute -right-16 top-1/2 h-[120%] w-[75%] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(232_194_122_/_38%),rgb(232_194_122_/_10%)_60%,transparent)]"
            />
            <img
              src="/images/design/shirt-card.webp"
              width={809}
              height={900}
              alt=""
              loading="lazy"
              className="absolute -right-6 bottom-[-6%] h-auto w-[52%] max-w-[330px] rotate-[6deg] object-contain drop-shadow-[0_24px_30px_rgb(0_0_0_/_45%)] transition-transform duration-500 group-hover:rotate-[1deg] group-hover:scale-105"
            />
          </Link>

          <div
            className="relative flex min-h-[340px] overflow-hidden rounded-3xl border border-dashed border-espresso/25 bg-parchment p-7 text-espresso sm:p-9"
            aria-disabled="true"
          >
            <div className="relative z-10 flex max-w-[60%] flex-col">
              <span className="text-[10px] font-semibold tracking-[.2em] text-clay">COMING SOON</span>
              <h3 className="mt-3 font-editorial text-4xl leading-none sm:text-5xl">Design your bat</h3>
              <p className="mt-4 text-sm leading-relaxed text-clay">
                Your own stickers, colours and name on a BEAST willow. We're building it now.
              </p>
            </div>
            <img
              src="/images/design/bat-card.webp"
              width={267}
              height={900}
              alt=""
              loading="lazy"
              className="absolute right-[10%] bottom-[-8%] h-[112%] w-auto object-contain drop-shadow-[0_20px_24px_rgb(56_28_16_/_25%)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
