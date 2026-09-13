import { useEffect, useState } from 'react'

import { KakaoMap } from './KakaoMap'
import { MapCanvas, type MapPoint } from './MapCanvas'
import { MapPopup } from './MapPopup'
import { kakaoKey } from './loadKakao'

export type { MapPoint }

type Props = {
  points: MapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  showRoute?: boolean
  /** Marks where the viewer is. Kakao only — the stand-in has no tiles to put it on. */
  showUserLocation?: boolean
  className?: string
}

/**
 * Single entry point for every map in the app. Uses Kakao when a JavaScript key
 * is configured, otherwise the built-in stand-in — so the app runs for anyone
 * who clones it without a key.
 *
 * Which pin has its popup open is held here rather than in either map, so the
 * two implementations cannot drift on when a card opens and closes.
 */
export function Map({
  points,
  selectedId,
  onSelect,
  showRoute,
  showUserLocation,
  className,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const close = () => setOpenId(null)

  // A card must never outlive the point it describes — filtering the map down
  // to one idol would otherwise strand it over an empty coordinate.
  useEffect(() => {
    if (openId && !points.some((point) => point.id === openId)) setOpenId(null)
  }, [points, openId])

  useEffect(() => {
    if (!openId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenId(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openId])

  const select = (id: string) => {
    // Clicking the open pin again closes its card, the way a consumer map does.
    setOpenId((current) => (current === id ? null : id))
    onSelect?.(id)
  }

  const shared = {
    points,
    selectedId,
    onSelect: select,
    showRoute,
    onClosePopup: close,
    className,
  }

  // Only a point with somewhere to go opens a card — the itinerary and detail
  // maps carry no `detailPath`, so they keep selecting and nothing more.
  const openPoint = points.find(
    (point) => point.id === openId && point.detailPath,
  )

  return (
    <>
      {kakaoKey() ? (
        <KakaoMap {...shared} showUserLocation={showUserLocation} />
      ) : (
        <MapCanvas {...shared} />
      )}
      {openPoint && <MapPopup point={openPoint} onClose={close} />}
    </>
  )
}
