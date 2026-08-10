import { translate } from '@/features/locale/useT'
import type { Locale } from '@/features/locale/store'

/**
 * Distance and duration formatting. Locale-aware because the unit strings and
 * their spacing differ per language — "5시간 20분", "5 hr 20 min", "5 小时 20 分".
 */
export function formatDistance(locale: Locale, meters: number | null) {
  if (meters === null) return null
  if (meters < 1000) {
    return translate(locale, 'unit.metre', { n: Math.round(meters / 10) * 10 })
  }
  return translate(locale, 'unit.kilometre', { n: (meters / 1000).toFixed(1) })
}

export function formatDuration(locale: Locale, seconds: number | null) {
  if (seconds === null) return null
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return translate(locale, 'unit.minute', { n: minutes })
  if (minutes === 0) return translate(locale, 'unit.hour', { n: hours })
  return translate(locale, 'unit.hourMinute', { h: hours, m: minutes })
}

/** The leg summary between two stops — "8분 · 600m". */
export function formatLeg(
  locale: Locale,
  meters: number | null,
  seconds: number | null,
) {
  const parts = [
    formatDuration(locale, seconds),
    formatDistance(locale, meters),
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}

const DATE_LOCALE: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-GB',
  zh: 'zh-CN',
}

export function formatDate(locale: Locale, iso: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** Default start time for the trip form: the next whole hour. */
export function nextWholeHour(now = new Date()): string {
  const next = new Date(now)
  next.setHours(now.getHours() + 1, 0, 0, 0)
  return `${String(next.getHours()).padStart(2, '0')}:00`
}
