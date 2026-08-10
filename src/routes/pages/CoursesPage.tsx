import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BookmarkCheck, BookmarkPlus } from 'lucide-react'

import { useRecommendations, useSaveCourse, useSavedCourses } from '@/api/queries'
import { TRANSPORT, travelStyleKey } from '@/api/constants'
import type { RecommendationRequest } from '@/api/schemas'
import { Button } from '@/components/ui/Button'
import { ErrorState, NoResults } from '@/components/ui/states'
import { useToast } from '@/components/ui/toast-context'
import { messageFor } from '@/features/auth/useAuth'
import { useT } from '@/features/locale/useT'
import { usePlanParams } from '@/features/plan/usePlanParams'
import { CourseResult } from '@/features/recommend/CourseResult'
import { RecommendWaiting } from '@/features/recommend/RecommendWaiting'

export function CoursesPage() {
  const t = useT()
  const { locationId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const id = Number(locationId)

  const { values, search } = usePlanParams()
  const savedCourses = useSavedCourses()
  const saveCourse = useSaveCourse(id)

  const backToPlan = () => navigate(`/locations/${id}/plan?${search}`)

  // The request body doubles as the cache key, so the query fires itself the
  // moment the conditions are complete — no effect, no ref guard.
  const body = useMemo<RecommendationRequest | null>(() => {
    if (!values.transportMode || values.travelStyles.length === 0) return null
    return {
      locationId: id,
      transportMode: values.transportMode,
      travelStyles: values.travelStyles,
      ...(values.startTime ? { startTime: values.startTime } : {}),
      ...(values.availableHours ? { availableHours: values.availableHours } : {}),
      ...(values.withPet ? { withPet: true } : {}),
      ...(values.partySize ? { partySize: values.partySize } : {}),
    }
  }, [id, values])

  const recommend = useRecommendations(body)

  // Arriving without the required answers means the URL was hand-edited or the
  // conditions were cleared — send them back to fill them in.
  useEffect(() => {
    if (body === null) navigate(`/locations/${id}/plan?${search}`, { replace: true })
  }, [body, id, search, navigate])

  if (body === null || recommend.isPending) {
    return <RecommendWaiting onCancel={backToPlan} />
  }

  if (recommend.isError) {
    return (
      <div className="px-screen">
        <ErrorState
          title={t('courses.failedTitle')}
          body={messageFor(recommend.error, t('courses.failedBody'))}
          onRetry={() => recommend.refetch()}
          retryLabel={t('courses.retrySame')}
          secondaryAction={
            <Button variant="ghost" onClick={backToPlan}>
              {t('courses.changeConditions')}
            </Button>
          }
        />
      </div>
    )
  }

  const courses = recommend.data ?? []

  if (courses.length === 0) {
    // Name the conditions that are actually narrowing the search, so the
    // suggestion is concrete rather than "try different options".
    const radius = TRANSPORT[body.transportMode].radiusKm
    const styleNames = body.travelStyles.map((s) => t(travelStyleKey(s))).join(', ')

    const reasons = [
      radius === 3 ? t('courses.noneWalk') : null,
      body.travelStyles.length <= 2
        ? t('courses.noneStyles', { styles: styleNames })
        : null,
      body.availableHours !== undefined && body.availableHours <= 3
        ? t('courses.noneHours', { hours: body.availableHours })
        : null,
    ].filter(Boolean) as string[]

    return (
      <div className="px-screen">
        <NoResults
          title={t('courses.noneTitle')}
          body={
            <span className="flex flex-col gap-2">
              {reasons.map((reason) => (
                <span key={reason}>{reason}</span>
              ))}
            </span>
          }
          action={
            <Button variant="primary" onClick={backToPlan}>
              {t('courses.changeConditions')}
            </Button>
          }
        />
      </div>
    )
  }

  const savedIds = (savedCourses.data ?? []).map((c) => c.id)

  return (
    <CourseResult
      courses={courses}
      footer={(active) => {
        const saved = savedIds.includes(active.id)
        return (
          <Button
            variant={saved ? 'outline' : 'primary'}
            fullWidth
            disabled={saved || saveCourse.isPending}
            onClick={() =>
              saveCourse.mutate(active, {
                onSuccess: () => toast.show(t('result.saveToast')),
                onError: (error) =>
                  toast.showError(messageFor(error, t('result.saveFailed'))),
              })
            }
            icon={
              saved ? (
                <BookmarkCheck size={18} strokeWidth={1.5} aria-hidden />
              ) : (
                <BookmarkPlus size={18} strokeWidth={1.5} aria-hidden />
              )
            }
          >
            {saved
              ? t('result.saved')
              : saveCourse.isPending
                ? t('result.saving')
                : t('result.save')}
          </Button>
        )
      }}
    />
  )
}
