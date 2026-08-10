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

/**
 * Whether the language screen has been answered since the app was opened.
 *
 * Deliberately not persisted: the language screen is meant to greet every visit,
 * so this resets with the page. The chosen language itself still is persisted —
 * it decides which language the greeting is written in, and what 마이페이지 shows
 * as current.
 */
let chosenThisVisit = false
export function hasChosenLocaleThisVisit(): boolean {
  return chosenThisVisit
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
      chosenThisVisit = true
      localStorage.setItem(KEY, next)
      document.documentElement.lang = HTML_LANG[next]
      set({ locale: next })
    },
  }
})
