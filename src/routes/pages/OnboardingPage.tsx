import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { LOCALES, LOCALE_LABEL, useLocaleStore, type Locale } from '@/features/locale/store'
import { useT } from '@/features/locale/useT'
import { ONBOARDING_SCENES } from '@/mocks/images'

/**
 * The one screen the system allows to be a single quiet moment: full-bleed
 * photography, content weighted to the lower left, no navigation.
 */
export function OnboardingPage() {
  const t = useT()
  const navigate = useNavigate()
  const setLocale = useLocaleStore((s) => s.setLocale)

  /**
   * A different frame each visit, chosen once.
   *
   * In state rather than computed while rendering: picking inline would deal a
   * new photo on every re-render, so the background would flicker as the
   * language store settles. The gate shows this screen once per visit, so once
   * per mount is once per visit.
   */
  const [backdrop] = useState(
    () => ONBOARDING_SCENES[Math.floor(Math.random() * ONBOARDING_SCENES.length)],
  )

  const choose = (locale: Locale) => {
    setLocale(locale)
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Decorative — and this is the screen where the user picks a language, so
          announcing a description in a language they may not read helps nobody. */}
      <img src={backdrop} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* The 64px inset is a desktop luxury — on a 375px phone it would eat a
          third of the width and leave the headline setting two words a line, so
          the phone falls back to the screen margin. `max-h-full` keeps the block
          scrollable instead of clipped under the fold on a short landscape
          viewport, where the parent's `overflow-hidden` would cut it off. */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col gap-6 overflow-y-auto p-screen pb-10 md:gap-8 md:p-16">
        <div className="flex flex-col gap-4">
          <span className="w-max bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent">
            Idolog
          </span>
          <h1 className="max-w-xl text-balance font-display text-display-lg">
            {t('onboarding.headline')}
          </h1>
        </div>

        {/* Each option is written in its own script, so it reads for someone who
            cannot yet read the current language. The column is capped on desktop
            so the buttons don't run the width of the frame; a phone is already
            that narrow, and a 320px cap there would only leave one edge hanging
            short of the margin. */}
        <div className="flex w-full flex-col gap-4 md:max-w-xs">
          {LOCALES.map((locale) => (
            <Button
              key={locale}
              variant="ghost"
              fullWidth
              lang={locale === 'zh' ? 'zh-Hans' : locale}
              onClick={() => choose(locale)}
            >
              {LOCALE_LABEL[locale]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
