import { z } from 'zod'

import { USE_MOCKS } from '@/app/env'
import { BASE_URL, request } from './client'
import {
  authTokensSchema,
  courseListSchema,
  courseSchema,
  filmingLocationSchema,
  idolListSchema,
  locationListSchema,
  userSchema,
  type RecommendationRequest,
} from './schemas'

/**
 * Every network call the app makes lives here. Paths follow the agreed contract
 * in the backend repo's `docs/FRONTEND_API_SPEC.md`.
 */

// ---- auth ----------------------------------------------------------------

/**
 * Google is the only sign-in route in the product right now, and it is a full
 * browser redirect rather than a fetch: the page leaves for the backend, which
 * bounces to Google and finally returns to `/auth/callback` with the refresh
 * cookie set. The access token never travels in a URL.
 *
 * Nothing comes back to the caller — by the time the request resolves the page
 * is gone — so this returns void rather than a promise of a session.
 */
export const GOOGLE_LOGIN_URL = `${BASE_URL}/auth/login/google`

/**
 * `moveToCallback` is only used against the mock, which cannot be reached the
 * real way: MSW's worker sits in front of top-level navigations and its
 * passthrough throws `TypeError: Failed to fetch` on them — the same defect the
 * Kakao asset rule at the top of `handlers.ts` works around. So the mock path
 * calls the very same endpoint by fetch, which establishes the session exactly
 * as the redirect would, and then moves to the callback route in-app. What
 * happens after that — spending the cookie for a token — is identical either
 * way, so the flow being exercised is still the real one.
 */
export async function startGoogleLogin(moveToCallback: () => void): Promise<void> {
  if (!USE_MOCKS) {
    window.location.assign(GOOGLE_LOGIN_URL)
    return
  }
  await fetch(GOOGLE_LOGIN_URL, { credentials: 'include' })
  moveToCallback()
}

export const logout = () => request('/auth/logout', z.unknown(), { method: 'POST' })

export const getMe = () => request('/auth/me', userSchema)

/**
 * Email and password are not reachable from the UI — Google is the only route.
 * Kept because the backend contract still lists them and the screens may come
 * back; delete both if the team confirms Google-only for good.
 */
export const signup = (body: {
  email: string
  password: string
  nickname: string
  preferredLanguage?: string
}) => request('/auth/signup', userSchema, { method: 'POST', body })

export const login = (body: { email: string; password: string }) =>
  request('/auth/login', authTokensSchema, { method: 'POST', body })

// ---- browse --------------------------------------------------------------

export const getIdols = (query?: string) =>
  request(
    `/idols${query ? `?query=${encodeURIComponent(query)}` : ''}`,
    idolListSchema,
  ).then((r) => r.idols)

export const getIdolLocations = (idolId: number) =>
  request(`/idols/${idolId}/locations`, locationListSchema).then((r) => r.locations)

/** Every filming location in the catalogue — what the map home pins by default. */
export const getAllLocations = () =>
  request('/locations', locationListSchema).then((r) => r.locations)

export const getLocation = (locationId: number) =>
  request(`/locations/${locationId}`, filmingLocationSchema)

// ---- recommendation ------------------------------------------------------

export const getRecommendations = (body: RecommendationRequest, signal?: AbortSignal) =>
  request('/recommendations', courseListSchema, { method: 'POST', body, signal }).then(
    (r) => r.courses,
  )

// ---- saved courses -------------------------------------------------------

export const getSavedCourses = () =>
  request('/courses', courseListSchema).then((r) => r.courses)

export const saveCourse = (course: { locationId: number; course: unknown }) =>
  request('/courses', courseSchema, { method: 'POST', body: course })

export const deleteCourse = (courseId: string) =>
  request(`/courses/${courseId}`, z.unknown(), { method: 'DELETE' })
