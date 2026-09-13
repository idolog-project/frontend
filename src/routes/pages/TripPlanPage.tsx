import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { useLocation as useLocationQuery } from '@/api/queries'
import {
  TRANSPORT,
  TRANSPORT_ORDER,
  TRAVEL_STYLE_ORDER,
  transportKey,
  travelStyleKey,
} from '@/api/constants'
import { Button } from '@/components/ui/Button'
import { Chip, Eyebrow } from '@/components/ui/Chip'
import {
  Disclosure,
  SectionHeader,
  StepIndicator,
  StickyBar,
} from '@/components/ui/layout'
import { Skeleton } from '@/components/ui/states'
import { useT } from '@/features/locale/useT'
import { usePlanParams } from '@/features/plan/usePlanParams'
import { cn } from '@/lib/cn'
import { nextWholeHour } from '@/lib/format'

export function TripPlanPage() {
  const t = useT()
  const { locationId } = useParams()
  const navigate = useNavigate()
  const id = Number(locationId)
  const locationQuery = useLocationQuery(Number.isFinite(id) ? id : undefined)

  const { values, patch, toggleStyle, search } = usePlanParams()
  const [missing, setMissing] = useState<Array<'transport' | 'styles'>>([])

  const submit = () => {
    // The button stays enabled on purpose — pressing it must explain what is
    // still empty rather than silently doing nothing (§5).
    const gaps: Array<'transport' | 'styles'> = []
    if (!values.transportMode) gaps.push('transport')
    if (values.travelStyles.length === 0) gaps.push('styles')
    setMissing(gaps)
    if (gaps.length) return

    navigate(`/locations/${id}/courses?${search}`)
  }

  const missingLabel = missing
    .map((field) =>
      t(field === 'transport' ? 'plan.fieldTransport' : 'plan.fieldStyles'),
    )
    .join(t('plan.missingJoin'))

  const summary = [
    values.transportMode ? t(transportKey(values.transportMode)) : null,
    values.travelStyles.map((s) => t(travelStyleKey(s))).join(', ') || null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-screen py-8 md:gap-10 md:py-12">
      <StepIndicator current={1} total={2} />

      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
        {/* The thumbnail gives up a little width on a phone so the origin line
            still has room to read as one sentence next to it. */}
        {locationQuery.isPending ? (
          <Skeleton className="h-14 w-20 md:h-16 md:w-24" />
        ) : locationQuery.isSuccess ? (
          <>
            {locationQuery.data.imageUrl && (
              <img
                src={locationQuery.data.imageUrl}
                alt=""
                className="h-14 w-20 shrink-0 rounded object-cover md:h-16 md:w-24"
              />
            )}
            {/* `min-w-0` + `break-words`: on a phone a long place name would
                otherwise refuse to shrink and push the card past the viewport. */}
            <div className="flex min-w-0 flex-col gap-1">
              <Eyebrow>{t('plan.origin')}</Eyebrow>
              <p className="break-words text-body-md">
                {t('plan.originLine', { name: locationQuery.data.name })}
              </p>
            </div>
          </>
        ) : (
          <p className="text-body-sm text-text-muted">{t('plan.originFailed')}</p>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader title={t('plan.transportTitle')} />
        {/* Four modes in one row needs the desktop column; on a phone two rows
            of two keeps each card wide enough for the label and the radius. */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TRANSPORT_ORDER.map((mode) => {
            const { radiusKm, icon: Icon } = TRANSPORT[mode]
            const selected = values.transportMode === mode
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  patch({ transportMode: mode })
                  setMissing((m) => m.filter((x) => x !== 'transport'))
                }}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors',
                  selected
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text',
                )}
              >
                <Icon size={22} strokeWidth={1.5} aria-hidden />
                <span className="text-body-sm">{t(transportKey(mode))}</span>
                <span className="text-caption tabular-nums text-text-subtle">
                  {t('plan.radius', { km: radiusKm })}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title={t('plan.stylesTitle')} meta={t('plan.stylesHint')} />
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLE_ORDER.map((style) => (
            <Chip
              key={style}
              selected={values.travelStyles.includes(style)}
              onClick={() => {
                toggleStyle(style)
                setMissing((m) => m.filter((x) => x !== 'styles'))
              }}
            >
              {t(travelStyleKey(style))}
            </Chip>
          ))}
        </div>
      </section>

      <Disclosure summary={t('plan.more')} hint={t('plan.moreHint')}>
        {/* Every control below is sized for a thumb on a phone (44px of height,
            full-width hit areas) and handed back its compact desktop shape at
            `md`. `text-body-md` on the text inputs is also what stops iOS from
            zooming the page in when one of them takes focus. */}
        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-text-subtle">
              {t('plan.startTime')}
            </span>
            <input
              type="time"
              value={values.startTime ?? nextWholeHour()}
              onChange={(e) => patch({ startTime: e.target.value })}
              className="min-h-11 border-b border-border bg-transparent py-2 text-body-md outline-none focus:border-primary md:min-h-0"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-text-subtle">
              {t('plan.hours', { hours: values.availableHours ?? 6 })}
            </span>
            <input
              type="range"
              min={2}
              max={12}
              value={values.availableHours ?? 6}
              onChange={(e) => patch({ availableHours: Number(e.target.value) })}
              // The track is only a few pixels tall; the phone gets hit area
              // around it and the full column to drag along, not a bigger
              // control. `md:` restores the browser's own sizing exactly.
              className="h-11 w-full accent-[#FF5A6E] md:h-auto md:w-auto"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-text-subtle">
              {t('plan.partySize')}
            </span>
            <input
              type="number"
              min={1}
              max={10}
              value={values.partySize ?? 1}
              onChange={(e) => patch({ partySize: Number(e.target.value) })}
              // A 96px field next to a full-width label reads as broken on a
              // phone, and its spinner arrows are hard to hit; it stays narrow
              // only where the field sits in a two-column row.
              className="min-h-11 w-full border-b border-border bg-transparent py-2 text-body-md tabular-nums outline-none focus:border-primary md:min-h-0 md:w-24"
            />
          </label>

          {/* The label is the hit target, so giving the row 44px makes the whole
              line tappable rather than just the 16px box. */}
          <label className="flex min-h-11 items-center gap-3 md:min-h-0 md:self-end md:pb-2">
            <input
              type="checkbox"
              checked={values.withPet}
              onChange={(e) => patch({ withPet: e.target.checked })}
              className="h-5 w-5 shrink-0 accent-[#FF5A6E] md:h-4 md:w-4"
            />
            <span className="text-body-sm">{t('plan.withPet')}</span>
          </label>
        </div>
      </Disclosure>

      <StickyBar>
        <div className="min-w-0 flex-1">
          {missing.length > 0 ? (
            <p role="alert" className="text-body-sm text-danger">
              {t('plan.missing', { fields: missingLabel })}
            </p>
          ) : (
            <span className="text-caption text-text-muted">
              {summary || t('plan.readyHint')}
            </span>
          )}
        </div>
        <Button variant="primary" onClick={submit}>
          {t('plan.submit')}
        </Button>
      </StickyBar>
    </div>
  )
}
