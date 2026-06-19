import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SettlementExportFormat {
  Pdf = 'pdf',
  Image = 'image',
}

export class ExportQueryDto {
  @ApiPropertyOptional({
    enum: SettlementExportFormat,
    default: SettlementExportFormat.Pdf,
  })
  @IsOptional()
  @IsEnum(SettlementExportFormat)
  format: SettlementExportFormat = SettlementExportFormat.Pdf;
}
