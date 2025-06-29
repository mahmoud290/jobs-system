import { forwardRef, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { UsersModule } from 'src/users/users.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { NotificationsModule } from 'src/notifications/notifications.module';  

@Module({
  imports: [
  TypeOrmModule.forFeature([Job]),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => MailerModule),
  ],
  providers: [JobsService],
  controllers: [JobsController],
  exports:[JobsService],
})
export class JobsModule {}
