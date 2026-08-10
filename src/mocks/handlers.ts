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

const fail = (status: number, code: ServerErrorCode, request: Request) =>
  HttpResponse.json({ code, message: serverMessage(code, request) }, { status })

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
   * TEMPORARY: stands in for the Google OAuth round trip so the app is usable
   * before the backend wires it. The real endpoint is a redirect, not a POST.
   */
  http.post('/api/auth/oauth/google', async () => {
    await delay(400)
    signedIn = true
    return HttpResponse.json({ accessToken: ACCESS_TOKEN })
  }),

  http.post('/api/auth/logout', async () => {
    signedIn = false
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/auth/refresh', async ({ request }) =>
    signedIn
      ? HttpResponse.json({ accessToken: ACCESS_TOKEN })
      : fail(401, 'UNAUTHENTICATED', request),
  ),

  http.get('/api/auth/me', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    const { password: _password, ...user } = users[0]
    return HttpResponse.json(user)
  }),

  // ---- browse ------------------------------------------------------------
  http.get('/api/idols', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    const query = new URL(request.url).searchParams.get('query')?.trim().toLowerCase()
    const result = query
      ? idols.filter((i) => i.name.toLowerCase().includes(query))
      : idols
    return HttpResponse.json({ idols: result })
  }),

  http.get('/api/idols/:idolId/locations', async ({ request, params }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    const ids = locationsByIdol[Number(params.idolId)] ?? []
    return HttpResponse.json({
      locations: locations.filter((l) => ids.includes(l.id)),
    })
  }),

  http.get('/api/locations', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    return HttpResponse.json({ locations })
  }),

  http.get('/api/locations/:locationId', async ({ request, params }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    const location = locations.find((l) => l.id === Number(params.locationId))
    if (!location) return fail(404, 'NOT_FOUND', request)
    return HttpResponse.json(location)
  }),

  // ---- recommendation ----------------------------------------------------
  http.post('/api/recommendations', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised

    // The real call runs a model plus map maths — slow on purpose.
    await delay(recommendDelayMs())

    switch (currentScenario()) {
      case 'error':
        return fail(503, 'RECOMMENDATION_FAILED', request)
      case 'empty':
        return HttpResponse.json({ courses: [] })
      default:
        // Only three seeded courses exist, so shuffle them: the same conditions
        // twice should not obviously return the same answer in the same order.
        return HttpResponse.json({ courses: shuffle(courses) })
    }
  }),

  // ---- saved courses -----------------------------------------------------
  http.get('/api/courses', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(400)
    return HttpResponse.json({ courses: savedCourses })
  }),

  http.post('/api/courses', async ({ request }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    const body = (await request.json()) as { course: Course }
    await delay(500)
    if (!savedCourses.some((c) => c.id === body.course.id)) {
      savedCourses = [body.course, ...savedCourses]
    }
    return HttpResponse.json(body.course)
  }),

  http.delete('/api/courses/:courseId', async ({ request, params }) => {
    const unauthorised = requireAuth(request)
    if (unauthorised) return unauthorised
    await delay(300)
    savedCourses = savedCourses.filter((c) => c.id !== params.courseId)
    return new HttpResponse(null, { status: 204 })
  }),
]
