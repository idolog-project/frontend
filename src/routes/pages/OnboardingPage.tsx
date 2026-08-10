import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { LOCALES, LOCALE_LABEL, useLocaleStore, type Locale } from '@/features/locale/store'
import { useT } from '@/features/locale/useT'
import { SCENE } from '@/mocks/images'

/**
 * The one screen the system allows to be a single quiet moment: full-bleed
 * photography, content weighted to the lower left, no navigation.
 */
export function OnboardingPage() {
  const t = useT()
  const navigate = useNavigate()
  const setLocale = useLocaleStore((s) => s.setLocale)

  const choose = (locale: Locale) => {
    setLocale(locale)
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Decorative — and this is the screen where the user picks a language, so
          announcing a description in a language they may not read helps nobody. */}
      <img src={SCENE.onboarding} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 p-16">
        <div className="flex flex-col gap-4">
          <span className="w-max bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent">
            Idolog
          </span>
          <h1 className="max-w-xl text-balance font-display text-display-lg">
            {t('onboarding.headline')}
          </h1>
        </div>

        {/* Each option is written in its own script, so it reads for someone who
            cannot yet read the current language. */}
        <div className="flex w-full max-w-xs flex-col gap-4">
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
