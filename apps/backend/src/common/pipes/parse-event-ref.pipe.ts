import { Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveEventId } from '../ids/resolve-event-id';

@Injectable()
export class ParseEventRefPipe implements PipeTransform<string, Promise<string>> {
  constructor(private readonly prisma: PrismaService) {}

  transform(value: string): Promise<string> {
    return resolveEventId(this.prisma, value);
  }
}
