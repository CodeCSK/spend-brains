/**
 * Dependency-free settlement exporters (PDF + SVG).
 * Structured layout with summary stats, balance table, and payment lines.
 */

export interface SettlementExportBalance {
  name: string;
  paid: string;
  share: string;
  net: string;
}

export interface SettlementExportLine {
  from: string;
  to: string;
  amount: string;
  settled: boolean;
}

export interface SettlementExportData {
  eventName: string;
  generatedAt: Date;
  statusLabel: string;
  settledCount: number;
  totalCount: number;
  totalSpent: string;
  settledAmount: string;
  outstandingAmount: string;
  balances: SettlementExportBalance[];
  lines: SettlementExportLine[];
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 52;

const COLORS = {
  primary: '#6a428a',
  page: '#fafafa',
  card: '#ffffff',
  border: '#e5e5e5',
  text: '#171717',
  muted: '#525252',
  faint: '#737373',
  success: '#065f46',
  successBg: '#ecfdf5',
  error: '#7f1d1d',
  errorBg: '#fef2f2',
  warning: '#92400e',
  warningBg: '#fffbeb',
  info: '#3730a3',
  infoBg: '#eef2ff',
} as const;

const inrFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatIndianNumber(value: string | number): string {
  const numeric = typeof value === 'number' ? value : parseAmount(value);
  return inrFormatter.format(Math.abs(numeric));
}

function formatPdfAmount(value: string): string {
  return `Rs. ${formatIndianNumber(value)}`;
}

function formatSvgAmount(value: string): string {
  return `\u20B9${formatIndianNumber(value)}`;
}

function formatNetLabel(net: string, currency: 'pdf' | 'svg'): string {
  const value = parseAmount(net);
  const amount =
    currency === 'pdf' ? formatPdfAmount(net) : formatSvgAmount(net);

  if (value === 0) return 'Even';
  if (value > 0) return `Gets ${amount}`;
  return `Owes ${amount}`;
}

function formatGeneratedDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/** Strip to printable ASCII for PDF base-14 fonts. */
function toPdfAscii(text: string): string {
  return text
    .replace(/\u20B9/g, 'Rs. ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

function statusColors(statusLabel: string): { fill: string; text: string } {
  const lower = statusLabel.toLowerCase();
  if (lower.includes('all settled')) {
    return { fill: COLORS.successBg, text: COLORS.success };
  }
  if (lower.includes('partial')) {
    return { fill: COLORS.warningBg, text: COLORS.warning };
  }
  return { fill: COLORS.infoBg, text: COLORS.info };
}

type PdfDraw = {
  x: number;
  y: number;
  text: string;
  size: number;
  bold?: boolean;
};

type PdfLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type PdfPageContent = {
  draws: PdfDraw[];
  lines: PdfLine[];
};

class PdfLayout {
  private pages: PdfPageContent[] = [{ draws: [], lines: [] }];
  private y = PAGE_HEIGHT - MARGIN_TOP;

  private ensureSpace(height: number): void {
    if (this.y - height >= MARGIN_BOTTOM) return;
    this.pages.push({ draws: [], lines: [] });
    this.y = PAGE_HEIGHT - MARGIN_TOP;
  }

  private drawLine(y: number, x1 = MARGIN_X, x2 = PAGE_WIDTH - MARGIN_X): void {
    this.pages[this.pages.length - 1].lines.push({ x1, y1: y, x2, y2: y });
  }

  text(
    text: string,
    opts: { size?: number; bold?: boolean; x?: number; gap?: number } = {},
  ): void {
    const size = opts.size ?? 10;
    const gap = opts.gap ?? size + 4;
    this.ensureSpace(gap);
    this.pages[this.pages.length - 1].draws.push({
      x: opts.x ?? MARGIN_X,
      y: this.y,
      text: toPdfAscii(text),
      size,
      bold: opts.bold,
    });
    this.y -= gap;
  }

  blank(gap = 8): void {
    this.ensureSpace(gap);
    this.y -= gap;
  }

  rule(): void {
    this.ensureSpace(10);
    this.drawLine(this.y);
    this.y -= 10;
  }

  tableHeader(cells: string[], xs: number[]): void {
    this.ensureSpace(16);
    const page = this.pages[this.pages.length - 1];
    cells.forEach((cell, index) => {
      page.draws.push({
        x: xs[index] ?? MARGIN_X,
        y: this.y,
        text: toPdfAscii(cell),
        size: 9,
        bold: true,
      });
    });
    this.y -= 12;
    this.drawLine(this.y + 4);
    this.y -= 8;
  }

  tableRow(cells: string[], xs: number[]): void {
    this.ensureSpace(14);
    const page = this.pages[this.pages.length - 1];
    cells.forEach((cell, index) => {
      page.draws.push({
        x: xs[index] ?? MARGIN_X,
        y: this.y,
        text: toPdfAscii(cell),
        size: 10,
      });
    });
    this.y -= 14;
  }

  footer(pageIndex: number, pageCount: number): void {
    const footerY = MARGIN_BOTTOM - 8;
    const page = this.pages[pageIndex];
    page.draws.push({
      x: MARGIN_X,
      y: footerY,
      text: 'Generated by SpendBrains',
      size: 8,
    });
    page.draws.push({
      x: PAGE_WIDTH - MARGIN_X - 70,
      y: footerY,
      text: `Page ${pageIndex + 1} of ${pageCount}`,
      size: 8,
    });
  }

  build(): PdfPageContent[] {
    return this.pages;
  }
}

function pageStream(page: PdfPageContent): string {
  const parts: string[] = [];

  for (const line of page.lines) {
    parts.push(`${line.x1} ${line.y1} m ${line.x2} ${line.y2} l S`);
  }

  for (const draw of page.draws) {
    parts.push('BT');
    parts.push(`/F1 ${draw.size} Tf`);
    parts.push(`1 0 0 1 ${draw.x} ${draw.y} Tm`);
    parts.push(`(${escapePdfText(draw.text)}) Tj`);
    parts.push('ET');
  }

  return parts.join('\n');
}

function assemblePdf(pages: PdfPageContent[]): Buffer {
  const pageCount = pages.length;
  const pageObjStart = 4;
  const contentObjStart = 4 + pageCount;

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');

  const kids = Array.from(
    { length: pageCount },
    (_, index) => `${pageObjStart + index} 0 R`,
  );
  objects.push(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageCount} >>`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  pages.forEach((_page, index) => {
    const contentObj = contentObjStart + index;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObj} 0 R >>`,
    );
  });

