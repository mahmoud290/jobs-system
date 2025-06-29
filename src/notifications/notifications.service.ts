import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from 'src/users/user.entity';
import { CreateNotificationDto } from './dtos/create-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const notification = this.notificationsRepository.create({
      message: dto.message,
      user,
    });

    return this.notificationsRepository.save(notification);
  }

  async sendNotification(user: User, message: string): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      message,
      user,
    });
    return this.notificationsRepository.save(notification);
  }

  async sendNotificationByUserId(userId: number, message: string): Promise<Notification> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.sendNotification(user, message);
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}