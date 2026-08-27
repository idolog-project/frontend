import type { z } from 'zod'

import { useLocaleStore } from '@/features/locale/store'
import { translate } from '@/features/locale/useT'
import { apiErrorSchema } from './schemas'

/** Backend serves under a versioned prefix — backend `docs/FRONTEND_API_SPEC.md`. */
export const BASE_URL = '/api/v1'

/**
 * Access token lives in memory only — never localStorage — and rides on the
 * Authorization header. ASSUMPTION: the refresh token is an HttpOnly cookie the
 * browser sends automatically, so refreshing needs no argument from us.
 */
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}
export const getAccessToken = () => accessToken

/** Thrown for any non-2xx response. Screens branch on `status` and `code`. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/** Thrown when a response does not match its schema — a backend contract break. */
export class SchemaError extends Error {
  readonly path: string
  readonly issues: unknown

  constructor(path: string, issues: unknown) {
    super(translate(useLocaleStore.getState().locale, 'error.schema', { path }))
    this.name = 'SchemaError'
    this.path = path
    this.issues = issues
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH'
  body?: unknown
  signal?: AbortSignal
  /** Set internally to stop a refresh loop. */
  skipRefresh?: boolean
}

/** Read outside React — these run in plain functions, not components. */
const currentLocale = () => useLocaleStore.getState().locale

/** `zh-Hans` is what the Accept-Language header should carry for Simplified. */
const acceptLanguage = () => {
  const locale = currentLocale()
  return locale === 'zh' ? 'zh-Hans, zh;q=0.9' : `${locale}, en;q=0.9`
}

/**
 * The backend wraps every success in `{ isSuccess, code, message, result }`.
 * Screens want the payload, so the envelope is opened here and nowhere else.
 *
 * Errors are deliberately left alone: the spec keeps `code` and `message` at
 * the top level of an error body, which is what `toApiError` reads.
 */
function unwrap(path: string, body: unknown): unknown {
  if (typeof body === 'object' && body !== null && 'result' in body) {
    return (body as { result: unknown }).result
  }
  throw new SchemaError(path, [
    { message: 'response was not the { isSuccess, code, message, result } envelope' },
  ])
}

async function toApiError(res: Response): Promise<ApiError> {
  let code = 'UNKNOWN'
  let message = translate(currentLocale(), 'error.generic')
  try {
    const parsed = apiErrorSchema.safeParse(await res.json())
    if (parsed.success) {
      code = parsed.data.code
      message = parsed.data.message
    }
  } catch {
    // Body was empty or not JSON — keep the defaults.
  }
  return new ApiError(res.status, code, message)
}

/** Single-flight refresh: concurrent 401s share one refresh request. */
let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return false
      const data = unwrap('/auth/refresh', await res.json()) as { accessToken?: string }
      if (!data?.accessToken) return false
      setAccessToken(data.accessToken)
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

/**
 * Exchanges the refresh cookie for an access token. Exported for the OAuth
 * callback, which lands holding nothing but that cookie.
 */
export const refreshSession = (): Promise<boolean> => refreshAccessToken()

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  const { method = 'GET', body, signal } = options
  return fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: {
      // The backend should localise its own error copy from this — the mock
      // handlers already do, as a worked example for the API team.
      'Accept-Language': acceptLanguage(),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

/**
 * Performs the request, and on a 401 refreshes the access token once and
 * retries the original request exactly once.
 */
export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  let res = await rawRequest(path, options)

  if (res.status === 401 && !options.skipRefresh) {
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      setAccessToken(null)
      throw new ApiError(
        401,
        'UNAUTHENTICATED',
        translate(currentLocale(), 'error.unauthenticated'),
      )
    }
    res = await rawRequest(path, { ...options, skipRefresh: true })
  }

  if (!res.ok) throw await toApiError(res)

  if (res.status === 204) return schema.parse(undefined)

  const parsed = schema.safeParse(unwrap(path, await res.json()))
  if (!parsed.success) throw new SchemaError(path, parsed.error.issues)
  return parsed.data
}
