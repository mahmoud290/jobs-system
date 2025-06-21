import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { Job } from './jobs/job.entity';
import { User } from './users/user.entity';
import { Notification } from './notifications/notification.entity';
dotenv.config();


@Module({
  imports: [TypeOrmModule.forRoot({
    type:'postgres',
    host:process.env.DB_HOST,
    port:5432,
    username:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.NODE_ENV === 'test' ? 'job-db-test' : process.env.DB_NAME,
    entities:[Job,User,Notification],
    autoLoadEntities:true,
    synchronize:true,
  }),
JobsModule,
UsersModule,
AuthModule,
],
})
export class AppModule {}
