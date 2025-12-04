import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRatingController } from './customer-rating.controller';
import { CustomerRatingService } from './customer-rating.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';

describe('CustomerRatingController', () => {
  let controller: CustomerRatingController;

  const mockCustomerRatingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    publishRating: jest.fn(),
    unPublishRating: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    userRatedBefore: jest.fn(),
    getCustomerRatingForDashboard: jest.fn(),
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
      controllers: [CustomerRatingController],
      providers: [
        {
          provide: CustomerRatingService,
          useValue: mockCustomerRatingService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<CustomerRatingController>(CustomerRatingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    // TODO: Add test cases
  });

  describe('findAll', () => {
    // TODO: Add test cases
  });

  describe('publishRating', () => {
    // TODO: Add test cases
  });

  describe('unPublishRating', () => {
    // TODO: Add test cases
  });

  describe('update', () => {
    // TODO: Add test cases
  });

  describe('remove', () => {
    // TODO: Add test cases
  });

  describe('userRatedBefore', () => {
    // TODO: Add test cases
  });

  describe('getCustomerRatingForDashboard', () => {
    // TODO: Add test cases
  });
});
