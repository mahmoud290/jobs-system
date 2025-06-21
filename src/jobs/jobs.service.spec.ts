import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { GetJobsFilterDto } from './dtos/get-jobs-filter.dto';
import { NotFoundException } from '@nestjs/common'; 
import { User } from 'src/users/user.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

describe('JobsService - createJob', () => {
let service: JobsService;
let jobsRepository: jest.Mocked<Repository<Job>>;

const mockJobsRepository = (): Partial<jest.Mocked<Repository<Job>>> => ({
    create: jest.fn(),
    save: jest.fn(),
});

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        {
        provide: getRepositoryToken(Job),
        useFactory: mockJobsRepository,
        },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job)) as jest.Mocked<Repository<Job>>;
});

it('should create and save a job', async () => {
    const dto: CreateJobDto = {
    title: 'Backend Developer',
    description: 'Build APIs',
    location: 'Remote',
    jobType: 'Full-time',
    };

    const fakeJob = { id: 1, ...dto } as Job;

    jobsRepository.create.mockReturnValue(fakeJob);
    jobsRepository.save.mockResolvedValue(fakeJob);

    const result = await service.createJob(dto);

    expect(jobsRepository.create).toHaveBeenCalledWith(dto);
    expect(jobsRepository.save).toHaveBeenCalledWith(fakeJob);
    expect(result).toEqual(fakeJob);
});
});



describe('JobsService - getJobs', () => {
let service: JobsService;

const mockQueryBuilder: any = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
};

const mockJobsRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        {
        provide: getRepositoryToken(Job),
        useValue: mockJobsRepository,
        },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
});

it('should return filtered jobs with pagination', async () => {
    const filterDto: GetJobsFilterDto = {
    search: 'developer',
    location: 'Cairo',
    jobType: 'Full-time',
    page: '1',
    limit: '2',
    };

    const mockJobs = [{ id: 1 }, { id: 2 }];
    const mockCount = 2;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockJobs, mockCount]);

    const result = await service.getJobs(filterDto);

    expect(mockJobsRepository.createQueryBuilder).toHaveBeenCalledWith('job');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3); 
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); 
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(2);
    expect(result).toEqual({ data: mockJobs, count: mockCount });
});
});


describe('JobsService - updateJob', () => {
let service: JobsService;
let jobsRepository: jest.Mocked<Repository<Job>>;

const mockJobsRepository = {
    save: jest.fn(),
};

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        {
        provide: getRepositoryToken(Job),
        useValue: mockJobsRepository,
        },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job)) as jest.Mocked<Repository<Job>>;
});

it('should update and save the job if it exists', async () => {
    const existingJob = {
    id: 1,
    title: 'Old Title',
    description: 'Old Desc',
    location: 'Remote',
    jobType: 'Full-time',
    } as Job;

    const dto: UpdateJobDto = {
    title: 'Updated Title',
    description: 'Updated Desc',
    };

    const updatedJob = { ...existingJob, ...dto };

    jest.spyOn(service, 'getJobById').mockResolvedValue(existingJob);
    jobsRepository.save.mockResolvedValue(updatedJob);

    const result = await service.updateJob(1, dto);

    expect(service.getJobById).toHaveBeenCalledWith(1);
    expect(jobsRepository.save).toHaveBeenCalledWith(updatedJob);
    expect(result).toEqual(updatedJob);
});
});

describe('JobsService - deleteJob', () => {
let service: JobsService;
let jobsRepository: jest.Mocked<Repository<Job>>;

const mockJobsRepository = {
    delete: jest.fn(),
};

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        {
        provide: getRepositoryToken(Job),
        useValue: mockJobsRepository,
        },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job)) as jest.Mocked<Repository<Job>>;
});

it('should delete a job successfully if it exists', async () => {
    jobsRepository.delete.mockResolvedValue({ affected: 1 } as any);

    const result = await service.deleteJob(1);

    expect(jobsRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({
    message: `Job with ID 1 has been deleted successfully.`,
    });
});

it('should throw NotFoundException if job does not exist', async () => {
    jobsRepository.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.deleteJob(999)).rejects.toThrow(
    new NotFoundException('Job with ID 999 not found'),
    );
});
});


