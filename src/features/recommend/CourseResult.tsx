import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ExternalLink, Map as MapIcon, Navigation } from 'lucide-react'

import type { Course } from '@/api/schemas'
import { Map, type MapPoint } from '@/components/map/Map'
import { Eyebrow } from '@/components/ui/Chip'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { directionsUrl } from '@/lib/kakaoLinks'
import { useFormat } from '@/lib/useFormat'

/** Mirrors Tailwind's `md:`, the width where the spread splits in two. */
const DESKTOP = '(min-width: 768px)'

// Stable identities so the subscription is not torn down on every render.
const watchDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const isDesktopNow = () => window.matchMedia(DESKTOP).matches

/**
 * The itinerary-beside-map spread. Courses compared by tab when there are
 * several (the recommendation result); the tab strip disappears for a single
 * course (a saved course opened from the list). The sticky footer action is
 * injected — save on the result screen, delete on the saved detail.
 *
 * A phone cannot hold both halves side by side, and the itinerary is what the
 * screen is for, so it takes the whole width and the map becomes an on-demand
 * panel docked under it — opened from the footer bar, where the switch stays
 * within reach however far down the list the reader has scrolled.
 */
export function CourseResult({
  courses,
  footer,
}: {
  courses: Course[]
  footer: (active: Course) => ReactNode
}) {
  const t = useT()
  const format = useFormat()
  const [activeId, setActiveId] = useState(courses[0].id)
  const [focusedPlace, setFocusedPlace] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const isDesktop = useSyncExternalStore(watchDesktop, isDesktopNow)

  const active = courses.find((c) => c.id === activeId) ?? courses[0]

  const points: MapPoint[] = useMemo(
    () =>
      active.places.map((place) => ({
        id: `${active.id}-${place.order}`,
        latitude: place.latitude,
        longitude: place.longitude,
        label: place.name,
        order: place.order,
        imageUrl: place.imageUrl,
      })),
    [active],
  )

  const meta = [
    format.distance(active.totalDistanceMeters),
    active.travelDurationSeconds !== null
      ? t('result.driving', {
          duration: format.duration(active.travelDurationSeconds) ?? '',
        })
      : null,
    active.startTime && active.endTime
      ? t('result.window', { start: active.startTime, end: active.endTime })
      : null,
  ].filter(Boolean) as string[]

  return (
    <div className="flex h-full flex-col md:flex-row">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto md:w-[45%] md:flex-none">
        {courses.length > 1 && (
        <div
          role="tablist"
          aria-label={t('result.reason')}
          // Phone: pinned to the top of the column, so switching courses does
          // not mean scrolling the whole itinerary back up first.
          className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-border bg-background px-screen md:static md:bg-transparent"
        >
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              role="tab"
              id={`course-tab-${course.id}`}
              aria-selected={course.id === activeId}
              aria-controls={`course-panel-${course.id}`}
              onClick={() => {
                setActiveId(course.id)
                setFocusedPlace(null)
              }}
              className={cn(
                'shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-body-sm transition-colors',
                course.id === activeId
                  ? 'border-accent text-text'
                  : 'border-transparent text-text-subtle hover:text-text',
              )}
            >
              {course.title}
            </button>
          ))}
        </div>
        )}

        <div
          {...(courses.length > 1
            ? {
                role: 'tabpanel',
                id: `course-panel-${active.id}`,
                'aria-labelledby': `course-tab-${active.id}`,
              }
            : {})}
          className="flex flex-col gap-6 px-screen py-6 md:gap-8 md:py-8"
        >
          <header className="flex flex-col gap-3">
            <h1 className="font-display text-display-md text-balance">{active.title}</h1>
            <p className="text-body-md text-text-muted">{active.summary}</p>
            <ul className="flex flex-wrap gap-2">
              {meta.map((item) => (
                <li
                  key={item}
                  className="rounded border border-border bg-surface px-2.5 py-1 text-caption tabular-nums text-text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </header>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 md:p-5">
            <Eyebrow>{t('result.reason')}</Eyebrow>
            <p className="text-body-md leading-relaxed text-text-muted">
              {active.reason}
            </p>
          </div>

          <ol className="flex flex-col">
            {active.places.map((place, index) => {
              const pointId = `${active.id}-${place.order}`
              const leg = format.leg(
                place.distanceFromPrevMeters,
                place.durationFromPrevSeconds,
              )
              return (
                <li key={place.order} className="flex flex-col">
                  {leg && index > 0 && (
                    <div className="flex items-center gap-3 py-2 pl-4">
                      <span className="h-6 w-px bg-border" />
                      <span className="text-caption tabular-nums text-text-subtle">
                        {leg}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      // Phone: the links drop under the stop instead of taking
                      // a column of their own — beside the text they left it
                      // about ninety pixels to wrap a name and an address in.
                      'flex flex-col gap-2 rounded-lg border p-3 transition-colors md:flex-row md:items-start md:gap-4',
                      focusedPlace === pointId
                        ? 'border-accent bg-surface'
                        : 'border-transparent hover:bg-surface',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setFocusedPlace(pointId)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left md:gap-4"
                    >
                      <span
                        className={cn(
                          'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-caption tabular-nums',
                          focusedPlace === pointId
                            ? 'border-accent text-primary'
                            : 'border-border text-text-subtle',
                        )}
                      >
                        {place.order}
                      </span>

                      {place.imageUrl && (
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded md:h-16 md:w-16">
                          <img
                            src={place.imageUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          {place.category && (
                            <span className="absolute inset-x-0 bottom-0 bg-background/80 px-1 py-0.5 text-center font-display text-[10px] uppercase tracking-wide text-primary">
                              {place.category}
                            </span>
                          )}
                        </span>
                      )}

                      <span className="flex min-w-0 flex-col gap-1">
                        {/* Wraps rather than pushing: a long stop name has to
                            break under the arrival time, not past the card. */}
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          {place.arrivalTime && (
                            <time className="text-caption tabular-nums text-primary">
                              {place.arrivalTime}
                            </time>
                          )}
                          <span className="text-body-md">{place.name}</span>
                        </span>
                        <span className="text-caption text-text-subtle">
                          {place.address}
                        </span>
                        {place.overview && (
                          <span className="text-caption leading-relaxed text-text-muted">
                            {place.overview}
                          </span>
                        )}
                      </span>
                    </button>

                    {/* Phone: a row indented to the text column (badge + gap),
                        so the links read as part of the stop above them. */}
                    <span className="flex shrink-0 flex-row flex-wrap items-center gap-2 pl-10 md:mt-1 md:flex-col md:flex-nowrap md:items-end md:gap-1 md:pl-0">
                      {/* Leaves the app for Kakao's own directions — no SDK needed. */}
                      <a
                        href={directionsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-caption text-text-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        <Navigation size={12} strokeWidth={1.5} aria-hidden />
                        {t('result.directions')}
                      </a>
                      {place.homepageUrl && (
                        <a
                          href={place.homepageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 text-caption text-primary hover:underline"
                        >
                          {t('result.homepage')}
                          <ExternalLink size={12} strokeWidth={1.5} aria-hidden />
                        </a>
                      )}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

          <p className="text-caption text-text-subtle">{t('result.source')}</p>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-background/85 px-screen py-3 backdrop-blur-md md:block md:py-4">
          <button
            type="button"
            aria-expanded={mapOpen}
            onClick={() => setMapOpen((open) => !open)}
            className="flex items-center justify-center gap-1.5 rounded border border-border py-2 text-body-sm text-text-muted transition-colors hover:border-primary hover:text-primary md:hidden"
          >
            <MapIcon size={16} strokeWidth={1.5} aria-hidden />
            {mapOpen ? t('map.close') : t('locations.toMap')}
          </button>
          {footer(active)}
        </div>
      </section>

      {/* Mounted rather than hidden when the phone panel is shut: the Kakao map
          measures its container once, at creation, so one built inside a
          collapsed panel would come back blank when it opened. */}
      {(isDesktop || mapOpen) && (
        <Map
          points={points}
          selectedId={focusedPlace}
          onSelect={setFocusedPlace}
          showRoute
          className="h-64 shrink-0 border-t border-border md:h-auto md:flex-1 md:border-l md:border-t-0"
        />
      )}
    </div>
  )
}
