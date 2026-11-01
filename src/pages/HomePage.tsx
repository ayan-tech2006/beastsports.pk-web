import { useNavigate } from "react-router"
import BatHero from "@/components/BatHero"
import BatRack from "@/components/BatRack"
import DesignCards from "@/components/DesignCards"
import ClothingRail from "@/components/ClothingRail"
import TiltCarousel, {
  type TiltCarouselImage,
} from "@/components/ui/tilt-carousel"
import {
  collectionRoots,
  getProductImageUrl,
  type Collection,
} from "@/data/products"

const collectionPath = (c: Collection): string =>
  c.parent ? `${collectionPath(c.parent)}/${c.id}` : `/collections/${c.id}`

// Every visible collection from the admin panel, parents before their sub-collections.
// The app's collections load before this module is imported (see main.tsx), so this is computed once.
const flatten = (list: Collection[]): Collection[] =>
  list.flatMap((c) => [c, ...flatten(c.children)])

const collectionImages: TiltCarouselImage[] = flatten(collectionRoots).map((c) => ({
  src: getProductImageUrl(c.image || c.products[0]?.image || ""),
  alt: `${c.name} collection`,
  label: c.name,
  href: collectionPath(c),
}))

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <>
      <BatHero />
      <section
        className="collections-section"
        id="collections"
        aria-labelledby="collections-title"
      >
        <div className="collection-intro" id="our-story">
          <div className="intro-heading">
            <p className="section-kicker">FIND YOUR GAME</p>
            <h2 id="collections-title">Collections.</h2>
          </div>
        </div>
        {collectionImages.length > 0 && (
          <TiltCarousel images={collectionImages} onOpen={navigate} />
        )}
      </section>
      <ClothingRail />
      <BatRack />
      <DesignCards />
    </>
  )
}
