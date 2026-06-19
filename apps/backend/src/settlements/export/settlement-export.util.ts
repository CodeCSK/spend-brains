/**
 * Dependency-free exporters for settlement details. We avoid native modules
 * (canvas/sharp) by hand-building a minimal valid PDF and an SVG image.
 * Exports cover settlement details only — not the full expense list.
 */

export interface SettlementExportData {
  eventName: string;
  generatedAt: Date;
  statusLabel: string;
  totalSpent: string;
  settledAmount: string;
  outstandingAmount: string;
  balances: { name: string; net: string }[];
  lines: { text: string; settled: boolean }[];
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/** Strip to printable ASCII; PDF base-14 Helvetica is WinAnsi only. */
function toAscii(text: string): string {
  return text.replace(/₹/g, 'Rs.').replace(/[^\x20-\x7E]/g, '');
}

export function buildSettlementLines(data: SettlementExportData): string[] {
  const lines: string[] = [];
  lines.push(`Event: ${data.eventName}`);
  lines.push(`Generated: ${data.generatedAt.toISOString().slice(0, 10)}`);
  lines.push('');
  lines.push(`Status: ${data.statusLabel}`);
  lines.push(`Total spent: Rs. ${data.totalSpent}`);
  lines.push(`Settled: Rs. ${data.settledAmount}`);
  lines.push(`Outstanding: Rs. ${data.outstandingAmount}`);
  lines.push('');
  lines.push('Balances');
  if (data.balances.length === 0) {
    lines.push('  (no members)');
  }
  for (const b of data.balances) {
    lines.push(`  ${b.name}: Rs. ${b.net}`);
  }
  lines.push('');
  lines.push('Payments');
  if (data.lines.length === 0) {
    lines.push('  Nothing to settle');
  }
  for (const l of data.lines) {
    lines.push(`  ${l.settled ? '[settled] ' : '[ ] '}${l.text}`);
  }
  return lines;
}

export function buildSettlementPdf(data: SettlementExportData): Buffer {
  const textLines = buildSettlementLines(data).map(toAscii);

  const contentParts: string[] = ['BT', '/F1 16 Tf', '50 800 Td'];
  contentParts.push(`(${escapePdfText(textLines[0] ?? '')}) Tj`);
  contentParts.push('/F1 11 Tf');
  for (let i = 1; i < textLines.length; i += 1) {
    contentParts.push('0 -16 Td');
    contentParts.push(`(${escapePdfText(textLines[i])}) Tj`);
  }
  contentParts.push('ET');
  const content = contentParts.join('\n');

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];

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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildSettlementSvg(data: SettlementExportData): string {
  const textLines = buildSettlementLines(data);
  const lineHeight = 22;
  const paddingTop = 50;
  const height = paddingTop + textLines.length * lineHeight + 30;
  const width = 640;

  const tspans = textLines
    .map((line, index) => {
      const y = paddingTop + index * lineHeight;
      const weight = index === 0 ? 'bold' : 'normal';
      const size = index === 0 ? 20 : 14;
      return `<text x="32" y="${y}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#1a1a2e">${escapeXml(line)}</text>`;
    })
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <rect width="${width}" height="8" fill="#5b8def"/>
  ${tspans}
</svg>`;
}
