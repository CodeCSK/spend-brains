import { CalendarDays, LogOut, PanelLeft, Terminal, User, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { AppLogo } from './AppLogo'
import { Icon } from './Icon'
import { Button } from './ui'
import { cn } from '../lib/cn'

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

type SidebarVariant = 'full' | 'rail' | 'drawer'

type AppSidebarContentProps = {
  navItems: AppNavItem[]
  logoutPending: boolean
  onLogout: () => void
  onNavigate?: () => void
  showLogo?: boolean
  showClose?: boolean
  onClose?: () => void
  /** full: desktop sidebar · rail: tablet landscape icon rail · drawer: overlay menu */
  variant?: SidebarVariant
  onExpand?: () => void
}

export function AppSidebarContent({
  navItems,
  logoutPending,
  onLogout,
  onNavigate,
  showLogo = true,
  showClose = false,
  onClose,
  variant = 'full',
  onExpand,
}: AppSidebarContentProps) {
  const isRail = variant === 'rail'

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-surface-raised">
      {(showLogo || showClose || isRail) && (
        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-2 border-b border-border',
            isRail
              ? 'h-[var(--header-height-tablet)] justify-center px-2'
              : 'h-[var(--header-height)] px-3 sm:px-4',
          )}
        >
          {isRail && onExpand ? (
            <Button
              type="button"
              variant="ghost"
              className="xp-icon-btn h-11 w-11"
              aria-label="Expand navigation"
              onClick={onExpand}
            >
              <Icon icon={PanelLeft} size={24} label="Expand navigation" />
            </Button>
          ) : showLogo ? (
            <AppLogo size="sm" href="/app/events" />
          ) : (
            <span />
          )}
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

      <nav
        aria-label="Main"
        className={cn(
          'flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain',
          isRail ? 'items-center p-2' : 'p-3',
        )}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isRail ? item.label : undefined}
            aria-label={isRail ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                sidebarNavLinkClass(isActive),
                isRail && 'xp-sidebar-nav-link-rail justify-center px-0',
              )
            }
            onClick={onNavigate}
          >
            <Icon icon={item.icon} size={isRail ? 24 : 20} />
            <span className={isRail ? 'sr-only' : undefined}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-border pb-[max(0.75rem,env(safe-area-inset-bottom))]',
          isRail ? 'p-2' : 'p-3',
        )}
      >
        <Button
          type="button"
          variant="secondary"
          loading={logoutPending}
          className={cn(
            'gap-3',
            isRail ? 'xp-icon-btn h-11 w-11 justify-center p-0' : 'w-full justify-start px-3',
          )}
          aria-label="Log out"
          onClick={() => {
            onNavigate?.()
            onLogout()
          }}
        >
          <Icon icon={LogOut} size={20} label="Log out" />
          {!isRail && (logoutPending ? 'Logging out…' : 'Logout')}
        </Button>
      </div>
    </div>
  )
}
