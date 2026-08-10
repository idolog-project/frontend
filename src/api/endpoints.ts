import { z } from 'zod'

import { request } from './client'
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
 * Every network call the app makes lives here. ASSUMPTION: paths follow the
 * brief (§6) and are not yet confirmed with the backend team.
 */

// ---- auth ----------------------------------------------------------------

/**
 * Google is the only sign-in route in the product right now.
 *
 * ASSUMPTION / TEMPORARY: the real flow is a redirect — the browser leaves for
 * Google and comes back to a callback that sets the session. OAuth is not wired
 * yet, so this posts directly and the mock hands back a session immediately.
 * When the backend lands, replace the body of `googleLogin` with
 * `window.location.href = GOOGLE_REDIRECT_URL` and drop the mock handler.
 */
export const GOOGLE_REDIRECT_URL = '/api/oauth/google'

export const googleLogin = () =>
  request('/auth/oauth/google', authTokensSchema, { method: 'POST' })

export const logout = () => request('/auth/logout', z.unknown(), { method: 'POST' })

export const getMe = () => request('/auth/me', userSchema)

/**
 * Email and password are not reachable from the UI — Google is the only route.
 * Kept because the backend contract still lists them and the screens may come
 * back; delete both if the team confirms Google-only for good.
 */
export const signup = (body: { email: string; password: string; nickname: string }) =>
  request('/auth/signup', authTokensSchema, { method: 'POST', body })

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
