import type { Locale } from '@/features/locale/store'

/**
 * Error copy the MOCK BACKEND returns, kept separate from the UI dictionary on
 * purpose: these strings belong to the server, not the client.
 *
 * The real Spring Boot service will need its own copy of this and should pick a
 * language from `Accept-Language` exactly as `localeFrom` does below. Handing
 * the API team a worked example is the point of doing it here.
 */
const SERVER_MESSAGES = {
  UNAUTHENTICATED: {
    ko: '로그인이 필요합니다.',
    en: 'You need to sign in first.',
    zh: '请先登录。',
  },
  NOT_FOUND: {
    ko: '없는 촬영지입니다. 지도에서 다시 골라주세요.',
    en: "That location doesn't exist. Pick another one on the map.",
    zh: '该拍摄地不存在，请在地图上重新选择。',
  },
  RECOMMENDATION_FAILED: {
    ko: '코스를 짜는 중에 문제가 생겼습니다. 조건을 바꾸거나 다시 시도해 주세요.',
    en: 'Something went wrong while building your course. Change your answers or try again.',
    zh: '规划路线时出了问题。修改条件或再试一次。',
  },
} as const satisfies Record<string, Record<Locale, string>>

export type ServerErrorCode = keyof typeof SERVER_MESSAGES

/** Parses the header the client sends: "zh-Hans, zh;q=0.9" -> "zh". */
export function localeFrom(request: Request): Locale {
  const header = request.headers.get('Accept-Language') ?? ''
  const first = header.split(',')[0]?.trim().toLowerCase() ?? ''
  const base = first.split('-')[0]
  return base === 'en' || base === 'zh' ? base : 'ko'
}

export function serverMessage(code: ServerErrorCode, request: Request): string {
  return SERVER_MESSAGES[code][localeFrom(request)]
}
