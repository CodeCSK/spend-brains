const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/**
 * Format an API amount (number or decimal string) as Indian Rupees.
 * Pair with `.tabular-amount` in JSX for aligned columns.
 */
export function formatInr(amount: number | string): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (!Number.isFinite(value)) {
    return '₹—'
  }
  return inrFormatter.format(value)
}

/** CSS class for rupee columns — tabular figures + slight tracking. */
export const TABULAR_AMOUNT_CLASS = 'tabular-amount'
