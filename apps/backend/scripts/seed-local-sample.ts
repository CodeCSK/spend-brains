/**
 * Local dev sample data — Docker Postgres only.
 *
 *   cd apps/backend
 *   npm run seed:local
 *
 * Uses your existing user as captain (CAPTAIN_PHONE or sole user in DB).
 * Creates 3 events, sample members, expenses, and settlement lines.
 * Safe to re-run: skips events that already have expenses.
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

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'food' },
  { name: 'Travel', icon: 'travel' },
  { name: 'Stay', icon: 'stay' },
  { name: 'Shopping', icon: 'shopping' },
  { name: 'Entertainment', icon: 'entertainment' },
  { name: 'Other', icon: 'other' },
] as const;

const SAMPLE_MEMBERS = [
  { name: 'Priya', phone: '9876543210' },
  { name: 'Rahul', phone: '9876543211' },
  { name: 'Ananya', phone: '9876543212' },
  { name: 'Vikram', phone: '9876543213' },
  { name: 'Meera', phone: '9876543214' },
] as const;

const SAMPLE_EVENTS = [
  {
    name: 'Weekend Goa Trip',
    description: 'Beach house, dinners, and cab splits.',
    location: 'Goa',
    eventType: EventType.travel,
    visibility: EventVisibility.private,
    daySpan: 3,
    memberNames: ['Priya', 'Rahul', 'Ananya', 'Vikram'] as const,
    expenses: [
      { description: 'Airbnb (2 nights)', amount: 8400, paidBy: 'Karthick', category: 'Stay' },
      { description: 'Friday dinner at Fishermans Wharf', amount: 4200, paidBy: 'Priya', category: 'Food' },
      { description: 'Scooter rental', amount: 1600, paidBy: 'Rahul', category: 'Travel' },
      { description: 'Beach shack lunch', amount: 2400, paidBy: 'Ananya', category: 'Food' },
      { description: 'Club entry & drinks', amount: 5000, paidBy: 'Vikram', category: 'Entertainment' },
    ],
  },
  {
    name: 'Flatmates — March',
    description: 'Shared rent, utilities, and groceries.',
    location: 'Chennai',
    eventType: EventType.roommate,
    visibility: EventVisibility.private,
    daySpan: 30,
    memberNames: ['Priya', 'Rahul', 'Meera'] as const,
    expenses: [
      { description: 'March rent', amount: 24000, paidBy: 'Karthick', category: 'Stay' },
      { description: 'Electricity bill', amount: 3200, paidBy: 'Priya', category: 'Other' },
      { description: 'Groceries (BigBasket)', amount: 2800, paidBy: 'Rahul', category: 'Food' },
      { description: 'Wi‑Fi recharge', amount: 900, paidBy: 'Meera', category: 'Other' },
    ],
  },
  {
    name: 'Office Team Outing',
    description: 'Quarterly team lunch and activities.',
    location: 'Bangalore',
    eventType: EventType.corporate,
    visibility: EventVisibility.public,
    daySpan: 1,
    memberNames: ['Ananya', 'Vikram', 'Meera'] as const,
    expenses: [
      { description: 'Team lunch buffet', amount: 5600, paidBy: 'Karthick', category: 'Food' },
      { description: 'Escape room booking', amount: 3600, paidBy: 'Ananya', category: 'Entertainment' },
      { description: 'Cab to venue', amount: 1200, paidBy: 'Vikram', category: 'Travel' },
    ],
  },
] as const;

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

async function resolveCaptain(prisma: PrismaClient) {
  const captainRaw = process.env.CAPTAIN_PHONE?.replace(/\D/g, '');
  if (captainRaw) {
    const captain = await prisma.user.findUnique({
      where: { phone: toE164(captainRaw) },
    });
    if (!captain) {
      throw new Error(
        `No user with phone ${toE164(captainRaw)}. Sign up in the app first.`,
      );
    }
    return captain;
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  if (users.length === 0) {
    throw new Error('No users in DB. Create your account in the app first.');
  }
  if (users.length > 1) {
    throw new Error(
      `Multiple users found. Set CAPTAIN_PHONE to pick the captain (e.g. CAPTAIN_PHONE=8973077078).`,
    );
  }
  return users[0];
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const captain = await resolveCaptain(prisma);
    const usersByName = new Map<string, string>();
    usersByName.set(captain.displayName ?? 'Captain', captain.id);
    usersByName.set('Karthick', captain.id);

    for (const member of SAMPLE_MEMBERS) {
      const phone = toE164(member.phone);
      const user = await prisma.user.upsert({
        where: { phone },
        create: {
          phone,
          displayName: member.name,
          phoneVerifiedAt: new Date(),
        },
        update: { displayName: member.name },
      });
      usersByName.set(member.name, user.id);
    }

    console.log(`\nCaptain: ${captain.displayName ?? captain.phone} (${captain.phone})\n`);

    for (const sample of SAMPLE_EVENTS) {
      let event = await prisma.event.findFirst({
        where: { name: sample.name, captainId: captain.id },
        include: { categories: true },
      });

      if (!event) {
        const today = new Date();
        const start = new Date(today.toISOString().slice(0, 10));
        const end = new Date(start);
        end.setDate(end.getDate() + sample.daySpan);

        event = await prisma.event.create({
          data: {
            publicId: generatePublicId(),
            name: sample.name,
            description: sample.description,
            location: sample.location,
            startDate: start,
            endDate: end,
            eventType: sample.eventType,
            visibility: sample.visibility,
            captainId: captain.id,
            members: {
              create: { userId: captain.id, role: MemberRole.captain },
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
        console.log(`Created event: ${event.name} (${event.publicId})`);
      } else {
        console.log(`Event exists: ${event.name} (${event.publicId})`);
      }

      const memberIds = [captain.id];
      for (const name of sample.memberNames) {
        const userId = usersByName.get(name);
        if (!userId) throw new Error(`Unknown member ${name}`);
        memberIds.push(userId);
        await prisma.eventMember.upsert({
          where: { eventId_userId: { eventId: event.id, userId } },
          create: {
            eventId: event.id,
            userId,
            role: MemberRole.member,
          },
          update: {},
        });
      }

      await prisma.eventMember.update({
        where: {
          eventId_userId: { eventId: event.id, userId: captain.id },
        },
        data: { role: MemberRole.captain },
      });

      const existingExpenses = await prisma.expense.count({
        where: { eventId: event.id },
      });

      if (existingExpenses > 0) {
        console.log(`  Expenses: skipped (${existingExpenses} already present)`);
        continue;
      }

      const categories = event.categories;
      const byName = (name: string) => {
        const cat = categories.find((c) => c.name === name);
        if (!cat) throw new Error(`Category ${name} missing on ${event!.name}`);
        return cat.id;
      };

      const expenseDate = new Date().toISOString().slice(0, 10);

      await prisma.$transaction(async (tx) => {
        for (const expense of sample.expenses) {
          const paidBy = usersByName.get(expense.paidBy);
          if (!paidBy) throw new Error(`Unknown payer ${expense.paidBy}`);

          const shareAmounts = splitEqually(expense.amount, memberIds.length);
          await tx.expense.create({
            data: {
              eventId: event!.id,
              createdBy: paidBy,
              description: expense.description,
              amount: new Prisma.Decimal(expense.amount),
              paidBy,
              expenseDate: new Date(expenseDate),
              categoryId: byName(expense.category),
              shares: {
                create: memberIds.map((userId, index) => ({
                  userId,
                  amount: shareAmounts[index],
                })),
              },
            },
          });
        }
        await recomputeSettlements(tx, event!.id);
      });

      console.log(`  Added ${sample.expenses.length} expenses + settlements`);
    }

    console.log('\nSample members — OTP = last 6 digits of phone:\n');
    for (const member of SAMPLE_MEMBERS) {
      const phone = toE164(member.phone);
      console.log(`  ${member.name.padEnd(8)} ${phone}  →  ${otpSuffix(phone)}`);
    }
    console.log('\nDone. Open the app as Karthick to see all 3 events.\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
