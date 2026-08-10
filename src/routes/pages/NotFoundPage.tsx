import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/states'
import { useT } from '@/features/locale/useT'

export function NotFoundPage() {
  const t = useT()

  return (
    <div className="px-screen">
      <EmptyState
        title={t('notFound.title')}
        body={t('notFound.body')}
        action={
          <ButtonLink to="/" variant="primary">
            {t('locations.toMap')}
          </ButtonLink>
        }
      />
    </div>
  )
}
