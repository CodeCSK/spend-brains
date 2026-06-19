import { useMutation } from '@tanstack/react-query'
import { Download, FileImage, FileText } from 'lucide-react'

import { Icon } from '../../../components/Icon'
import { Button, Card } from '../../../components/ui'
import { ApiError, exportSettlement } from '../../../lib/api'
import { useToast } from '../../../lib/store/useToast'
import type { SettlementExportFormat } from '../../../types/settlement'

type SettlementExportButtonsProps = {
  eventId: string
}

export function SettlementExportButtons({ eventId }: SettlementExportButtonsProps) {
  const toast = useToast()

  const exportMutation = useMutation({
    mutationFn: (format: SettlementExportFormat) => exportSettlement(eventId, format),
    onSuccess: (_data, format) => {
      toast.success(format === 'pdf' ? 'Settlement PDF exported.' : 'Settlement image exported.')
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
    <Card as="article">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-text-label">
        <Icon icon={Download} size={20} className="text-primary" aria-hidden />
        Export
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Download a snapshot of balances and payment lines.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          loading={isPdfExporting}
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate('pdf')}
        >
          <Icon icon={FileText} size={20} aria-hidden />
          {isPdfExporting ? 'Exporting…' : 'Export PDF'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={isImageExporting}
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate('image')}
        >
          <Icon icon={FileImage} size={20} aria-hidden />
          {isImageExporting ? 'Exporting…' : 'Export image'}
        </Button>
      </div>
    </Card>
  )
}
