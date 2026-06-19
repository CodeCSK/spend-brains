import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'OK' });
  });

  it('/dashboard (GET)', () => {
    return request(app.getHttpServer())
      .get('/dashboard')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect((res) => {
        expect(res.text).toContain('npm run start:dev');
        expect(res.text).toContain('copy-btn');
      });
  });
});
