import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

describe('Users Integration Tests', () => {
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
    await dataSource.synchronize(); 
});

afterAll(async () => {
    await dataSource.destroy();
    await app.close();
});

it('should create a user', async () => {
    const res = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Mahmoud',
        email: 'mahmoud@example.com',
        password: '123456',
        age: 22,
    })
    .expect(201);

    expect(res.body.name).toBe('Mahmoud');
    expect(res.body.email).toBe('mahmoud@example.com');
});

it('should get all users', async () => {
    const res = await request(app.getHttpServer())
    .get('/users')
    .expect(200); 
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
});

it('should get a user by ID', async () => {
    const createRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Sarah',
        email: 'sarah@example.com',
        password: '123456',
        age: 25,
    })
    .expect(201);

    const userId = createRes.body.id;

    const res = await request(app.getHttpServer())
    .get(`/users/${userId}`)
    .expect(200); 
    expect(res.body.name).toBe('Sarah');
});

it('should update a user', async () => {
    const createRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Ali',
        email: 'ali@example.com',
        password: '123456',
        age: 20,
    })
    .expect(201);

    const userId = createRes.body.id;

    const updateRes = await request(app.getHttpServer())
    .patch(`/users/${userId}`)
    .send({ name: 'Ali Updated' })
    .expect(200); 

    expect(updateRes.body.name).toBe('Ali Updated');
});

it('should delete a user', async () => {
    const createRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'To Be Deleted',
        email: 'delete@example.com',
        password: '123456',
        age: 30,
    })
    .expect(201);

    const userId = createRes.body.id;

    const deleteRes = await request(app.getHttpServer())
    .delete(`/users/${userId}`)
    .expect(200); 
    expect(deleteRes.body.message).toBe('User Deleted successfully');

    await request(app.getHttpServer())
    .get(`/users/${userId}`)
    .expect(404);
});

it('should apply user to job', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Applicant',
        email: 'applicant@example.com',
        password: '123456',
        age: 28,
    })
    .expect(201);

    const userId = userRes.body.id;

    const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
        title: 'NestJS Job',
        description: 'Build APIs',
        location: 'Remote',
        jobType: 'Full-time',
    })
    .expect(201);

    const jobId = jobRes.body.id;

    const applyRes = await request(app.getHttpServer())
    .post(`/users/${userId}/apply/${jobId}`)
    .expect(201);

    expect(applyRes.body.message).toBe('User applied to job successfully');
});

it('should throw error if user already applied to the same job', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Duplicate Applicant',
        email: 'duplicate@applicant.com',
        password: '123456',
        age: 30,
    })
    .expect(201);

    const userId = userRes.body.id;

    const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
        title: 'Unique Job',
        description: 'Only one applicant allowed',
        location: 'Remote',
        jobType: 'Full-time',
    })
    .expect(201);

    const jobId = jobRes.body.id;

    await request(app.getHttpServer())
    .post(`/users/${userId}/apply/${jobId}`)
    .expect(201);

    const duplicateApplyRes = await request(app.getHttpServer())
    .post(`/users/${userId}/apply/${jobId}`)
    .expect(400); 

    expect(duplicateApplyRes.body.message).toBe('User Already Applied to this job');
});
});
