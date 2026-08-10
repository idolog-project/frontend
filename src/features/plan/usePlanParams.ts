import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'

import {
  transportModeSchema,
  travelStyleSchema,
  type TransportMode,
  type TravelStyle,
} from '@/api/schemas'

export type PlanValues = {
  transportMode: TransportMode | null
  travelStyles: TravelStyle[]
  startTime: string | null
  availableHours: number | null
  withPet: boolean
  partySize: number | null
}

/**
 * The whole form lives in the query string, so back and refresh keep the answers
 * and the resulting course page can be linked to directly (§5).
 */
export function usePlanParams() {
  const [params, setParams] = useSearchParams()

  const values = useMemo<PlanValues>(() => {
    const transport = transportModeSchema.safeParse(params.get('transport'))
    const styles = (params.get('styles') ?? '')
      .split(',')
      .map((s) => travelStyleSchema.safeParse(s))
      .flatMap((r) => (r.success ? [r.data] : []))

    const hours = Number(params.get('hours'))
    const party = Number(params.get('party'))

    return {
      transportMode: transport.success ? transport.data : null,
      travelStyles: styles,
      startTime: params.get('start'),
      availableHours: Number.isFinite(hours) && hours > 0 ? hours : null,
      withPet: params.get('pet') === '1',
      partySize: Number.isFinite(party) && party > 0 ? party : null,
    }
  }, [params])

  const patch = useCallback(
    (next: Partial<PlanValues>) => {
      const merged = { ...values, ...next }
      const search = new URLSearchParams()
      if (merged.transportMode) search.set('transport', merged.transportMode)
      if (merged.travelStyles.length) search.set('styles', merged.travelStyles.join(','))
      if (merged.startTime) search.set('start', merged.startTime)
      if (merged.availableHours) search.set('hours', String(merged.availableHours))
      if (merged.withPet) search.set('pet', '1')
      if (merged.partySize) search.set('party', String(merged.partySize))
      setParams(search, { replace: true })
    },
    [values, setParams],
  )

  const toggleStyle = useCallback(
    (style: TravelStyle) =>
      patch({
        travelStyles: values.travelStyles.includes(style)
          ? values.travelStyles.filter((s) => s !== style)
          : [...values.travelStyles, style],
      }),
    [values.travelStyles, patch],
  )

  return { values, patch, toggleStyle, search: params.toString() }
}
