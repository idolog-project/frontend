import type { MapPoint } from './MapCanvas'

/**
 * The pin's geometry and its raw-DOM rendering, kept out of `Pin.tsx` so that
 * file exports only a component and stays fast-refresh friendly.
 *
 * Kakao's CustomOverlay takes an element, not a React node, so the same pin has
 * to exist in both forms — the constants below are the single source both use.
 */
const SIZE = { selected: 46, default: 32 } as const
const RING = { selected: 2.5, default: 2 } as const
const TAIL = { selected: 7, default: 5 } as const

/**
 * Tinted veil over the photo, darkest at the foot of the disc, so a bright shot
 * never fights the dark map — and so a white order number has something to read
 * against on the numbered pins of a course.
 */
export const PIN_VEIL = 'linear-gradient(180deg, rgba(11,11,15,.05), rgba(11,11,15,.45))'
export const PIN_SHADOW = 'drop-shadow(0 4px 8px rgba(0,0,0,.55))'

export function pinGeometry(selected: boolean) {
  return {
    size: selected ? SIZE.selected : SIZE.default,
    ring: selected ? RING.selected : RING.default,
    tail: selected ? TAIL.selected : TAIL.default,
  }
}

/**
 * "You are here", as an element for Kakao's CustomOverlay.
 *
 * Deliberately not a pin. The pins mark places worth going to and carry a photo
 * of each; the viewer's own position is neither, so it takes the shape every
 * map uses for it — a small filled dot with a halo, which reads as a position
 * rather than a destination even at country zoom.
 *
 * The halo is a ring rather than an animation: a pulsing marker draws the eye
 * away from the pins, which are the point of the screen.
 */
export function createUserDotElement(label: string): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('role', 'img')
  root.setAttribute('aria-label', label)
  root.style.cssText = [
    'width:18px',
    'height:18px',
    'border-radius:9999px',
    // The halo is drawn with a shadow so it costs no extra element and never
    // affects the overlay's anchor point.
    `background:${USER_DOT_COLOR}`,
    // Dark ring, not white: the fill is white, so a white ring would vanish
    // into it and leave a bare disc with nothing holding its edge.
    `border:2.5px solid ${USER_DOT_RING}`,
    `box-shadow:0 0 0 4px ${USER_DOT_HALO}, 0 2px 6px rgba(0,0,0,.55)`,
  ].join(';')
  return root
}

/**
 * Plain white, not a palette colour.
 *
 * Every entry in `IDOL_PALETTE` is spoken for on this map — mint is an idol's
 * ring, not a spare — so tinting the dot would make the viewer's own position
 * look like one more idol's location. White inside a dark ring belongs to
 * nobody, and is the one thing that stays legible on the dark tiles.
 */
const USER_DOT_COLOR = '#f2f2f4'
const USER_DOT_RING = '#0b0b0f'
const USER_DOT_HALO = 'rgba(242,242,244,.28)'

/** Builds the pin as an element, for Kakao's CustomOverlay. */
export function createPinElement(
  point: MapPoint,
  selected: boolean,
  color: string,
  onClick: () => void,
): HTMLElement {
  const { size, ring, tail } = pinGeometry(selected)

  const root = document.createElement('button')
  root.type = 'button'
  // What the popup anchors to — see `MapPopup`.
  root.dataset.mapPin = point.id
  root.setAttribute(
    'aria-label',
    point.order ? `${point.order}. ${point.label}` : point.label,
  )
  root.setAttribute('aria-current', selected ? 'true' : 'false')
  root.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'background:none',
    'border:0',
    'padding:0',
    'cursor:pointer',
    `filter:${PIN_SHADOW}`,
  ].join(';')
  root.addEventListener('click', onClick)

  const disc = document.createElement('span')
  disc.style.cssText = [
    'position:relative',
    'display:block',
    'overflow:hidden',
    'border-radius:9999px',
    'background:#15151B',
    `width:${size}px`,
    `height:${size}px`,
    `border:${ring}px solid ${color}`,
    `opacity:${selected ? 1 : 0.92}`,
  ].join(';')

  if (point.imageUrl) {
    const img = document.createElement('img')
    img.src = point.imageUrl
    img.alt = ''
    img.loading = 'lazy'
    img.style.cssText = [
      'width:100%',
      'height:100%',
      'object-fit:cover',
      'display:block',
      `filter:${selected ? 'none' : 'grayscale(.35)'}`,
    ].join(';')
    disc.appendChild(img)
  }

  const veil = document.createElement('span')
  veil.style.cssText = `position:absolute;inset:0;background:${PIN_VEIL}`
  disc.appendChild(veil)

  if (point.order !== undefined) {
    const num = document.createElement('span')
    num.textContent = String(point.order)
    num.style.cssText = [
      'position:absolute',
      'inset:0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'color:#fff',
      'font-weight:600',
      'font-variant-numeric:tabular-nums',
      `font-size:${selected ? 15 : 12}px`,
    ].join(';')
    disc.appendChild(num)
  }

  // Pointer, drawn as a CSS triangle so it needs no extra asset.
  const pointer = document.createElement('span')
  pointer.style.cssText = [
    'display:block',
    'margin-top:-1px',
    'width:0',
    'height:0',
    `border-left:${tail}px solid transparent`,
    `border-right:${tail}px solid transparent`,
    `border-top:${tail + 2}px solid ${color}`,
  ].join(';')

  root.appendChild(disc)
  root.appendChild(pointer)
  return root
}
