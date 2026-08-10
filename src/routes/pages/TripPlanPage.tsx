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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-screen py-12">
      <StepIndicator current={1} total={2} />

      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
        {locationQuery.isPending ? (
          <Skeleton className="h-16 w-24" />
        ) : locationQuery.isSuccess ? (
          <>
            {locationQuery.data.imageUrl && (
              <img
                src={locationQuery.data.imageUrl}
                alt=""
                className="h-16 w-24 shrink-0 rounded object-cover"
              />
            )}
            <div className="flex flex-col gap-1">
              <Eyebrow>{t('plan.origin')}</Eyebrow>
              <p className="text-body-md">
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-text-subtle">
              {t('plan.startTime')}
            </span>
            <input
              type="time"
              value={values.startTime ?? nextWholeHour()}
              onChange={(e) => patch({ startTime: e.target.value })}
              className="border-b border-border bg-transparent py-2 text-body-md outline-none focus:border-primary"
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
              className="accent-[#FF5A6E]"
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
              className="w-24 border-b border-border bg-transparent py-2 text-body-md tabular-nums outline-none focus:border-primary"
            />
          </label>

          <label className="flex items-center gap-3 self-end pb-2">
            <input
              type="checkbox"
              checked={values.withPet}
              onChange={(e) => patch({ withPet: e.target.checked })}
              className="h-4 w-4 accent-[#FF5A6E]"
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
