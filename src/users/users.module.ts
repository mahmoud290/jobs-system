import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JobsModule } from 'src/jobs/jobs.module';
import { Job } from 'src/jobs/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Job]),
    forwardRef(() => JobsModule), 
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService,TypeOrmModule],
})
export class UsersModule {}
