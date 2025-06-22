import { MailerService } from './mailer.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer'); 

describe('MailerService', () => {
  let service: MailerService;
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    service = new MailerService();
  });

  it('should send application email', async () => {
    await service.sendApplicationEmail('test@example.com', 'Backend Dev');

    expect(mockSendMail).toHaveBeenCalledWith({
      from: `"Jobs System" <${process.env.EMAIL_USER}>`,
      to: 'test@example.com',
      subject: 'Job Application Confirmation',
      html: `<p>You have successfully applied for the job: <b>Backend Dev</b>.</p>`,
    });
  });

  it('should send shortlist notification email', async () => {
    await service.sendShortlistNotification('user@example.com', 'Frontend Dev');

    expect(mockSendMail).toHaveBeenCalledWith({
      from: `"Jobs System" <${process.env.EMAIL_USER}>`,
      to: 'user@example.com',
      subject: 'You have been shortlisted!',
      html: `
        <p>🎉 Congratulations!</p>
        <p>You have been <b>shortlisted</b> for the job: <b>Frontend Dev</b>.</p>
    `,
    });
  });
});
