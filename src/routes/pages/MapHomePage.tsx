import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Check, ChevronDown } from 'lucide-react'

import { useAllLocations, useIdols } from '@/api/queries'
import { Map, type MapPoint } from '@/components/map/Map'
import { SpotCard } from '@/components/ui/cards'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { messageFor } from '@/features/auth/useAuth'
import {
  UNFEATURED_PIN_COLOR,
  colorForLocation,
  featuredIdols,
  idolColors,
} from '@/features/idol/colors'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'

/**
 * Home. Every filming location in the catalogue is pinned on a map of Korea —
 * browsing the map is how you find where to go. The idol chip narrows the pins
 * rather than being the thing you must choose first, and each idol has its own
 * pin colour so a mixed map still reads.
 *
 * The filter rides in the query string so back and refresh survive.
 */
export function MapHomePage() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [biasOpen, setBiasOpen] = useState(false)

  const idolsQuery = useIdols()
  const locationsQuery = useAllLocations()

  const idols = useMemo(() => idolsQuery.data ?? [], [idolsQuery.data])

  const idolIdParam = params.get('idol')
  const selectedIdol = idols.find((i) => String(i.id) === idolIdParam) ?? null

  /**
   * The idols that get a colour, and so the rows the legend shows.
   *
   * Normally the five with the most locations. Filtering to an idol outside
   * that five — only reachable from the full dropdown — appends them, so the
   * map never goes entirely grey and the legend still explains every pin.
   */
  const legendIdols = useMemo(() => {
    const featured = featuredIdols(idols)
    if (selectedIdol && !featured.some((i) => i.id === selectedIdol.id)) {
      return [...featured, selectedIdol]
    }
    return featured
  }, [idols, selectedIdol])

  const colors = useMemo(() => idolColors(legendIdols), [legendIdols])

  const locations = useMemo(() => {
    const all = locationsQuery.data ?? []
    if (!selectedIdol) return all
    return all.filter((location) =>
      location.musicVideos.some((mv) => mv.idolId === selectedIdol.id),
    )
  }, [locationsQuery.data, selectedIdol])

  const points: MapPoint[] = useMemo(
    () =>
      locations.map((location) => ({
        id: String(location.id),
        latitude: location.latitude,
        longitude: location.longitude,
        label: location.name,
        color: colorForLocation(location, colors) ?? UNFEATURED_PIN_COLOR,
        imageUrl: location.imageUrl,
        caption: location.musicVideos.map((mv) => mv.title).join(', '),
        detailPath: `/locations/${location.id}`,
      })),
    [locations, colors],
  )

  const chooseIdol = (id: number | null) => {
    setParams(id === null ? {} : { idol: String(id) }, { replace: true })
    setFocusedId(null)
    setBiasOpen(false)
  }

  return (
    <div className="relative h-full">
      {/* Sized, not positioned: the map component sets `position: relative`
          itself so its pins have a containing block, and Tailwind emits
          `.relative` after `.absolute`, so passing `absolute inset-0` here would
          lose to it and collapse the map to zero height. */}
      <Map
        points={points}
        selectedId={focusedId}
        onSelect={setFocusedId}
        className="h-full w-full"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-screen">
        <div className="pointer-events-auto relative w-max">
          <button
            type="button"
            aria-expanded={biasOpen}
            onClick={() => setBiasOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 backdrop-blur-md transition-colors hover:border-border-strong"
          >
            {selectedIdol ? (
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: colors.get(selectedIdol.id) ?? UNFEATURED_PIN_COLOR,
                }}
              />
            ) : null}
            <span className="font-display text-label-caps uppercase">
              {selectedIdol?.name ?? t('home.filterAll')}
            </span>
            <span className="text-caption tabular-nums text-text-subtle">
              {t('home.spotCount', { count: locations.length })}
            </span>
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden />
          </button>

          {biasOpen && (
            <ul className="absolute left-0 top-full z-30 mt-2 w-60 overflow-hidden rounded border border-border bg-surface">
              <li>
                <button
                  type="button"
                  onClick={() => chooseIdol(null)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left text-body-sm transition-colors hover:bg-surface-raised',
                    !selectedIdol && 'text-primary',
                  )}
                >
                  {t('home.filterAll')}
                  {!selectedIdol && <Check size={14} strokeWidth={2} aria-hidden />}
                </button>
              </li>
              {idols.map((idol) => (
                <li key={idol.id}>
                  <button
                    type="button"
                    onClick={() => chooseIdol(idol.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left text-body-sm transition-colors hover:bg-surface-raised',
                      idol.id === selectedIdol?.id && 'text-primary',
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: colors.get(idol.id) ?? UNFEATURED_PIN_COLOR }}
                    />
                    <span className="flex-1 truncate">{idol.name}</span>
                    <span className="text-caption tabular-nums text-text-subtle">
                      {t('home.spotCount', { count: idol.locationCount })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pin colour legend, and the quickest way to filter.
          It stays put while a filter is active: it is how you switch idols or
          get back to all of them without reopening the dropdown. */}
      {legendIdols.length > 0 && (
        <div className="absolute bottom-screen right-screen z-20 w-52 rounded border border-border bg-background/85 px-3 py-2.5 backdrop-blur-md">
          <p className="mb-2 font-display text-label-caps uppercase text-text-subtle">
            {t('home.popularIdols')}
          </p>
          <ul className="flex flex-col gap-0.5">
            {legendIdols.map((idol) => {
              const active = idol.id === selectedIdol?.id
              return (
                <li key={idol.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    // Pressing the active row clears the filter, so the legend
                    // alone can take you back to the whole map.
                    onClick={() => chooseIdol(active ? null : idol.id)}
                    className={cn(
                      '-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded px-1.5 py-1 text-left text-caption transition-colors hover:bg-surface-raised',
                      active && 'bg-surface-raised text-primary',
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: colors.get(idol.id) }}
                    />
                    <span className="flex-1 truncate">{idol.name}</span>
                    <span className="tabular-nums text-text-subtle">
                      {idol.locationCount}
                    </span>
                  </button>
                </li>
              )
            })}

            {/* Without this the grey pins are unexplained — the reader cannot
                tell a quiet idol from a broken colour. */}
            {!selectedIdol && idols.length > legendIdols.length && (
              <li className="flex items-center gap-2 px-1.5 py-1 text-caption text-text-subtle">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: UNFEATURED_PIN_COLOR }}
                />
                <span className="flex-1 truncate">{t('home.otherIdols')}</span>
                <span className="tabular-nums">
                  {idols.length - legendIdols.length}
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Fixed-height panel over the map. The cards must keep their natural
          height and let the panel scroll — as flex children they would otherwise
          be squashed to fit and the scrollbar would never appear. */}
      <aside className="absolute bottom-screen left-screen top-24 z-10 flex w-[380px] flex-col overflow-hidden rounded-lg border border-border bg-background/85 backdrop-blur-md">
        <div className="overflow-y-auto p-4">
          {locationsQuery.isPending && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-56 w-full shrink-0" />
              <Skeleton className="h-56 w-full shrink-0" />
            </div>
          )}

          {locationsQuery.isError && (
            <ErrorState
              title={t('home.loadFailed')}
              body={messageFor(locationsQuery.error, t('state.genericRetry'))}
              onRetry={() => locationsQuery.refetch()}
            />
          )}

          {locationsQuery.isSuccess && locations.length === 0 && (
            <EmptyState title={t('home.empty')} body={t('home.emptyBody')} />
          )}

          <ul className="flex flex-col gap-4">
            {locations.map((location) => (
              <li key={location.id} className="shrink-0">
                <SpotCard
                  location={location}
                  accentColor={colorForLocation(location, colors) ?? UNFEATURED_PIN_COLOR}
                  selected={focusedId === String(location.id)}
                  onFocus={() => setFocusedId(String(location.id))}
                />
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
