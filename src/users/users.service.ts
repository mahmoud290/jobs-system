import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { Job } from "src/jobs/job.entity";
import { JobsService } from "src/jobs/jobs.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Job)
        private readonly jobRepository: Repository<Job>,

    @Inject(forwardRef(() => JobsService))  
    private readonly jobsService: JobsService,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User Not Found!!');
        return user;
    }

    // Create User
    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }
        const newUser = this.userRepository.create(createUserDto);
        return await this.userRepository.save(newUser);
    }

    // Get All Users
    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    // Update User
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    // Delete User
    async remove(id: number): Promise<{ message: string }> {
const user = await this.userRepository.findOne({
    where: { id },
    relations: ['appliedJobs', 'shortlistedJobs'],
});

if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
}
user.appliedJobs = [];
user.shortlistedJobs = [];
await this.userRepository.save(user);

await this.userRepository.remove(user);
return { message: 'User Deleted successfully' };
}
async applyToJob(userId: number, jobId: number): Promise<void> {
const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['appliedJobs'],
});

const job = await this.jobRepository.findOne({ where: { id: jobId } });

if (!user || !job) {
    throw new NotFoundException('User or Job not found');
}

const alreadyApplied = user.appliedJobs.some(j => j.id === job.id);
if (alreadyApplied) {
    throw new BadRequestException('User already applied to this job');
}

user.appliedJobs.push(job);
await this.userRepository.save(user);
}
}
