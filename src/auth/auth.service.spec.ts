/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgetPasswordDto } from './dtos/forget-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { NotificationService } from '../notification/notification.service';
import { AwsService } from '../aws/aws.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
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

  const mockAwsService = {
    uploadAvatar: jest.fn(),
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
    mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Note'), useValue: mockNotesModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AwsService, useValue: mockAwsService },
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

  describe('getCurrentUser', () => {
    it('should return user data if id is valid', async () => {
      const mockUser = {
        _id: 'user-123',
        fullName: 'Test User',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue(mockUser),
      });

      const result = await service.getCurrentUser('user-123');

      expect(result.data).toEqual(mockUser);
      expect(result.statusCode).toBe(200);
    });

    it('should throw UnauthorizedException if id is missing', async () => {
      await expect(service.getCurrentUser('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue(null),
      });

      await expect(service.getCurrentUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      fullName: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
      university: 'Test University',
    };

    it('should successfully register and send email', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockJwtService.signAsync.mockResolvedValue('test-token');

      const result = await service.register(registerDto);

      expect(mockMailService.sendRegistrationEmail).toHaveBeenCalled();
      expect(result.statusCode).toBe(201);
      expect(result.message).toContain('تم إنشاء الحساب');
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should normalize name and add random suffix if name exists', async () => {
      mockUserModel.findOne
        .mockResolvedValueOnce(null) // for email
        .mockResolvedValueOnce({ fullName: 'TestUser' }); // for name check

      mockJwtService.signAsync.mockResolvedValue('test-token');

      await service.register(registerDto);

      const signCall = mockJwtService.signAsync.mock.calls[0][0];
      expect(signCall.fullName).toMatch(/TestUser_.+/);
    });
  });

  describe('verify', () => {
    const verifyToken = 'valid-token';
    const decodedPayload = {
      email: 'test@example.com',
      fullName: 'TestUser',
      password: 'hashed-password',
      university: 'Test Uni',
    };

    it('should verify token and create user', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'new-id',
        ...decodedPayload,
        role: 'student',
      });
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.verify(verifyToken, mockRes);

      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(result.statusCode).toBe(201);
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verify('invalid', mockRes)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockUserModel.findOne.mockResolvedValue({ email: 'test@example.com' });

      await expect(service.verify(verifyToken, mockRes)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully and set cookies', async () => {
      const mockUser = {
        _id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
        role: 'student',
        fullName: 'Test User',
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(loginDto, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(result.statusCode).toBe(200);
      expect(result.message).toContain('نجاح');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto, mockRes)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password matches fails', async () => {
      mockUserModel.findOne.mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgetPassword', () => {
    const forgetPasswordDto: ForgetPasswordDto = { email: 'test@example.com' };

    it('should send reset email if user exists', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        resetPasswordToken: '',
        resetPasswordExpires: 0,
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.forgetPassword(forgetPasswordDto);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockMailService.sendForgetPasswordEmail).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.forgetPassword(forgetPasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });
    describe('resetPassword', () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: '60d0fe4f5311236168a109ca',
        resetPasswordToken:
          'cbb35fdbd30b607c26ea984b8f67ce83d29c179b436e329550ecf',
        newPassword: 'newPassword123',
      };

      it('should reset password successfully', async () => {
        const mockUser = {
          _id: '60d0fe4f5311236168a109ca',
          resetPasswordToken:
            'cbb35fdbd30b607c26ea984b8f67ce83d29c179b436e329550ecf',
          resetPasswordExpires: Date.now() + 10000,
          save: jest.fn().mockResolvedValue(true),
        };
        mockUserModel.findOne.mockResolvedValue(mockUser);
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

        const result = await service.resetPassword(resetPasswordDto);

        expect(mockUser.save).toHaveBeenCalled();
        expect(result.statusCode).toBe(200);
        expect(result.message).toContain('نجاح');
      });

      it('should throw BadRequestException if token is invalid or expired', async () => {
        mockUserModel.findOne.mockResolvedValue({
          resetPasswordToken: 'different-token',
          resetPasswordExpires: Date.now() - 1000,
        });

        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException if user not found', async () => {
        mockUserModel.findOne.mockResolvedValue(null);

        await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('deleteAccount', () => {
      it('should delete account successfully', async () => {
        mockUserModel.findById.mockResolvedValue({ _id: 'user-id' });
        mockUserModel.findByIdAndDelete.mockResolvedValue(true);

        const result = await service.deleteAccount('user-id');

        expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('user-id');
        expect(result.statusCode).toBe(200);
      });

      it('should throw NotFoundException if user not found', async () => {
        mockUserModel.findById.mockResolvedValue(null);

        await expect(service.deleteAccount('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const mockUser = {
          _id: 'user-id',
          university: 'Old Uni',
          save: jest.fn().mockResolvedValue(true),
        };
        mockUserModel.findById.mockResolvedValue(mockUser);

        const result = await service.updateUser('user-id', {
          university: 'New Uni',
        });

        expect(mockUser.university).toBe('New Uni');
        expect(mockUser.save).toHaveBeenCalled();
        expect(result.statusCode).toBe(200);
      });
    });

    describe('updateAvatar', () => {
      const mockFile = { buffer: Buffer.from('') } as Express.Multer.File;

      it('should update avatar successfully', async () => {
        mockAwsService.uploadAvatar.mockResolvedValue('http://avatar-url');
        mockUserModel.findByIdAndUpdate.mockResolvedValue({ _id: 'user-id' });

        const result = await service.updateAvatar('user-id', mockFile);

        expect(mockAwsService.uploadAvatar).toHaveBeenCalledWith(mockFile);
        expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(result.statusCode).toBe(200);
      });

      it('should throw BadRequestException if file is missing', async () => {
        await expect(
          service.updateAvatar('user-id', null as any),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
