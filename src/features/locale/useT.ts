import { useCallback } from 'react'

import { messages, type MessageKey } from './messages'
import { useLocaleStore, type Locale } from './store'

type Params = Record<string, string | number>

/** Substitutes `{name}` placeholders. Unknown placeholders are left in place so
 *  a missing param is visible in development rather than silently blank. */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Params,
): string {
  const template = messages[locale][key] ?? messages.ko[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

/**
 * `const t = useT()` then `t('nav.home')` or `t('home.spotCount', { count: 4 })`.
 * Keys are typed, so a typo or a key removed from the dictionary fails the build.
 */
export function useT() {
  const locale = useLocaleStore((s) => s.locale)
  return useCallback(
    (key: MessageKey, params?: Params) => translate(locale, key, params),
    [locale],
  )
}

export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale)
}
