import { useRef, useState } from 'react'
import { Star } from 'lucide-react'

import { SectionHeader } from '@/components/ui/layout'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/toast-context'
import { useT } from '@/features/locale/useT'
import { REVIEW_SEED } from '@/mocks/reviews'
import { cn } from '@/lib/cn'
import { useFormat } from '@/lib/useFormat'

const STARS = [1, 2, 3, 4, 5] as const

/**
 * Reviews of a filming location: what people found when they got there.
 *
 * UI only. There is no reviews endpoint yet, so the list is seeded development
 * content and the form posts nowhere — the first press of 등록하기 says so
 * rather than pretending it worked, because a form that silently swallows what
 * someone wrote is worse than one that admits it is not connected.
 *
 * The seam for whoever wires it: replace `REVIEW_SEED` with the query, and
 * `onSubmit` with the mutation. Nothing else here needs to change.
 */
export function ReviewSection({ locationId }: { locationId: number }) {
  const t = useT()
  const format = useFormat()
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')

  const reviews = REVIEW_SEED[locationId] ?? []
  const ready = rating > 0 && body.trim().length > 0

  /**
   * Says the form is not connected, once.
   *
   * Repeating it on every press turns a piece of information into nagging — the
   * reader was told, and telling them again says nothing new. A ref rather than
   * state because nothing on screen depends on it.
   */
  const notified = useRef(false)
  const notifyOnce = () => {
    if (notified.current) return
    notified.current = true
    toast.show(t('review.notWired'))
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title={t('review.title')}
        meta={reviews.length > 0 ? t('review.count', { count: reviews.length }) : undefined}
        rule
      />

      {/* The form comes before the list: this screen asks you to add to it, and
          burying the ask under other people's notes is how it goes unused. */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">{t('review.rating')}</legend>
          {STARS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              aria-label={t('review.ratingValue', { n: value })}
              className="rounded p-0.5 text-text-subtle transition-colors hover:text-primary"
            >
              <Star
                size={22}
                strokeWidth={1.5}
                aria-hidden
                // Filled up to the chosen value, so the row reads as a score
                // rather than five separate switches.
                className={cn(value <= rating && 'fill-primary text-primary')}
              />
            </button>
          ))}
        </fieldset>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder={t('review.placeholder')}
          // 16px on a phone, like every other input here: iOS zooms the page in
          // on anything smaller and does not zoom back out.
          className="w-full resize-y rounded border border-border bg-background px-3 py-2 text-body-md text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary md:text-body-sm"
        />

        <div className="flex justify-end">
          <Button disabled={!ready} onClick={notifyOnce}>
            {t('review.submit')}
          </Button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-body-sm text-text-subtle">{t('review.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-body-sm font-semibold">
                  {review.nickname}
                </span>
                <span
                  className="flex items-center gap-0.5"
                  aria-label={t('review.ratingValue', { n: review.rating })}
                >
                  {STARS.map((value) => (
                    <Star
                      key={value}
                      size={13}
                      strokeWidth={1.5}
                      aria-hidden
                      className={cn(
                        value <= review.rating
                          ? 'fill-primary text-primary'
                          : 'text-text-subtle',
                      )}
                    />
                  ))}
                </span>
                <span className="text-caption text-text-subtle">
                  {format.date(review.writtenOn)}
                </span>
              </div>
              <p className="text-body-sm leading-relaxed text-text-muted">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
