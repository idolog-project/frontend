import { HttpResponse, delay, http, passthrough } from 'msw'

import { HAS_REAL_API } from '@/app/env'
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

/**
 * With a real backend in front, the session lives there and `signedIn` is never
 * set — so the catalogue handlers must not gate on it, or every mocked endpoint
 * would 401 for a properly signed-in user.
 */
const requireAuth = (request: Request) =>
  HAS_REAL_API || signedIn ? null : fail(401, 'UNAUTHENTICATED', request)

/** Fisher-Yates on a copy — the seed array must stay in its authored order. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Kakao asset passthrough must stay first: MSW resolves handlers in order.
 */
const passthroughHandlers = [
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
]

/**
 * Auth handlers stand down as soon as a real backend is reachable — it has
 * auth implemented, and a mock session would issue a token that backend
 * rejects, which reads as a backend bug rather than a mock in the way.
 */
const authHandlers = HAS_REAL_API ? [] : [

  // ---- auth --------------------------------------------------------------
  /**
   * Stands in for the whole Google round trip. The real endpoint answers 302 to
   * Google, and its callback returns to `/auth/callback` with the refresh
   * cookie set; all the mock owes the app is that established session.
   *
   * 204 rather than the real 302 on purpose. A service worker answering a
   * redirect is the exact thing that breaks here — the worker sits in front of
   * navigations and its passthrough throws `TypeError: Failed to fetch`, the
   * same defect the Kakao asset rule above works around. The caller moves to
   * the callback route itself instead, and everything after that point — the
   * cookie-for-token exchange — is the real flow unchanged.
   */
  http.get('/api/v1/auth/login/google', async () => {
    await delay(400)
    signedIn = true
    return new HttpResponse(null, { status: 204 })
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

]

/**
 * 백엔드가 /idols 와 /locations 를 구현했으므로 카탈로그 목도 물러납니다.
 * 남은 것은 어느 쪽에도 속하지 않는 카카오 자산 통과 규칙뿐이고, 그것은
 * 실서버 여부와 무관하게 언제나 필요합니다.
 */
const catalogueHandlers = HAS_REAL_API ? [] : [

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

]

/**
 * 추천은 백엔드에 아직 POST /recommendations 가 없어 실서버가 붙어 있어도
 * 목이 계속 답합니다. 그래야 코스 화면이 빈 채로 남지 않습니다.
 *
 * 팀원의 추천 구현이 들어오면 이 배열도 다른 것들처럼 HAS_REAL_API 로
 * 감싸면 됩니다.
 */
const recommendationHandlers = [
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

]

/**
 * 저장 코스는 백엔드가 구현했으므로 실서버가 붙으면 물러납니다. 목이 남아
 * 있으면 저장한 코스가 새로고침마다 사라져 백엔드가 저장을 못 하는 것처럼
 * 보입니다.
 */
const courseHandlers = HAS_REAL_API ? [] : [
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

export const handlers = [
  ...passthroughHandlers,
  ...authHandlers,
  ...catalogueHandlers,
  ...recommendationHandlers,
  ...courseHandlers,
]
