import { NavLink, Outlet } from 'react-router'
import { CircleUser, Compass, Route } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { MessageKey } from '@/features/locale/messages'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'

/**
 * Global navigation, in the two shapes the draft already implied.
 *
 * The Stitch draft used a five-item bottom tab bar, but that was a mobile
 * layout and carried two items (Events, Passport) outside the product scope.
 * The approved resolution was a left sidebar with the brief's three
 * destinations — which is right on a desktop and wrong on a phone, where a
 * 240px rail eats two thirds of the width. So the sidebar holds from `md` up
 * and the draft's bottom bar returns below it, with the same three items.
 */
/**
 * Icons chosen as a set rather than one at a time.
 *
 * The previous three (Map, Bookmark, User) each read fine alone but sat badly
 * together: a dense angular map, a tall narrow bookmark, a plain bust — three
 * different weights in a row of three. These share a build, and two circles
 * bracket a linear middle so the row has a shape.
 *
 * They are also closer to what each destination holds. Home is not a map you
 * read, it is a country you browse, so Compass. What you save is an ordered
 * course between stops, which is what Route draws — Bookmark described the
 * act of saving, not the thing saved.
 */
const NAV: Array<{ to: string; label: MessageKey; icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: 'nav.home', icon: Compass, end: true },
  { to: '/my/courses', label: 'nav.saved', icon: Route },
  { to: '/my', label: 'nav.my', icon: CircleUser, end: true },
]

export function AppShell() {
  const t = useT()

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
          // Desktop: the sidebar.
          'md:order-first md:w-sidebar md:flex-col md:gap-8 md:border-r md:border-t-0 md:px-screen md:py-8',
        )}
      >
        <NavLink
          to="/"
          end
          aria-label={t('nav.home')}
          // The wordmark is a sidebar affordance; a tab bar has no room for it.
          className="hidden w-max bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent transition-opacity hover:opacity-80 md:block"
        >
          Idolog
        </NavLink>

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
                    'md:flex-row md:items-center md:justify-start md:gap-3 md:rounded md:px-3 md:py-2.5',
                    isActive
                      ? 'bg-surface text-primary'
                      : 'text-text-muted hover:bg-surface hover:text-text',
                  )
                }
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden className="shrink-0" />
                <span className="truncate text-caption md:text-body-sm">{t(label)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
