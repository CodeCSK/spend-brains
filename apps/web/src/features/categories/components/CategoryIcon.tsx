import { Icon } from '../../../components/Icon'
import { getCategoryLucideIcon } from '../lib/category-icons'

type CategoryIconProps = {
  iconKey: string
  size?: 16 | 20 | 24
  className?: string
}

export function CategoryIcon({ iconKey, size = 20, className }: CategoryIconProps) {
  return (
    <Icon
      icon={getCategoryLucideIcon(iconKey)}
      size={size}
      className={className}
      aria-hidden
    />
  )
}
