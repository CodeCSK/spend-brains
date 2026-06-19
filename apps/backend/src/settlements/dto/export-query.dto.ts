import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SettlementExportFormat {
  Image = 'image',
}

export class ExportQueryDto {
  @ApiPropertyOptional({
    enum: SettlementExportFormat,
    default: SettlementExportFormat.Image,
  })
  @IsOptional()
  @IsEnum(SettlementExportFormat)
  format: SettlementExportFormat = SettlementExportFormat.Image;
}
