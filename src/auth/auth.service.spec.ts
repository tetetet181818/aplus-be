/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('node:crypto', () => ({
  randomBytes: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockNotesModel: any = {
    find: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendRegistrationEmail: jest.fn(),
    sendForgetPasswordEmail: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  const mockRes: any = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  };

  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUserModel.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    mockUserModel.findOne.mockResolvedValue(null);
    mockUserModel.create.mockResolvedValue(null);

    mockUserModel.find.mockReturnValue({
      sort: () => ({
        select: () => ({ lean: () => [] }),
      }),
      skip: () => ({
        limit: () => ({
          select: () => ({ lean: () => [] }),
        }),
      }),
    });

    mockUserModel.findByIdAndDelete.mockResolvedValue(null);

    mockUserModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    mockNotesModel.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    });

    mockJwtService.signAsync.mockResolvedValue('signed-token');
    mockJwtService.verifyAsync.mockResolvedValue({});

    mockConfigService.get.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        NODE_ENV: 'development',
        FRONTEND_SERVER_DEVELOPMENT: 'http://dev',
        FRONTEND_SERVER_PRODUCTION: 'http://prod',
      };
      return map[key];
    });

    (crypto.randomBytes as jest.Mock).mockReturnValue(
      Buffer.from('a'.repeat(32)),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Note'), useValue: mockNotesModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
