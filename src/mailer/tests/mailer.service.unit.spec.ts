import { MailerService } from '../mailer.service';
import { SendEmailDto } from '../dtos/sendEmail.dto';
import { Test } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('MailerService', () => {
  let service: MailerService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

 it('should send application email', async () => {
  const dto: SendEmailDto = {
    to: 'user@example.com',
    jobTitle: 'Frontend Dev',
  };

  await service.sendApplicationEmail(dto);

  expect(mockSendMail).toHaveBeenCalledWith({
    from: `"Jobs System" <${process.env.EMAIL_USER}>`,
    to: dto.to,
    subject: 'Application Received',
    text: `You have successfully applied for the job: ${dto.jobTitle}`,
  });
});


  it('should send shortlist notification email', async () => {
    const dto: SendEmailDto = {
      to: 'user@example.com',
      jobTitle: 'Frontend Dev',
    };

    await service.sendShortlistNotification(dto);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: `"Jobs System" <${process.env.EMAIL_USER}>`,
      to: 'user@example.com',
      subject: 'You have been shortlisted!',
      html: `
        <p>🎉 Congratulations!</p>
        <p>You have been <b>shortlisted</b> for the job: <b>Frontend Dev</b>.</p>`,
    });
  });
});
