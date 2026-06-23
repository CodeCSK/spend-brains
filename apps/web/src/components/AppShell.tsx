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

const MOBILE_NAV_MS = 240

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [mobileNavMounted, setMobileNavMounted] = useState(false)
  const [mobileNavVisible, setMobileNavVisible] = useState(false)

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

  const openMobileNav = useCallback(() => {
    setMobileNavMounted(true)
    setMobileNavVisible(false)
  }, [])

  const closeMobileNav = useCallback(() => {
    setMobileNavVisible(false)
  }, [])

  const toggleMobileNav = useCallback(() => {
    if (mobileNavMounted && mobileNavVisible) {
      closeMobileNav()
    } else {
      openMobileNav()
    }
  }, [closeMobileNav, mobileNavMounted, mobileNavVisible, openMobileNav])

  useEffect(() => {
    closeMobileNav()
  }, [location.pathname, closeMobileNav])

  useEffect(() => {
    if (!mobileNavMounted) {
      return
    }

    const frame = requestAnimationFrame(() => {
      setMobileNavVisible(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [mobileNavMounted])

  useEffect(() => {
    if (mobileNavMounted && !mobileNavVisible) {
      const timeout = window.setTimeout(() => {
        setMobileNavMounted(false)
      }, MOBILE_NAV_MS)

      return () => window.clearTimeout(timeout)
    }
  }, [mobileNavMounted, mobileNavVisible])

  useEffect(() => {
    if (!mobileNavMounted) {
      return
    }

    lockBodyScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileNav()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeMobileNav, mobileNavMounted])

  return (
    <div className="flex min-h-screen bg-surface-page">
      <aside
        aria-label="App navigation"
        className="xp-sidebar fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col md:flex"
      >
        <AppSidebarContent
          navItems={navItems}
          logoutPending={logoutMutation.isPending}
          onLogout={() => logoutMutation.mutate()}
        />
      </aside>

      {mobileNavMounted && (
        <>
          <button
            type="button"
            className={cn(
              'xp-mobile-nav-overlay fixed inset-0 z-40 md:hidden',
              mobileNavVisible && 'xp-mobile-nav-overlay-visible',
            )}
            aria-label="Close menu"
            onClick={closeMobileNav}
          />
          <aside
            id="mobile-app-nav"
            aria-label="App navigation"
            aria-modal="true"
            aria-hidden={!mobileNavVisible}
            className={cn(
              'xp-mobile-nav-drawer fixed inset-y-0 left-0 z-50 flex flex-col md:hidden',
              mobileNavVisible && 'xp-mobile-nav-drawer-visible',
            )}
          >
            <AppSidebarContent
              navItems={navItems}
              logoutPending={logoutMutation.isPending}
              onLogout={() => logoutMutation.mutate()}
              onNavigate={closeMobileNav}
              showClose
              onClose={closeMobileNav}
            />
          </aside>
        </>
      )}

      <div className="flex min-h-screen flex-1 flex-col md:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-20 border-b border-border bg-surface-raised/95 backdrop-blur-sm md:hidden">
          <div className="flex h-[var(--header-height)] items-center gap-2 px-3 sm:px-4">
            <Button
              type="button"
              variant="ghost"
              className="xp-icon-btn shrink-0"
              aria-label={mobileNavVisible ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavVisible}
              aria-controls="mobile-app-nav"
              onClick={toggleMobileNav}
            >
              <Icon icon={Menu} size={20} label={mobileNavVisible ? 'Close menu' : 'Open menu'} />
            </Button>
            <div className="min-w-0 flex-1">
              <AppLogo size="sm" href="/app/events" />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
