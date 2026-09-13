import { useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useAllLocations, useIdols } from '@/api/queries'
import { Map, type MapPoint } from '@/components/map/Map'
import { SpotCard } from '@/components/ui/cards'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { messageFor } from '@/features/auth/useAuth'
import { IdolSearch } from '@/features/idol/IdolSearch'
import {
  UNFEATURED_PIN_COLOR,
  colorForLocation,
  featuredIdols,
  idolColors,
} from '@/features/idol/colors'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'

/**
 * One card in the phone's bottom strip. Wide enough to read, narrow enough that
 * the next card peeks in and the strip reads as something that scrolls sideways.
 * From `md` up the panel decides the width again, so the cap comes back off.
 */
const STRIP_CARD = 'w-[78vw] max-w-[320px] md:w-full md:max-w-none'

/**
 * A loading, error or empty state standing in for the cards. On a phone the
 * strip has no ground of its own — the cards bring theirs — so anything that
 * replaces them has to carry one or it sits unreadable on the map.
 */
const STRIP_STATE =
  'rounded-lg border border-border bg-background/85 px-4 backdrop-blur-md md:rounded-none md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none'

/**
 * Home. Every filming location in the catalogue is pinned on a map of Korea —
 * browsing the map is how you find where to go. Narrowing to one idol is a
 * search box, not a first choice you must make, and the few idols that carry
 * most of the map get their own pin colour so a mixed map still reads.
 *
 * The filter rides in the query string so back and refresh survive.
 */
