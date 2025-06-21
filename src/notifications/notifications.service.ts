import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class NotificationsService {
constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
) {}

async sendNotification(user: User, message: string) {
    const notification = this.notificationRepo.create({ user, message });
    return await this.notificationRepo.save(notification);
}
async getUserNotifications(userId: number) {
return await this.notificationRepo.find({
    where: { user: { id: userId } },
    order: { id: 'DESC' },
});
}
}
