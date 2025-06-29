import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { SendEmailDto } from './dtos/sendEmail.dto';

dotenv.config();

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendApplicationEmail({ to, jobTitle }: SendEmailDto) {
    const info = await this.transporter.sendMail({
      from: `"Jobs System" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Application Received',
      text: `You have successfully applied for the job: ${jobTitle}`,
    });
    console.log('Email sent:', info.messageId);
  }

  async sendShortlistNotification({ to, jobTitle }: SendEmailDto) {
    const info = await this.transporter.sendMail({
      from: `"Jobs System" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'You have been shortlisted!',
      html: `
        <p>🎉 Congratulations!</p>
        <p>You have been <b>shortlisted</b> for the job: <b>${jobTitle}</b>.</p>`
    });
    console.log('Shortlist email sent:', info.messageId);
  }
}
