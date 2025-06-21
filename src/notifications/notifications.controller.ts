import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
constructor(private readonly notificationsService: NotificationsService) {}

@Get(':userId')
async getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUserNotifications(userId);
}
}
