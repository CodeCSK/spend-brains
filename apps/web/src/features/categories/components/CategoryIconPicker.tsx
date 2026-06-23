import { cn } from '../../../lib/cn'
import {
  CATEGORY_ICON_ARIA_LABELS,
  CATEGORY_ICON_KEYS,
  type CategoryIconKey,
} from '../lib/category-icons'
import { CategoryIcon } from './CategoryIcon'

type CategoryIconPickerProps = {
  value: CategoryIconKey
  onChange: (key: CategoryIconKey) => void
  name?: string
}

export function CategoryIconPicker({ value, onChange, name }: CategoryIconPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Category icon">
      {CATEGORY_ICON_KEYS.map((key) => {
        const selected = value === key
        return (
          <label
            key={key}
            className={cn(
              'xp-category-icon-option',
              selected && 'xp-category-icon-option-selected',
            )}
            aria-label={CATEGORY_ICON_ARIA_LABELS[key]}
          >
            <input
              type="radio"
              name={name}
              value={key}
              checked={selected}
              className="sr-only"
              onChange={() => onChange(key)}
            />
            <CategoryIcon iconKey={key} size={20} variant="badge" />
          </label>
        )
      })}
    </div>
  )
}
