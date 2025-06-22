import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('Notifications E2E Test', () => {
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
    await dataSource.synchronize(true); 
});

afterAll(async () => {
    await dataSource.destroy();
    await app.close();
});

it('should create a user and send notifications', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'NotificationUser',
        email: 'notify@example.com',
        password: 'password123',
        age: 30,
    })
    .expect(201);

    const userId = userRes.body.id;

    const emptyNotifications = await request(app.getHttpServer())
    .get(`/notifications/${userId}`)
    .expect(200);
    expect(Array.isArray(emptyNotifications.body)).toBe(true);
    expect(emptyNotifications.body.length).toBe(0);

});

it('should get user notifications after adding one', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'NotifyUser2',
        email: 'notify2@example.com',
        password: 'password456',
        age: 28,
    })
    .expect(201);

    const userId = userRes.body.id;
    await request(app.getHttpServer())
    .post('/notifications/add')
    .send({
        userId,
        message: 'Welcome to notifications!',
    })
    .expect(201);

    const notificationsRes = await request(app.getHttpServer())
    .get(`/notifications/${userId}`)
    .expect(200);

    expect(notificationsRes.body.length).toBeGreaterThan(0);
    expect(notificationsRes.body[0]).toHaveProperty('message', 'Welcome to notifications!');
});
});
