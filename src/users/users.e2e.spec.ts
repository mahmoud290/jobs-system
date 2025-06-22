import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

describe('Users E2E Test', () => {
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
    const res = await request(app.getHttpServer()).get('/users').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
});

it('should get user by ID', async () => {
    const createRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret',
        age: 30,
    })
    .expect(201);

    const userId = createRes.body.id;

    const res = await request(app.getHttpServer())
    .get(`/users/${userId}`)
    .expect(200); 

    expect(res.body.name).toBe('John Doe');
});

it('should update user', async () => {
    const createRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Old Name',
        email: 'old@example.com',
        password: 'oldpass',
        age: 20,
    })
    .expect(201);

    const userId = createRes.body.id;

    const updateRes = await request(app.getHttpServer())
    .patch(`/users/${userId}`)
    .send({
        name: 'New Name',
        age: 25,
    })
    .expect(200); 

    expect(updateRes.body.name).toBe('New Name');
    expect(updateRes.body.age).toBe(25);
});

it('should delete user', async () => {
    const createRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'To Be Deleted',
        email: 'delete@example.com',
        password: 'toDelete',
        age: 35,
    })
    .expect(201);

    const userId = createRes.body.id;

    const deleteRes = await request(app.getHttpServer())
    .delete(`/users/${userId}`)
    .expect(200); 
    expect(deleteRes.body.message).toBe('User Deleted successfully');
});

it('should allow user to apply to job', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Job Seeker',
        email: 'seeker@example.com',
        password: 'apply123',
        age: 28,
    })
    .expect(201);

    const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
        title: 'Backend Job',
        description: 'NodeJS Dev',
        location: 'Remote',
        jobType: 'Full-time',
    })
    .expect(201);

    const applyRes = await request(app.getHttpServer())
    .post(`/users/${userRes.body.id}/apply/${jobRes.body.id}`)
    .expect(201);

    expect(applyRes.body.message).toBe('User applied to job successfully');
});

it('should not allow user to apply twice to same job', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Repeat Applier',
        email: 'repeat@example.com',
        password: 'pass123',
        age: 26,
    })
    .expect(201);

    const jobRes = await request(app.getHttpServer())
    .post('/jobs')
    .send({
        title: 'Frontend Job',
        description: 'React Dev',
        location: 'Onsite',
        jobType: 'Part-time',
    })
    .expect(201);

    const userId = userRes.body.id;
    const jobId = jobRes.body.id;

    await request(app.getHttpServer())
    .post(`/users/${userId}/apply/${jobId}`)
    .expect(201);

    const res = await request(app.getHttpServer())
    .post(`/users/${userId}/apply/${jobId}`)
    .expect(400); 
    expect(res.body.message).toBe('User Already Applied to this job');
});
});
