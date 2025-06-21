import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { Job } from "src/jobs/job.entity";

@Module({
    imports:[TypeOrmModule.forFeature([User,Job])],
    providers:[UsersService],
    controllers:[UsersController],
})

export class UsersModule{}