import NavBar, { type IMenu, type MenuProps } from "@/components/ui/navbar"
import { useLocation } from "react-router"
import { collectionRoots } from "@/data/products"

const menus: IMenu[] = [
  { id: 1, title: "Home", url: "/" },
  {
    id: 2,
    title: "Shop",
    url: "/shop",
    dropdown: true,
    items: [
      { id: 20, title: "Shop all essentials", url: "/shop" },
      { id: 21, title: "New arrivals", url: "/shop?edit=new" },
      { id: 22, title: "Best sellers", url: "/shop?edit=featured" },
      { id: 23, title: "The sale edit", url: "/shop?edit=sale" },
    ],
  },
  {
    id: 3,
    title: "Collections",
    url: "/collections",
    dropdown: true,
    // Top-level collections from the admin panel (loaded before the app renders).
    items: [
      { id: 30, title: "All collections", url: "/collections" },
      ...collectionRoots.map((c, i) => ({ id: 31 + i, title: c.name, url: `/collections/${c.id}` })),
    ],
  },
  { id: 4, title: "About", url: "/about" },
  { id: 5, title: "Contact", url: "/contact" },
]

export function NavBarDemo(props: Omit<MenuProps, "list">) {
  const { pathname } = useLocation()
  const activeId =
    pathname === "/shop" || pathname.startsWith("/product/")
      ? 2
      : pathname.startsWith("/collections")
        ? 3
        : pathname === "/about"
          ? 4
          : pathname === "/contact"
            ? 5
            : pathname === "/"
              ? 1
              : 0

  return (
    <NavBar
      list={menus}
      activeId={activeId}
      {...props}
    />
  )
}
