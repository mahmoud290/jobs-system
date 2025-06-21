import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

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
    await dataSource.destroy();
    await app.close();
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
    await request(app.getHttpServer()).post('/jobs').send({
    title: 'Frontend Developer',
    description: 'Build UI',
    location: 'Onsite',
    jobType: 'Part-time',
    });

    const res = await request(app.getHttpServer()).get('/jobs').expect(200);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title');
});

it('should update a job by ID', async () => {
    const created = await request(app.getHttpServer()).post('/jobs').send({
    title: 'Junior Dev',
    description: 'Write code',
    location: 'Office',
    jobType: 'Full-time',
    });

    const jobId = created.body.id;

    const updated = await request(app.getHttpServer())
    .patch(`/jobs/${jobId}`)
    .send({
        title: 'Senior Dev',
        description: 'Review code',
    })
    .expect(200);

    expect(updated.body.title).toBe('Senior Dev');
    expect(updated.body.description).toBe('Review code');
});

it('should delete a job by ID', async () => {
    const created = await request(app.getHttpServer()).post('/jobs').send({
    title: 'Temp Job',
    description: 'For delete test',
    location: 'Nowhere',
    jobType: 'Part-time',
    });

    const jobId = created.body.id;

    const res = await request(app.getHttpServer())
    .delete(`/jobs/${jobId}`)
    .expect(200);

    expect(res.body.message).toBe(
    `Job with ID ${jobId} has been deleted successfully.`,
    );

    await request(app.getHttpServer()).get(`/jobs/${jobId}`).expect(404);
});

it('should return applied users for a job', async () => {
const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
    name: 'Mahmoud',
    email: 'mahmoud@example.com',
    password: '123456',
    age: 22,
    })
    .expect(201);

const userId = userRes.body.id;

const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
    title: 'NestJS Dev',
    description: 'Build APIs',
    location: 'Online',
    jobType: 'Full-time',
    })
    .expect(201);

const jobId = jobRes.body.id;

await request(app.getHttpServer())
    .post(`/users/${userId}/apply/${jobId}`)
    .expect(200);

const appliedUsersRes = await request(app.getHttpServer())
    .get(`/jobs/${jobId}/applied-users`)
    .expect(200);

expect(appliedUsersRes.body.length).toBe(1);
expect(appliedUsersRes.body[0].id).toBe(userId);
});

it('should shortlist a user for a job and send notification (E2E)', async () => {
const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
    name: 'ShortlistUser',
    email: 'shortlist@example.com',
    password: '123456',
    age: 22,
    })
    .expect(201);

const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
    title: 'Shortlist Job',
    description: 'Test shortlist',
    location: 'Online',
    jobType: 'Full-time',
    })
    .expect(201);

await request(app.getHttpServer())
    .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
    .expect(200);

const shortlistRes = await request(app.getHttpServer())
    .post(`/jobs/${jobRes.body.id}/shortlist`)
    .send({ userId: userRes.body.id })
    .expect(201);

expect(shortlistRes.body.message).toBe('User shortlisted and notified successfully');
});

it('should return shortlisted users for a job (E2E)', async () => {
const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
    name: 'ShortlistedUser',
    email: 'shortlisteduser@example.com',
    password: '123456',
    age: 23,
    })
    .expect(201);

const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
    title: 'Review Job',
    description: 'Review shortlisted users',
    location: 'Cairo',
    jobType: 'Full-time',
    })
    .expect(201);

await request(app.getHttpServer())
    .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
    .expect(200);

await request(app.getHttpServer())
    .post(`/jobs/${jobRes.body.id}/shortlist`)
    .send({ userId: userRes.body.id })
    .expect(201);

const res = await request(app.getHttpServer())
    .get(`/jobs/${jobRes.body.id}/shortlisted-users`)
    .expect(200);

expect(res.body.length).toBeGreaterThan(0);
expect(res.body[0].id).toBe(userRes.body.id);
});
});
