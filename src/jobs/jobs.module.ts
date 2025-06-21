import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { User } from "src/users/user.entity";
import { NotificationsModule } from "src/notifications/notifications.module";


@Module({
    imports:[TypeOrmModule.forFeature([Job,User]),NotificationsModule,],
    controllers:[JobsController],
    providers:[JobsService],
})
export class JobsModule{}