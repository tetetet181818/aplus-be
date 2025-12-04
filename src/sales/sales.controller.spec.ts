import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';

describe('SalesController', () => {
  let controller: SalesController;

  const mockSalesService = {
    getUserStatisticsSales: jest.fn(),
    createSale: jest.fn(),
    getSalesByUserId: jest.fn(),
    getSalesUserStats: jest.fn(),
    getAllSales: jest.fn(),
    getDetailsSalesNote: jest.fn(),
    getSingleSale: jest.fn(),
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
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<SalesController>(SalesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
