import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Bus, Camera, MapPin, Sunrise } from 'lucide-react'

import { useLocation as useLocationQuery } from '@/api/queries'
import { Map } from '@/components/map/Map'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Eyebrow, InfoChip } from '@/components/ui/Chip'
import { SectionHeader } from '@/components/ui/layout'
import { GalleryStrip, Hero, ViewfinderFrame } from '@/components/ui/media'
import { ErrorState, Skeleton } from '@/components/ui/states'
import { messageFor } from '@/features/auth/useAuth'
import { useT } from '@/features/locale/useT'
import { useFormat } from '@/lib/useFormat'
import { SCENE } from '@/mocks/images'

/**
 * The one screen the draft covered end to end. "재현 가이드" and the gallery were
 * kept by decision; the draft's share and save-photo-spot actions were dropped
 * as out of scope.
 */
export function LocationDetailPage() {
  const t = useT()
  const format = useFormat()
  const { locationId } = useParams()
  const navigate = useNavigate()
  const id = Number(locationId)
  const query = useLocationQuery(Number.isFinite(id) ? id : undefined)

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[420px] w-full" />
        <div className="flex flex-col gap-4 px-screen">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="px-screen">
        <ErrorState
          title={t('detail.loadFailed')}
          body={messageFor(query.error, t('state.genericRetry'))}
          onRetry={() => query.refetch()}
          secondaryAction={
            <Button variant="ghost" onClick={() => navigate('/')}>
              {t('locations.toMap')}
            </Button>
          }
        />
      </div>
    )
  }

  const location = query.data
  const credit = location.musicVideos[0]
  const releasedOn = format.date(credit?.releaseDate ?? null)

  return (
    <article className="flex flex-col pb-16">
      <Hero
        imageUrl={location.imageUrl}
        alt={t('detail.heroAlt', { name: location.name })}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('detail.back')}
          className="absolute left-screen top-screen z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-primary backdrop-blur-sm transition-colors hover:border-border-strong"
        >
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
        </button>
        <ViewfinderFrame label={t('detail.recreateBadge')} />
      </Hero>

      <div className="-mt-12 grid grid-cols-1 gap-12 px-screen lg:grid-cols-[3fr_2fr]">
        <div className="relative z-10 flex flex-col gap-10">
          <header className="flex flex-col gap-4">
            <Eyebrow>{t('detail.eyebrow')}</Eyebrow>
            <h1 className="font-display text-display-lg text-balance">
              {location.name}
            </h1>
            {credit && (
              <p className="text-body-md text-text-muted">
                <span className="text-text">
                  {location.musicVideos.map((v) => v.title).join(', ')}
                </span>
                {releasedOn && ` · ${releasedOn}`}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <InfoChip icon={<MapPin size={16} strokeWidth={1.5} aria-hidden />}>
                {location.address.split(' ').slice(0, 2).join(' ')}
              </InfoChip>
              <InfoChip icon={<Bus size={16} strokeWidth={1.5} aria-hidden />}>
                {t('detail.transport')}
              </InfoChip>
              <InfoChip icon={<Sunrise size={16} strokeWidth={1.5} aria-hidden />}>
                {t('detail.bestLight')}
              </InfoChip>
            </div>
          </header>

          {location.description && (
            <section className="flex flex-col gap-3">
              <SectionHeader title={t('detail.scene')} rule />
              <p className="max-w-prose text-body-md leading-relaxed text-text-muted">
                {location.description}
              </p>
            </section>
          )}

          {/* ASSUMPTION: the backend has no shot-guide field yet, so this copy is
              generic rather than per-location. */}
          <section className="relative overflow-hidden rounded-lg border border-border bg-surface p-6">
            <Camera
              size={96}
              strokeWidth={1}
              aria-hidden
              className="absolute -right-4 -top-4 text-text opacity-5"
            />
            <h2 className="font-display text-title-md text-primary">
              {t('detail.guide')}
            </h2>
            <p className="mt-3 max-w-prose text-body-md text-text-muted">
              {t('detail.guideBody')}
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title={t('detail.gallery')}
              meta={t('detail.gallerySwipe')}
            />
            {/* ASSUMPTION: no gallery field on the API yet — seeded for now.
                alt="" until the API carries a description per image; an index
                like "photo 2" is noise to a screen reader, not information. */}
            <GalleryStrip images={SCENE.gallery.map((url) => ({ url, alt: '' }))} />
          </section>
        </div>

        <aside className="relative z-10 flex flex-col gap-4 lg:sticky lg:top-12 lg:self-start">
          <Map
            points={[
              {
                id: String(location.id),
                latitude: location.latitude,
                longitude: location.longitude,
                label: location.name,
                imageUrl: location.imageUrl,
              },
            ]}
            selectedId={String(location.id)}
            className="h-64 rounded-lg border border-border"
          />
          <p className="text-body-sm text-text-muted">{location.address}</p>
          <ButtonLink
            to={`/locations/${location.id}/plan`}
            variant="primary"
            fullWidth
          >
            {t('detail.cta')}
          </ButtonLink>
        </aside>
      </div>
    </article>
  )
}
