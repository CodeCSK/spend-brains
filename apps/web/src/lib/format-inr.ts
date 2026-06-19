/** Indian Rupee symbol — use for inputs and with `formatInr` output. */
export const INR_SYMBOL = '₹'

const inrNumberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/**
 * Format an API amount (number or decimal string) as Indian Rupees with ₹ prefix.
 * Pair with `.tabular-amount` in JSX for aligned columns.
 */
export function formatInr(amount: number | string): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (!Number.isFinite(value)) {
    return `${INR_SYMBOL}—`
  }
  return `${INR_SYMBOL}${inrNumberFormatter.format(Math.abs(value))}`
}

/** CSS class for rupee columns — tabular figures + slight tracking. */
export const TABULAR_AMOUNT_CLASS = 'tabular-amount'
