import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailerService Integration', () => {
  let service: MailerService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mocked-id' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should send application email', async () => {
    await service.sendApplicationEmail('test@example.com', 'Full Stack Job');

    expect(mockSendMail).toHaveBeenCalledWith({
      from: expect.stringContaining('Jobs System'),
      to: 'test@example.com',
      subject: 'Job Application Confirmation',
      html: expect.stringContaining('Full Stack Job'),
    });
  });

  it('should send shortlist email', async () => {
    await service.sendShortlistNotification('shortlisted@example.com', 'Backend Job');

    expect(mockSendMail).toHaveBeenCalledWith({
      from: expect.stringContaining('Jobs System'),
      to: 'shortlisted@example.com',
      subject: 'You have been shortlisted!',
      html: expect.stringContaining('Backend Job'),
    });
  });
});
