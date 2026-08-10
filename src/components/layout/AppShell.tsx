import { NavLink, Outlet } from 'react-router'
import { Bookmark, Map, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { MessageKey } from '@/features/locale/messages'
import { useT } from '@/features/locale/useT'
import { cn } from '@/lib/cn'

/**
 * Desktop global navigation. The Stitch draft used a five-item bottom tab bar,
 * but that was a mobile layout and carried two items (Events, Passport) outside
 * the product scope. Approved resolution: a left sidebar with the brief's three
 * destinations.
 */
const NAV: Array<{ to: string; label: MessageKey; icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: 'nav.home', icon: Map, end: true },
  { to: '/my/courses', label: 'nav.saved', icon: Bookmark },
  { to: '/my', label: 'nav.my', icon: User, end: true },
]

export function AppShell() {
  const t = useT()

  return (
    <div className="flex h-full">
      <nav
        aria-label={t('nav.aria')}
        className="flex w-sidebar shrink-0 flex-col gap-8 border-r border-border px-screen py-8"
      >
        <NavLink
          to="/"
          end
          aria-label={t('nav.home')}
          className="w-max bg-gradient-to-r from-accent to-accent-end bg-clip-text font-display text-title-md text-transparent transition-opacity hover:opacity-80"
        >
          Idolog
        </NavLink>

        <ul className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex min-w-0 items-center gap-3 rounded px-3 py-2.5 transition-colors',
                    isActive
                      ? 'bg-surface text-primary'
                      : 'text-text-muted hover:bg-surface hover:text-text',
                  )
                }
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden className="shrink-0" />
                <span className="truncate text-body-sm">{t(label)}</span>
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
