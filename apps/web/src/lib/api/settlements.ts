import type { MemberBalance, SettlementLine, SettlementSummary } from '../../types/settlement'
import { apiFetch, apiFetchBlobResponse } from './client'

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
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function defaultExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `settlement-${date}.png`
}

async function svgBlobToPng(svgBlob: Blob): Promise<Blob> {
  const svgMarkup = await svgBlob.text()
  const svgUrl = URL.createObjectURL(
    new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }),
  )

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to render settlement image'))
      img.src = svgUrl
    })

    const width = image.naturalWidth || 640
    const height = image.naturalHeight || 900
    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas is unavailable in this browser')
    }

    context.scale(scale, scale)
    context.fillStyle = '#f5f5f5'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
          return
        }
        reject(new Error('Failed to encode PNG'))
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

function pngFilenameFromServerName(filename: string | undefined): string {
  if (!filename) return defaultExportFilename()
  if (filename.endsWith('.png')) return filename
  return filename.replace(/\.svg$/i, '.png')
}

export async function exportSettlement(eventId: string): Promise<void> {
  const { blob, filename } = await apiFetchBlobResponse(
    `/v1/events/${encodeURIComponent(eventId)}/settlements/export?format=image`,
    { auth: true },
  )

  const pngBlob = await svgBlobToPng(blob)
  downloadBlob(pngBlob, pngFilenameFromServerName(filename))
}
