import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

jest.setTimeout(30000);

jest.spyOn(console, 'log').mockImplementation(() => {});
describe('Jobs Integration Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  dataSource = moduleRef.get(DataSource);

  if (dataSource.isInitialized) {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  }
});


  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
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
    const res = await request(app.getHttpServer()).get('/jobs').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should update a job by ID', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Junior Developer',
        description: 'Junior role',
        location: 'Onsite',
        jobType: 'Part-time',
      })
      .expect(201);

    const jobId = createRes.body.id;

    const updateRes = await request(app.getHttpServer())
      .patch(`/jobs/${jobId}`)
      .send({
        title: 'Senior Developer',
        description: 'Senior role',
      })
      .expect(200);

    expect(updateRes.body.title).toBe('Senior Developer');
    expect(updateRes.body.description).toBe('Senior role');
  });

  it('should delete a job by ID', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'To Be Deleted',
        description: 'Delete me',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);

    const jobId = createRes.body.id;

    const deleteRes = await request(app.getHttpServer())
      .delete(`/jobs/${jobId}`)
      .expect(200);

    expect(deleteRes.body.message).toContain('has been deleted successfully');
  });

  it('should apply a user to a job', async () => {
    const jobRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'React Developer',
        description: 'Build UI',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);

    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Mahmoud',
        email: 'mahmoud@example.com',
        password: '123456',
        age: 22,
      })
      .expect(201);

    const applyRes = await request(app.getHttpServer())
      .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
      .expect(201);

    expect(applyRes.body.message).toBe('Application submitted and email sent successfully');
  });

  it('should return 400 if user already applied to the job', async () => {
    const jobRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Node Developer',
        description: 'Build APIs',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);

    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Rowan',
        email: 'rowan@example.com',
        password: '123456',
        age: 23,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
      .expect(201);

    const duplicateApply = await request(app.getHttpServer())
      .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
      .expect(400);

    expect(duplicateApply.body.message).toBe('User already applied');
  });

  it('should shortlist a user for a job', async () => {
    const jobRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Angular Developer',
        description: 'Frontend work',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);

    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Ayman',
        email: 'ayman@example.com',
        password: '123456',
        age: 25,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
      .expect(201);

    const shortlistRes = await request(app.getHttpServer())
      .post(`/jobs/${jobRes.body.id}/shortlist/${userRes.body.id}`)
      .expect(201);

    expect(shortlistRes.body.message).toBe('User shortlisted and notified successfully');
  });

  it('should return 400 if user already shortlisted', async () => {
    const jobRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Tester',
        description: 'QA',
        location: 'Onsite',
        jobType: 'Part-time',
      })
      .expect(201);

    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'TestUser',
        email: 'testuser@example.com',
        password: '123456',
        age: 30,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/jobs/${jobRes.body.id}/shortlist/${userRes.body.id}`)
      .expect(201);

    const duplicateShortlist = await request(app.getHttpServer())
      .post(`/jobs/${jobRes.body.id}/shortlist/${userRes.body.id}`)
      .expect(400);

    expect(duplicateShortlist.body.message).toBe('User already shortlisted');
  });

    it('should close the job and send notifications to all applicants', async () => {
    const jobRes = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        title: 'Python Developer',
        description: 'Backend with Django',
        location: 'Remote',
        jobType: 'Full-time',
      })
      .expect(201);
    const jobId = jobRes.body.id;

    const user1 = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Ali',
        email: 'ali@example.com',
        password: '123456',
        age: 27,
      })
      .expect(201);

    const user2 = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Sara',
        email: 'sara@example.com',
        password: '123456',
        age: 24,
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

    const jobAfterClose = await request(app.getHttpServer())
      .get(`/jobs/${jobId}`)
      .expect(200);

    expect(jobAfterClose.body.status).toBe('closed');

    const notifsUser1 = await request(app.getHttpServer())
      .get(`/notifications/${user1.body.id}`)
      .expect(200);

    const notifsUser2 = await request(app.getHttpServer())
      .get(`/notifications/${user2.body.id}`)
      .expect(200);

    expect(notifsUser1.body[0].message).toBe(`Job "${jobRes.body.title}" has been closed.`);
    expect(notifsUser2.body[0].message).toBe(`Job "${jobRes.body.title}" has been closed.`);
  });
});
