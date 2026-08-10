import type { MapPoint } from './MapCanvas'
import { PIN_SHADOW, PIN_VEIL, pinGeometry } from './pinElement'

/**
 * The map pin: a photo disc over a pointer — the draft's idea. The disc is a
 * real image slot, so swapping the seed photo for a music-video still is a data
 * change, not a design change.
 *
 * The raw-DOM twin lives in `pinElement.ts` for Kakao's CustomOverlay; both
 * share the geometry constants so they stay identical.
 */
export function Pin({
  point,
  selected,
  color,
  onClick,
}: {
  point: MapPoint
  selected: boolean
  color: string
  onClick?: () => void
}) {
  const { size, ring, tail } = pinGeometry(selected)

  return (
    <button
      type="button"
      onClick={onClick}
      // What the popup anchors to — see `MapPopup`.
      data-map-pin={point.id}
      aria-label={point.order ? `${point.order}. ${point.label}` : point.label}
      aria-current={selected || undefined}
      className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
      style={{ filter: PIN_SHADOW }}
    >
      <span
        className="relative block overflow-hidden rounded-full bg-surface transition-all duration-200"
        style={{
          width: size,
          height: size,
          border: `${ring}px solid ${color}`,
          opacity: selected ? 1 : 0.92,
        }}
      >
        {point.imageUrl && (
          <img
            src={point.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ filter: selected ? 'none' : 'grayscale(.35)' }}
          />
        )}
        <span className="absolute inset-0" style={{ background: PIN_VEIL }} />
        {point.order !== undefined && (
          <span
            className="absolute inset-0 flex items-center justify-center font-display font-semibold tabular-nums text-white"
            style={{ fontSize: selected ? 15 : 12 }}
          >
            {point.order}
          </span>
        )}
      </span>

      <span
        className="block transition-all duration-200"
        style={{
          marginTop: -1,
          width: 0,
          height: 0,
          borderLeft: `${tail}px solid transparent`,
          borderRight: `${tail}px solid transparent`,
          borderTop: `${tail + 2}px solid ${color}`,
        }}
      />
    </button>
  )
}
