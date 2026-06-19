export type ExpenseShare = {
  userId: string
  amount: string
}

export type Expense = {
  id: string
  eventId: string
  description: string
  amount: string
  paidBy: string
  categoryId: string
  expenseDate: string
  notes: string | null
  createdBy: string
  createdAt: string
  shares: ExpenseShare[]
}

export type ExpenseListParams = {
  page?: number
  limit?: number
  sort?: 'expenseDate' | 'amount' | 'createdAt' | 'description'
  order?: 'asc' | 'desc'
  categoryId?: string
  paidBy?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
