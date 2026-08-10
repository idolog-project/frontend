import { z } from 'zod'

/**
 * ASSUMPTION: the backend is still being built, so every shape here is agreed
 * with nobody yet. Each schema mirrors the domain types in the brief (§6).
 * When the real spec lands, this file and the MSW handlers are the only places
 * that should need editing — screens consume the inferred types.
 */

export const transportModeSchema = z.enum(['WALK', 'TAXI', 'BUS', 'CAR'])
export type TransportMode = z.infer<typeof transportModeSchema>

export const travelStyleSchema = z.enum([
  'NATURE',
  'CULTURE',
  'ACTIVITY',
  'FOOD',
  'SHOPPING',
  'PHOTO',
])
export type TravelStyle = z.infer<typeof travelStyleSchema>

export const idolSchema = z.object({
  id: z.number(),
  name: z.string(),
  agency: z.string().nullable(),
  imageUrl: z.string().nullable(),
  locationCount: z.number(),
})
export type Idol = z.infer<typeof idolSchema>

export const musicVideoSchema = z.object({
  id: z.number(),
  title: z.string(),
  idolId: z.number(),
  releaseDate: z.string().nullable(),
  youtubeUrl: z.string().nullable(),
})
export type MusicVideo = z.infer<typeof musicVideoSchema>

/**
 * ASSUMPTION — not in the agreed backend contract yet.
 *
 * What kind of place this is, which is what the map's filter chips switch on.
 * The draft's chips were 전체 / 뮤비 촬영지 / 카페 / 포토스팟, so the map is
 * expected to carry more than the filming locations themselves.
 */
export const locationCategorySchema = z.enum(['MV_SPOT', 'CAFE', 'PHOTO_SPOT'])
export type LocationCategory = z.infer<typeof locationCategorySchema>

export const filmingLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: locationCategorySchema,
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().nullable(),
  description: z.string().nullable(),
  musicVideos: z.array(musicVideoSchema),
})
export type FilmingLocation = z.infer<typeof filmingLocationSchema>

export const recommendationRequestSchema = z.object({
  locationId: z.number(),
  transportMode: transportModeSchema,
  // These messages are never shown — the trip form validates and phrases its own
  // errors in the user's language. They exist for logs and tests.
  travelStyles: z.array(travelStyleSchema).min(1, 'at least one travel style'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'expected HH:mm').optional(),
  availableHours: z.number().int().min(2).max(12).optional(),
  withPet: z.boolean().optional(),
  partySize: z.number().int().min(1).max(10).optional(),
})
export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>

/**
 * What a stop is, for the itinerary rail. `category` drives the tag on the
 * photo; it is a free string because TourAPI content types do not map cleanly
 * onto a fixed enum, and the filming location itself is not a TourAPI place.
 */
export const coursePlaceSchema = z.object({
  order: z.number(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().nullable(),
  overview: z.string().nullable(),
  homepageUrl: z.string().nullable(),
  /** "HH:mm" — when the itinerary expects you to arrive. */
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  /** Short label shown over the photo: 촬영지, 해변, 카페, 점심 … */
  category: z.string().nullable(),
  /** null on the first place — there is no previous leg. */
  distanceFromPrevMeters: z.number().nullable(),
  durationFromPrevSeconds: z.number().nullable(),
})
export type CoursePlace = z.infer<typeof coursePlaceSchema>

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** One line under the title describing the shape of the day. */
  summary: z.string(),
  /** Why the model picked this course for these answers. */
  reason: z.string(),
  places: z.array(coursePlaceSchema),
  totalDistanceMeters: z.number(),
  /** Whole-day span including time spent at each stop. */
  totalDurationSeconds: z.number(),
  /** Time on the road only — the number a driver actually plans around. */
  travelDurationSeconds: z.number().nullable(),
  /** "HH:mm" bounds of the itinerary. */
  startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
})
export type Course = z.infer<typeof courseSchema>

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  nickname: z.string(),
})
export type User = z.infer<typeof userSchema>

/** ASSUMPTION: refresh token is set as an HttpOnly cookie, so only the access
 *  token comes back in the body. */
export const authTokensSchema = z.object({
  accessToken: z.string(),
})
export type AuthTokens = z.infer<typeof authTokensSchema>

export const idolListSchema = z.object({ idols: z.array(idolSchema) })
export const locationListSchema = z.object({ locations: z.array(filmingLocationSchema) })
export const courseListSchema = z.object({ courses: z.array(courseSchema) })

/** Shape the API uses for expected failures. */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
})
export type ApiErrorBody = z.infer<typeof apiErrorSchema>
