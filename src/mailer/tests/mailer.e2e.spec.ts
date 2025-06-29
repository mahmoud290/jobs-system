import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('MailerController (e2e)', () => {
  let app: INestApplication;
  let mockSendMail: jest.Mock;

  beforeAll(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'abc123' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/mailer/send-application (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/mailer/send-application')
      .send({ to: 'test@example.com', jobTitle: 'Full Stack Dev' })
      .expect(201);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: expect.stringContaining('Jobs System'),
      to: 'test@example.com',
      subject: 'Application Received',
      text: expect.stringContaining('Full Stack Dev'),
    });

    expect(res.body.message).toBe('Application email sent successfully');
  });

  it('/mailer/send-shortlist (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/mailer/send-shortlist')
      .send({ to: 'shortlisted@example.com', jobTitle: 'Backend Engineer' })
      .expect(201);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: expect.stringContaining('Jobs System'),
      to: 'shortlisted@example.com',
      subject: 'You have been shortlisted!',
      html: expect.stringContaining('Backend Engineer'),
    });

    expect(res.body.message).toBe('Shortlist email sent successfully');
  });
});
