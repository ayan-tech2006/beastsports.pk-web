import { createHashRouter, Link, redirect } from "react-router"
import Storefront from "@/Storefront"
import HomePage from "@/pages/HomePage"
import ShopPage from "@/pages/ShopPage"
import ProductPage from "@/pages/ProductPage"

// Phase 1: Order Flow
import CartPage from "@/pages/CartPage"
import CheckoutPage from "@/pages/CheckoutPage"
import OrderConfirmationPage from "@/pages/OrderConfirmationPage"

// Phase 2: Policies
import ShippingPolicyPage from "@/pages/ShippingPolicyPage"
import ReturnPolicyPage from "@/pages/ReturnPolicyPage"
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage"
import TermsPage from "@/pages/TermsPage"

// Phase 3: Help & Trust
import AboutPage from "@/pages/AboutPage"
import ContactPage from "@/pages/ContactPage"
import FaqPage from "@/pages/FaqPage"
import SizeGuidePage from "@/pages/SizeGuidePage"

// Phase 4: Discovery & Catalogs
import CollectionsPage from "@/pages/CollectionsPage"
import ShirtDesignerPage from "@/pages/ShirtDesignerPage"

function NotFoundPage() {
  return (
    <section className="bg-[#f8f3e9] px-6 py-24 text-center text-[#381c10]">
      <p className="store-eyebrow text-[#7f472d]">A LITTLE OFF THE BEATEN PATH</p>
      <h1 className="mt-5 font-editorial text-5xl">
        Let’s get you back in the game.
      </h1>
      <p className="mt-4 text-[#78685e]">
        We couldn’t find that page. Your next favourite gear is still out there.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-4">
        <Link className="store-button" to="/shop">
          Explore the shop
        </Link>
        <Link
          to="/"
          className="inline-flex items-center rounded-full border border-[rgb(56_28_16_/_20%)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#381c10] hover:bg-[#eee9e2]"
        >
          Return Home
        </Link>
      </div>
    </section>
  )
}

// Keep links to homepage sections from before the multi-page navigation working.
if (window.location.hash && !window.location.hash.startsWith("#/")) {
  const url = new URL(window.location.href)
  url.hash = `/#${window.location.hash.slice(1)}`
  window.history.replaceState(window.history.state, "", url)
}

// Hash routing keeps all pages directly accessible on static previews and hosting.
export const router = createHashRouter([
  {
    Component: Storefront,
    children: [
      { index: true, Component: HomePage },
      { path: "shop", Component: ShopPage },
      { path: "product/:productId", Component: ProductPage },
      { path: "design/shirt", Component: ShirtDesignerPage },

      // Phase 1: Order Flow
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "order-confirmation", Component: OrderConfirmationPage },

      // Phase 2: Policies
      { path: "shipping-policy", Component: ShippingPolicyPage },
      { path: "return-policy", Component: ReturnPolicyPage },
      { path: "privacy-policy", Component: PrivacyPolicyPage },
      { path: "terms", Component: TermsPage },

      // Phase 3: Help & Trust
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "faq", Component: FaqPage },
      { path: "size-guide", Component: SizeGuidePage },

      // Phase 4: Discovery & Catalogs
      { path: "collections", Component: CollectionsPage },
      { path: "collections/*", Component: CollectionsPage },
      // Old sport-based category links now land on the admin-managed collections.
      { path: "category/*", loader: () => redirect("/collections") },
      // Search lives in the header and shows results on the shop page.
      {
        path: "search",
        loader: ({ request }) => redirect(`/shop${new URL(request.url).search}`),
      },

      { path: "*", Component: NotFoundPage },
    ],
  },
])
