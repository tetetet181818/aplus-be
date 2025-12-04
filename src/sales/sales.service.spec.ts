/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { getModelToken } from '@nestjs/mongoose';
import { Sales } from '../schemas/sales.schema';
import { User } from '../schemas/users.schema';
import { Note } from '../schemas/note.schema';
import { Model } from 'mongoose';
import { NotificationService } from '../notification/notification.service';

describe('SalesService', () => {
  let service: SalesService;
  let salesModel: Model<Sales>;
  let userModel: Model<User>;
  let noteModel: Model<Note>;

  const mockSalesModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    sort: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockNoteModel = {
    find: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken('Sales'),
          useValue: mockSalesModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Note.name),
          useValue: mockNoteModel,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    salesModel = module.get<Model<Sales>>(getModelToken('Sales'));
    userModel = module.get<Model<User>>(getModelToken(User.name));
    noteModel = module.get<Model<Note>>(getModelToken(Note.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
