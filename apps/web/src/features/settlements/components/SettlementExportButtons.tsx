import { useMutation } from '@tanstack/react-query'
import { FileImage, FileText } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { Button } from '../../../components/ui'
import { ApiError, exportSettlement } from '../../../lib/api'
import { useToast } from '../../../lib/store/useToast'
import type { SettlementExportFormat } from '../../../types/settlement'

type SettlementExportActionsProps = {
  eventId: string
  className?: string
}

export function SettlementExportActions({ eventId, className }: SettlementExportActionsProps) {
  const toast = useToast()

  const exportMutation = useMutation({
    mutationFn: (format: SettlementExportFormat) => exportSettlement(eventId, format),
    onSuccess: (_data, format) => {
      toast.success(format === 'pdf' ? 'PDF downloaded.' : 'Image saved as PNG.')
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : error.message ?? 'Export failed'
      toast.error(message)
    },
  })

  const isPdfExporting = exportMutation.isPending && exportMutation.variables === 'pdf'
  const isImageExporting = exportMutation.isPending && exportMutation.variables === 'image'

  return (
    <div className={className ?? 'flex flex-wrap gap-2'}>
      <Button
        type="button"
        variant="secondary"
        className="h-8 px-2.5 text-xs sm:text-sm"
        loading={isPdfExporting}
        disabled={exportMutation.isPending}
        onClick={() => exportMutation.mutate('pdf')}
      >
        <Icon icon={FileText} size={16} aria-hidden />
        Download PDF
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="h-8 px-2.5 text-xs sm:text-sm"
        loading={isImageExporting}
        disabled={exportMutation.isPending}
        onClick={() => exportMutation.mutate('image')}
      >
        <Icon icon={FileImage} size={16} aria-hidden />
        Save PNG
      </Button>
    </div>
  )
}
