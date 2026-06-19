import type { ReactNode } from 'react'

import { Card } from '../ui'

type PageLayoutProps = {
  children: ReactNode
  /** wide: events list · narrow: profile/forms · auth: login (renders `<main>`) */
  width?: 'wide' | 'narrow' | 'auth'
  className?: string
}

const widthClass = {
  wide: 'xp-page',
  narrow: 'xp-page-narrow',
  auth: 'xp-auth-shell',
} as const

/**
 * Page width + padding — see docs/LAYOUT_SYSTEM.md#content-layout-standards
 * Auth width renders `<main>`; wide/narrow render a div inside AppShell `<main>`.
 */
export function PageLayout({
  children,
  width = 'wide',
  className,
}: PageLayoutProps) {
  const classes = [widthClass[width], className].filter(Boolean).join(' ')

  if (width === 'auth') {
    return <main className={classes}>{children}</main>
  }

  return <div className={classes}>{children}</div>
}

type PageHeaderProps = {
  title: ReactNode
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="xp-page-title">{title}</h1>
        {description && <p className="xp-page-subtitle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

type AuthLogoHeaderProps = {
  children: ReactNode
}

/** Logo row on auth pages — `<header>` inside auth `<main>`. */
export function AuthLogoHeader({ children }: AuthLogoHeaderProps) {
  return <header className="mb-8 flex justify-center">{children}</header>
}

type AuthCardProps = {
  children: ReactNode
}

/** Sign-in / OTP card — semantic `<article>`. */
export function AuthCard({ children }: AuthCardProps) {
  return <Card as="article">{children}</Card>
}

type AuthFooterProps = {
  children: ReactNode
}

/** Optional meta copy below auth card. */
export function AuthFooter({ children }: AuthFooterProps) {
  return (
    <footer className="mt-4 text-center text-xs text-text-muted">{children}</footer>
  )
}

type PageSectionProps = {
  children: ReactNode
  /** Accessible name when no visible heading */
  'aria-label'?: string
  /** Pairs with `<h2 id="...">` inside the section */
  'aria-labelledby'?: string
  className?: string
}

export function PageSection({
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
}: PageSectionProps) {
  return (
    <section
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={className}
    >
      {children}
    </section>
  )
}
