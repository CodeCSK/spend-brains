export const SETTLEMENT_STATUSES = ['unsettled', 'partial', 'settled'] as const

export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number]

export type MemberBalance = {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  totalPaid: string
  totalShare: string
  netBalance: string
}

export type SettlementLine = {
  id: string
  fromUserId: string
  fromDisplayName: string | null
  toUserId: string
  toDisplayName: string | null
  amount: string
  isSettled: boolean
  settledBy: string | null
  settledAt: string | null
}

export type SettlementSummary = {
  totalSpent: string
  settledAmount: string
  outstandingAmount: string
  status: SettlementStatus
  settledCount: number
  totalCount: number
  lines: SettlementLine[]
  balances: MemberBalance[]
}

export type SettlementExportFormat = 'pdf' | 'image'
