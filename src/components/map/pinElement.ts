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

/** Tinted veil over the photo so a bright shot never fights the dark map. */
export const PIN_VEIL = 'linear-gradient(180deg, rgba(11,11,15,.05), rgba(11,11,15,.45))'
export const PIN_SHADOW = 'drop-shadow(0 4px 8px rgba(0,0,0,.55))'

export function pinGeometry(selected: boolean) {
  return {
    size: selected ? SIZE.selected : SIZE.default,
    ring: selected ? RING.selected : RING.default,
    tail: selected ? TAIL.selected : TAIL.default,
  }
}

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
