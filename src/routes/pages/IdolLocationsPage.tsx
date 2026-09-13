import { useParams } from 'react-router'

import { useIdolLocations, useIdols } from '@/api/queries'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { SpotCard } from '@/components/ui/cards'
import { PageHeader } from '@/components/ui/layout'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { messageFor } from '@/features/auth/useAuth'
import { useT } from '@/features/locale/useT'

/**
 * Card grid, shared by the skeleton so the placeholders land where the cards will.
 *
 * `auto-fill` already collapses to one column on a phone — 280px is the widest
 * track, and 375px less the screen margins still clears it — so this needs no
 * breakpoint of its own.
 */
const CARD_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6'

/** All filming locations for one idol, as a grid. */
export function IdolLocationsPage() {
  const t = useT()
  const { idolId } = useParams()
  const id = Number(idolId)

  const idolsQuery = useIdols()
  const idol = idolsQuery.data?.find((i) => i.id === id)
  const locationsQuery = useIdolLocations(Number.isFinite(id) ? id : undefined)
  const locations = locationsQuery.data ?? []

  // Tighter top padding on a phone: the page opens straight onto its own title
  // there, with no sidebar beside it to balance the desktop's 48px of air.
  return (
    <div className="flex flex-col gap-10 px-screen py-8 md:py-12">
      <PageHeader
        eyebrow={t('locations.eyebrow')}
        title={
          idol
            ? t('locations.title', { name: idol.name })
            : t('locations.titleFallback')
        }
      >
        {idol?.agency && <p className="text-body-md text-text-muted">{idol.agency}</p>}
      </PageHeader>

      {locationsQuery.isPending && (
        <div className={CARD_GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
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
        <EmptyState
          title={t('locations.empty')}
          body={t('locations.emptyBody')}
          action={
            <ButtonLink to="/" variant="outline">
              {t('locations.toMap')}
            </ButtonLink>
          }
        />
      )}

      {locations.length > 0 && (
        <ul className={CARD_GRID}>
          {locations.map((location) => (
            <li key={location.id}>
              <SpotCard location={location} idolName={idol?.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
