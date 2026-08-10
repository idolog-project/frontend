import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Check, ChevronDown } from 'lucide-react'

import { useAllLocations, useIdols } from '@/api/queries'
import { Map, type MapPoint } from '@/components/map/Map'
import { SpotCard } from '@/components/ui/cards'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { messageFor } from '@/features/auth/useAuth'
import { colorForLocation, idolColors } from '@/features/idol/colors'
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
  const colors = useMemo(() => idolColors(idols), [idols])

  const idolIdParam = params.get('idol')
  const selectedIdol = idols.find((i) => String(i.id) === idolIdParam) ?? null

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
        color: colorForLocation(location, colors),
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
                style={{ background: colors.get(selectedIdol.id) }}
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
                      style={{ background: colors.get(idol.id) }}
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

      {/* Pin colour legend — only useful while every idol is on the map. */}
      {!selectedIdol && idols.length > 0 && (
        <ul className="absolute bottom-screen right-screen z-20 flex flex-col gap-1.5 rounded border border-border bg-background/85 px-3 py-2.5 backdrop-blur-md">
          {idols.map((idol) => (
            <li key={idol.id} className="flex items-center gap-2 text-caption">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colors.get(idol.id) }}
              />
              {idol.name}
            </li>
          ))}
        </ul>
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
                  accentColor={colorForLocation(location, colors)}
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
