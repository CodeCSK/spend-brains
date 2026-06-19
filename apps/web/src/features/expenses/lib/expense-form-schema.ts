import { z } from 'zod'

import type { CreateExpensePayload, UpdateExpensePayload } from '../../../lib/api/expenses'

export const expenseFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description must be at most 500 characters'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => {
      const num = Number(value)
      return Number.isFinite(num) && num >= 0.01 && num <= 99_999_999.99
    }, 'Enter a valid amount between ₹0.01 and ₹99,999,999.99'),
  expenseDate: z.string().min(1, 'Date is required'),
  categoryId: z.string().uuid('Select a category'),
  paidBy: z.string().uuid('Select who paid'),
  sharedAmong: z
    .array(z.string().uuid())
    .min(1, 'Select at least one member to split among'),
  notes: z.string().max(2000, 'Notes must be at most 2000 characters').optional(),
})

export type ExpenseFormInput = z.input<typeof expenseFormSchema>
export type ExpenseFormValues = z.output<typeof expenseFormSchema>

export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toCreateExpensePayload(values: ExpenseFormValues): CreateExpensePayload {
  return {
    description: values.description.trim(),
    amount: Number(values.amount),
    expenseDate: values.expenseDate,
    categoryId: values.categoryId,
    paidBy: values.paidBy,
    sharedAmong: values.sharedAmong,
    notes: values.notes?.trim() || null,
  }
}

export function toUpdateExpensePayload(values: ExpenseFormValues): UpdateExpensePayload {
  return toCreateExpensePayload(values)
}
