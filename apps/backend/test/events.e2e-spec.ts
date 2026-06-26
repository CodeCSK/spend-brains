import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

interface SignedInUser {
  id: string;
  token: string;
  phone: string;
}

function createApp(moduleFixture: TestingModule) {
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  return app;
}

describe('Events domain (e2e)', () => {
  let app: INestApplication<App>;
  let captain: SignedInUser;
  let member2: SignedInUser;
  let member3: SignedInUser;
  let outsider: SignedInUser;

  async function signIn(phone: string): Promise<SignedInUser> {
    await request(app.getHttpServer())
      .post('/v1/auth/otp/send')
      .send({ phone, otpConsent: true, client: 'mobile' })
      .expect(200);
    const res = await request(app.getHttpServer())
      .post('/v1/auth/otp/verify')
      .send({ phone, otp: '123456' })
      .expect(200);
    return { id: res.body.user.id, token: res.body.accessToken, phone };
  }

  const auth = (u: SignedInUser) => ({ Authorization: `Bearer ${u.token}` });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = createApp(moduleFixture);
    await app.init();

    captain = await signIn('+919800000001');
    member2 = await signIn('+919800000002');
    member3 = await signIn('+919800000003');
    outsider = await signIn('+919800000004');
  });

  afterAll(async () => {
    await app.close();
  });

  let eventId: string;
  let publicId: string;

  it('captain creates an event (seeds captain membership + default categories)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/events')
      .set(auth(captain))
      .send({
        name: 'Goa Trip 2026',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        visibility: 'private',
      })
      .expect(201);

    expect(res.body.myRole).toBe('captain');
    expect(res.body.memberCount).toBe(1);
    expect(res.body.coverImageUrl).toBeTruthy();
    eventId = res.body.id;
    publicId = res.body.publicId;
  });

  it('default categories exist after create', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/categories`)
      .set(auth(captain))
      .expect(200);
    expect(res.body.length).toBe(6);
  });

  it('non-member gets 403 on a protected event route', async () => {
    await request(app.getHttpServer())
      .get(`/v1/events/${eventId}`)
      .set(auth(outsider))
      .expect(403);
  });

  it('private join → pending → approve → member listed', async () => {
    const join = await request(app.getHttpServer())
      .post(`/v1/events/join/${publicId}`)
      .set(auth(member2))
      .expect(200);
    expect(join.body.status).toBe('requested');

    const requests = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/join-requests`)
      .set(auth(captain))
      .expect(200);
    expect(requests.body.length).toBe(1);
    const requestId = requests.body[0].id;

    await request(app.getHttpServer())
      .post(`/v1/events/${eventId}/join-requests/${requestId}/approve`)
      .set(auth(captain))
      .expect(200);

    const members = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/members`)
      .set(auth(captain))
      .expect(200);
    expect(members.body.map((m: { userId: string }) => m.userId)).toContain(
      member2.id,
    );
  });

  it('public event adds member without approval', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/events/${eventId}`)
      .set(auth(captain))
      .send({ visibility: 'public' })
      .expect(200);

    const join = await request(app.getHttpServer())
      .post(`/v1/events/join/${publicId}`)
      .set(auth(member3))
      .expect(200);
    expect(join.body.status).toBe('joined');
  });

  let categoryId: string;

  it('reads a category id for expenses', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/categories`)
      .set(auth(captain))
      .expect(200);
    categoryId = res.body[0].id;
  });

  it('₹1200 among 3 members → 3 shares at ₹400', async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/events/${eventId}/expenses`)
      .set(auth(captain))
      .send({
        description: 'Dinner',
        amount: 1200,
        paidBy: captain.id,
        sharedAmong: [captain.id, member2.id, member3.id],
        expenseDate: '2026-07-02',
        categoryId,
      })
      .expect(201);
    expect(res.body.shares.length).toBe(3);
    expect(res.body.shares.every((s: { amount: string }) => s.amount === '400.00')).toBe(
      true,
    );
  });

  it('summaries reflect paid vs share', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/summaries`)
      .set(auth(captain))
      .expect(200);
    const cap = res.body.find((b: { userId: string }) => b.userId === captain.id);
    expect(cap.totalPaid).toBe('1200.00');
    expect(cap.totalShare).toBe('400.00');
    expect(cap.netBalance).toBe('800.00');
  });

  it('settlements produce minimal lines and mark settled updates summary', async () => {
    const before = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/settlements`)
      .set(auth(captain))
      .expect(200);
    expect(before.body.totalCount).toBe(2);
    expect(before.body.status).toBe('unsettled');

    const lineId = before.body.lines[0].id;
    await request(app.getHttpServer())
      .post(`/v1/events/${eventId}/settlements/${lineId}/settle`)
      .set(auth(captain))
      .expect(200);

    const after = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/settlements`)
      .set(auth(captain))
      .expect(200);
    expect(after.body.settledCount).toBe(1);
    expect(after.body.status).toBe('partial');
  });

  it('member cannot delete an expense they do not own', async () => {
    const list = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/expenses`)
      .set(auth(member2))
      .expect(200);
    const expenseId = list.body.data[0].id;
    await request(app.getHttpServer())
      .delete(`/v1/events/${eventId}/expenses/${expenseId}`)
      .set(auth(member2))
      .expect(403);
  });

  it('settlement export returns a non-empty SVG image', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/events/${eventId}/settlements/export?format=image`)
      .set(auth(captain))
      .expect(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    expect(res.text.length).toBeGreaterThan(0);
    expect(res.text).toContain('<svg');
  });

  it('vice-captain promotion; vice-captain cannot remove a member', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/events/${eventId}/members/${member2.id}`)
      .set(auth(captain))
      .send({ role: 'vice_captain' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/v1/events/${eventId}/members/${member3.id}`)
      .set(auth(member2))
      .expect(403);
  });

  it('captain deletes the event', async () => {
    await request(app.getHttpServer())
      .delete(`/v1/events/${eventId}`)
      .set(auth(captain))
      .expect(204);
  });
});
