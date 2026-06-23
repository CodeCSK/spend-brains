import { CategoryIcon } from '../../../categories/components/CategoryIcon'

type ChartLegendMarkerProps = {
  color: string
  iconKey?: string
  size?: 16 | 20 | 24
}

export function ChartLegendMarker({ color, iconKey, size = 16 }: ChartLegendMarkerProps) {
  if (iconKey) {
    return <CategoryIcon iconKey={iconKey} size={size} variant="badge" color={color} />
  }

  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}
