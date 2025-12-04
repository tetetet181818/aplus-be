/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsService } from './withdrawals.service';
import { getModelToken } from '@nestjs/mongoose';
import { Withdrawal } from '../schemas/withdrawal.schema';
import { User } from '../schemas/users.schema';
import { Model } from 'mongoose';
import { NotificationService } from '../notification/notification.service';

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;
  let withdrawalModel: Model<Withdrawal>;
  let userModel: Model<User>;

  const mockWithdrawalModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    select: jest.fn(),
    save: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalsService,
        {
          provide: getModelToken('Withdrawal'),
          useValue: mockWithdrawalModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<WithdrawalsService>(WithdrawalsService);
    withdrawalModel = module.get<Model<Withdrawal>>(
      getModelToken('Withdrawal'),
    );
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
