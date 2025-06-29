import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationsController } from './notifications.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => UsersModule),
  ],
  providers: [NotificationsService],
  controllers:[NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
