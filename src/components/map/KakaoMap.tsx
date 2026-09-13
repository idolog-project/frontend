import { useEffect, useRef, useState } from 'react'

import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { DEFAULT_PIN_COLOR, MapCanvas, type MapPoint } from './MapCanvas'
import { createPinElement, createUserDotElement } from './pinElement'
import { loadKakaoMaps, type KakaoLatLng, type KakaoMaps } from './loadKakao'

type Props = {
  points: MapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  showRoute?: boolean
  /** Marks where the viewer is, if the browser will say and they allow it. */
  showUserLocation?: boolean
  /** Called when a gesture should dismiss an open popup — see `Map`. */
  onClosePopup?: () => void
  className?: string
}

/**
 * Kakao ships no dark map style, so the tiles were inverted in CSS to sit in a
 * dark app, with every pin carrying the exact inverse to cancel it.
 *
 * That is off now. Inverting a drawn map does not darken it so much as turn it
 * inside out: white land goes black, the pale blue sea goes deep teal, park
 * green comes back as something closer to terrain. The result read as a
 * satellite photo rather than a map, which is the opposite of what a map of
 * places you might visit should look like.
 *
 * Kept as a constant rather than deleted because it is the whole mechanism —
 * put the filter back here and the pins re-cancel it on their own. Whatever
 * goes here, the pin wrapper must carry the same string: applied twice,
 * `invert(1) hue-rotate(180deg)` is the identity, and any other pairing would
 * leave the photo inside each pin colour-shifted.
 */
const MAP_FILTER = 'none'

