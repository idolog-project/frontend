import { useState } from 'react'

import { useAllLocations } from '@/api/queries'
import { randomBackdrop } from '@/mocks/images'

/**
 * The filming locations the full-bleed screens draw their photograph from.
 *
 * Picked for the frame rather than at random: wide, dark and quiet enough to
 * carry a headline, and between them a maze, a country station, a river park
 * and a platform — four different kinds of place, so a returning visitor is
 * unlikely to see the same one twice running.
 *
 * Matched by name, which is the only stable handle the API offers here — ids
 * come from an import and would not survive a reseed. Rename one in the
 * catalogue and it quietly drops out of the rotation rather than breaking the
 * screen, which is the right way for this to fail.
 */
const BACKDROP_LOCATIONS = ['메이즈랜드', '도경리역', '반포한강공원', '일영역']

/**
 * A real filming location's photograph for the language and sign-in screens.
 *
 * These two screens used to show art seeded from the design tool — pictures of
 * nowhere. The app is about places you can actually stand in, and the first
 * screen should already be one of them.
 *
 * Falls back to the seed art, which is bundled and therefore instant, whenever
 * the catalogue is not there: the language screen runs before sign-in and
 * before any of this has been fetched, and it must never open on an empty
 * frame because the network is slow or the backend is down.
 *
 * Both choices are made once per mount. Re-picking on every render would deal
 * a new photograph each time the screen re-rendered for any other reason.
 */
export function useLocationBackdrop(): string {
  const [fallback] = useState(randomBackdrop)
  const [roll] = useState(Math.random)
  const { data } = useAllLocations()

  const candidates = (data ?? []).filter(
    (location) =>
      location.imageUrl && BACKDROP_LOCATIONS.includes(location.name),
  )
  if (candidates.length === 0) return fallback

  return candidates[Math.floor(roll * candidates.length)].imageUrl ?? fallback
}
