/**
 * Friends beta seed — run against staging Neon:
 *
 * **Your event already exists (recommended):**
 *   cd apps/backend
 *   $env:DATABASE_URL="postgresql://..."
 *   $env:EVENT_PUBLIC_ID="ABCD1234"   # join code from your event Settings
 *   npm run seed:friends-beta
 *
 * **Or create a new demo event:**
 *   $env:CAPTAIN_PHONE="9751636813"
 *   npm run seed:friends-beta
 *
 * Skip sample expenses: $env:SEED_EXPENSES="false"
 */
import {
  EventType,
  EventVisibility,
  MemberRole,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { randomInt } from 'crypto';

const PUBLIC_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const FRIENDS = [
  { name: 'Akshy', phone: '9751636813' },
  { name: 'Kiruba', phone: '8940213173' },
  { name: 'Motta', phone: '9976756137' },
  { name: 'Machan', phone: '9597878977' },
  { name: 'Ool', phone: '8056827479' },
  { name: 'Shiva', phone: '9003844233' },
  { name: 'Surya', phone: '9159937526' },
  { name: 'Venky', phone: '9751163533' },
] as const;

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'food' },
  { name: 'Travel', icon: 'travel' },
  { name: 'Stay', icon: 'stay' },
  { name: 'Shopping', icon: 'shopping' },
  { name: 'Entertainment', icon: 'entertainment' },
  { name: 'Other', icon: 'other' },
] as const;

const EVENT_NAME = 'Friends Beta Trip';

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12
    ? `+${digits}`
    : `+91${digits.slice(-10)}`;
}

function otpSuffix(phone: string): string {
  return phone.replace(/\D/g, '').slice(-6);
}

function generatePublicId(): string {
  let id = '';
  for (let i = 0; i < 8; i += 1) {
    id += PUBLIC_ID_ALPHABET[randomInt(0, PUBLIC_ID_ALPHABET.length)];
  }
  return id;
}

function splitEqually(amount: number, count: number): Prisma.Decimal[] {
  const totalPaise = Math.round(amount * 100);
  const base = Math.floor(totalPaise / count);
  const remainder = totalPaise - base * count;
  return Array.from({ length: count }, (_, index) => {
    const paise = base + (index < remainder ? 1 : 0);
    return new Prisma.Decimal(paise).dividedBy(100);
  });
}

function decimalToPaise(value: Prisma.Decimal | null | undefined): number {
  if (!value) return 0;
  return Math.round(Number(value) * 100);
}

async function recomputeSettlements(
  tx: Prisma.TransactionClient,
  eventId: string,
): Promise<void> {
  const [members, paidGroups, shareRows] = await Promise.all([
    tx.eventMember.findMany({ where: { eventId }, select: { userId: true } }),
    tx.expense.groupBy({
      by: ['paidBy'],
      where: { eventId },
      _sum: { amount: true },
    }),
    tx.expenseShare.findMany({
      where: { expense: { eventId } },
      select: { userId: true, amount: true },
    }),
  ]);

  const paidByUser = new Map<string, number>();
  for (const g of paidGroups) {
    paidByUser.set(g.paidBy, decimalToPaise(g._sum.amount));
  }

  const shareByUser = new Map<string, number>();
  for (const row of shareRows) {
    shareByUser.set(
      row.userId,
      (shareByUser.get(row.userId) ?? 0) + decimalToPaise(row.amount),
    );
  }

  const balances = members.map((m) => {
    const paid = paidByUser.get(m.userId) ?? 0;
    const share = shareByUser.get(m.userId) ?? 0;
    return { userId: m.userId, net: paid - share };
  });

  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ userId: b.userId, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ userId: b.userId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const lines: { fromUserId: string; toUserId: string; amountPaise: number }[] =
    [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const transfer = Math.min(debtor.amount, creditor.amount);
    if (transfer > 0) {
      lines.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountPaise: transfer,
      });
    }
    debtor.amount -= transfer;
    creditor.amount -= transfer;
    if (debtor.amount === 0) i += 1;
    if (creditor.amount === 0) j += 1;
  }

  const previous = await tx.settlementLine.aggregate({
    where: { eventId },
    _max: { computationVersion: true },
  });
  const nextVersion = (previous._max.computationVersion ?? 0) + 1;

  await tx.settlementLine.deleteMany({ where: { eventId } });
  if (lines.length > 0) {
    await tx.settlementLine.createMany({
      data: lines.map((line) => ({
        eventId,
        fromUserId: line.fromUserId,
        toUserId: line.toUserId,
        amount: new Prisma.Decimal(line.amountPaise).dividedBy(100),
        computationVersion: nextVersion,
      })),
    });
  }
}

