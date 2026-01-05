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
import { NotificationGateway } from '../notification/notification.gateway';
import { SalesService } from '../sales/sales.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../utils/types';
import { AwsService } from '../aws/aws.service';

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
  const mockAwsService = {
    uploadThumbnail: jest.fn(),
    uploadNoteFile: jest.fn(),
  };

  const mockNotificationGateway = {
    emitToUser: jest.fn(),
    emitUploadProgress: jest.fn(),
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
        {
          provide: AwsService,
          useValue: mockAwsService,
        },
        {
          provide: NotificationGateway,
          useValue: mockNotificationGateway,
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

  describe('createNote', () => {
    it('should call upload methods if files are provided', async () => {
      const mockBody = {
        title: 'Test Note',
        price: 10,
        termsAccepted: 'true',
      } as any;
      const mockUser = 'user-123';
      const mockCover = { buffer: Buffer.from('cover') } as any;
      const mockNoteFile = { buffer: Buffer.from('note') } as any;

      mockAwsService.uploadThumbnail.mockResolvedValue('cover-url');
      mockAwsService.uploadNoteFile.mockResolvedValue('note-url');
      mockNoteModel.create.mockResolvedValue({
        title: 'Test Note',
        owner_id: 'user-123',
      });

      await service.createNote(mockBody, mockUser, mockCover, mockNoteFile);

      expect(mockAwsService.uploadThumbnail).toHaveBeenCalledWith(
        mockCover,
        expect.any(Function),
      );
      expect(mockAwsService.uploadNoteFile).toHaveBeenCalledWith(
        mockNoteFile,
        expect.any(Function),
      );
      expect(mockNoteModel.create).toHaveBeenCalled();
    });
  });
});
