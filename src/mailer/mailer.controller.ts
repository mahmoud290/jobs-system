import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
constructor(private readonly mailerService: MailerService) {}

@Post('send-application')
async sendApplicationEmail(
    @Body() body: { to: string; jobTitle: string },
) {
    await this.mailerService.sendApplicationEmail(body.to, body.jobTitle);
    return { message: 'Application email sent successfully' };
}

@Post('send-shortlist')
async sendShortlistEmail(
    @Body() body: { to: string; jobTitle: string },
) {
    await this.mailerService.sendShortlistNotification(body.to, body.jobTitle);
    return { message: 'Shortlist email sent successfully' };
}
}
