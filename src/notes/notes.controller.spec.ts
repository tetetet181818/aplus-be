import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { JwtPayload } from '../utils/types';

describe('NotesController', () => {
  let controller: NotesController;

  const mockNotesService = {
    getAllNotes: jest.fn(),
    getUserNotes: jest.fn(),
    getLikesNotes: jest.fn(),
    createNote: jest.fn(),
    bestSellersNotes: jest.fn(),
    updateNote: jest.fn(),
    getSingleNote: jest.fn(),
    deleteNote: jest.fn(),
    addReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    purchaseNote: jest.fn(),
    likeNote: jest.fn(),
    unlikeNote: jest.fn(),
    likeOrNot: jest.fn(),
    createPaymentLink: jest.fn(),
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
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<NotesController>(NotesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
