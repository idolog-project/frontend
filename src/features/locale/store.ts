import { create } from 'zustand'

export const LOCALES = ['ko', 'en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]

/** Shown in the picker in the language's own script. */
export const LOCALE_LABEL: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '简体中文',
}

/** `lang` attribute values — `zh-Hans` tells the browser which font to reach for. */
const HTML_LANG: Record<Locale, string> = {
  ko: 'ko',
  en: 'en',
  zh: 'zh-Hans',
}

const KEY = 'idolog:locale'
const VISIT_KEY = 'idolog:locale-asked'

/**
 * Whether the language screen has been answered during this visit.
 *
 * Held in `sessionStorage` rather than a module variable, because signing in
 * with Google takes the tab away to Google and brings it back as a fresh
 * document. A module variable would forget, and the gate would throw the
 * language screen in front of a half-finished sign-in.
 *
 * Session-scoped, so a new tab is a new visit and gets asked again. The chosen
 * language itself lives in `localStorage` — it decides which language the
 * greeting is written in, and what 마이페이지 shows as current.
 */
export function hasChosenLocaleThisVisit(): boolean {
  try {
    return sessionStorage.getItem(VISIT_KEY) !== null
  } catch {
    // Private modes can throw on access. Asking again is the safe failure.
    return false
  }
}

function initialLocale(): Locale {
  const stored = localStorage.getItem(KEY)
  if (stored && (LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale
  }
  // Fall back to what the browser asks for before defaulting to Korean.
  const preferred = navigator.languages ?? [navigator.language]
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale
  }
  return 'ko'
}

type LocaleState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>((set) => {
  const locale = initialLocale()
  document.documentElement.lang = HTML_LANG[locale]

  return {
    locale,
    setLocale: (next) => {
      try {
        sessionStorage.setItem(VISIT_KEY, '1')
      } catch {
        // Storage unavailable — the gate simply asks again next load.
      }
      localStorage.setItem(KEY, next)
      document.documentElement.lang = HTML_LANG[next]
      set({ locale: next })
    },
  }
})
