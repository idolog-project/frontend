import { Bus, Car, Footprints, type LucideIcon } from 'lucide-react'

import type { MessageKey } from '@/features/locale/messages'
import type { LocationCategory, TransportMode, TravelStyle } from './schemas'

/**
 * Radius per transport mode comes from the brief (§5) and must be shown to the
 * user when they pick a mode. Labels live in the message dictionary — only the
 * numbers and icons belong here.
 */
export const TRANSPORT: Record<TransportMode, { radiusKm: number; icon: LucideIcon }> = {
  WALK: { radiusKm: 3, icon: Footprints },
  TAXI: { radiusKm: 30, icon: Car },
  BUS: { radiusKm: 30, icon: Bus },
  CAR: { radiusKm: 30, icon: Car },
}

export const TRANSPORT_ORDER: TransportMode[] = ['WALK', 'TAXI', 'BUS', 'CAR']

export const TRAVEL_STYLE_ORDER: TravelStyle[] = [
  'NATURE',
  'CULTURE',
  'ACTIVITY',
  'FOOD',
  'SHOPPING',
  'PHOTO',
]

/** Filter chips on the map, in the draft's order. `null` is the "all" chip. */
export const LOCATION_CATEGORY_ORDER: Array<LocationCategory | null> = [
  null,
  'MV_SPOT',
  'CAFE',
  'PHOTO_SPOT',
]

export const locationCategoryKey = (category: LocationCategory | null) =>
  (category === null ? 'home.filterAll' : `category.${category}`) as MessageKey

export const transportKey = (mode: TransportMode) =>
  `transport.${mode}` as MessageKey

export const travelStyleKey = (style: TravelStyle) => `style.${style}` as MessageKey

/**
 * The recommendation call runs a place lookup, filtering, a model call and
 * distance maths, so it is slow by design. These are the user-facing steps —
 * never the system names (§9).
 */
export const RECOMMEND_STEPS = [
  { label: 'wait.step1', caption: 'wait.step1Caption' },
  { label: 'wait.step2', caption: 'wait.step2Caption' },
  { label: 'wait.step3', caption: 'wait.step3Caption' },
  { label: 'wait.step4', caption: 'wait.step4Caption' },
] as const satisfies ReadonlyArray<{ label: MessageKey; caption: MessageKey }>

/** ASSUMPTION: no progress stream from the backend, so steps advance on a timer
 *  sized to the expected 10-30s total. */
export const RECOMMEND_STEP_MS = 4_000
