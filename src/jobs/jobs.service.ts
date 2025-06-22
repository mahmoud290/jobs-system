import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { CreateJobDto } from "./dtos/create-job.dto";
import { GetJobsFilterDto } from "./dtos/get-jobs-filter.dto";
import { UpdateJobDto } from "./dtos/update-job.dto";
import { Repository } from "typeorm";
import { User } from "src/users/user.entity";
import { MailerService } from 'src/mailer/mailer.service';
import { NotificationsService } from "src/notifications/notifications.service";

@Injectable()
export class JobsService {
constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private notificationsService: NotificationsService,
    private readonly mailerService: MailerService,
) {}

async createJob(dto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create(dto);
    return await this.jobsRepository.save(job);
}

async getJobs(filterDto: GetJobsFilterDto) {
    const { search, location, jobType, page = '1', limit = '10' } = filterDto;

    const query = this.jobsRepository.createQueryBuilder('job');

    if (search) {
    query.andWhere('(job.title ILIKE :search OR job.description ILIKE :search)', { search: `%${search}%` });
    }

    if (location) {
    query.andWhere('job.location = :location', { location });
    }

    if (jobType) {
    query.andWhere('job.jobType = :jobType', { jobType });
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    query.skip((pageNumber - 1) * pageSize).take(pageSize);

    const [jobs, count] = await query.getManyAndCount();

    return { data: jobs, count };
}

async getJobById(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOneBy({ id });
    if (!job) {
    throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
}

async updateJob(id: number, dto: UpdateJobDto): Promise<Job> {
    const job = await this.getJobById(id);
    Object.assign(job, dto);
    return this.jobsRepository.save(job);
}
async deleteJob(id: number): Promise<{ message: string }> {
const result = await this.jobsRepository.delete(id);
if (result.affected === 0) {
    throw new NotFoundException(`Job with ID ${id} not found`);
}
return { message: `Job with ID ${id} has been deleted successfully.` };
}


async shortlistApplication(jobId: number, userId: number) {
    const job = await this.jobsRepository.findOne({
    where: { id: jobId },
    relations: ['appliedUsers', 'shortlistedUsers'],
    });
    if (!job) throw new NotFoundException('Job not found');

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    job.shortlistedUsers = job.shortlistedUsers || [];

    const alreadyShortlisted = job.shortlistedUsers.find((u) => u.id === userId);
    if (alreadyShortlisted) throw new BadRequestException('User already shortlisted');

    job.shortlistedUsers.push(user);
    await this.jobsRepository.save(job);

    await this.notificationsService.sendNotification(
    user,
    `You have been shortlisted for the job: ${job.title}`,
    );

    await this.mailerService.sendShortlistNotification(user.email, job.title);

    return { message: 'User shortlisted and notified successfully' };
}

async applyToJob(jobId: number, userId: number) {
    const job = await this.jobsRepository.findOne({
    where: { id: jobId },
    relations: ['appliedUsers'],
    });
    if (!job) throw new NotFoundException('Job not found');

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    job.appliedUsers = job.appliedUsers || [];

    const alreadyApplied = job.appliedUsers.find((u) => u.id === userId);
    if (alreadyApplied) throw new BadRequestException('User already applied');

    job.appliedUsers.push(user);
    await this.jobsRepository.save(job);

    await this.notificationsService.sendNotification(
    user,
    `You have successfully applied for the job: ${job.title}`,
    );

    await this.mailerService.sendApplicationEmail(user.email, job.title);

    return { message: 'Application submitted and email sent successfully' };
}
async getAppliedUsers(jobId: number): Promise<User[]> {
const job = await this.jobsRepository.findOne({
    where: { id: jobId },
    relations: ['appliedUsers'],
});
if (!job) {
    throw new NotFoundException('Job not found');
}
return job.appliedUsers;
}

async getShortlistedUsers(jobId: number): Promise<User[]> {
const job = await this.jobsRepository.findOne({
    where: { id: jobId },
    relations: ['shortlistedUsers'],
});
if (!job) {
    throw new NotFoundException('Job not found');
}
return job.shortlistedUsers;
}
}
