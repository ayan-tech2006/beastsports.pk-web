# UI components

This app already uses React, Vite, TypeScript, and Tailwind CSS v4. No Next.js
migration, Tailwind configuration file, or additional context provider is needed.

## Paths and shadcn

- Reusable UI: `src/components/ui/`, imported as `@/components/ui/...`.
- Shared class-name helper: `src/lib/utils.ts`.
- Global styles and semantic shadcn tokens: `src/index.css`.
- Navbar-only responsive styles: `src/components/ui/navbar.css`.
- shadcn CLI configuration: root `components.json`.

The project uses a `src/` directory, so `/components/ui` conventionally means
`src/components/ui` here. Keeping this folder and the matching aliases lets
shadcn-generated components and copied component examples resolve consistently.
Do not create a second root-level `components/ui` directory.

Tailwind and TypeScript are installed, and the shadcn configuration is in place.
To add another shadcn component later, run, for example:

```sh
pnpm dlx shadcn@latest add button
```

The navbar dependencies are installed with:

```sh
pnpm add framer-motion lucide-react clsx tailwind-merge
```

## Animated navbar

`ui/navbar.tsx` adapts the supplied component to Vite using React Router links
for the Home and Shop routes, including links to homepage sections.
`ui/demo.tsx` provides the BeastSports menu data and is mounted by `src/App.tsx`.

```tsx
import NavBar, { type IMenu } from '@/components/ui/navbar'

const links: IMenu[] = [
  { id: 1, title: 'Home', url: '/' },
  {
    id: 2,
    title: 'Shop',
    url: '/shop',
    dropdown: true,
    items: [{ id: 21, title: 'The sale edit', url: '/shop?edit=sale' }],
  },
]

export function Example() {
  return <NavBar list={links} />
}
```

Menu items have a unique `id`, `title`, and `url`, with optional `dropdown` and
one level of `items`. Component state is local; no external state manager or
image assets are required. The optional `mobileOpen` and `onMobileOpenChange`
props let the header control the mobile disclosure.

Desktop menus open on hover or with the chevron button. Arrow Down/Up opens a
dropdown and focuses its first/last link; Tab works normally; Escape closes the
dropdown and restores focus. At 900px and below, the navigation becomes a
hamburger menu with tappable disclosures. Outside clicks and navigation dismiss
the menu. Reduced-motion preferences disable the shared-layout movement.

## Pages and shopping state

- `src/app/App.tsx` mounts React Router's `RouterProvider`.
- `src/app/routes.tsx` uses a data-mode hash router so links work on static hosting.
- `src/pages/HomePage.tsx` preserves the homepage hero and collections carousel.
- `src/pages/ShopPage.tsx` is the Shop page, accessible at `/#/shop`.
- `src/pages/ProductPage.tsx` handles `/#/product/:productId` for every catalog product.
- `src/Storefront.tsx` is the shared layout and owns the product data, quick-view
  dialogs, saved products, and session-only demo bag for both pages.

Product photos and titles link to full product pages; Quick add keeps the shared
dialog. Product pages use the same related-product cards as Home, and share size,
color-aware bag variants and saved-product state through the outlet context.
`src/lib/product-details.ts` supplies illustrative color, fit, and care metadata.
The gallery shows the original catalog photograph and clearly labelled detail
crops, rather than claiming to show unavailable side or back photographs.

Shop filters, sorting, and pagination use URL search parameters, so filtered views support
reloads, sharing, and browser back/forward navigation. Checkout is not connected.

Shop uses the same `renderProduct` cards and colors as Home; its stylesheet only
styles page layout and controls. Recommendations reuse those shared cards in a
scrollable rail. The Shop hero reuses the homepage tennis-court photograph.

The additional court photograph (`public/images/shop-court.jpg`) is by Kateryna
Hliznitsova on Unsplash, photo ID `1684443726782-1d5bb1aecbd5`.
