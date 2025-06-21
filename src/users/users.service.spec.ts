import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Job } from 'src/jobs/job.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';

const mockUserRepo = () => ({
create: jest.fn(),
save: jest.fn(),
find: jest.fn(),
findOne: jest.fn(),
remove: jest.fn(),
});

const mockJobRepo = () => ({
findOne: jest.fn(),
});

describe('UsersService', () => {
let service: UsersService;
let userRepository: jest.Mocked<Repository<User>>;
let jobRepository: jest.Mocked<Repository<Job>>;

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
        UsersService,
        {
        provide: getRepositoryToken(User),
        useFactory: mockUserRepo,
        },
        {
        provide: getRepositoryToken(Job),
        useFactory: mockJobRepo,
        },
    ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    jobRepository = module.get(getRepositoryToken(Job)) as jest.Mocked<Repository<Job>>;
});

describe('create', () => {
    it('should create and save a user', async () => {
const dto: CreateUserDto = {
name: 'Mohamed',
email: 'Mohamed@gmail.com',
password: '123456',
age: 22,
};
    const user = { id: 1, ...dto } as User;
    userRepository.create.mockReturnValue(user);
    userRepository.save.mockResolvedValue(user);

    const result = await service.create(dto);

    expect(userRepository.create).toHaveBeenCalledWith(dto);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
    });
});

describe('findAll', () => {
    it('should return all users', async () => {
    const users = [{ id: 1 }, { id: 2 }] as User[];
    userRepository.find.mockResolvedValue(users);
    const result = await service.findAll();
    expect(result).toEqual(users);
    });
});

describe('findOne', () => {
    it('should return user by id', async () => {
    const user = { id: 1 } as User;
    userRepository.findOne.mockResolvedValue(user);
    const result = await service.findOne(1);
    expect(result).toEqual(user);
    });

    it('should throw if user not found', async () => {
    userRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
});

describe('update', () => {
    it('should update user', async () => {
    const user = { id: 1, name: 'Mohamed' } as User;
    const dto = { name: 'Updated' };
    userRepository.findOne.mockResolvedValue(user);
    userRepository.save.mockResolvedValue({ ...user, ...dto });
    const result = await service.update(1, dto);
    expect(result).toEqual({ ...user, ...dto });
    });
});

describe('remove', () => {
    it('should remove user', async () => {
    const user = { id: 1 } as User;
    userRepository.findOne.mockResolvedValue(user);
    userRepository.remove.mockResolvedValue(user);
    const result = await service.remove(1);
    expect(result).toEqual({ message: 'User Deleted successfully' });
    });
});

describe('applyToJob', () => {
    it('should apply user to job', async () => {
    const job = { id: 2 } as Job;
    const user = {
id: 1,
name: 'Test User',
email: 'Mohamed@gmail.com.com',
password: '123456',
age: 25,
appliedJobs: [],
} as User;

    userRepository.findOne.mockResolvedValue(user);
    jobRepository.findOne.mockResolvedValue(job);
    userRepository.save.mockResolvedValue({ ...user, appliedJobs: [job] });

    await service.applyToJob(1, 2);

    expect(userRepository.save).toHaveBeenCalledWith({ ...user, appliedJobs: [job] });
    });

    it('should throw if already applied', async () => {
    const job = { id: 2 } as Job;
    const user = { id: 1, appliedJobs: [job] } as User;
    userRepository.findOne.mockResolvedValue(user);
    jobRepository.findOne.mockResolvedValue(job);

    await expect(service.applyToJob(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should throw if user or job not found', async () => {
    userRepository.findOne.mockResolvedValue(null);
    jobRepository.findOne.mockResolvedValue(null);

    await expect(service.applyToJob(1, 2)).rejects.toThrow(NotFoundException);
    });
});
});
