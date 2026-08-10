import { Trash2 } from 'lucide-react'

import { useDeleteCourse, useSavedCourses } from '@/api/queries'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { CourseCard } from '@/components/ui/cards'
import { PageHeader } from '@/components/ui/layout'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states'
import { useToast } from '@/components/ui/toast-context'
import { messageFor } from '@/features/auth/useAuth'
import { useT } from '@/features/locale/useT'

export function SavedCoursesPage() {
  const t = useT()
  const query = useSavedCourses()
  const remove = useDeleteCourse()
  const toast = useToast()

  const courses = query.data ?? []

  return (
    <div className="flex flex-col gap-10 px-screen py-12">
      <PageHeader
        eyebrow={t('saved.eyebrow')}
        title={
          query.isSuccess && courses.length > 0
            ? t('saved.count', { count: courses.length })
            : t('saved.eyebrow')
        }
      />

      {query.isPending && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      )}

      {query.isError && (
        <ErrorState
          title={t('saved.loadFailed')}
          body={messageFor(query.error, t('state.genericRetry'))}
          onRetry={() => query.refetch()}
        />
      )}

      {query.isSuccess && courses.length === 0 && (
        <EmptyState
          title={t('saved.empty')}
          body={t('saved.emptyBody')}
          action={
            <ButtonLink to="/" variant="primary">
              {t('saved.browse')}
            </ButtonLink>
          }
        />
      )}

      {courses.length > 0 && (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {courses.map((course) => (
            <li key={course.id}>
              <CourseCard
                course={course}
                to={`/my/courses/${course.id}`}
                action={
                  <Button
                    variant="text"
                    disabled={remove.isPending}
                    onClick={() =>
                      remove.mutate(course.id, {
                        onSuccess: () => toast.show(t('saved.deleteToast')),
                        onError: (error) =>
                          toast.showError(
                            messageFor(error, t('saved.deleteFailed')),
                          ),
                      })
                    }
                    icon={<Trash2 size={14} strokeWidth={1.5} aria-hidden />}
                  >
                    {t('saved.delete')}
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
