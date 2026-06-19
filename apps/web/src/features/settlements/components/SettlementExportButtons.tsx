import { useMutation } from '@tanstack/react-query'
import { FileImage } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { Button } from '../../../components/ui'
import { ApiError, exportSettlement } from '../../../lib/api'
import { useToast } from '../../../lib/store/useToast'

type SettlementExportActionsProps = {
  eventId: string
  className?: string
}

export function SettlementExportActions({ eventId, className }: SettlementExportActionsProps) {
  const toast = useToast()

  const exportMutation = useMutation({
    mutationFn: () => exportSettlement(eventId),
    onSuccess: () => {
      toast.success('PNG saved.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : error.message ?? 'Export failed'
      toast.error(message)
    },
  })

  return (
    <div className={className ?? 'flex flex-wrap gap-2'}>
      <Button
        type="button"
        variant="secondary"
        className="h-8 px-2.5 text-xs sm:text-sm"
        loading={exportMutation.isPending}
        disabled={exportMutation.isPending}
        onClick={() => exportMutation.mutate()}
      >
        <Icon icon={FileImage} size={16} aria-hidden />
        Save PNG
      </Button>
    </div>
  )
}