  pages.forEach((page) => {
    const stream = pageStream(page);
    objects.push(
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

function buildPdfLayout(data: SettlementExportData): PdfPageContent[] {
  const layout = new PdfLayout();
  const balanceCols = [MARGIN_X, MARGIN_X + 130, MARGIN_X + 240, MARGIN_X + 350];
  const lineCols = [MARGIN_X, MARGIN_X + 150, MARGIN_X + 300, MARGIN_X + 420];

  layout.text('SpendBrains', { size: 9, gap: 12 });
  layout.text(data.eventName, { size: 18, bold: true, gap: 22 });
  layout.text(
    `Settlement summary · Generated ${formatGeneratedDate(data.generatedAt)}`,
    { size: 10, gap: 14 },
  );
  layout.text(
    `${data.statusLabel} · ${data.settledCount} of ${data.totalCount} payment line${data.totalCount === 1 ? '' : 's'} settled`,
    { size: 10, gap: 18 },
  );

  layout.tableRow(
    [
      'Total spent',
      'Settled',
      'Outstanding',
    ],
    [MARGIN_X, MARGIN_X + 170, MARGIN_X + 320],
  );
  layout.tableRow(
    [
      formatPdfAmount(data.totalSpent),
      formatPdfAmount(data.settledAmount),
      formatPdfAmount(data.outstandingAmount),
    ],
    [MARGIN_X, MARGIN_X + 170, MARGIN_X + 320],
  );
  layout.blank(10);

  layout.text('Member balances', { size: 12, bold: true, gap: 16 });
  layout.tableHeader(['Member', 'Paid', 'Share', 'Net'], balanceCols);

  if (data.balances.length === 0) {
    layout.text('No members yet.', { size: 10 });
  } else {
    for (const balance of data.balances) {
      layout.tableRow(
        [
          truncate(balance.name, 18),
          formatPdfAmount(balance.paid),
          formatPdfAmount(balance.share),
          formatNetLabel(balance.net, 'pdf'),
        ],
        balanceCols,
      );
    }
  }

  layout.blank(8);
  layout.text('Suggested payments', { size: 12, bold: true, gap: 16 });
  layout.tableHeader(['From', 'To', 'Amount', 'Status'], lineCols);

  if (data.lines.length === 0) {
    layout.text('Nothing to settle — everyone is even.', { size: 10 });
  } else {
    for (const line of data.lines) {
      layout.tableRow(
        [
          truncate(line.from, 16),
          truncate(line.to, 16),
          formatPdfAmount(line.amount),
          line.settled ? 'Settled' : 'Pending',
        ],
        lineCols,
      );
    }
  }

  const pages = layout.build();
  pages.forEach((_, index) => layout.footer(index, pages.length));
  return pages;
}

export function buildSettlementPdf(data: SettlementExportData): Buffer {
  return assemblePdf(buildPdfLayout(data));
}

function svgText(
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
  const size = opts.size ?? 13;
  const weight = opts.weight ?? 400;
  const fill = opts.fill ?? COLORS.text;
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : '';
  return `<text x="${x}" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${escapeXml(text)}</text>`;
}

function svgRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string,
  radius = 10,
): string {
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="1"` : '';
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${fill}"${strokeAttr}/>`;
}

function buildSvgStatCard(
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  valueColor: string,
): string {
  return `
  ${svgRect(x, y, width, 68, COLORS.card, COLORS.border, 12)}
  ${svgText(x + 14, y + 24, label.toUpperCase(), { size: 10, fill: COLORS.faint, weight: 600 })}
  ${svgText(x + 14, y + 52, value, { size: 18, fill: valueColor, weight: 700 })}`;
}

function buildSvgTableRow(
  y: number,
  cells: string[],
  xs: number[],
  opts: { header?: boolean; fill?: string; valueColors?: string[] } = {},
): string {
  const rowHeight = opts.header ? 28 : 34;
  const parts: string[] = [];

  if (opts.fill) {
    parts.push(
      svgRect(32, y - 18, 656, rowHeight, opts.fill, undefined, 8),
    );
  }

  cells.forEach((cell, index) => {
    parts.push(
      svgText(xs[index] ?? 44, y, cell, {
        size: opts.header ? 10 : 13,
        weight: opts.header ? 700 : 500,
        fill: opts.header ? COLORS.faint : opts.valueColors?.[index] ?? COLORS.text,
      }),
    );
  });

  return parts.join('\n  ');
}

export function buildSettlementSvg(data: SettlementExportData): string {
  const width = 720;
  const statsHeight = 88;
  const balancesSection =
    56 + 28 + Math.max(data.balances.length, 1) * 34 + 24;
  const linesSection = 56 + 28 + Math.max(data.lines.length, 1) * 34 + 24;
  const height = 88 + 44 + statsHeight + balancesSection + linesSection + 48;

  const status = statusColors(data.statusLabel);
  const balanceCols = [44, 220, 360, 500];
  const lineCols = [44, 220, 360, 560];

  let cursorY = 112;

  const statCards = [
    buildSvgStatCard(32, cursorY, 208, 'Total spent', formatSvgAmount(data.totalSpent), COLORS.text),
    buildSvgStatCard(
      256,
      cursorY,
      208,
      'Settled',
      formatSvgAmount(data.settledAmount),
      COLORS.success,
    ),
    buildSvgStatCard(
      480,
      cursorY,
      208,
      'Outstanding',
      formatSvgAmount(data.outstandingAmount),
      COLORS.error,
    ),
  ].join('\n  ');

  cursorY += statsHeight + 24;

  const balanceRows =
    data.balances.length === 0
      ? buildSvgTableRow(cursorY + 28, ['No members yet.'], [44])
      : data.balances
          .map((balance, index) => {
            const y = cursorY + 28 + index * 34;
            const netValue = parseAmount(balance.net);
            const netColor =
              netValue > 0 ? COLORS.success : netValue < 0 ? COLORS.error : COLORS.muted;
            return buildSvgTableRow(
              y,
              [
                truncate(balance.name, 22),
                formatSvgAmount(balance.paid),
                formatSvgAmount(balance.share),
                formatNetLabel(balance.net, 'svg'),
              ],
              balanceCols,
              {
                fill: index % 2 === 0 ? '#ffffff' : '#fcfcfc',
                valueColors: [COLORS.text, COLORS.muted, COLORS.muted, netColor],
              },
            );
          })
          .join('\n  ');

  const balancesTop = cursorY;
  cursorY += balancesSection;

  const paymentRows =
    data.lines.length === 0
      ? buildSvgTableRow(cursorY + 28, ['Nothing to settle — everyone is even.'], [44], {
          fill: '#fcfcfc',
        })
      : data.lines
          .map((line, index) => {
            const y = cursorY + 28 + index * 34;
            return buildSvgTableRow(
              y,
              [
                truncate(line.from, 18),
                truncate(line.to, 18),
                formatSvgAmount(line.amount),
                line.settled ? 'Settled' : 'Pending',
              ],
              lineCols,
              {
                fill: index % 2 === 0 ? '#ffffff' : '#fcfcfc',
                valueColors: [
                  COLORS.text,
                  COLORS.text,
                  COLORS.text,
                  line.settled ? COLORS.success : COLORS.error,
                ],
              },
            );
          })
          .join('\n  ');

  const linesTop = cursorY;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.page}"/>
  <rect width="${width}" height="72" fill="${COLORS.primary}"/>
  ${svgText(32, 30, 'SpendBrains', { size: 12, fill: '#f3eef7', weight: 600 })}
  ${svgText(32, 56, truncate(data.eventName, 42), { size: 22, fill: '#ffffff', weight: 700 })}

  ${svgText(32, 92, `Generated ${formatGeneratedDate(data.generatedAt)}`, { size: 12, fill: COLORS.muted })}
  ${svgRect(532, 78, 156, 24, status.fill, COLORS.border, 999)}
  ${svgText(610, 94, truncate(data.statusLabel, 20), { size: 10, fill: status.text, weight: 700, anchor: 'middle' })}
  ${svgText(32, 108, `${data.settledCount} of ${data.totalCount} payment line${data.totalCount === 1 ? '' : 's'} settled`, {
    size: 11,
    fill: COLORS.muted,
  })}

  ${statCards}

  ${svgText(32, balancesTop + 18, 'Member balances', { size: 15, weight: 700 })}
  ${svgRect(32, balancesTop + 24, 656, 1, COLORS.border, undefined, 0)}
  ${buildSvgTableRow(balancesTop + 48, ['Member', 'Paid', 'Share', 'Net'], balanceCols, { header: true })}
  ${balanceRows}

  ${svgText(32, linesTop + 18, 'Suggested payments', { size: 15, weight: 700 })}
  ${svgRect(32, linesTop + 24, 656, 1, COLORS.border, undefined, 0)}
  ${buildSvgTableRow(linesTop + 48, ['From', 'To', 'Amount', 'Status'], lineCols, { header: true })}
  ${paymentRows}

  ${svgText(width / 2, height - 18, 'Exported from SpendBrains', {
    size: 11,
    fill: COLORS.faint,
    anchor: 'middle',
  })}
</svg>`;
}

export function buildExportFilename(eventName: string, format: 'pdf' | 'image'): string {
  const slug =
    eventName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'event';

  const date = new Date().toISOString().slice(0, 10);
  return format === 'pdf'
    ? `${slug}-settlement-${date}.pdf`
    : `${slug}-settlement-${date}.png`;
}

/** @deprecated Used by legacy tests — prefer structured export layout. */
export function buildSettlementLines(data: SettlementExportData): string[] {
  const lines: string[] = [];
  lines.push(data.eventName);
  lines.push(`Generated ${formatGeneratedDate(data.generatedAt)}`);
  lines.push(`${data.statusLabel} · ${data.settledCount}/${data.totalCount} lines settled`);
  lines.push('');
  lines.push(`Total spent: ${formatPdfAmount(data.totalSpent)}`);
  lines.push(`Settled: ${formatPdfAmount(data.settledAmount)}`);
  lines.push(`Outstanding: ${formatPdfAmount(data.outstandingAmount)}`);
  lines.push('');
  lines.push('Member balances');
  for (const balance of data.balances) {
    lines.push(
      `  ${balance.name}: paid ${formatPdfAmount(balance.paid)}, share ${formatPdfAmount(balance.share)}, net ${formatNetLabel(balance.net, 'pdf')}`,
    );
  }
  lines.push('');
  lines.push('Suggested payments');
  if (data.lines.length === 0) {
    lines.push('  Nothing to settle');
  }
  for (const line of data.lines) {
    lines.push(
      `  ${line.from} → ${line.to}: ${formatPdfAmount(line.amount)} (${line.settled ? 'settled' : 'pending'})`,
    );
  }
  return lines;
}
