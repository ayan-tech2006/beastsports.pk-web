import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion"
import { ChevronDown, Menu as MenuIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router"
import "./navbar.css"

export type IMenu = {
  id: number
  title: string
  url: string
  dropdown?: boolean
  items?: IMenu[]
}

export type MenuProps = {
  list: IMenu[]
  className?: string
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  activeId?: number
}

export default function Menu({
  list,
  className,
  mobileOpen: controlledMobileOpen,
  onMobileOpenChange,
  activeId,
}: MenuProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const mobileOpen = controlledMobileOpen ?? internalMobileOpen
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const disclosureRefs = useRef(new Map<number, HTMLButtonElement>())
  const menuId = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const reducedMotion = useReducedMotion()
  const cursorId = reducedMotion || mobileOpen ? undefined : "cursor"

  const changeMobileOpen = useCallback(
    (open: boolean) => {
      setInternalMobileOpen(open)
      onMobileOpenChange?.(open)
      setHovered(null)
    },
    [onMobileOpenChange],
  )

  useEffect(() => {
    const onOutsidePointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setHovered(null)
        changeMobileOpen(false)
      }
    }
    const media = window.matchMedia("(max-width: 900px)")
    const onBreakpointChange = () => changeMobileOpen(false)
    document.addEventListener("pointerdown", onOutsidePointer)
    media.addEventListener("change", onBreakpointChange)
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer)
      media.removeEventListener("change", onBreakpointChange)
    }
  }, [changeMobileOpen])

  useEffect(() => {
    if (!mobileOpen) setHovered(null)
  }, [mobileOpen])

  function navigate() {
    changeMobileOpen(false)
  }

  function focusSubmenu(item: IMenu, last = false) {
    setHovered(item.id)
    window.requestAnimationFrame(() => {
      const panel = document.getElementById(`${menuId}-submenu-${item.id}`)
      const links = panel?.querySelectorAll<HTMLAnchorElement>("a")
      if (links?.length) links[last ? links.length - 1 : 0].focus()
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape") return
    const openDropdown = list.find(
      (item) => item.id === hovered && item.dropdown,
    )
    if (openDropdown) {
      setHovered(null)
      disclosureRefs.current.get(openDropdown.id)?.focus()
    } else if (mobileOpen) {
      changeMobileOpen(false)
      toggleRef.current?.focus()
    } else {
      setHovered(null)
    }
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        type: "tween",
        duration: reducedMotion ? 0 : 0.2,
        ease: "easeOut",
      }}
    >
      <LayoutGroup id={menuId}>
        <nav
          ref={navRef}
          className={cn("animated-navbar relative", className)}
          aria-label="Main navigation"
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              changeMobileOpen(false)
          }}
        >
          <button
            ref={toggleRef}
            className="navbar-toggle rounded"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={`${menuId}-links`}
            onClick={() => changeMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <MenuIcon size={22} strokeWidth={1.5} />
            )}
          </button>
          <ul
            className="navbar-list flex items-center gap-1"
            id={`${menuId}-links`}
            data-open={mobileOpen}
          >
            {list.map((item) => {
              const expanded = hovered === item.id
              const hasDropdown = Boolean(item.dropdown && item.items?.length)
              return (
                <li
                  key={item.id}
                  className="navbar-item relative"
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setHovered(item.id)
                  }}
                  onPointerLeave={(event) => {
                    const focused = document.activeElement
                    if (
                      event.currentTarget.contains(focused) &&
                      focused?.matches(":focus-visible")
                    )
                      return
                    if (event.pointerType === "mouse") {
                      setHovered((current) =>
                        current === item.id ? null : current,
                      )
                    }
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setHovered((current) =>
                        current === item.id ? null : current,
                      )
                    }
                  }}
                >
                  <div
                    className={cn(
                      "navbar-trigger flex items-center rounded transition-colors",
                      expanded && "is-highlighted",
                    )}
                  >
                    <Link
                      className={cn(
                        "navbar-link flex items-center justify-center rounded py-3",
                        activeId === item.id && "underline underline-offset-8",
                      )}
                      to={item.url}
                      aria-current={activeId === item.id ? "page" : undefined}
                      onClick={navigate}
                      onFocus={() => setHovered(hasDropdown ? null : item.id)}
                      onKeyDown={(event) => {
                        if (
                          hasDropdown &&
                          (event.key === "ArrowDown" || event.key === "ArrowUp")
                        ) {
                          event.preventDefault()
                          focusSubmenu(item, event.key === "ArrowUp")
                        }
                      }}
                    >
                      {item.title}
                    </Link>
                    {hasDropdown && (
                      <button
                        ref={(node) => {
                          if (node) disclosureRefs.current.set(item.id, node)
                          else disclosureRefs.current.delete(item.id)
                        }}
                        type="button"
                        className="navbar-disclosure rounded"
                        aria-label={`Toggle ${item.title} links`}
                        aria-expanded={expanded}
                        aria-controls={`${menuId}-submenu-${item.id}`}
                        onClick={() => setHovered(expanded ? null : item.id)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "ArrowDown" ||
                            event.key === "ArrowUp"
                          ) {
                            event.preventDefault()
                            focusSubmenu(item, event.key === "ArrowUp")
                          }
                        }}
                      >
                        <ChevronDown size={13} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded && !hasDropdown && !mobileOpen && (
                      <motion.div
                        key="underline"
                        layoutId={cursorId}
                        className="navbar-cursor absolute h-0.5 w-full bg-current"
                        aria-hidden="true"
                      />
                    )}
                    {hasDropdown && expanded && (
                      <div key="dropdown" className="navbar-dropdown-bridge">
                        <motion.div
                          id={`${menuId}-submenu-${item.id}`}
                          layoutId={cursorId}
                          initial={{ y: reducedMotion ? 0 : 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: reducedMotion ? 0 : 8, opacity: 0 }}
                          className="navbar-dropdown rounded-lg border border-border bg-background text-foreground shadow-lg"
                        >
                          <p className="navbar-dropdown-heading">
                            {item.title}
                          </p>
                          <ul>
                            {item.items?.map((link) => (
                              <li key={link.id}>
                                <Link
                                  className="navbar-dropdown-link block rounded px-4 py-3 transition-colors hover:bg-muted"
                                  to={link.url}
                                  onClick={navigate}
                                >
                                  {link.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </nav>
      </LayoutGroup>
    </MotionConfig>
  )
}