export function MapHomePage() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [listOpen, setListOpen] = useState(true)
  const listId = useId()

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

  /**
   * A location carries only `idolId`s, and the cards want the names.
   *
   * A plain object rather than a `Map`: this module imports the map component
   * under that name, so `new Map()` here would reach for the component and not
   * the built-in.
   */
  const idolNameById = useMemo(
    () =>
      Object.fromEntries(idols.map((idol) => [idol.id, idol.name])) as Record<
        number,
        string
      >,
    [idols],
  )

  /** Deduplicated — one place can hold several videos by the same idol. */
  const idolNamesFor = (location: (typeof locations)[number]) =>
    [
      ...new Set(
        location.musicVideos
          .map((mv) => idolNameById[mv.idolId])
          .filter((name): name is string => Boolean(name)),
      ),
    ].join(', ')

  const locations = useMemo(() => {
    const all = locationsQuery.data ?? []
    const visible = selectedIdol
      ? all.filter((location) =>
          location.musicVideos.some((mv) => mv.idolId === selectedIdol.id),
        )
      : all

    /**
     * Photographed places first.
     *
     * Only about a third of the catalogue has a picture yet, and a card without
     * one is a dark rectangle with a name on it — put a run of those at the top
     * and the panel reads as broken rather than unfinished. This does not hide
     * anything: the rest follow, in the order they arrived.
     *
     * Sorting a copy, and only on this flag, keeps the original order inside
     * each group — `toSorted` is stable, so two photographed places stay in the
     * order the API sent them.
     */
    return visible.toSorted(
      (a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)),
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
  }

  return (
    <div className="relative h-full">
      {/* Sized, not positioned: the map component sets `position: relative`
          itself so its pins have a containing block, and Tailwind emits
          `.relative` after `.absolute`, so passing `absolute inset-0` here would
          lose to it and collapse the map to zero height. */}
      {/* Only here. The itinerary and detail maps are about one place each, and
          a second dot on them would compete with the place they exist to show. */}
      <Map
        points={points}
        selectedId={focusedId}
        onSelect={setFocusedId}
        showUserLocation
        className="h-full w-full"
      />

      {/* Search sits top right, clear of the card panel on the left. A phone has
          nothing to keep clear of up there, so it spans the width instead. */}
      <div className="pointer-events-none absolute left-screen right-screen top-screen z-20 flex justify-end md:left-auto">
        <IdolSearch
          idols={idols}
          selectedIdol={selectedIdol}
          colors={colors}
          spotCount={locations.length}
          onSelect={chooseIdol}
        />
      </div>

      {/* Pin colour legend, and the quickest way to filter.
          It stays put while a filter is active: it is how you switch idols or
          get back to all of them without reopening the dropdown.

          Desktop only. A third floating panel is what buries a phone's map, and
          it is the one of the three that duplicates something else: opening the
          search with nothing typed lists the same idols, in the same order,
          behind the same colour dots — so the key survives, only the shortcut
          costs a tap. */}
      {legendIdols.length > 0 && (
        <div className="absolute bottom-screen right-screen z-20 hidden w-52 rounded border border-border bg-background/85 px-3 py-2.5 backdrop-blur-md md:block">
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

      {/* The same cards in the two shapes the screen allows.

          Desktop: a fixed-height panel over the map. The cards must keep their
          natural height and let the panel scroll — as flex children they would
          otherwise be squashed to fit and the scrollbar would never appear.

          Phone: a strip along the bottom edge that scrolls sideways, with no
          panel behind it. A column here would be a full-screen sheet, and the
          map is the page — you have to be able to see where the pins are while
          you read what is at them. */}
      {/* Folds the panel away to see the map under it, and brings it back.
          Desktop only: on a phone the strip already leaves most of the map
          showing, and there is no sideways room to fold into.

          The handle moves with the panel rather than sitting on it, so the
          button that opens the list is in the place the list just left. */}
      <button
        type="button"
        onClick={() => setListOpen((open) => !open)}
        aria-expanded={listOpen}
        aria-controls={listId}
        aria-label={t(listOpen ? 'home.collapseList' : 'home.expandList')}
        className={cn(
          // A tab hanging off the right of whatever is to its left — the panel
          // when open, the window edge when not. A free-floating circle was
          // there first and read as part of the map: 36px of dark on dark, at
          // the one place the eye is not looking.
          'absolute top-1/2 z-20 hidden h-14 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-border bg-surface text-text transition-colors hover:bg-surface-raised hover:text-primary md:flex',
          // 20px margin + the panel's 380px. Flush, so the two read as one piece.
          listOpen ? 'md:left-[400px]' : 'md:left-0',
        )}
      >
        {listOpen ? (
          <PanelLeftClose size={18} strokeWidth={1.5} aria-hidden />
        ) : (
          <PanelLeftOpen size={18} strokeWidth={1.5} aria-hidden />
        )}
      </button>

      <aside
        id={listId}
        // Named because on a phone this is a sideways strip over a map: without
        // a label a screen reader meets a bare run of links with no clue that
        // they are the pins it just described.
        aria-label={t('home.spotList')}
        className={cn(
          'absolute z-10 flex flex-col',
          'bottom-0 left-0 right-0',
          'md:bottom-screen md:left-screen md:right-auto md:top-24 md:w-[380px] md:overflow-hidden md:rounded-lg md:border md:border-border md:bg-background/85 md:backdrop-blur-md',
          // Collapsed only from `md` up — the phone strip is unaffected.
          !listOpen && 'md:hidden',
        )}
      >
        <div
          className={cn(
            // Snapped so a flick lands on a card rather than between two, and
            // contained so the same flick never drags the page behind it.
            'snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-screen px-screen pb-screen pt-2',
            'md:snap-none md:overflow-x-visible md:overflow-y-auto md:px-4 md:pb-4 md:pt-4',
          )}
        >
          {locationsQuery.isPending && (
            <div className="flex gap-3 md:flex-col md:gap-4">
              <Skeleton className={cn(STRIP_CARD, 'h-40 shrink-0 md:h-56')} />
              <Skeleton className={cn(STRIP_CARD, 'h-40 shrink-0 md:h-56')} />
            </div>
          )}

          {locationsQuery.isError && (
            <div className={STRIP_STATE}>
              <ErrorState
                title={t('home.loadFailed')}
                body={messageFor(locationsQuery.error, t('state.genericRetry'))}
                onRetry={() => locationsQuery.refetch()}
              />
            </div>
          )}

          {locationsQuery.isSuccess && locations.length === 0 && (
            <div className={STRIP_STATE}>
              <EmptyState title={t('home.empty')} body={t('home.emptyBody')} />
            </div>
          )}

          <ul className="flex gap-3 md:flex-col md:gap-4">
            {locations.map((location) => (
              <li key={location.id} className={cn(STRIP_CARD, 'shrink-0 snap-start')}>
                <SpotCard
                  location={location}
                  accentColor={colorForLocation(location, colors) ?? UNFEATURED_PIN_COLOR}
                  idolName={idolNamesFor(location)}
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
