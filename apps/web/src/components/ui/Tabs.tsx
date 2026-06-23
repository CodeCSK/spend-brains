import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '../../lib/cn'
import { Icon } from '../Icon'

function tabLinkClass(isActive: boolean): string {
  return cn(
    'xp-tab-link xp-tab-link-mobile w-full md:w-auto',
    isActive ? 'xp-tab-link-active' : 'xp-tab-link-inactive',
  )
}

type TabsProps = {
  children: ReactNode
  'aria-label': string
  className?: string
}

export function Tabs({ children, 'aria-label': ariaLabel, className }: TabsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('border-b border-border', className)}>
      <div className="-mb-px xp-tabs-grid md:flex md:gap-1 md:overflow-x-auto md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </nav>
  )
}

type TabProps = {
  to: string
  children: ReactNode
  /** Shorter label shown below the icon on narrow viewports. */
  shortLabel?: string
  icon?: LucideIcon
}

export function Tab({ to, children, shortLabel, icon }: TabProps) {
  const mobileLabel = shortLabel ?? children

  return (
    <NavLink to={to} className={({ isActive }) => tabLinkClass(isActive)}>
      {icon && <Icon icon={icon} size={20} className="md:h-5 md:w-5" aria-hidden />}
      <span className="truncate md:hidden">{mobileLabel}</span>
      <span className="hidden truncate md:inline">{children}</span>
    </NavLink>
  )
}
