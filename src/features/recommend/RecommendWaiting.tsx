import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

import { RECOMMEND_STEPS, RECOMMEND_STEP_MS } from '@/api/constants'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Chip'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'
import { SCENE } from '@/mocks/images'

/**
 * The wait is 10-30 seconds, so this screen has to hold attention rather than
 * spin. Steps advance on a timer because the backend streams no progress
 * (ASSUMPTION); the last step holds until the response actually lands, so the
 * list never claims to be finished before it is.
 */
export function RecommendWaiting({ onCancel }: { onCancel: () => void }) {
  const t = useT()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= RECOMMEND_STEPS.length - 1) return
    const timer = window.setTimeout(() => setStep((s) => s + 1), RECOMMEND_STEP_MS)
    return () => window.clearTimeout(timer)
  }, [step])

  return (
    <div className="relative flex h-full items-center overflow-hidden">
      <img
        src={SCENE.waitingBackdrop}
        alt=""
        aria-hidden
        className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />

      <div className="relative z-10 flex max-w-xl flex-col gap-8 px-16">
        <div className="flex flex-col gap-3">
          <Eyebrow>{t('wait.eyebrow')}</Eyebrow>
          <h1 className="font-display text-display-lg text-balance">
            {t(RECOMMEND_STEPS[step].label)}
          </h1>
        </div>

        <ol className="flex flex-col">
          {RECOMMEND_STEPS.map((item, index) => {
            const done = index < step
            const active = index === step
            return (
              <li
                key={item.label}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative flex items-start gap-3 border-b border-border py-4',
                  !done && !active && 'opacity-40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                    done && 'border-accent bg-accent/20 text-accent',
                    active && 'border-accent text-accent',
                    !done && !active && 'border-border',
                  )}
                  aria-hidden
                >
                  {done && <Check size={12} strokeWidth={2.5} />}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </span>

                <span className="flex flex-col gap-1">
                  <span
                    className={cn(
                      'text-body-md',
                      active ? 'text-primary' : 'text-text',
                    )}
                  >
                    {t(item.label)}
                  </span>
                  <span className="text-caption text-text-subtle">
                    {t(item.caption)}
                  </span>
                </span>

                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px origin-left animate-[grow_4s_linear_forwards] bg-accent"
                  />
                )}
              </li>
            )
          })}
        </ol>

        <div>
          <Button variant="text" onClick={onCancel}>
            {t('wait.cancel')}
          </Button>
        </div>
      </div>

      <style>{`@keyframes grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </div>
  )
}
