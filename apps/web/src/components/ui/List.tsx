import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

type ListProps = HTMLAttributes<HTMLUListElement> & {
  children: ReactNode
}

export function List({ className, children, ...props }: ListProps) {
  return (
    <ul className={cn('space-y-3', className)} {...props}>
      {children}
    </ul>
  )
}

type ListItemProps = HTMLAttributes<HTMLLIElement> & {
  children: ReactNode
}

export function ListItem({ className, children, ...props }: ListItemProps) {
  return (
    <li className={className} {...props}>
      {children}
    </li>
  )
}
