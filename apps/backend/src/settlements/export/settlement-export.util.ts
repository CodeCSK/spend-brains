/**
 * Settlement PNG export source (SVG). Payment lines only — who pays who.
 */

export interface SettlementExportLine {
  from: string;
  to: string;
  amount: string;
}

export interface SettlementExportData {
  eventName: string;
  generatedAt: Date;
  lines: SettlementExportLine[];
}

const W = 640;
const PAD = 24;
const INNER = W - PAD * 2;
const ROW_H = 52;
const HEADER_H = 96;
const FOOTER_H = 36;

const C = {
  primary: '#6a428a',
  primaryLight: '#9d75bd',
  primarySoft: '#f3eef7',
  page: '#f5f5f5',
  card: '#ffffff',
  border: '#e5e5e5',
  text: '#171717',
  label: '#262626',
  muted: '#525252',
  faint: '#737373',
  rowAlt: '#fafafa',
  tableHead: '#f5f5f5',
} as const;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: string): string {
  return `\u20B9${inrFormatter.format(Math.abs(parseAmount(value)))}`;
}

function formatGeneratedDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function t(
  x: number,
  y: number,
  text: string,
  opts: {
    size?: number;
    weight?: number | string;
    fill?: string;
    anchor?: 'start' | 'middle' | 'end';
  } = {},
): string {
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : '';
  return `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${opts.size ?? 13}" font-weight="${opts.weight ?? 400}" fill="${opts.fill ?? C.text}"${anchor}>${escapeXml(text)}</text>`;
}

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string,
  radius = 12,
): string {
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="1"` : '';
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${fill}"${strokeAttr}/>`;
}

function paymentRow(
  y: number,
  from: string,
  to: string,
  amount: string,
  striped: boolean,
): string {
  const left = PAD;
  const rowTop = y;
  const midY = rowTop + 31;
  const parts: string[] = [];

  if (striped) {
    parts.push(rect(left + 1, rowTop, INNER - 2, ROW_H, C.rowAlt, undefined, 0));
  }

  parts.push(t(left + 16, midY, truncate(from, 18), { size: 14, weight: 600 }));
  parts.push(t(left + 148, midY, 'pays', { size: 12, fill: C.muted, anchor: 'middle' }));
  parts.push(t(left + 168, midY, truncate(to, 18), { size: 14, weight: 600 }));
  parts.push(t(left + INNER - 16, midY, formatAmount(amount), {
    size: 17,
    weight: 700,
    anchor: 'end',
  }));

  return parts.join('\n  ');
}

export function buildSettlementSvg(data: SettlementExportData): string {
  const tableHeaderH = 32;
  const bodyRows = Math.max(data.lines.length, 1);
  const tableH = tableHeaderH + bodyRows * ROW_H + 8;
  const height = PAD + HEADER_H + 28 + tableH + FOOTER_H + PAD;

  const listTop = PAD + HEADER_H + 28;

  let paymentLines = '';
  if (data.lines.length === 0) {
    paymentLines = t(PAD + 16, listTop + tableHeaderH + 30, 'Everyone is settled up.', {
      size: 14,
      fill: C.muted,
    });
  } else {
    paymentLines = data.lines
      .map((line, index) =>
        paymentRow(
          listTop + tableHeaderH + index * ROW_H,
          line.from,
          line.to,
          line.amount,
          index % 2 === 1,
        ),
      )
      .join('\n  ');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">
  <defs>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.primary}"/>
      <stop offset="100%" stop-color="${C.primaryLight}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${height}" fill="${C.page}"/>
  ${rect(PAD - 2, PAD - 2, INNER + 4, height - PAD * 2 + 4, C.card, C.border, 16)}

  <rect x="${PAD}" y="${PAD}" width="${INNER}" height="${HEADER_H}" fill="url(#headerGrad)" rx="12" ry="12"/>
  ${t(PAD + 16, PAD + 24, 'SpendBrains', { size: 11, weight: 600, fill: C.primarySoft })}
  ${t(PAD + 16, PAD + 50, truncate(data.eventName, 34), { size: 20, weight: 700, fill: '#ffffff' })}
  ${t(PAD + 16, PAD + 72, 'Who pays who', { size: 12, fill: '#ece4f4' })}
  ${t(PAD + INNER - 16, PAD + 72, formatGeneratedDate(data.generatedAt), {
    size: 11,
    fill: '#ece4f4',
    anchor: 'end',
  })}

  ${t(PAD, listTop + 18, 'Payments', { size: 14, weight: 700, fill: C.label })}
  ${rect(PAD, listTop + 24, INNER, tableH, C.card, C.border, 12)}
  ${rect(PAD, listTop + 24, INNER, tableHeaderH, C.tableHead, C.border, 12)}
  ${t(PAD + 16, listTop + 44, 'FROM', { size: 10, weight: 700, fill: C.faint })}
  ${t(PAD + 168, listTop + 44, 'TO', { size: 10, weight: 700, fill: C.faint })}
  ${t(PAD + INNER - 16, listTop + 44, 'AMOUNT', { size: 10, weight: 700, fill: C.faint, anchor: 'end' })}

  ${paymentLines}

  ${t(W / 2, height - 14, 'SpendBrains', { size: 10, fill: C.faint, anchor: 'middle' })}
</svg>`;
}

export function buildExportFilename(eventName: string): string {
  const slug =
    eventName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'event';

  const date = new Date().toISOString().slice(0, 10);
  return `${slug}-payments-${date}.png`;
}
