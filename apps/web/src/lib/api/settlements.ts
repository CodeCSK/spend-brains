import type { MemberBalance, SettlementExportFormat, SettlementLine, SettlementSummary } from '../../types/settlement'
import { apiFetch, apiFetchBlob } from './client'

export function getMemberSummaries(eventId: string): Promise<MemberBalance[]> {
  return apiFetch<MemberBalance[]>(
    `/v1/events/${encodeURIComponent(eventId)}/summaries`,
    {
      method: 'GET',
      auth: true,
    },
  )
}

export function getSettlements(eventId: string): Promise<SettlementSummary> {
  return apiFetch<SettlementSummary>(
    `/v1/events/${encodeURIComponent(eventId)}/settlements`,
    {
      method: 'GET',
      auth: true,
    },
  )
}

export function settleLine(eventId: string, lineId: string): Promise<SettlementLine> {
  return apiFetch<SettlementLine>(
    `/v1/events/${encodeURIComponent(eventId)}/settlements/${encodeURIComponent(lineId)}/settle`,
    {
      method: 'POST',
      auth: true,
    },
  )
}

export function unsettleLine(eventId: string, lineId: string): Promise<SettlementLine> {
  return apiFetch<SettlementLine>(
    `/v1/events/${encodeURIComponent(eventId)}/settlements/${encodeURIComponent(lineId)}/unsettle`,
    {
      method: 'POST',
      auth: true,
    },
  )
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function exportSettlement(
  eventId: string,
  format: SettlementExportFormat,
): Promise<void> {
  const blob = await apiFetchBlob(
    `/v1/events/${encodeURIComponent(eventId)}/settlements/export?format=${format}`,
    { auth: true },
  )
  downloadBlob(blob, format === 'pdf' ? 'settlement.pdf' : 'settlement.svg')
}
