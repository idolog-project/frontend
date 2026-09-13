import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { PageHeader, SectionHeader } from '@/components/ui/layout'
import { useLogout } from '@/features/auth/useAuth'
import { useAuthStore } from '@/features/auth/store'
import { LOCALES, LOCALE_LABEL, useLocaleStore } from '@/features/locale/store'
import { useT } from '@/features/locale/useT'

export function MyPage() {
  const t = useT()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const { locale, setLocale } = useLocaleStore()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-screen py-12">
      <PageHeader
        eyebrow={t('my.eyebrow')}
        title={user?.nickname ?? t('my.fallbackName')}
      >
        {/* `break-words`: an address has no space to wrap at, so a long one
            would run past the right edge of a phone. */}
        {user && (
          <p className="break-words text-body-md text-text-muted">{user.email}</p>
        )}
      </PageHeader>

      <section className="flex flex-col gap-4">
        <SectionHeader title={t('my.language')} rule />
        {/* Rendered from the locale registry, so adding a language never means
            touching this screen. Each label is in its own script. */}
        <div className="flex flex-wrap gap-3">
          {LOCALES.map((option) => (
            <Button
              key={option}
              variant={locale === option ? 'outline' : 'ghost'}
              lang={option === 'zh' ? 'zh-Hans' : option}
              aria-pressed={locale === option}
              onClick={() => setLocale(option)}
            >
              {LOCALE_LABEL[option]}
            </Button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader title={t('my.account')} rule />
        <div>
          <Button
            variant="ghost"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSettled: () => navigate('/login', { replace: true }),
              })
            }
          >
            {logout.isPending ? t('my.loggingOut') : t('my.logout')}
          </Button>
        </div>
      </section>
    </div>
  )
}
