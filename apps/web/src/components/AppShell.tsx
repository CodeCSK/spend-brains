import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, LogOut, Terminal, User } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { AppLogo } from './AppLogo'
import { Icon } from './Icon'
import { Button } from './ui'
import { logout, getMe } from '../lib/api'
import { clearTokens, getRefreshToken } from '../lib/auth-storage'
import { profileKeys } from '../lib/query-keys'

function navLinkClass(isActive: boolean, compact = false) {
  return [
    'xp-nav-link',
    isActive ? 'xp-nav-link-active' : 'xp-nav-link-inactive',
    compact ? 'h-[var(--bottom-nav-height)] flex-1 flex-col gap-1 py-2 text-xs' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function AppShell() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: getMe,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await logout(refreshToken)
      }
    },
    onSettled: () => {
      clearTokens()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })

  return (
    <div className="flex min-h-screen flex-col bg-surface-page pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px))] md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border bg-surface-raised/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--content-max-width-wide)] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 md:gap-8">
            <AppLogo size="sm" href="/app/events" />
            <nav
              aria-label="Main"
              className="hidden items-center gap-1 md:flex"
            >
              <NavLink to="/app/events" className={({ isActive }) => navLinkClass(isActive)}>
                <Icon icon={CalendarDays} size={20} />
                Events
              </NavLink>
              <NavLink to="/app/profile" className={({ isActive }) => navLinkClass(isActive)}>
                <Icon icon={User} size={20} />
                Profile
              </NavLink>
              {profileQuery.data?.isSuperAdmin && (
                <NavLink
                  to="/app/dev-console"
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  <Icon icon={Terminal} size={20} />
                  Dev
                </NavLink>
              )}
            </nav>
          </div>
          <Button
            type="button"
            variant="secondary"
            loading={logoutMutation.isPending}
            className="shrink-0 px-3"
            aria-label="Log out"
            onClick={() => logoutMutation.mutate()}
          >
            <Icon icon={LogOut} size={20} label="Log out" />
            <span className="hidden sm:inline">
              {logoutMutation.isPending ? 'Logging out…' : 'Logout'}
            </span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface-raised pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      >
        <div className="mx-auto flex max-w-lg">
          <NavLink
            to="/app/events"
            className={({ isActive }) => navLinkClass(isActive, true)}
          >
            <Icon icon={CalendarDays} size={20} />
            Events
          </NavLink>
          <NavLink
            to="/app/profile"
            className={({ isActive }) => navLinkClass(isActive, true)}
          >
            <Icon icon={User} size={20} />
            Profile
          </NavLink>
          {profileQuery.data?.isSuperAdmin && (
            <NavLink
              to="/app/dev-console"
              className={({ isActive }) => navLinkClass(isActive, true)}
            >
              <Icon icon={Terminal} size={20} />
              Dev
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  )
}
