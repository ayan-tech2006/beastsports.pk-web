import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { router } from "./routes"

export default function Application() {
  useEffect(() => {
    const onHashChange = () => {
      const { hash } = window.location
      if (hash && !hash.startsWith("#/")) {
        void router.navigate(`/#${hash.slice(1)}`, { replace: true })
      }
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  return <RouterProvider router={router} />
}
