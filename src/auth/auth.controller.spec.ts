import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
// import { ForgetPasswordDto } from './dtos/forget-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import type { JwtPayload, GoogleAuthRequest } from '../utils/types';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    getCurrentUser: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    verify: jest.fn(),
    logout: jest.fn(),
    forgetPassword: jest.fn(),
    resetPassword: jest.fn(),
    deleteAccount: jest.fn(),
    updateUser: jest.fn(),
    getBestSellers: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    googleLogin: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockGoogleAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(GoogleAuthGuard)
      .useValue(mockGoogleAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const payload: JwtPayload = { id: 'user-123', email: 'test@example.com' };
      const expectedUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      mockAuthService.getCurrentUser.mockResolvedValue(expectedUser);

      const result = await controller.getCurrentUser(payload);

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expectedUser);
    });

    it('should handle empty id in payload', async () => {
      const payload: JwtPayload = { id: '', email: 'test@example.com' };

      await controller.getCurrentUser(payload);

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith('');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };
      const expectedResult = { message: 'User registered successfully' };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        message: 'مرحباً بعودتك! تم تسجيل الدخول بنجاح ✅',
        statusCode: 200,
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto,
        mockResponse,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verify', () => {
    it('should verify user with token', async () => {
      const token = 'verification-token';
      const expectedResult = { message: 'Email verified successfully' };

      mockAuthService.verify.mockResolvedValue(expectedResult);

      const result = await controller.verify(token, mockResponse);

      expect(mockAuthService.verify).toHaveBeenCalledWith(token, mockResponse);
      expect(result).toEqual(expectedResult);
    });
  });

  // describe('forgetPassword', () => {
  //   it('should send password reset email', async () => {
  //     const forgetPasswordDto: ForgetPasswordDto = {
  //       email: 'test@example.com',
  //     };
  //     const expectedResult = { message: 'Password reset email sent' };

  //     mockAuthService.forgetPassword.mockResolvedValue(expectedResult);

  //     const result = await controller.forgetPassword(forgetPasswordDto);

  //     expect(mockAuthService.forgetPassword).toHaveBeenCalledWith(
  //       forgetPasswordDto.email,
  //     );
  //     expect(result).toEqual(expectedResult);
  //   });
  // });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        userId: 'user-123',
        resetPasswordToken: 'reset-token',
        newPassword: 'newPassword123',
      };
      const expectedResult = { message: 'Password reset successfully' };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const payload: JwtPayload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
      };
      const expectedResult = { message: 'Account deleted successfully' };

      mockAuthService.deleteAccount.mockResolvedValue(expectedResult);

      const result = await controller.deleteAccount(payload);

      expect(mockAuthService.deleteAccount).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const payload: JwtPayload = { id: 'user-123', email: 'test@example.com' };
      const updateUserDto: UpdateUserDto = { university: 'Updated Name' };
      const expectedResult = { message: 'User updated successfully' };

      mockAuthService.updateUser.mockResolvedValue(expectedResult);

      const result = await controller.updateUser(payload, updateUserDto);

      expect(mockAuthService.updateUser).toHaveBeenCalledWith(
        'user-123',
        updateUserDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return early if payload id is empty', async () => {
      const payload: JwtPayload = {
        id: '',
        email: 'test@example.com',
        role: 'student',
      };
      const updateUserDto: UpdateUserDto = { university: 'Updated Name' };

      const result = await controller.updateUser(payload, updateUserDto);

      expect(mockAuthService.updateUser).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return early if payload id is undefined', async () => {
      const payload: JwtPayload = {
        email: 'test@example.com',
        role: 'student',
      };
      const updateUserDto: UpdateUserDto = { university: 'Updated Name' };

      const result = await controller.updateUser(payload, updateUserDto);

      expect(mockAuthService.updateUser).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('getBestSellers', () => {
    it('should return best sellers list', async () => {
      const expectedResult = [
        { id: '1', fullName: 'Seller 1', sales: 100 },
        { id: '2', fullName: 'Seller 2', sales: 90 },
      ];

      mockAuthService.getBestSellers.mockResolvedValue(expectedResult);

      const result = await controller.getBestSellers();

      expect(mockAuthService.getBestSellers).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users with default values', async () => {
      const expectedResult = {
        users: [{ id: '1', fullName: 'User 1' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockAuthService.getAllUsers.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers();

      expect(mockAuthService.getAllUsers).toHaveBeenCalledWith(1, 10, '');
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated users with custom page and limit', async () => {
      const expectedResult = {
        users: [{ id: '1', fullName: 'User 1' }],
        total: 50,
        page: 2,
        limit: 20,
      };

      mockAuthService.getAllUsers.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers('2', '20');

      expect(mockAuthService.getAllUsers).toHaveBeenCalledWith(2, 20, '');
      expect(result).toEqual(expectedResult);
    });

    it('should return filtered users by fullName', async () => {
      const expectedResult = {
        users: [{ id: '1', fullName: 'John Doe' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockAuthService.getAllUsers.mockResolvedValue(expectedResult);

      const result = await controller.getAllUsers('1', '10', 'John');

      expect(mockAuthService.getAllUsers).toHaveBeenCalledWith(1, 10, 'John');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      const expectedUser = {
        id: 'user-123',
        fullName: 'Test User',
        email: 'test@example.com',
      };

      mockAuthService.getUserById.mockResolvedValue(expectedUser);

      const result = await controller.getUserById(userId);

      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('googleAuthCallback', () => {
    it('should handle google auth callback', async () => {
      const mockRequest = {
        user: { id: 'google-user-123', email: 'google@example.com' },
      } as unknown as GoogleAuthRequest;
      const expectedResult = {
        token: 'jwt-token',
        user: { id: 'google-user-123' },
      };

      mockAuthService.googleLogin.mockResolvedValue(expectedResult);

      const result = await controller.googleAuthCallback(
        mockRequest,
        mockResponse,
      );

      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
