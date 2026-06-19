import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import { cn } from '../../lib/cn'
import { Icon } from '../Icon'

function tabLinkClass(isActive: boolean): string {
  return cn(
    'xp-tab-link',
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
      <div className="-mb-px flex gap-1 overflow-x-auto">{children}</div>
    </nav>
  )
}

type TabProps = {
  to: string
  children: ReactNode
  icon?: LucideIcon
}

export function Tab({ to, children, icon }: TabProps) {
  return (
    <NavLink to={to} className={({ isActive }) => tabLinkClass(isActive)}>
      {icon && <Icon icon={icon} size={20} aria-hidden />}
      {children}
    </NavLink>
  )
}
