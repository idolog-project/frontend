import { useMemo, useState, type ReactNode } from 'react'
import { ExternalLink, Navigation } from 'lucide-react'

import type { Course } from '@/api/schemas'
import { Map, type MapPoint } from '@/components/map/Map'
import { Eyebrow } from '@/components/ui/Chip'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { directionsUrl } from '@/lib/kakaoLinks'
import { useFormat } from '@/lib/useFormat'

/**
 * The itinerary-beside-map spread. Courses compared by tab when there are
 * several (the recommendation result); the tab strip disappears for a single
 * course (a saved course opened from the list). The sticky footer action is
 * injected — save on the result screen, delete on the saved detail.
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
    <div className="flex h-full">
      <section className="flex w-[45%] min-w-0 flex-col overflow-y-auto">
        {courses.length > 1 && (
        <div
          role="tablist"
          aria-label={t('result.reason')}
          className="flex gap-1 overflow-x-auto border-b border-border px-screen"
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
          className="flex flex-col gap-8 px-screen py-8"
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

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5">
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
                      'flex items-start gap-4 rounded-lg border p-3 transition-colors',
                      focusedPlace === pointId
                        ? 'border-accent bg-surface'
                        : 'border-transparent hover:bg-surface',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setFocusedPlace(pointId)}
                      className="flex min-w-0 flex-1 items-start gap-4 text-left"
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
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
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
                        <span className="flex items-baseline gap-2">
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

                    <span className="mt-1 flex shrink-0 flex-col items-end gap-1">
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

        <div className="sticky bottom-0 border-t border-border bg-background/85 px-screen py-4 backdrop-blur-md">
          {footer(active)}
        </div>
      </section>

      <Map
        points={points}
        selectedId={focusedPlace}
        onSelect={setFocusedPlace}
        showRoute
        className="flex-1 border-l border-border"
      />
    </div>
  )
}
