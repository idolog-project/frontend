import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router'

import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import type { MapPoint } from './MapCanvas'

const WIDTH = 256
/** Gap between the card's pointer and the top of the pin disc. */
const GAP = 10
/** Keeps the card off the window edges when a pin sits near one. */
const MARGIN = 8

/**
 * Where a pin is on screen. Both maps put `data-map-pin` on the pin itself, so
 * the anchor is read off the DOM rather than recomputed: Kakao already moves its
 * pins for every pan and zoom, and mirroring that projection here would be a
 * second source of truth that can only ever disagree with the first.
 */
function useAnchorRect(pointId: string): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    let frame = 0
    let last = ''

    // Polled rather than subscribed: Kakao's pan is a continuous drag, so an
    // event would fire at the same rate anyway. Only runs while a card is open.
    const measure = () => {
      const pin = document.querySelector(`[data-map-pin="${CSS.escape(pointId)}"]`)
      const next = pin?.getBoundingClientRect() ?? null
      const key = next ? `${next.top},${next.left},${next.width}` : ''
      if (key !== last) {
        last = key
        setRect(next)
      }
      frame = requestAnimationFrame(measure)
    }

    measure()
    return () => cancelAnimationFrame(frame)
  }, [pointId])

  return rect
}

/**
 * The card a pin opens, in the manner of a consumer map: photo, name, what was
 * shot there, and the way through to the full page.
 *
 * It hangs off `document.body` rather than the map. The map root isolates its
 * stacking context and clips its overflow, and the screens float panels over it
 * — inside, the card would slide under the list and get cut at the map's edge.
 */
export function MapPopup({
  point,
  onClose,
}: {
  point: MapPoint
  onClose: () => void
}) {
  const t = useT()
  const anchor = useAnchorRect(point.id)
  const cardRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  // Layout, not effect: the flip below has to be decided before the frame is
  // painted, or the card shows clipped for one frame and then jumps. `anchor` is
  // in the deps because it is null until the pin is found — that first non-null
  // render is when there is finally a card to measure.
  useLayoutEffect(() => {
    setHeight(cardRef.current?.offsetHeight ?? 0)
  }, [anchor, point, t])

  if (!anchor) return null

  const half = WIDTH / 2
  const centre = anchor.left + anchor.width / 2
  // A pin near the top of the window has no room for a card above it, so the
  // card drops below and the pointer moves to its other end.
  const below = height > 0 && anchor.top - GAP - height < MARGIN

  return createPortal(
    <div
      className="fixed z-40"
      style={{
        left: Math.min(
          Math.max(centre, half + MARGIN),
          window.innerWidth - half - MARGIN,
        ),
        top: below ? anchor.bottom + GAP : anchor.top - GAP,
        width: WIDTH,
        transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
    >
      <div
        ref={cardRef}
        className="relative flex flex-col rounded-lg border border-border bg-surface text-left"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('map.close')}
          // Sits over the photo, so it carries its own scrim to stay legible.
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 text-text-muted backdrop-blur-sm transition-colors hover:text-text"
        >
          <X size={14} strokeWidth={1.5} aria-hidden />
        </button>

        {/* The photo takes the end of the card away from the pin, so the pointer
            always meets flat surface rather than biting into the image. */}
        {point.imageUrl && (
          <div
            className={cn(
              'relative h-28 overflow-hidden',
              below ? 'order-last rounded-b-[15px]' : 'rounded-t-[15px]',
            )}
          >
            {/* alt="" — the name sits right beside it, so describing the photo
                here would just announce the place twice. */}
            <img src={point.imageUrl} alt="" className="h-full w-full object-cover" />
            <div
              className={cn(
                'absolute inset-0 from-surface to-transparent',
                below ? 'bg-gradient-to-b' : 'bg-gradient-to-t',
              )}
            />
          </div>
        )}

        <div className="flex flex-col gap-1 p-3">
          {/* Room for the close button, which keeps the same corner either way. */}
          <h3 className="pr-7 font-display text-body-md font-semibold leading-tight">
            {point.label}
          </h3>
          {point.caption && (
            <p className="text-caption text-text-muted">{point.caption}</p>
          )}
          {point.detailPath && (
            <Link
              to={point.detailPath}
              className="mt-1.5 inline-flex w-max items-center gap-1 font-display text-label-caps uppercase text-primary transition-colors hover:text-accent"
            >
              {t('map.detail')}
              <ArrowRight size={13} strokeWidth={2} aria-hidden />
            </Link>
          )}
        </div>

        {/* Pointer at the pin — a rotated square so the card's own border and
            fill carry through it with no seam. Only the two edges facing the pin
            are drawn, which is why flipping swaps which pair that is. */}
        <span
          aria-hidden
          className={cn(
            'absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-border bg-surface',
            below
              ? 'top-0 -translate-y-1/2 border-l border-t'
              : 'bottom-0 translate-y-1/2 border-b border-r',
          )}
        />
      </div>
    </div>,
    document.body,
  )
}
