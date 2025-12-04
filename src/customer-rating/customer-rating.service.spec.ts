import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRatingService } from './customer-rating.service';
import { getModelToken } from '@nestjs/mongoose';
import { CustomerRating } from '../schemas/customer-rating.schema';
import { Model } from 'mongoose';

describe('CustomerRatingService', () => {
  let service: CustomerRatingService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<CustomerRating>;

  const mockCustomerRatingModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRatingService,
        {
          provide: getModelToken(CustomerRating.name),
          useValue: mockCustomerRatingModel,
        },
      ],
    }).compile();

    service = module.get<CustomerRatingService>(CustomerRatingService);
    model = module.get<Model<CustomerRating>>(
      getModelToken(CustomerRating.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
