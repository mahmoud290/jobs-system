import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';

describe('NotificationsController (Integration)', () => {
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

it('should send notification and get user notifications', async () => {
    const userRes = await request(app.getHttpServer())
    .post('/users')
    .send({
        name: 'Notification User',
        email: 'notify@example.com',
        password: '123456',
        age: 25,
    })
    .expect(201);

    const userId = userRes.body.id;

    await dataSource.getRepository('Notification').save({
    message: 'Welcome notification',
    user: { id: userId },
    });

    const notificationsRes = await request(app.getHttpServer())
    .get(`/notifications/${userId}`)
    .expect(200);

    expect(Array.isArray(notificationsRes.body)).toBe(true);
    expect(notificationsRes.body.length).toBeGreaterThan(0);
    expect(notificationsRes.body[0]).toHaveProperty('message', 'Welcome notification');
});
});
