import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

jest.setTimeout(30000);
jest.spyOn(console, 'log').mockImplementation(() => {});


describe('Jobs E2E Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleRef.get(DataSource);
    await dataSource.synchronize(true);   
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    if (app) await app.close();
  });

  it('should create a job', async () => {
    const res = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Backend Developer',
        description: 'Build APIs',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);

    expect(res.body.title).toBe('Backend Developer');
    expect(res.body.description).toBe('Build APIs');
  });

  it('should get all jobs', async () => {
    await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Frontend Developer',
        description: 'Build UI',
        location: 'Onsite',
        jobType: 'Part-time',
      });

    const res = await request(app.getHttpServer()).get('/jobs').expect(200);

    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBe(true);
    if (Array.isArray(res.body)) {
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
    } else {
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('title');
    }
  });
it('should close a job and send notifications to all applicants', async () => {
  const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
      title: 'DevOps Engineer',
      description: 'Manage infrastructure',
      location: 'Remote',
      jobType: 'Full-time',
    })
    .expect(201);
  const jobId = jobRes.body.id;

  const user1 = await request(app.getHttpServer())
    .post('/users')
    .send({
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: '123456',
      age: 30,
    })
    .expect(201);

  const user2 = await request(app.getHttpServer())
    .post('/users')
    .send({
      name: 'Mona',
      email: 'mona@example.com',
      password: '123456',
      age: 28,
    })
    .expect(201);

  await request(app.getHttpServer())
    .post(`/users/${user1.body.id}/apply/${jobId}`)
    .expect(201);

  await request(app.getHttpServer())
    .post(`/users/${user2.body.id}/apply/${jobId}`)
    .expect(201);

  const closeRes = await request(app.getHttpServer())
    .patch(`/jobs/${jobId}/close`)
    .expect(200);

  expect(closeRes.body.message).toBe('Job closed and notifications sent');

  const jobDetails = await request(app.getHttpServer())
    .get(`/jobs/${jobId}`)
    .expect(200);
  expect(jobDetails.body.status).toBe('closed');

  const notifications1 = await request(app.getHttpServer())
    .get(`/notifications/${user1.body.id}`)
    .expect(200);
  const notifications2 = await request(app.getHttpServer())
    .get(`/notifications/${user2.body.id}`)
    .expect(200);

  expect(notifications1.body[0].message).toBe(`Job "${jobRes.body.title}" has been closed.`);
  expect(notifications2.body[0].message).toBe(`Job "${jobRes.body.title}" has been closed.`);
});
});
