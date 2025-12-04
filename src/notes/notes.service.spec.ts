/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { getModelToken } from '@nestjs/mongoose';
import { Note } from '../schemas/note.schema';
import { User } from '../schemas/users.schema';
import { Sales } from '../schemas/sales.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { SalesService } from '../sales/sales.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../utils/types';

describe('NotesService', () => {
  let service: NotesService;
  let noteModel: Model<Note>;
  let userModel: Model<User>;
  let salesModel: Model<Sales>;

  const mockNoteModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateOne: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    exec: jest.fn(),
  };

  const mockSalesModel = {
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  const mockSalesService = {
    createSale: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockJwtPayload: JwtPayload = {
    id: 'user-123',
    fullName: 'Test User',
    email: 'a@a.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
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
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    service = module.get<NotesService>(NotesService);
    noteModel = module.get<Model<Note>>(getModelToken(Note.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));
    salesModel = module.get<Model<Sales>>(getModelToken(Sales.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
