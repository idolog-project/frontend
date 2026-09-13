import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'

import { useDeleteCourse, useSavedCourses } from '@/api/queries'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { useToast } from '@/components/ui/toast-context'
import { messageFor } from '@/features/auth/useAuth'
import { useT } from '@/features/locale/useT'
import { CourseResult } from '@/features/recommend/CourseResult'

/**
 * A saved course opened from the list — the same itinerary-beside-map spread as
 * the recommendation result (stacked, with the map on demand, on a phone), with
 * delete in place of save.
 */
export function SavedCourseDetailPage() {
  const t = useT()
  const { courseId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const query = useSavedCourses()
  const remove = useDeleteCourse()

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4 px-screen py-8 md:py-12">
        <Skeleton className="h-8 w-full max-w-48" />
        <Skeleton className="h-64 w-full md:h-96" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="px-screen">
        <ErrorState
          title={t('saved.loadFailed')}
          body={messageFor(query.error, t('state.genericRetry'))}
          onRetry={() => query.refetch()}
        />
      </div>
    )
  }

  const course = query.data.find((c) => c.id === courseId)

  if (!course) {
    return (
      <div className="px-screen">
        <EmptyState
          title={t('notFound.title')}
          body={t('saved.emptyBody')}
          action={
            <ButtonLink to="/my/courses" variant="primary">
              {t('saved.eyebrow')}
            </ButtonLink>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-screen py-3">
        <ButtonLink
          to="/my/courses"
          variant="text"
          icon={<ArrowLeft size={16} strokeWidth={1.5} aria-hidden />}
        >
          {t('saved.eyebrow')}
        </ButtonLink>
      </div>

      <div className="min-h-0 flex-1">
        <CourseResult
          courses={[course]}
          footer={(active) => (
            <Button
              variant="ghost"
              fullWidth
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(active.id, {
                  onSuccess: () => {
                    toast.show(t('saved.deleteToast'))
                    navigate('/my/courses', { replace: true })
                  },
                  onError: (error) =>
                    toast.showError(messageFor(error, t('saved.deleteFailed'))),
                })
              }
              icon={<Trash2 size={16} strokeWidth={1.5} aria-hidden />}
            >
              {t('saved.delete')}
            </Button>
          )}
        />
      </div>
    </div>
  )
}
