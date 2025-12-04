/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/mongoose';
import { Note } from '../schemas/note.schema';
import { User } from '../schemas/users.schema';
import { Sales } from '../schemas/sales.schema';
import { Withdrawal } from '../schemas/withdrawal.schema';
import { Model } from 'mongoose';
import { NotificationService } from '../notification/notification.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let noteModel: Model<Note>;
  let userModel: Model<User>;
  let salesModel: Model<Sales>;
  let withdrawalModel: Model<Withdrawal>;

  const mockNoteModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    save: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockSalesModel = {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockWithdrawalModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Note.name),
          useValue: mockNoteModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Sales.name),
          useValue: mockSalesModel,
        },
        {
          provide: getModelToken(Withdrawal.name),
          useValue: mockWithdrawalModel,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    noteModel = module.get<Model<Note>>(getModelToken(Note.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));
    salesModel = module.get<Model<Sales>>(getModelToken(Sales.name));
    withdrawalModel = module.get<Model<Withdrawal>>(
      getModelToken(Withdrawal.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
