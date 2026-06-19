import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isEventUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Resolve route ref (UUID or 8-char join code) to internal event id. */
export async function resolveEventId(
  prisma: PrismaService,
  ref: string,
): Promise<string> {
  const trimmed = ref.trim();
  if (!trimmed) {
    throw new NotFoundException('Event not found');
  }

  if (isEventUuid(trimmed)) {
    return trimmed;
  }

  const event = await prisma.event.findUnique({
    where: { publicId: trimmed.toUpperCase() },
    select: { id: true },
  });
  if (!event) {
    throw new NotFoundException('Event not found');
  }
  return event.id;
}
