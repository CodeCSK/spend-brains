import type { HTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { cn } from '../../lib/cn'

type CardElement = 'div' | 'article' | 'section' | 'li'

type CardBaseProps = {
  children: ReactNode
  className?: string
}

type CardAsElement = CardBaseProps &
  Omit<HTMLAttributes<HTMLElement>, keyof CardBaseProps> & {
    as?: CardElement
    to?: never
  }

type CardAsLink = CardBaseProps &
  Omit<LinkProps, 'to' | 'children' | 'className'> & {
    as: 'link'
    to: string
  }

export type CardProps = CardAsElement | CardAsLink

export function Card(props: CardProps) {
  if (props.as === 'link') {
    const { as: _as, className, children, ...linkProps } = props

    return (
      <Link className={cn('xp-card', className)} {...linkProps}>
        {children}
      </Link>
    )
  }

  const { as: Tag = 'div', className, children, ...rest } = props

  return (
    <Tag className={cn('xp-card', className)} {...rest}>
      {children}
    </Tag>
  )
}

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  )
}