describe('JobsService - getAppliedUsers', () => {
let service: JobsService;
let jobsRepository: jest.Mocked<Repository<Job>>;

const mockJobsRepository = {
    findOne: jest.fn(),
};

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        {
        provide: getRepositoryToken(Job),
        useValue: mockJobsRepository,
        },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job)) as jest.Mocked<Repository<Job>>;
});

it('should return applied users if job exists', async () => {
    const mockUsers = [
    { id: 1, name: 'Mohamed' },
    { id: 2, name: 'Ahmed' },
    ] as any;

    const fakeJob = {
    id: 1,
    appliedUsers: mockUsers,
    } as any;

    jobsRepository.findOne.mockResolvedValue(fakeJob);

    const result = await service.getAppliedUsers(1);

    expect(jobsRepository.findOne).toHaveBeenCalledWith({
    where: { id: 1 },
    relations: ['appliedUsers'],
    });
    expect(result).toEqual(mockUsers);
});

it('should throw NotFoundException if job not found', async () => {
    jobsRepository.findOne.mockResolvedValue(null);

    await expect(service.getAppliedUsers(999)).rejects.toThrow(
    new NotFoundException('Job Not Found'),
    );
});

describe('JobsService - applyToJob', () => {
let service: JobsService;
let jobsRepository: jest.Mocked<Repository<Job>>;
let usersRepository: jest.Mocked<Repository<User>>;

const mockJobsRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
};

const mockUsersRepository = {
    findOne: jest.fn(),
};

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: mockJobsRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job));
    usersRepository = module.get(getRepositoryToken(User));
});

it('should allow user to apply to a job', async () => {
    const fakeJob = { id: 1, appliedUsers: [] } as any;
    const fakeUser = { id: 2 } as any;

    jobsRepository.findOne.mockResolvedValue(fakeJob);
    usersRepository.findOne.mockResolvedValue(fakeUser);
    jobsRepository.save.mockResolvedValue({ ...fakeJob, appliedUsers: [fakeUser] });

    const result = await service.applyToJob(1, 2);

    expect(jobsRepository.findOne).toHaveBeenCalled();
    expect(usersRepository.findOne).toHaveBeenCalled();
    expect(jobsRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Application submitted successfully' });
});
});


describe('JobsService - shortlistApplication', () => {
let service: JobsService;
let jobsRepository: jest.Mocked<Repository<Job>>;
let usersRepository: jest.Mocked<Repository<User>>;
let notificationsService: { sendNotification: jest.Mock };

const mockJobsRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
};

const mockUsersRepository = {
    findOne: jest.fn(),
};

beforeEach(async () => {
    notificationsService = { sendNotification: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
    providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: mockJobsRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: NotificationsService, useValue: notificationsService },
    ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job));
    usersRepository = module.get(getRepositoryToken(User));
});

it('should shortlist a user and send notification', async () => {
    const fakeUser = { id: 2 } as any;
    const fakeJob = {
    id: 1,
    title: 'Backend Dev',
    appliedUsers: [fakeUser],
    shortlistedUsers: [],
    } as any;

    jobsRepository.findOne.mockResolvedValue(fakeJob);
    usersRepository.findOne.mockResolvedValue(fakeUser);
    jobsRepository.save.mockResolvedValue(fakeJob);

    const result = await service.shortlistApplication(1, 2);

    expect(jobsRepository.findOne).toHaveBeenCalled();
    expect(usersRepository.findOne).toHaveBeenCalled();
    expect(jobsRepository.save).toHaveBeenCalled();
    expect(notificationsService.sendNotification).toHaveBeenCalledWith(
    fakeUser,
    'You have been shortlisted for the job: Backend Dev',
    );
    expect(result).toEqual({ message: 'User shortlisted and notified successfully' });
});
});

});