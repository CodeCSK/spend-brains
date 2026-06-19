import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { Icon } from '../../../components/Icon'
import { Badge, Button, Card } from '../../../components/ui'
import { ApiError, settleLine, unsettleLine } from '../../../lib/api'
import { formatInr, TABULAR_AMOUNT_CLASS } from '../../../lib/format-inr'
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
    <Card
      as="li"
      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="min-w-0">
        <p className="font-medium">
          {fromName} pays {toName}{' '}
          <span className={`${TABULAR_AMOUNT_CLASS} text-primary`}>
            {formatInr(line.amount)}
          </span>
        </p>
        {line.isSettled && line.settledAt && (
          <p className="mt-1 text-xs text-text-muted">
            Settled {new Date(line.settledAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {line.isSettled ? (
          <Badge variant="success">Settled</Badge>
        ) : (
          <Badge variant="info">Unsettled</Badge>
        )}

        {canManage && !line.isSettled && (
          <Button
            type="button"
            loading={settleMutation.isPending}
            disabled={isPending}
            onClick={() => settleMutation.mutate()}
          >
            <Icon icon={Check} size={20} aria-hidden />
            {settleMutation.isPending ? 'Saving…' : 'Mark settled'}
          </Button>
        )}

        {canManage && line.isSettled && (
          <Button
            type="button"
            variant="secondary"
            loading={unsettleMutation.isPending}
            disabled={isPending}
            onClick={() => unsettleMutation.mutate()}
          >
            <Icon icon={RotateCcw} size={20} aria-hidden />
            {unsettleMutation.isPending ? 'Saving…' : 'Unsettle'}
          </Button>
        )}
      </div>

      {actionError && <p className="w-full text-sm text-error-text">{actionError}</p>}
    </Card>
  )
}
