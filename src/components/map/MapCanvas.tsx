import { useMemo } from 'react'

import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { Pin } from './Pin'

export type MapPoint = {
  id: string
  latitude: number
  longitude: number
  label: string
  /** Shown inside the pin when the map is drawing an ordered route. */
  order?: number
  /** Pin colour — used to tell one idol's locations from another's on the map. */
  color?: string
  /** Photo shown inside the pin disc. */
  imageUrl?: string | null
  /**
   * Where the popup's "자세히 보기" goes. Setting it is what gives the pin a
   * popup at all — a point with nowhere to go opens nothing, which is why the
   * itinerary and detail maps still just select.
   */
  detailPath?: string
  /** Second line in the popup — the music videos shot here. */
  caption?: string
}

/** Falls back to the accent when a point carries no colour of its own. */
export const DEFAULT_PIN_COLOR = '#FF5A6E'

type Props = {
  points: MapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** Draws a line through `points` in array order. */
  showRoute?: boolean
  /** Called when a gesture should dismiss an open popup — see `Map`. */
  onClosePopup?: () => void
  className?: string
}

/**
 * STAND-IN for the Kakao Maps SDK.
 *
 * The Kakao JavaScript key is not issued yet, so this renders the same data on a
 * dark projected canvas: pins sit at their true relative positions, the route
 * follows the itinerary order, and selection is two-way bound with the list.
 * Everything the screens rely on is in the props above — swapping in the real
 * SDK should touch this file only.
 *
 * The system forbids bright consumer-map styling, so the real map will need
 * a dark custom style to match this.
 */
export function MapCanvas({
  points,
  selectedId,
  onSelect,
  showRoute,
  onClosePopup,
  className,
}: Props) {
  const t = useT()

  // Project lat/lng into 0-100% with padding, so pins never touch the edges.
  const projected = useMemo(() => {
    if (!points.length) return []
    const lats = points.map((p) => p.latitude)
    const lngs = points.map((p) => p.longitude)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const spanLat = maxLat - minLat || 1
    const spanLng = maxLng - minLng || 1

    return points.map((p) => ({
      ...p,
      // Latitude grows north, screen y grows down — invert it.
      top: 12 + ((maxLat - p.latitude) / spanLat) * 76,
      left: 12 + ((p.longitude - minLng) / spanLng) * 76,
    }))
  }, [points])

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-background',
        className,
      )}
      // Anywhere that is not a pin dismisses an open card, matching the Kakao
      // map's click-the-map-to-close.
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest('[data-map-pin]')) {
          onClosePopup?.()
        }
      }}
      // Not role="img": the subtree holds focusable pin buttons, and an img role
      // would make them presentational while leaving them tabbable.
      role="group"
      aria-label={t(showRoute ? 'result.mapAria' : 'result.mapAriaPins', {
        count: points.length,
      })}
    >
      {/* Faint graticule so the surface reads as a map, not an empty panel. */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M64 0 L0 0 0 64"
              fill="none"
              stroke="#1E1E26"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {showRoute && projected.length > 1 && (
          <polyline
            points={projected.map((p) => `${p.left}%,${p.top}%`).join(' ')}
            fill="none"
            stroke="#FF5A6E"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        )}
      </svg>

      {projected.map((point) => (
        <span
          key={point.id}
          className="absolute"
          style={{ top: `${point.top}%`, left: `${point.left}%` }}
        >
          <Pin
            point={point}
            selected={point.id === selectedId}
            color={point.color ?? DEFAULT_PIN_COLOR}
            onClick={() => onSelect?.(point.id)}
          />
        </span>
      ))}

      <span className="absolute bottom-3 right-3 z-10 rounded border border-border bg-background/80 px-2 py-1 text-caption text-text-subtle backdrop-blur-sm">
        {t('state.mapStandIn')}
      </span>
    </div>
  )
}
