import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { CircleUser, Compass, PanelLeftClose, PanelLeftOpen, Route } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { MessageKey } from '@/features/locale/messages'
import { LOCALES, LOCALE_LABEL, useLocaleStore } from '@/features/locale/store'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'

/**
 * The three destinations, in the two shapes the draft already implied.
 *
 * The Stitch draft used a five-item bottom tab bar, but that was a mobile
 * layout and carried two items (Events, Passport) outside the product scope.
 * The approved resolution was a left sidebar with the brief's three
 * destinations — which is right on a desktop and wrong on a phone, where a
 * 240px rail eats two thirds of the width. So the sidebar holds from `md` up
 * and the draft's bottom bar returns below it, with the same three items.
 *
 * The icons were chosen as a set rather than one at a time. The previous three
 * (Map, Bookmark, User) each read fine alone but sat badly together: a dense
 * angular map, a tall narrow bookmark, a plain bust — three different weights
 * in a row of three. These share a build, and two circles bracket a linear
 * middle so the row has a shape.
 *
 * They are also closer to what each destination holds. Home is not a map you
 * read, it is a country you browse, so Compass. What you save is an ordered
 * course between stops, which is what Route draws — Bookmark described the act
 * of saving, not the thing saved.
 */
const NAV: Array<{ to: string; label: MessageKey; icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: 'nav.home', icon: Compass, end: true },
  { to: '/my/courses', label: 'nav.saved', icon: Route },
  { to: '/my', label: 'nav.my', icon: CircleUser, end: true },
]

export function AppShell() {
  const t = useT()
  const [railOpen, setRailOpen] = useState(true)
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <div className="flex h-full flex-col md:flex-row">
      <nav
        aria-label={t('nav.aria')}
        className={cn(
          'flex shrink-0 border-border',
          // Phone: a bar under the content. `order-last` puts it at the bottom
          // while leaving it first in the DOM, so tab order still reaches
          // navigation before the page body.
          'order-last border-t pb-[env(safe-area-inset-bottom)]',
          // Desktop: the sidebar. Narrow enough for icons alone when folded.
          'md:order-first md:flex-col md:gap-8 md:border-r md:border-t-0 md:py-8',
          railOpen ? 'md:w-sidebar md:px-screen' : 'md:w-16 md:px-2',
        )}
      >
        {/* The wordmark and the fold control share the top row, so the button
            sits where the eye already lands. Folded, the wordmark goes and the
            button takes the row by itself — still the same spot. */}
        <div className="hidden items-center gap-2 md:flex">
          {railOpen && (
            <NavLink
              to="/"
              end
              aria-label={t('nav.home')}
              className="min-w-0 flex-1 truncate bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent transition-opacity hover:opacity-80"
            >
              Idolog
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => setRailOpen((open) => !open)}
            aria-expanded={railOpen}
            aria-label={t(railOpen ? 'nav.collapse' : 'nav.expand')}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface hover:text-text',
              !railOpen && 'mx-auto',
            )}
          >
            {railOpen ? (
              <PanelLeftClose size={20} strokeWidth={1.5} aria-hidden />
            ) : (
              <PanelLeftOpen size={20} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>

        <ul className="flex flex-1 md:flex-col md:gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1 md:flex-none">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-0 transition-colors',
                    // Phone: icon over label, filling an equal share of the bar.
                    'flex-col items-center justify-center gap-0.5 py-2',
                    // Desktop: icon beside label, in a list.
                    'md:flex-row md:items-center md:gap-3 md:rounded md:py-2.5',
                    railOpen ? 'md:justify-start md:px-3' : 'md:justify-center md:px-0',
                    isActive
                      ? 'bg-surface text-primary'
                      : 'text-text-muted hover:bg-surface hover:text-text',
                  )
                }
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden className="shrink-0" />
                {/* Folded, the label stays for a screen reader but takes no
                    room — dropping it would leave three unnamed icons. */}
                <span
                  className={cn(
                    'truncate text-caption md:text-body-sm',
                    !railOpen && 'md:sr-only',
                  )}
                >
                  {t(label)}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sidebar only. The bottom bar has room for three destinations and
            nothing else, and a phone still reaches this from 마이페이지 — the
            same control, on a screen that has space to explain it.

            `mt-auto` drops it to the foot of the rail: it is a setting, not a
            fourth place to go, so it must not read as part of the list above. */}
        <div
          className={cn(
            'mt-auto hidden flex-col gap-2',
            // Folded, there is no width for three language names, and shrinking
            // them to initials would make the picker a puzzle. It waits.
            railOpen && 'md:flex',
          )}
        >
          <span className="px-3 font-display text-label-caps uppercase text-text-subtle">
            {t('my.language')}
          </span>
          <ul className="flex flex-col gap-0.5">
            {LOCALES.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  // Each label is written in its own script, so the browser has
                  // to be told which — otherwise 简体中文 renders in whatever
                  // font the active locale happens to ask for.
                  lang={option === 'zh' ? 'zh-Hans' : option}
                  aria-pressed={locale === option}
                  onClick={() => setLocale(option)}
                  className={cn(
                    'w-full rounded px-3 py-1.5 text-left text-body-sm transition-colors',
                    locale === option
                      ? 'bg-surface text-primary'
                      : 'text-text-muted hover:bg-surface hover:text-text',
                  )}
                >
                  {LOCALE_LABEL[option]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
