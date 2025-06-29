import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './dtos/sendEmail.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send-application')
  async sendApplicationEmail(@Body() body: SendEmailDto) {
    await this.mailerService.sendApplicationEmail(body); 
    return { message: 'Application email sent successfully' };
  }

  @Post('send-shortlist')
  async sendShortlistEmail(@Body() body: SendEmailDto) {
    await this.mailerService.sendShortlistNotification(body); 
    return { message: 'Shortlist email sent successfully' };
  }
}
