import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const TEST_PHONE = '+919876543210';

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

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = createApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/auth/otp/send requires consent', () => {
    return request(app.getHttpServer())
      .post('/v1/auth/otp/send')
      .send({ phone: TEST_PHONE, otpConsent: false })
      .expect(400);
  });

  it('full OTP sign-in flow', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/otp/send')
      .send({ phone: TEST_PHONE, otpConsent: true, client: 'mobile' })
      .expect(200)
      .expect({ message: 'If this number is valid, an OTP has been sent.' });

    const verifyRes = await request(app.getHttpServer())
      .post('/v1/auth/otp/verify')
      .send({ phone: TEST_PHONE, otp: '123456' })
      .expect(200);

    expect(verifyRes.body.accessToken).toBeDefined();
    expect(verifyRes.body.refreshToken).toBeDefined();
    expect(verifyRes.body.user.phone).toBe(TEST_PHONE);

    const meRes = await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${verifyRes.body.accessToken}`)
      .expect(200);

    expect(meRes.body.id).toBe(verifyRes.body.user.id);
    expect(meRes.body.phone).toBe(TEST_PHONE);

    const patchRes = await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${verifyRes.body.accessToken}`)
      .send({
        displayName: 'Test User',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      })
      .expect(200);

    expect(patchRes.body.displayName).toBe('Test User');
    expect(patchRes.body.avatarUrl).toBe(
      'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    );

    const refreshRes = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken: verifyRes.body.refreshToken })
      .expect(200);

    expect(refreshRes.body.accessToken).toBeDefined();

    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .send({ refreshToken: refreshRes.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/v1/auth/logout-all')
      .set('Authorization', `Bearer ${refreshRes.body.accessToken}`)
      .expect(200);
  });
});
