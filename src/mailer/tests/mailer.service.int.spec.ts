import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '../mailer.service'; 
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../dtos/sendEmail.dto';
jest.mock('nodemailer');
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('MailerService Integration', () => {
  let service: MailerService;
  let mockSendMail: jest.Mock;

  beforeAll(() => {
    if (!process.env.EMAIL_USER) {
      process.env.EMAIL_USER = 'test@example.com';
    }
  });

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
  const dto: SendEmailDto = {
    to: 'test@example.com',
    jobTitle: 'Full Stack Job',
  };

  await service.sendApplicationEmail(dto);

  expect(mockSendMail).toHaveBeenCalledWith({
    from: `"Jobs System" <${process.env.EMAIL_USER}>`,
    to: 'test@example.com',
    subject: 'Application Received',
    text: `You have successfully applied for the job: ${dto.jobTitle}`,
  });
});

  it('should send shortlist email', async () => {
  const dto: SendEmailDto = {
    to: 'shortlisted@example.com',
    jobTitle: 'Backend Job',
  };

  await service.sendShortlistNotification(dto);

  expect(mockSendMail).toHaveBeenCalledWith({
    from: `"Jobs System" <${process.env.EMAIL_USER}>`,
    to: 'shortlisted@example.com',
    subject: 'You have been shortlisted!',
    html: `
        <p>🎉 Congratulations!</p>
        <p>You have been <b>shortlisted</b> for the job: <b>${dto.jobTitle}</b>.</p>`,
  });
});

  it('should throw if sendMail rejects', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

    const dto: SendEmailDto = {
      to: 'fail@example.com',
      jobTitle: 'Job',
    };

    await expect(service.sendApplicationEmail(dto)).rejects.toThrow('SMTP error');
  });
});
