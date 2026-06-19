import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Amount, Badge } from '../../../components/ui'
import { ApiError, settleLine, unsettleLine } from '../../../lib/api'
import { settlementKeys } from '../../../lib/query-keys'
import { useToast } from '../../../lib/store/useToast'
import type { SettlementLine } from '../../../types/settlement'
import { memberDisplayName } from '../lib/settlement-labels'

type SettlementLineRowProps = {
  eventId: string
  line: SettlementLine
  canManage: boolean
}

export function SettlementLineRow({ eventId, line, canManage }: SettlementLineRowProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [actionError, setActionError] = useState<string | null>(null)

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: settlementKeys.summary(eventId) })
  }

  const settleMutation = useMutation({
    mutationFn: () => settleLine(eventId, line.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Payment marked settled.')
      await invalidate()
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to mark settled')
    },
  })

  const unsettleMutation = useMutation({
    mutationFn: () => unsettleLine(eventId, line.id),
    onSuccess: async () => {
      setActionError(null)
      toast.success('Payment unsettled.')
      await invalidate()
    },
    onError: (error) => {
      setActionError(error instanceof ApiError ? error.message : 'Failed to unsettle')
    },
  })

  const isPending = settleMutation.isPending || unsettleMutation.isPending
  const fromName = memberDisplayName(line.fromDisplayName)
  const toName = memberDisplayName(line.toDisplayName)

  return (
    <li className="xp-compact-list-row flex-wrap sm:flex-nowrap">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <p className="min-w-0 truncate text-sm">
          <span className="font-medium text-text-primary">{fromName}</span>
          <Icon
            icon={ArrowRight}
            size={16}
            className="mx-0.5 inline-block shrink-0 text-text-muted"
            aria-hidden
          />
          <span className="font-medium text-text-primary">{toName}</span>
        </p>
      </div>

      <Amount value={line.amount} tone="neutral" className="shrink-0 text-sm" />

      {line.isSettled ? (
        <Badge variant="success" className="shrink-0 px-1.5 py-0 text-[10px]">
          Done
        </Badge>
      ) : (
        <Badge variant="warning" className="shrink-0 px-1.5 py-0 text-[10px]">
          Due
        </Badge>
      )}

      {canManage && (
        <div className="flex shrink-0 items-center gap-0.5">
          {!line.isSettled && (
            <button
              type="button"
              className="xp-icon-btn-sm text-success-text hover:bg-success-bg"
              aria-label={`Mark ${fromName} pays ${toName} as settled`}
              disabled={isPending}
              onClick={() => settleMutation.mutate()}
            >
              <Icon icon={Check} size={16} aria-hidden />
            </button>
          )}
          {line.isSettled && (
            <button
              type="button"
              className="xp-icon-btn-sm"
              aria-label={`Unsettle payment from ${fromName} to ${toName}`}
              disabled={isPending}
              onClick={() => unsettleMutation.mutate()}
            >
              <Icon icon={RotateCcw} size={16} aria-hidden />
            </button>
          )}
        </div>
      )}

      {actionError && (
        <p className="w-full basis-full text-xs text-error-text">{actionError}</p>
      )}
    </li>
  )
}
