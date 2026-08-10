import type { CoursePlace } from '@/api/schemas'

/**
 * Deep links into Kakao Map. These need no SDK and no key — they just open
 * kakao's own site or app, which is what the itinerary's "길찾기" action wants.
 */
export function directionsUrl(place: {
  name: string
  latitude: number
  longitude: number
}) {
  // Kakao's own format: /link/to/{name},{lat},{lng}
  return `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.latitude},${place.longitude}`
}

export function placeUrl(place: {
  name: string
  latitude: number
  longitude: number
}) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.latitude},${place.longitude}`
}

/** Whole-course link — Kakao has no multi-stop URL, so this targets the last stop. */
export function finalDestinationUrl(places: CoursePlace[]) {
  const last = places.at(-1)
  return last ? directionsUrl(last) : null
}