export function KakaoMap({
  points,
  selectedId,
  onSelect,
  showRoute,
  showUserLocation,
  onClosePopup,
  className,
}: Props) {
  const t = useT()
  const containerRef = useRef<HTMLDivElement>(null)
  const [maps, setMaps] = useState<KakaoMaps | null>(null)
  const [failed, setFailed] = useState(false)

  // Held across renders so selecting a pin never rebuilds the map — rebuilding
  // would throw away the zoom and pan the user just made, which is the whole
  // point of browsing the map.
  const mapRef = useRef<InstanceType<KakaoMaps['Map']> | null>(null)
  const overlaysRef = useRef<Array<{ setMap(map: unknown): void }>>([])
  /** point id -> the filter wrapper whose child is the pin. */
  const pinsRef = useRef(new globalThis.Map<string, HTMLElement>())
  const routeRef = useRef<{ setMap(map: unknown): void } | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onClosePopupRef = useRef(onClosePopup)
  onClosePopupRef.current = onClosePopup

  useEffect(() => {
    let cancelled = false
    loadKakaoMaps()
      .then((m) => !cancelled && setMaps(m))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [])

  // Create the map exactly once.
  useEffect(() => {
    if (!maps || !containerRef.current || mapRef.current) return
    mapRef.current = new maps.Map(containerRef.current, {
      center: new maps.LatLng(36.5, 127.9), // roughly the centre of Korea
      level: 13,
    })
  }, [maps])

  /**
   * Where the viewer is, once.
   *
   * Asked for rather than watched: the map opens on the whole country and the
   * pins do not move, so a live feed would spend the battery to redraw a dot in
   * the same place. It also does not recentre — the viewer came to browse every
   * filming location, and yanking the map to wherever they happen to be would
   * take that away before they had looked.
   *
   * Every failure is silent. Permission refused, no signal indoors, an older
   * browser without the API — none of that is worth an error the viewer did not
   * ask to see, and the map is fully usable without it.
   */
  useEffect(() => {
    if (!maps || !showUserLocation || !navigator.geolocation) return

    let overlay: { setMap(map: unknown): void } | null = null
    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const map = mapRef.current
        if (cancelled || !map) return
        overlay = new maps.CustomOverlay({
          position: new maps.LatLng(coords.latitude, coords.longitude),
          content: createUserDotElement(t('map.myLocation')),
          // Under the pins: it says where you are, it is not somewhere to go.
          zIndex: 1,
          clickable: false,
        })
        overlay.setMap(map)
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    )

    return () => {
      cancelled = true
      overlay?.setMap(null)
    }
  }, [maps, showUserLocation, t])

  // Rebuild pins only when the set of points changes.
  useEffect(() => {
    const map = mapRef.current
    if (!maps || !map || !points.length) return

    for (const overlay of overlaysRef.current) overlay.setMap(null)
    overlaysRef.current = []
    pinsRef.current.clear()
    routeRef.current?.setMap(null)

    const bounds = new maps.LatLngBounds()
    const path: KakaoLatLng[] = []

    for (const point of points) {
      const position = new maps.LatLng(point.latitude, point.longitude)
      bounds.extend(position)
      path.push(position)

      // Wrapper carries the counter-filter that cancels whatever the tiles are
      // filtered by — a no-op while `MAP_FILTER` is `none`, and the thing that
      // keeps each pin's photo true if it is ever turned back on.
      const wrapper = document.createElement('div')
      wrapper.style.cssText = `filter:${MAP_FILTER}`
      const el = createPinElement(
        point,
        false,
        point.color ?? DEFAULT_PIN_COLOR,
        () => onSelectRef.current?.(point.id),
      )
      wrapper.appendChild(el)
      pinsRef.current.set(point.id, wrapper)

      overlaysRef.current.push(
        // yAnchor 1 puts the pointer tip on the coordinate, not the disc centre.
        // `clickable` keeps the pin's own click from also counting as a click on
        // the map, which would close the card the same gesture just opened.
        new maps.CustomOverlay({
          position,
          content: wrapper,
          map,
          yAnchor: 1,
          clickable: true,
        }),
      )
    }

    if (showRoute && path.length > 1) {
      const line = new maps.Polyline({
        path,
        strokeWeight: 3,
        strokeColor: '#FF5A6E',
        strokeOpacity: 0.9,
        strokeStyle: 'shortdash',
      })
      line.setMap(map)
      routeRef.current = line
    }

    // Fit only when the pin set changes — never on selection.
    if (points.length > 1) map.setBounds(bounds)
    else map.setCenter(path[0])
  }, [maps, points, showRoute])

  // Swap the pin in place. No map rebuild, no bounds change, zoom preserved.
  useEffect(() => {
    for (const point of points) {
      const wrapper = pinsRef.current.get(point.id)
      if (!wrapper) continue
      wrapper.replaceChildren(
        createPinElement(
          point,
          point.id === selectedId,
          point.color ?? DEFAULT_PIN_COLOR,
          () => onSelectRef.current?.(point.id),
        ),
      )
    }
  }, [selectedId, points])

  // Clicking empty map dismisses the card, as on any consumer map.
  useEffect(() => {
    const map = mapRef.current
    if (!maps || !map) return
    const close = () => onClosePopupRef.current?.()
    maps.event.addListener(map, 'click', close)
    return () => maps.event.removeListener(map, 'click', close)
  }, [maps])

  // The SDK refused to load. Fall back so the screen still works, but say so in
  // development — a silent fallback makes a fixable console setting look like a
  // broken app.
  if (failed) {
    return (
      <div className={cn('relative', className)}>
        <MapCanvas
          points={points}
          selectedId={selectedId}
          onSelect={onSelect}
          showRoute={showRoute}
          onClosePopup={onClosePopup}
          className="absolute inset-0"
        />
        {import.meta.env.DEV && (
          <p className="absolute inset-x-3 top-3 z-20 rounded border border-danger/40 bg-background/90 px-3 py-2 text-caption text-danger backdrop-blur-sm">
            카카오맵 SDK 로드 실패 — 콘솔을 확인하세요. 대체 지도로 표시 중입니다.
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn('relative isolate overflow-hidden bg-background', className)}
      role="group"
      aria-label={t(showRoute ? 'result.mapAria' : 'result.mapAriaPins', {
        count: points.length,
      })}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ filter: MAP_FILTER }}
      />
      {!maps && (
        <div className="absolute inset-0 flex items-center justify-center text-caption text-text-subtle">
          {t('state.mapPending')}
        </div>
      )}

    </div>
  )
}
