import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Camera } from 'lucide-react'

import type { Course, FilmingLocation } from '@/api/schemas'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { useFormat } from '@/lib/useFormat'

/** Cards are 16px radius and separated by hairlines — never drop shadows. */
export function SpotCard({
  location,
  selected,
  distanceMeters,
  accentColor,
  onFocus,
}: {
  location: FilmingLocation
  selected?: boolean
  distanceMeters?: number | null
  /** Matches the location's pin colour so card and map read as the same thing. */
  accentColor?: string
  onFocus?: () => void
}) {
  const t = useT()
  const format = useFormat()
  const credit = location.musicVideos[0]
  const distance = format.distance(distanceMeters ?? null)

  return (
    <Link
      to={`/locations/${location.id}`}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      style={selected && accentColor ? { borderColor: accentColor } : undefined}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-surface transition-colors',
        selected ? 'border-accent' : 'border-border hover:border-border-strong',
      )}
    >
      {accentColor && (
        <span
          aria-hidden
          className="h-0.5 w-full shrink-0"
          style={{ background: accentColor }}
        />
      )}
      <div className="relative h-32 shrink-0">
        {/* alt="" — the name is the heading directly below, so a description
            here would just announce it twice. */}
        {location.imageUrl && (
          <img src={location.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        {distance && (
          <span className="absolute right-3 top-3 rounded border border-border bg-background/80 px-2 py-1 font-display text-label-caps text-text backdrop-blur-sm">
            {distance}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-display text-body-md font-semibold leading-tight">
          {location.name}
        </h3>
        {credit && (
          <p className="text-caption text-text-muted">
            {location.musicVideos.map((v) => v.title).join(', ')}
          </p>
        )}
        <span className="mt-1 inline-flex w-max items-center gap-1 rounded-full border border-live/30 bg-live/10 px-2 py-1 font-display text-label-caps uppercase text-live">
          <Camera size={12} strokeWidth={1.5} aria-hidden />
          {t('detail.recreateBadge')}
        </span>
      </div>
    </Link>
  )
}

export function CourseCard({
  course,
  to,
  action,
}: {
  course: Course
  /** Where the card body navigates. The `action` stays a separate control —
   *  nesting it inside a link would be invalid and unclickable. */
  to?: string
  action?: ReactNode
}) {
  const t = useT()
  const format = useFormat()
  const first = course.places[0]

  const media = (
    <>
      {first?.imageUrl && (
        <img
          src={first.imageUrl}
          alt={t('saved.firstStopAlt', { name: first.name })}
          className="h-full w-full object-cover"
        />
      )}
    </>
  )

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent">
      {to ? (
        <Link
          to={to}
          aria-label={course.title}
          className="h-40 shrink-0 bg-surface-raised"
        >
          {media}
        </Link>
      ) : (
        <div className="h-40 shrink-0 bg-surface-raised">{media}</div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-title-md leading-tight">
            {to ? (
              <Link to={to} className="transition-colors hover:text-primary">
                {course.title}
              </Link>
            ) : (
              course.title
            )}
          </h3>
          <p className="text-caption tabular-nums text-text-muted">
            {t('result.total', {
              duration: format.duration(course.totalDurationSeconds) ?? '',
              distance: format.distance(course.totalDistanceMeters) ?? '',
            })}
          </p>
        </div>

        <ul className="flex -space-x-2">
          {course.places.slice(0, 3).map((place) => (
            <li
              key={place.order}
              className="h-8 w-8 overflow-hidden rounded-full border border-border bg-surface-raised"
            >
              {place.imageUrl && (
                <img src={place.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </li>
          ))}
          {course.places.length > 3 && (
            <li className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-caption tabular-nums text-text-subtle">
              +{course.places.length - 3}
            </li>
          )}
        </ul>

        {action && <div className="mt-auto flex justify-end pt-2">{action}</div>}
      </div>
    </article>
  )
}
