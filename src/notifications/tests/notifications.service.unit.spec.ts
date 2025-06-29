import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { Notification } from '../notification.entity'; 
import { ObjectLiteral, Repository } from 'typeorm';import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { NotFoundException } from '@nestjs/common';

type MockRepo<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: MockRepo<Notification>;
  let userRepo: MockRepo<User>;

  const mockUser = { id: 1 } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepo = module.get(getRepositoryToken(Notification));
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('sendNotification', () => {
    it('should create and save a notification', async () => {
      const message = 'Test notification';
      const mockNotification = { id: 1, message, user: mockUser };

      notificationRepo.create!.mockReturnValue(mockNotification);
      notificationRepo.save!.mockResolvedValue(mockNotification);

      const result = await service.sendNotification(mockUser, message);

      expect(notificationRepo.create).toHaveBeenCalledWith({ message, user: mockUser });
      expect(notificationRepo.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getNotificationsByUserId', () => {
    it('should return notifications for the user', async () => {
      const userId = 1;
      const mockNotifications = [
        { id: 2, message: 'Second', user: { id: userId } },
        { id: 1, message: 'First', user: { id: userId } },
      ];

      notificationRepo.find!.mockResolvedValue(mockNotifications);

      const result = await service.getNotificationsByUserId(userId);

      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('sendNotificationByUserId', () => {
    it('should find user and send notification', async () => {
      const message = 'Hi Mahmoud';
      const mockNotification = { id: 1, message, user: mockUser };

      userRepo.findOne!.mockResolvedValue(mockUser);
      notificationRepo.create!.mockReturnValue(mockNotification);
      notificationRepo.save!.mockResolvedValue(mockNotification);

      const result = await service.sendNotificationByUserId(mockUser.id, message);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(notificationRepo.create).toHaveBeenCalledWith({ message, user: mockUser });
      expect(notificationRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should throw if user not found', async () => {
      userRepo.findOne!.mockResolvedValue(null);

      await expect(service.sendNotificationByUserId(999, 'msg')).rejects.toThrow(NotFoundException);
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('createNotification', () => {
    it('should create notification using DTO', async () => {
      const dto = { userId: 1, message: 'Welcome!' };
      const notificationEntity = { id: 1, message: dto.message, user: mockUser };

      userRepo.findOne!.mockResolvedValue(mockUser);
      notificationRepo.create!.mockReturnValue(notificationEntity);
      notificationRepo.save!.mockResolvedValue(notificationEntity);

      const result = await service.createNotification(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: dto.userId } });
      expect(notificationRepo.create).toHaveBeenCalledWith({
        user: mockUser,
        message: dto.message,
      });
      expect(notificationRepo.save).toHaveBeenCalledWith(notificationEntity);
      expect(result).toEqual(notificationEntity);
    });

    it('should throw if user not found in createNotification', async () => {
      userRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.createNotification({ userId: 999, message: 'Hi' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
