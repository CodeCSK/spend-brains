import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Icon } from '../Icon'
import { Button, type ButtonVariant } from './Button'

type BackLinkProps = {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  className?: string
}

export function BackLink({
  to,
  children,
  variant = 'ghost',
  className,
}: BackLinkProps) {
  return (
    <Button
      as="link"
      to={to}
      variant={variant}
      className={cn('-ml-2 mb-4 inline-flex px-2', className)}
    >
      <Icon icon={ArrowLeft} size={20} aria-hidden />
      {children}
    </Button>
  )
}
