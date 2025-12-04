import { Test, TestingModule } from '@nestjs/testing';
import { ProfitsService } from './profits.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ProfitsService', () => {
  let service: ProfitsService;

  const mockUserModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    select: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfitsService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<ProfitsService>(ProfitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
