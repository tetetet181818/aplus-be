import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockDashboardService = {
    getOverview: jest.fn(),
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
    getUsersStats: jest.fn(),
    searchUsers: jest.fn(),
    getAllNotes: jest.fn(),
    getNotesStats: jest.fn(),
    MakeNotePublish: jest.fn(),
    MakeNoteUnPublish: jest.fn(),
    getAllSales: jest.fn(),
    getSalesStats: jest.fn(),
    getSingleSale: jest.fn(),
    getAllWithdrawals: jest.fn(),
    getWithdrawalsStats: jest.fn(),
    getWithdrawalsStatuses: jest.fn(),
    getSingleWithdrawal: jest.fn(),
    acceptedWithdrawal: jest.fn(),
    rejectedWithdrawal: jest.fn(),
    completedWithdrawal: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockJwtPayload: JwtPayload = {
    id: 'user-123',
    fullName: 'Test User',
    email: 'a@a.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
