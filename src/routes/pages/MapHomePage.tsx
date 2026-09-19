import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useAllLocations, useIdols } from '@/api/queries'
import { Map, type MapPoint } from '@/components/map/Map'
import { SpotCard } from '@/components/ui/cards'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { messageFor } from '@/features/auth/useAuth'
import { IdolSearch } from '@/features/idol/IdolSearch'
import {
  IDOL_PALETTE,
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

/** Mirrors Tailwind's `md:`, the width where the panel becomes a strip. */
const DESKTOP = '(min-width: 768px)'

/**
 * Whether the list starts open.
 *
 * A phone opens on the map alone. The strip costs 40% of a small screen, and
 * this page is a map of the whole country — the first thing to see is where the
 * pins are, not the first two of a hundred and twenty cards. A desktop has room
 * for both at once, so it keeps the list up.
 *
 * Only the starting value. Once anyone touches the handle, that answer stands
 * at every width.
 */
const listOpensByDefault = () =>
  typeof window === 'undefined' || !window.matchMedia
    ? true
    : window.matchMedia(DESKTOP).matches

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
  const [listOpen, setListOpen] = useState(listOpensByDefault)
  const [othersOpen, setOthersOpen] = useState(false)
  const othersToggleRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const scrollerId = useId()

  const idolsQuery = useIdols()
  const locationsQuery = useAllLocations()

  const idols = useMemo(() => idolsQuery.data ?? [], [idolsQuery.data])

  /**
   * The filter, as a set of idol ids.
   *
   * Repeated `?idol=` params rather than one comma-joined value: the browser
   * and `URLSearchParams` both already know how to carry a repeated key, and a
   * separator would have to be chosen, escaped and parsed by hand.
   *
   * Empty means no filter, which is not the same as "nobody" — an empty
   * selection shows every location.
   */
  const selectedIds = useMemo(() => {
    const known = new Set(idols.map((idol) => idol.id))
    return new Set(
      params
        .getAll('idol')
        .map(Number)
        .filter((id) => known.has(id)),
    )
  }, [params, idols])

  const selectedIdols = useMemo(
    () => idols.filter((idol) => selectedIds.has(idol.id)),
    [idols, selectedIds],
  )

  /**
   * The idols that get a colour, and so the rows the legend shows.
   *
   * The five with the most locations, plus any others being filtered on — the
   * latter only reachable from search, and without a colour their pins would
   * be the same grey as the idols nobody asked for.
   *
   * Capped at the palette. Six distinct colours is the whole budget, so beyond
   * that a selected idol keeps grey pins rather than borrowing a colour the
   * legend has already promised to someone else. The search line under the box
   * still names every idol in the filter, so nothing is hidden — only uncoloured.
   */
  const legendIdols = useMemo(() => {
    const featured = featuredIdols(idols)
    const extras = selectedIdols.filter(
      (idol) => !featured.some((f) => f.id === idol.id),
    )
    return [...featured, ...extras].slice(0, IDOL_PALETTE.length)
  }, [idols, selectedIdols])

  const colors = useMemo(() => idolColors(legendIdols), [legendIdols])

  /**
   * Brings the opened drawer into view.
   *
   * The list is capped so the panel never grows, which means the rows that just
   * appeared are below the fold of its own scroller — press it and nothing
   * seems to happen. Putting the row that was pressed at the top of the
   * scroller shows what it opened.
   */
  useEffect(() => {
    if (!othersOpen) return
    othersToggleRef.current?.scrollIntoView({ block: 'start' })
  }, [othersOpen])

  /**
   * Everyone the legend does not name, most-filmed first.
   *
   * Sorted the same way the named five were picked, so opening the drawer
   * continues the order rather than starting a new one.
   */
  const otherIdols = useMemo(() => {
    const named = new Set(legendIdols.map((idol) => idol.id))
    return idols
      .filter((idol) => !named.has(idol.id))
      .toSorted(
        (a, b) =>
          b.locationCount - a.locationCount || a.name.localeCompare(b.name, 'ko'),
      )
  }, [idols, legendIdols])

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
    // Any of the chosen idols, not all of them: a location that appears in one
    // selected idol's video belongs on the map, and almost no place would
    // survive a rule that demanded every one of them.
    const visible =
      selectedIds.size === 0
        ? all
        : all.filter((location) =>
            location.musicVideos.some((mv) => selectedIds.has(mv.idolId)),
          )

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
  }, [locationsQuery.data, selectedIds])

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

  /** Adds an idol to the filter, or takes it back out. */
  const toggleIdol = (id: number) => {
    const next = new Set(selectedIds)
    if (!next.delete(id)) next.add(id)
    setParams(
      // Repeated key, in the catalogue's own order so the URL is stable no
      // matter which order they were tapped in.
      idols
        .filter((idol) => next.has(idol.id))
        .map((idol): [string, string] => ['idol', String(idol.id)]),
      { replace: true },
    )
    setFocusedId(null)
  }

  const clearIdols = () => {
    setParams({}, { replace: true })
    setFocusedId(null)
  }

  return (
    <div className="relative h-full">
      {/* Sized, not positioned: the map component sets `position: relative`
          itself so its pins have a containing block, and Tailwind emits
          `.relative` after `.absolute`, so passing `absolute inset-0` here would
          lose to it and collapse the map to zero height.

          `showUserLocation` is set here and nowhere else: the itinerary and
          detail maps are about one place each, and a second dot on them would
          compete with the place they exist to show. */}
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
          selectedIdols={selectedIdols}
          colors={colors}
          spotCount={locations.length}
          onToggle={toggleIdol}
          onClear={clearIdols}
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
          {/* Capped at about the height the five named idols already take, so
              opening the rest scrolls inside the panel instead of growing it up
              the screen and over the map it is explaining. */}
          <ul className="flex max-h-40 flex-col gap-0.5 overflow-y-auto overscroll-contain">
            {legendIdols.map((idol) => {
              const active = selectedIds.has(idol.id)
              return (
                <li key={idol.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    // Each row is its own switch, so several can be on at once
                    // and pressing a lit one takes just that idol back out.
                    onClick={() => toggleIdol(idol.id)}
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

            {/* Two jobs in one row. It explains the grey pins — without it the
                reader cannot tell a quiet idol from a broken colour — and it
                opens the rest of the catalogue, which is otherwise only
                reachable by typing a name you already have to know. */}
            {otherIdols.length > 0 && (
              <li>
                <button
                  ref={othersToggleRef}
                  type="button"
                  aria-expanded={othersOpen}
                  onClick={() => setOthersOpen((open) => !open)}
                  className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded px-1.5 py-1 text-left text-caption text-text-subtle transition-colors hover:bg-surface-raised hover:text-text"
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: UNFEATURED_PIN_COLOR }}
                  />
                  <span className="flex-1 truncate">{t('home.otherIdols')}</span>
                  <span className="tabular-nums">{otherIdols.length}</span>
                  {othersOpen ? (
                    <ChevronUp size={12} strokeWidth={2} aria-hidden />
                  ) : (
                    <ChevronDown size={12} strokeWidth={2} aria-hidden />
                  )}
                </button>
              </li>
            )}

            {/* The uncoloured rest, filterable all the same. Their dot is the
                grey their pins actually draw in, so the row does not promise a
                colour the map will not keep. */}
            {othersOpen &&
              otherIdols.map((idol) => {
                const active = selectedIds.has(idol.id)
                return (
                  <li key={idol.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleIdol(idol.id)}
                      className={cn(
                        '-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded px-1.5 py-1 text-left text-caption transition-colors hover:bg-surface-raised',
                        active ? 'bg-surface-raised text-primary' : 'text-text-muted',
                      )}
                    >
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: UNFEATURED_PIN_COLOR }}
                      />
                      <span className="flex-1 truncate">{idol.name}</span>
                      <span className="tabular-nums text-text-subtle">
                        {idol.locationCount}
                      </span>
                    </button>
                  </li>
                )
              })}
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
          This is the desktop shape — a tab on the panel's edge. A phone folds
          the same list with the grabber inside the strip, below; the two share
          one `listOpen`, so the list is either open or it is not, whichever way
          you last said so and whichever size the window happens to be.

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
          // The bottom inset lives here, not on the scroller, so it still holds
          // the grabber clear of the home indicator once the cards are folded.
          'bottom-0 left-0 right-0 pb-screen',
          'md:bottom-screen md:left-screen md:right-auto md:top-24 md:w-[380px] md:overflow-hidden md:rounded-lg md:border md:border-border md:bg-background/85 md:backdrop-blur-md md:pb-0',
          // Folded, the phone keeps the grabber and drops the cards; the desktop
          // panel goes entirely, because its tab is outside it.
          !listOpen && 'md:hidden',
        )}
      >
        {/* Phone grabber. Folded, it reports what is behind it — the count is
            the reason to pull the strip back up, so it is the better label. */}
        <button
          type="button"
          onClick={() => setListOpen((open) => !open)}
          aria-expanded={listOpen}
          aria-controls={scrollerId}
          aria-label={t(listOpen ? 'home.collapseList' : 'home.expandList')}
          className="mx-auto mb-2 flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-3.5 py-1.5 text-caption text-text-muted backdrop-blur-md transition-colors hover:text-text md:hidden"
        >
          {listOpen ? (
            <ChevronDown size={14} strokeWidth={2} aria-hidden />
          ) : (
            <ChevronUp size={14} strokeWidth={2} aria-hidden />
          )}
          {listOpen
            ? t('home.collapseList')
            : t('home.spotCount', { count: locations.length })}
        </button>

        <div
          id={scrollerId}
          className={cn(
            // Snapped so a flick lands on a card rather than between two, and
            // contained so the same flick never drags the page behind it.
            'snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-screen px-screen pt-2',
            'md:snap-none md:overflow-x-visible md:overflow-y-auto md:px-4 md:pb-4 md:pt-4',
            !listOpen && 'hidden md:block',
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
