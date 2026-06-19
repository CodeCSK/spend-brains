import { Brain } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from './Icon'

const APP_NAME = 'Spendbrains'
const LOGO_MARK_SRC = '/brand/logo-mark.svg'

type AppLogoProps = {
  /** sm: header / mobile · md: auth · lg: marketing */
  size?: 'sm' | 'md' | 'lg'
  /** Show wordmark beside the mark */
  showWordmark?: boolean
  /** Link target when used in authenticated shell; omit on login */
  href?: string
  className?: string
}

const markSize = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const

const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

const wordmarkClass = {
  sm: 'text-base font-semibold tracking-tight',
  md: 'text-xl font-semibold tracking-tight',
  lg: 'text-2xl font-semibold tracking-tight',
} as const

type LogoMarkProps = {
  size: NonNullable<AppLogoProps['size']>
}

/** Loads `public/brand/logo-mark.svg` when present; brain placeholder until then. */
function LogoMark({ size }: LogoMarkProps) {
  const [usePlaceholder, setUsePlaceholder] = useState(false)

  if (!usePlaceholder) {
    return (
      <img
        src={LOGO_MARK_SRC}
        alt=""
        width={size === 'lg' ? 48 : size === 'md' ? 40 : 32}
        height={size === 'lg' ? 48 : size === 'md' ? 40 : 32}
        className={`shrink-0 object-contain ${markSize[size]}`}
        onError={() => setUsePlaceholder(true)}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xp-lg bg-primary ${markSize[size]}`}
      aria-hidden
    >
      <Icon icon={Brain} size={iconSize[size]} className="text-primary-fg" />
    </span>
  )
}

/**
 * Spendbrains brand lockup. Drop SVGs in `public/brand/` — see public/brand/README.md.
 */
export function AppLogo({
  size = 'sm',
  showWordmark = true,
  href,
  className,
}: AppLogoProps) {
  const content = (
    <>
      <LogoMark size={size} />
      {showWordmark && (
        <span className={`text-text-primary ${wordmarkClass[size]}`}>
          {APP_NAME}
        </span>
      )}
    </>
  )

  const rootClass = ['inline-flex items-center gap-2.5', className]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <Link to={href} className={rootClass} aria-label={`${APP_NAME} home`}>
        {content}
      </Link>
    )
  }

  return (
    <div
      className={rootClass}
      aria-label={showWordmark ? APP_NAME : undefined}
    >
      {content}
    </div>
  )
}
