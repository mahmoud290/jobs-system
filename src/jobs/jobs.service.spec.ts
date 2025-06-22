import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MailerService } from 'src/mailer/mailer.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockJobsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUsersRepository = () => ({
  findOne: jest.fn(),
});

const mockNotificationsService = () => ({
  sendNotification: jest.fn(),
});

const mockMailerService = () => ({
  sendApplicationEmail: jest.fn(),
  sendShortlistNotification: jest.fn(),
});

describe('JobsService', () => {
  let service: JobsService;
  let jobsRepository: jest.Mocked<Repository<Job>>;
  let usersRepository: jest.Mocked<Repository<User>>;
  let notificationsService: NotificationsService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useFactory: mockJobsRepository },
        { provide: getRepositoryToken(User), useFactory: mockUsersRepository },
        { provide: NotificationsService, useFactory: mockNotificationsService },
        { provide: MailerService, useFactory: mockMailerService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobsRepository = module.get(getRepositoryToken(Job));
    usersRepository = module.get(getRepositoryToken(User));
    notificationsService = module.get(NotificationsService);
    mailerService = module.get(MailerService);
  });

  describe('createJob', () => {
    it('should create and save a job', async () => {
      const dto = { title: 'Backend Dev', description: 'APIs', location: 'Remote', jobType: 'Full-time' };
      const createdJob = { id: 1, ...dto } as Job;

      jobsRepository.create.mockReturnValue(createdJob);
      jobsRepository.save.mockResolvedValue(createdJob);

      const result = await service.createJob(dto as any);

      expect(jobsRepository.create).toHaveBeenCalledWith(dto);
      expect(jobsRepository.save).toHaveBeenCalledWith(createdJob);
      expect(result).toEqual(createdJob);
    });
  });

  describe('getJobs', () => {
    it('should return filtered jobs with pagination', async () => {
      const filterDto = { search: 'dev', location: 'NY', jobType: 'Full-time', page: '1', limit: '2' };
      const mockQueryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }, { id: 2 }], 2]),
      };
      jobsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getJobs(filterDto as any);

      expect(jobsRepository.createQueryBuilder).toHaveBeenCalledWith('job');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(2);
      expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }], count: 2 });
    });
  });

  describe('getJobById', () => {
    it('should return a job if found', async () => {
      const job = { id: 1 } as Job;
      jobsRepository.findOneBy.mockResolvedValue(job);

      const result = await service.getJobById(1);

      expect(jobsRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(job);
    });

    it('should throw NotFoundException if job not found', async () => {
      jobsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getJobById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateJob', () => {
    it('should update and save the job', async () => {
      const job = { id: 1, title: 'Old', description: 'Old Desc' } as Job;
      const dto = { title: 'New', description: 'New Desc' } as any;
      const updatedJob = { ...job, ...dto };

      jest.spyOn(service, 'getJobById').mockResolvedValue(job);
      jobsRepository.save.mockResolvedValue(updatedJob);

      const result = await service.updateJob(1, dto);

      expect(service.getJobById).toHaveBeenCalledWith(1);
      expect(jobsRepository.save).toHaveBeenCalledWith(updatedJob);
      expect(result).toEqual(updatedJob);
    });
  });

  describe('deleteJob', () => {
    it('should delete the job if exists', async () => {
      jobsRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.deleteJob(1);

      expect(jobsRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Job with ID 1 has been deleted successfully.' });
    });

    it('should throw if job does not exist', async () => {
      jobsRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.deleteJob(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('shortlistApplication', () => {
    it('should shortlist user and send notifications', async () => {
      const job = { id: 1, title: 'Job1', appliedUsers: [], shortlistedUsers: [] } as any;
      const user = { id: 2, email: 'user@example.com' } as any;

      jobsRepository.findOne.mockResolvedValue(job);
      usersRepository.findOne.mockResolvedValue(user);
      jobsRepository.save.mockResolvedValue(job);

      const result = await service.shortlistApplication(1, 2);

      expect(jobsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['appliedUsers', 'shortlistedUsers'],
      });
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(jobsRepository.save).toHaveBeenCalledWith(job);
      expect(notificationsService.sendNotification).toHaveBeenCalledWith(
        user,
        `You have been shortlisted for the job: ${job.title}`,
      );
      expect(mailerService.sendShortlistNotification).toHaveBeenCalledWith(user.email, job.title);
      expect(result).toEqual({ message: 'User shortlisted and notified successfully' });
    });

    it('should throw if user already shortlisted', async () => {
      const user = { id: 2 } as any;
      const job = { id: 1, shortlistedUsers: [user], appliedUsers: [] } as any;

      jobsRepository.findOne.mockResolvedValue(job);
      usersRepository.findOne.mockResolvedValue(user);

      await expect(service.shortlistApplication(1, 2)).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyToJob', () => {
    it('should apply user and send notifications', async () => {
      const job = { id: 1, title: 'Job1', appliedUsers: [] } as any;
      const user = { id: 2, email: 'user@example.com' } as any;

      jobsRepository.findOne.mockResolvedValue(job);
      usersRepository.findOne.mockResolvedValue(user);
      jobsRepository.save.mockResolvedValue(job);

      const result = await service.applyToJob(1, 2);

      expect(jobsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['appliedUsers'],
      });
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(jobsRepository.save).toHaveBeenCalledWith(job);
      expect(notificationsService.sendNotification).toHaveBeenCalledWith(
        user,
        `You have successfully applied for the job: ${job.title}`,
      );
      expect(mailerService.sendApplicationEmail).toHaveBeenCalledWith(user.email, job.title);
      expect(result).toEqual({ message: 'Application submitted and email sent successfully' });
    });

    it('should throw if user already applied', async () => {
      const user = { id: 2 } as any;
      const job = { id: 1, appliedUsers: [user] } as any;

      jobsRepository.findOne.mockResolvedValue(job);
      usersRepository.findOne.mockResolvedValue(user);

      await expect(service.applyToJob(1, 2)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAppliedUsers', () => {
    it('should return applied users for the job', async () => {
      const appliedUsers = [{ id: 2 }, { id: 3 }] as any;
      const job = { id: 1, appliedUsers } as any;

      jobsRepository.findOne.mockResolvedValue(job);

      const result = await service.getAppliedUsers(1);

      expect(jobsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['appliedUsers'],
      });
      expect(result).toEqual(appliedUsers);
    });

    it('should throw NotFoundException if job is not found', async () => {
      jobsRepository.findOne.mockResolvedValue(null);

      await expect(service.getAppliedUsers(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getShortlistedUsers', () => {
    it('should return shortlisted users for the job', async () => {
      const shortlistedUsers = [{ id: 5 }, { id: 6 }] as any;
      const job = { id: 1, shortlistedUsers } as any;

      jobsRepository.findOne.mockResolvedValue(job);

      const result = await service.getShortlistedUsers(1);

      expect(jobsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['shortlistedUsers'],
      });
      expect(result).toEqual(shortlistedUsers);
    });

    it('should throw NotFoundException if job is not found', async () => {
      jobsRepository.findOne.mockResolvedValue(null);

      await expect(service.getShortlistedUsers(999)).rejects.toThrow(NotFoundException);
    });
});
});
