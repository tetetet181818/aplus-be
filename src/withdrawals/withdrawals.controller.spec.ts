import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';

describe('WithdrawalsController', () => {
  let controller: WithdrawalsController;

  const mockWithdrawalsService = {
    getAllUserWithdrawals: jest.fn(),
    createWithdrawal: jest.fn(),
    getAllWithdrawals: jest.fn(),
    getSingleWithdrawal: jest.fn(),
    updateWithdrawal: jest.fn(),
    deleteWithdrawal: jest.fn(),
    addAdminNote: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockJwtPayload: JwtPayload = {
    id: 'user-123',
    fullName: 'Test User',
    email: 'a@a.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalsController],
      providers: [
        {
          provide: WithdrawalsService,
          useValue: mockWithdrawalsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<WithdrawalsController>(WithdrawalsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
