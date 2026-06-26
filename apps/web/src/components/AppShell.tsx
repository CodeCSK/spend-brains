import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Menu } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import {
  AppSidebarContent,
  DEV_NAV,
  MAIN_NAV,
} from './AppSidebarContent'
import { AppLogo } from './AppLogo'
import { Icon } from './Icon'
import { Button } from './ui'
import { logout, getMe } from '../lib/api'
import { clearTokens, getRefreshToken } from '../lib/auth-storage'
import { lockBodyScroll, unlockBodyScroll } from '../lib/body-scroll-lock'
import { cn } from '../lib/cn'
import { profileKeys } from '../lib/query-keys'

const NAV_DRAWER_MS = 240

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [navDrawerMounted, setNavDrawerMounted] = useState(false)
  const [navDrawerVisible, setNavDrawerVisible] = useState(false)

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

  const navItems = profileQuery.data?.isSuperAdmin
    ? [...MAIN_NAV, DEV_NAV]
    : MAIN_NAV

  const openNavDrawer = useCallback(() => {
    setNavDrawerMounted(true)
    setNavDrawerVisible(false)
  }, [])

  const closeNavDrawer = useCallback(() => {
    setNavDrawerVisible(false)
  }, [])

  const toggleNavDrawer = useCallback(() => {
    if (navDrawerMounted && navDrawerVisible) {
      closeNavDrawer()
    } else {
      openNavDrawer()
    }
  }, [closeNavDrawer, navDrawerMounted, navDrawerVisible, openNavDrawer])

  useEffect(() => {
    document.documentElement.classList.add('xp-app-viewport')

    return () => {
      document.documentElement.classList.remove('xp-app-viewport')
    }
  }, [])

  useEffect(() => {
    closeNavDrawer()
  }, [location.pathname, closeNavDrawer])

  useEffect(() => {
    if (!navDrawerMounted) {
      return
    }

    const frame = requestAnimationFrame(() => {
      setNavDrawerVisible(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [navDrawerMounted])

  useEffect(() => {
    if (navDrawerMounted && !navDrawerVisible) {
      const timeout = window.setTimeout(() => {
        setNavDrawerMounted(false)
      }, NAV_DRAWER_MS)

      return () => window.clearTimeout(timeout)
    }
  }, [navDrawerMounted, navDrawerVisible])

  useEffect(() => {
    if (!navDrawerMounted) {
      return
    }

    lockBodyScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNavDrawer()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeNavDrawer, navDrawerMounted])

  return (
    <div className="xp-app-shell flex bg-surface-page">
      {/* Desktop — full persistent sidebar */}
      <aside
        aria-label="App navigation"
        className="xp-sidebar xp-shell-desktop-sidebar fixed inset-y-0 left-0 z-30 w-[var(--sidebar-width)] flex-col"
      >
        <AppSidebarContent
          navItems={navItems}
          logoutPending={logoutMutation.isPending}
          onLogout={() => logoutMutation.mutate()}
        />
      </aside>

      {/* Tablet landscape — collapsed icon rail */}
      <aside
        aria-label="App navigation"
        className="xp-sidebar xp-shell-tablet-rail fixed inset-y-0 left-0 z-30 w-[var(--sidebar-width-collapsed)] flex-col"
      >
        <AppSidebarContent
          navItems={navItems}
          logoutPending={logoutMutation.isPending}
          onLogout={() => logoutMutation.mutate()}
          variant="rail"
          showLogo={false}
          onExpand={openNavDrawer}
        />
      </aside>

      {/* Mobile + tablet portrait — overlay drawer */}
      {navDrawerMounted && (
        <>
          <button
            type="button"
            className={cn(
              'xp-shell-nav-overlay fixed inset-0 z-40',
              navDrawerVisible && 'xp-shell-nav-overlay-visible',
            )}
            aria-label="Close menu"
            onClick={closeNavDrawer}
          />
          <aside
            id="app-nav-drawer"
            aria-label="App navigation"
            aria-modal="true"
            aria-hidden={!navDrawerVisible}
            className={cn(
              'xp-shell-nav-drawer fixed inset-y-0 left-0 z-50 flex flex-col',
              navDrawerVisible && 'xp-shell-nav-drawer-visible',
            )}
          >
            <AppSidebarContent
              navItems={navItems}
              logoutPending={logoutMutation.isPending}
              onLogout={() => logoutMutation.mutate()}
              onNavigate={closeNavDrawer}
              showClose
              onClose={closeNavDrawer}
              variant="drawer"
            />
          </aside>
        </>
      )}

      <div className="xp-shell-main flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="xp-shell-topbar sticky top-0 z-20 shrink-0 border-b border-border bg-surface-raised/95 backdrop-blur-sm">
          <div className="flex h-[var(--header-height-tablet)] items-center gap-3 px-4 md:px-6">
            <Button
              type="button"
              variant="ghost"
              className="xp-icon-btn h-11 w-11 shrink-0"
              aria-label={navDrawerVisible ? 'Close menu' : 'Open menu'}
              aria-expanded={navDrawerVisible}
              aria-controls="app-nav-drawer"
              onClick={toggleNavDrawer}
            >
              <Icon icon={Menu} size={24} label={navDrawerVisible ? 'Close menu' : 'Open menu'} />
            </Button>
            <div className="min-w-0 flex-1">
              <AppLogo size="sm" href="/app/events" />
            </div>
          </div>
        </header>

        <main className="xp-shell-content flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
