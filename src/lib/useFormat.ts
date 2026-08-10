import { useMemo } from 'react'

import { useLocale } from '@/features/locale/useT'
import { formatDate, formatDistance, formatDuration, formatLeg } from './format'

/** The formatters bound to the active locale, so components never pass it in. */
export function useFormat() {
  const locale = useLocale()

  return useMemo(
    () => ({
      distance: (meters: number | null) => formatDistance(locale, meters),
      duration: (seconds: number | null) => formatDuration(locale, seconds),
      leg: (meters: number | null, seconds: number | null) =>
        formatLeg(locale, meters, seconds),
      date: (iso: string | null) => formatDate(locale, iso),
    }),
    [locale],
  )
}
