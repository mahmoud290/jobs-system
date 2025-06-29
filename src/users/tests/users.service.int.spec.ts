import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: number;
  let jobId: number;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  dataSource = app.get(DataSource);

  await dataSource.destroy();
  await dataSource.initialize();
  await dataSource.synchronize(true);
});


  afterAll(async () => {
    await app.close();
  });

  it('should create a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Mahmoud',
        email: 'mahmoud@example.com',
        password: 'password123',
        age: 22,
      })
      .expect(201);

    userId = res.body.id;
    expect(res.body.name).toBe('Mahmoud');
  });

  it('should create a new job', async () => {
    const res = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Backend Dev',
        description: 'Build APIs',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);

    jobId = res.body.id;
    expect(res.body.title).toBe('Backend Dev');
  });

  it('should allow user to apply to a job', async () => {
    const applyRes = await request(app.getHttpServer())
      .post(`/users/${userId}/apply/${jobId}`)
      .expect(201);

    expect(applyRes.body.message).toBe('Application submitted and email sent successfully');
  });

  it('should throw error if user already applied to the same job', async () => {
    const duplicateApplyRes = await request(app.getHttpServer())
      .post(`/users/${userId}/apply/${jobId}`)
      .expect(400);

      expect(duplicateApplyRes.body.message.toLowerCase()).toContain('user already applied');  });
});
