import { Test, TestingModule } from '@nestjs/testing';
import { ProfitsController } from './profits.controller';
import { ProfitsService } from './profits.service';

describe('ProfitsController', () => {
  let controller: ProfitsController;

  const mockProfitsService = {
    getAllProfits: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfitsController],
      providers: [
        {
          provide: ProfitsService,
          useValue: mockProfitsService,
        },
      ],
    }).compile();

    controller = module.get<ProfitsController>(ProfitsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