async function main() {
  const prisma = new PrismaClient();
  const eventPublicId = process.env.EVENT_PUBLIC_ID?.trim().toUpperCase();
  const seedExpenses = process.env.SEED_EXPENSES !== 'false';

  try {
    const users = new Map<string, string>();

    for (const friend of FRIENDS) {
      const phone = toE164(friend.phone);
      const user = await prisma.user.upsert({
        where: { phone },
        create: {
          phone,
          displayName: friend.name,
          phoneVerifiedAt: new Date(),
        },
        update: { displayName: friend.name },
      });
      users.set(friend.name, user.id);
    }

    let event;

    if (eventPublicId) {
      event = await prisma.event.findUnique({
        where: { publicId: eventPublicId },
        include: { categories: true },
      });
      if (!event) {
        throw new Error(
          `No event with join code ${eventPublicId}. Copy the code from Settings in the app.`,
        );
      }
    } else {
      const captainRaw =
        process.env.CAPTAIN_PHONE?.replace(/\D/g, '') ?? FRIENDS[0].phone;
      const captainPhone = toE164(captainRaw);
      const captainUser = await prisma.user.findUnique({
        where: { phone: captainPhone },
      });
      if (!captainUser) {
        throw new Error(
          `Captain phone ${captainPhone} not found. Login once on beta or set CAPTAIN_PHONE.`,
        );
      }

      event = await prisma.event.findFirst({
        where: { name: EVENT_NAME, captainId: captainUser.id },
        include: { categories: true },
      });

      if (!event) {
        const today = new Date();
        const start = new Date(today.toISOString().slice(0, 10));
        const end = new Date(start);
        end.setDate(end.getDate() + 2);

        event = await prisma.event.create({
          data: {
            publicId: generatePublicId(),
            name: EVENT_NAME,
            description: 'Beta trip for the gang — sample expenses pre-loaded.',
            location: 'Staging beta',
            startDate: start,
            endDate: end,
            eventType: EventType.travel,
            coverImageUrl:
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
            visibility: EventVisibility.public,
            captainId: captainUser.id,
            members: {
              create: { userId: captainUser.id, role: MemberRole.captain },
            },
            categories: {
              create: DEFAULT_CATEGORIES.map((c) => ({
                name: c.name,
                icon: c.icon,
                isDefault: true,
              })),
            },
          },
          include: { categories: true },
        });
      }
    }

    for (const userId of users.values()) {
      await prisma.eventMember.upsert({
        where: { eventId_userId: { eventId: event.id, userId } },
        create: { eventId: event.id, userId, role: MemberRole.member },
        update: {},
      });
    }

    const allMembers = await prisma.eventMember.findMany({
      where: { eventId: event.id },
      select: { userId: true },
    });
    const allMemberIds = allMembers.map((m) => m.userId);

    const existingExpenses = await prisma.expense.count({
      where: { eventId: event.id },
    });

    if (seedExpenses && existingExpenses === 0 && allMemberIds.length > 0) {
      const categories = await prisma.eventExpenseCategory.findMany({
        where: { eventId: event.id },
      });
      const byName = (name: string) => {
        const cat = categories.find((c) => c.name === name);
        if (!cat) throw new Error(`Category ${name} missing on this event`);
        return cat.id;
      };

      const today = new Date().toISOString().slice(0, 10);

      const samples = [
        {
          description: 'Team dinner',
          amount: 3200,
          paidBy: users.get('Akshy')!,
          categoryId: byName('Food'),
        },
        {
          description: 'Petrol / cab',
          amount: 1800,
          paidBy: users.get('Venky')!,
          categoryId: byName('Travel'),
        },
        {
          description: 'Stay (2 nights)',
          amount: 9600,
          paidBy: users.get('Shiva')!,
          categoryId: byName('Stay'),
        },
        {
          description: 'Snacks & drinks',
          amount: 800,
          paidBy: users.get('Kiruba')!,
          categoryId: byName('Food'),
        },
      ];

      await prisma.$transaction(async (tx) => {
        for (const sample of samples) {
          const shareAmounts = splitEqually(sample.amount, allMemberIds.length);
          await tx.expense.create({
            data: {
              eventId: event.id,
              createdBy: sample.paidBy,
              description: sample.description,
              amount: new Prisma.Decimal(sample.amount),
              paidBy: sample.paidBy,
              expenseDate: new Date(today),
              categoryId: sample.categoryId,
              shares: {
                create: allMemberIds.map((userId, index) => ({
                  userId,
                  amount: shareAmounts[index],
                })),
              },
            },
          });
        }
        await recomputeSettlements(tx, event.id);
      });
    }

    console.log('\n✅ Friends beta seed complete\n');
    console.log(`Event: ${event.name}`);
    console.log(`Join code: ${event.publicId}`);
    if (existingExpenses > 0) {
      console.log(`Expenses: skipped (${existingExpenses} already on event)`);
    } else if (!seedExpenses) {
      console.log('Expenses: skipped (SEED_EXPENSES=false)');
    } else {
      console.log('Expenses: 4 sample expenses added (split across all members)');
    }
    console.log('\nFriends — login OTP = last 6 digits of phone:\n');
    for (const friend of FRIENDS) {
      const phone = toE164(friend.phone);
      console.log(`  ${friend.name.padEnd(8)} ${phone}  →  ${otpSuffix(phone)}`);
    }
    console.log('\nFriends can open the app and see the event immediately.\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
