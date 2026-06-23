import { useId, useMemo, useState } from 'react'

import { Amount } from '../../../../components/ui'
import { cn } from '../../../../lib/cn'
import { formatInr } from '../../../../lib/format-inr'
import {
  getCategoryChartColor,
  type CategorySpendStat,
} from '../../lib/expense-summary-stats'
import { ChartLegendMarker } from './ChartLegendMarker'

type ExpenseDoughnutChartProps = {
  categories: CategorySpendStat[]
  totalLabel: string
  centerLabel?: string
  showLegend?: boolean
  className?: string
}

const SIZE = 240
const CX = SIZE / 2
const CY = SIZE / 2
const INNER_R = 68
const OUTER_R = 98
const SEGMENT_GAP = 1.2

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function describeDonutSegment(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
) {
  if (endAngle - startAngle >= 359.9) {
    endAngle = startAngle + 359.9
  }

  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

type Segment = CategorySpendStat & {
  color: string
  startAngle: number
  endAngle: number
  index: number
}

export function ExpenseDoughnutChart({
  categories,
  totalLabel,
  centerLabel = 'Total',
  showLegend = false,
  className,
}: ExpenseDoughnutChartProps) {
  const chartId = useId()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const total = useMemo(
    () => categories.reduce((sum, category) => sum + category.amount, 0),
    [categories],
  )

  const segments = useMemo(() => {
    if (total <= 0) return [] as Segment[]

    let cursor = 0
    return categories.map((category, index) => {
      const sweep = (category.amount / total) * 360
      const startAngle = cursor + (index > 0 ? SEGMENT_GAP / 2 : 0)
      const endAngle = cursor + sweep - (index < categories.length - 1 ? SEGMENT_GAP / 2 : 0)
      cursor += sweep

      return {
        ...category,
        color: getCategoryChartColor(index),
        startAngle,
        endAngle: Math.max(startAngle + 0.5, endAngle),
        index,
      }
    })
  }, [categories, total])

  const activeId = hoveredId ?? focusedId
  const activeSegment = segments.find((segment) => segment.categoryId === activeId)

  if (segments.length === 0) {
    return (
      <div
        className={cn(
          'xp-summary-chart-shell flex flex-col items-center justify-center text-center',
          className,
        )}
      >
        <div className="xp-summary-chart-empty" aria-hidden />
        <p className="mt-4 text-sm font-medium text-text-primary">No spending yet</p>
      </div>
    )
  }

  return (
    <div className={cn('xp-summary-chart-shell xp-chart-enter', className)}>
      <div
        className={cn(
          'flex flex-col gap-6',
          showLegend && 'md:flex-row md:items-center md:justify-center lg:flex-row',
        )}
      >
        <div className="relative mx-auto shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-56 w-56 sm:h-60 sm:w-60 md:h-64 md:w-64"
            role="img"
            aria-label={`${totalLabel} spending doughnut chart`}
          >
            {segments.map((segment) => {
              const isActive = activeId === segment.categoryId
              const isDimmed = activeId != null && !isActive
              const outerR = isActive ? OUTER_R + 5 : OUTER_R

              return (
                <path
                  key={segment.categoryId}
                  d={describeDonutSegment(CX, CY, INNER_R, outerR, segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  className="cursor-pointer transition-[opacity,transform] duration-150 ease-out"
                  style={{
                    opacity: isDimmed ? 0.28 : 1,
                    transformOrigin: `${CX}px ${CY}px`,
                  }}
                  onMouseEnter={() => setHoveredId(segment.categoryId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setFocusedId(segment.categoryId)}
                  onBlur={() => setFocusedId(null)}
                  tabIndex={0}
                  aria-label={`${segment.categoryName}: ${formatInr(segment.amount)}, ${Math.round(segment.percent)} percent`}
                />
              )
            })}
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {activeSegment ? activeSegment.categoryName : centerLabel}
            </p>
            <Amount
              value={activeSegment?.amount ?? total}
              className="mt-1 text-xl sm:text-2xl"
            />
            {activeSegment ? (
              <p className="mt-0.5 text-xs text-text-secondary">
                {Math.round(activeSegment.percent)}% of {totalLabel.toLowerCase()}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-text-secondary">{totalLabel}</p>
            )}
          </div>

          {activeSegment && hoveredId ? (
            <div
              className="xp-summary-chart-tooltip pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full"
              role="tooltip"
              id={`${chartId}-tooltip`}
            >
              <p className="font-medium text-text-primary">{activeSegment.categoryName}</p>
              <p className="mt-0.5 text-sm text-text-secondary">
                <Amount value={activeSegment.amount} className="text-sm" /> ·{' '}
                {Math.round(activeSegment.percent)}%
              </p>
            </div>
          ) : null}
        </div>

        {showLegend && (
          <ul className="min-w-0 flex-1 space-y-2" aria-label="Category legend">
            {segments.map((segment) => {
              const isActive = activeId === segment.categoryId

              return (
                <li key={segment.categoryId}>
                  <button
                    type="button"
                    className={cn(
                      'xp-summary-legend-item w-full min-h-11',
                      isActive && 'xp-summary-legend-item-active',
                    )}
                    onMouseEnter={() => setHoveredId(segment.categoryId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setFocusedId(segment.categoryId)}
                    onBlur={() => setFocusedId(null)}
                    aria-describedby={
                      hoveredId === segment.categoryId ? `${chartId}-tooltip` : undefined
                    }
                  >
                    <ChartLegendMarker color={segment.color} iconKey={segment.categoryIcon} />
                    <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-text-primary">
                      {segment.categoryName}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted">
                      {Math.round(segment.percent)}%
                    </span>
                    <Amount value={segment.amount} className="shrink-0 text-sm" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
