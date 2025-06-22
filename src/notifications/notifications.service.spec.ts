import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { Repository, ObjectLiteral } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('NotificationsService', () => {
let service: NotificationsService;
let notificationRepo: MockRepository<Notification>;

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
    ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepo = module.get<MockRepository<Notification>>(getRepositoryToken(Notification));
});

describe('sendNotification', () => {
    it('should create and save a notification', async () => {
    const user = { id: 1 } as User;
    const message = 'Test notification';
    const notificationEntity = { id: 1, message, user };

      // mock create and save behavior
    notificationRepo.create!.mockReturnValue(notificationEntity);
    notificationRepo.save!.mockResolvedValue(notificationEntity);

    const result = await service.sendNotification(user, message);

    expect(notificationRepo.create).toHaveBeenCalledWith({ user, message });
    expect(notificationRepo.save).toHaveBeenCalledWith(notificationEntity);
    expect(result).toEqual(notificationEntity);
    });
});

describe('getUserNotifications', () => {
    it('should return notifications for user ordered by id desc', async () => {
    const userId = 1;
    const notifications = [
        { id: 2, message: 'Second', user: { id: userId } },
        { id: 1, message: 'First', user: { id: userId } },
    ];

    notificationRepo.find!.mockResolvedValue(notifications);

    const result = await service.getUserNotifications(userId);

    expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        order: { id: 'DESC' },
    });
    expect(result).toEqual(notifications);
    });
});
});
