import { HttpResponse, delay, http, passthrough } from 'msw'

import type { Course } from '@/api/schemas'
import { courses, idols, locations, locationsByIdol, users } from './seed'
import { currentScenario, recommendDelayMs } from './scenario'
import { serverMessage, type ServerErrorCode } from './serverMessages'

/**
 * ASSUMPTION: every path and payload here mirrors the brief (§6) and is not yet
 * confirmed with the backend team. When the real contract lands, this file plus
 * `src/api/` are the only places that should change.
 *
 * Error copy is chosen from the request's Accept-Language header, which is how
 * the real service should do it too.
 */

/** Session state lives for the lifetime of the tab. */
let signedIn = false
let savedCourses: Course[] = [courses[0]]

const ACCESS_TOKEN = 'mock-access-token'

/**
 * The real service wraps every body in `{ isSuccess, code, message, result }`
 * — backend `docs/FRONTEND_API_SPEC.md`. The mock has to wrap too, or the app
 * would be written against a shape only the mock ever produces.
 */
const ok = (result: unknown, init?: ResponseInit) =>
  HttpResponse.json(
    { isSuccess: true, code: 'COMMON200', message: '요청에 성공했습니다.', result },
    init,
  )

const fail = (status: number, code: ServerErrorCode, request: Request) =>
  HttpResponse.json(
    { isSuccess: false, code, message: serverMessage(code, request), result: null },
    { status },
  )

const requireAuth = (request: Request) =>
  signedIn ? null : fail(401, 'UNAUTHENTICATED', request)

/** Fisher-Yates on a copy — the seed array must stay in its authored order. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const handlers = [
  /**
   * Kakao Maps pulls its SDK, tiles and sprites from these hosts. MSW's worker
   * sits in front of every request the page makes, and its generic passthrough
   * throws `TypeError: Failed to fetch` on cross-origin no-cors asset requests —
   * which silently breaks map tiles. Matching them first and returning
   * `passthrough()` hands them straight to the network instead.
   *
   * Must stay at the top: MSW resolves handlers in order.
   */
  http.all(/^https:\/\/[^/]*\.(daumcdn\.net|kakao\.com)\//, () => passthrough()),

  // ---- auth --------------------------------------------------------------
  /**
   * Stands in for the whole Google round trip. The real endpoint bounces to
   * Google and its callback returns to `/auth/callback` carrying only the
   * refresh cookie; the mock skips Google and bounces straight back, so the
   * app exercises the same navigation and the same cookie-for-token exchange.
   */
  http.get('/api/v1/auth/login/google', async () => {
    await delay(400)
    signedIn = true
    return new HttpResponse(null, { status: 302, headers: { Location: '/auth/callback' } })
  }),

  http.post('/api/v1/auth/logout', async () => {
    signedIn = false
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/auth/refresh', async ({ request }) =>
    signedIn ? ok({ accessToken: ACCESS_TOKEN }) : fail(401, 'UNAUTHENTICATED', request),
  ),

  http.get('/api/v1/auth/me', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    const { password: _password, ...user } = users[0]
    return ok(user)
  }),

  // ---- browse ------------------------------------------------------------
  http.get('/api/v1/idols', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    const query = new URL(request.url).searchParams.get('query')?.trim().toLowerCase()
    const result = query
      ? idols.filter((i) => i.name.toLowerCase().includes(query))
      : idols
    return ok({ idols: result })
  }),

  http.get('/api/v1/idols/:idolId/locations', async ({ request, params }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    const ids = locationsByIdol[Number(params.idolId)] ?? []
    return ok({
      locations: locations.filter((l) => ids.includes(l.id)),
    })
  }),

  http.get('/api/v1/locations', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    return ok({ locations })
  }),

  http.get('/api/v1/locations/:locationId', async ({ request, params }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    const location = locations.find((l) => l.id === Number(params.locationId))
    if (!location) return fail(404, 'NOT_FOUND', request)
    return ok(location)
  }),

  // ---- recommendation ----------------------------------------------------
  http.post('/api/v1/recommendations', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised

    // The real call runs a model plus map maths — slow on purpose.
    await delay(recommendDelayMs())

    switch (currentScenario()) {
      case 'error':
        return fail(503, 'RECOMMENDATION_FAILED', request)
      case 'empty':
        return ok({ courses: [] })
      default:
        // Only three seeded courses exist, so shuffle them: the same conditions
        // twice should not obviously return the same answer in the same order.
        return ok({ courses: shuffle(courses) })
    }
  }),

  // ---- saved courses -----------------------------------------------------
  http.get('/api/v1/courses', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    return ok({ courses: savedCourses })
  }),

  http.post('/api/v1/courses', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    const body = (await request.json()) as { course: Course }
    await delay(500)
    if (!savedCourses.some((c) => c.id === body.course.id)) {
      savedCourses = [body.course, ...savedCourses]
    }
    return ok(body.course)
  }),

  http.delete('/api/v1/courses/:courseId', async ({ request, params }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(300)
    savedCourses = savedCourses.filter((c) => c.id !== params.courseId)
    return new HttpResponse(null, { status: 204 })
  }),
]
