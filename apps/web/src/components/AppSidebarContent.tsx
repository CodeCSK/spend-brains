import { CalendarDays, LogOut, Terminal, User, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { AppLogo } from './AppLogo'
import { Icon } from './Icon'
import { Button } from './ui'

export type AppNavItem = {
  to: string
  label: string
  icon: LucideIcon
}

export const MAIN_NAV: AppNavItem[] = [
  { to: '/app/events', label: 'Events', icon: CalendarDays },
  { to: '/app/profile', label: 'Profile', icon: User },
]

export const DEV_NAV: AppNavItem = {
  to: '/app/dev-console',
  label: 'Dev',
  icon: Terminal,
}

export function sidebarNavLinkClass(isActive: boolean) {
  return [
    'xp-sidebar-nav-link',
    isActive ? 'xp-sidebar-nav-link-active' : 'xp-sidebar-nav-link-inactive',
  ].join(' ')
}

type AppSidebarContentProps = {
  navItems: AppNavItem[]
  logoutPending: boolean
  onLogout: () => void
  onNavigate?: () => void
  showLogo?: boolean
  showClose?: boolean
  onClose?: () => void
}

export function AppSidebarContent({
  navItems,
  logoutPending,
  onLogout,
  onNavigate,
  showLogo = true,
  showClose = false,
  onClose,
}: AppSidebarContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-surface-raised">
      {(showLogo || showClose) && (
        <div className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
          {showLogo ? <AppLogo size="sm" href="/app/events" /> : <span />}
          {showClose && onClose ? (
            <Button
              type="button"
              variant="ghost"
              className="xp-icon-btn shrink-0"
              aria-label="Close menu"
              onClick={onClose}
            >
              <Icon icon={X} size={20} label="Close menu" />
            </Button>
          ) : null}
        </div>
      )}

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => sidebarNavLinkClass(isActive)}
            onClick={onNavigate}
          >
            <Icon icon={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="secondary"
          loading={logoutPending}
          className="w-full justify-start gap-3 px-3"
          aria-label="Log out"
          onClick={() => {
            onNavigate?.()
            onLogout()
          }}
        >
          <Icon icon={LogOut} size={20} label="Log out" />
          {logoutPending ? 'Logging out…' : 'Logout'}
        </Button>
      </div>
    </div>
  )
}
