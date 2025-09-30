import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Note } from '../schemas/note.schema';
import response from '../utils/response.pattern';
import { CreateNoteDto } from './dtos/create-note.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { User } from 'src/schemas/users.schema';
@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<Note>,
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
  ) {}

  /** Create new note with comprehensive error handling */
  public async createNote(
    body: CreateNoteDto,
    userId: string,
    image?: Express.Multer.File,
    file?: Express.Multer.File,
  ) {
    try {
      if (!userId) {
        throw new BadRequestException('معرف المستخدم مطلوب');
      }
      let uploadImage: UploadApiResponse | null = null;
      let uploadFilePdf: UploadApiResponse | null = null;
      // upload image to cloudanry
      if (image) {
        uploadImage = await this.uploadImage(image);
      }

      if (file) {
        uploadFilePdf = await this.uploadFile(file);
      }
      const noteData: Partial<Note> = {
        owner_id: userId,
        ...(uploadFilePdf && { file_path: uploadFilePdf.secure_url }),
        ...(uploadImage && { cover_url: uploadImage.secure_url }),
        ...body,
        termsAccepted:
          body.termsAccepted === 'true' || body.termsAccepted === '1',
      };

      const newNote = await this.noteModel.create(noteData);

      if (!newNote) {
        throw new InternalServerErrorException('فشل في إنشاء الملخص');
      }

      return response({
        data: newNote,
        message: 'تم إنشاء الملخص بنجاح، يمكنك الآن عرضه أو تعديله',
        statusCode: 201,
      });
    } catch (err: unknown) {
      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }

      if (
        typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        (err as { name?: unknown }).name === 'ValidationError' &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
        throw new BadRequestException(
          `بيانات غير صالحة: ${(err as { message: string }).message}`,
        );
      }

      // Handle MongoDB duplicate key
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: unknown }).code === 11000
      ) {
        throw new BadRequestException('الملف موجود مسبقاً');
      }

      throw new InternalServerErrorException(
        'خطأ في الخادم أثناء إنشاء الملخص',
      );
    }
  }

  public async getPurchasedNotes(userId: string) {
    const notes = await this.noteModel.find({ purchased_by: userId }).lean();

    if (!notes || notes.length === 0) {
      throw new NotFoundException('لم تقم بشراء أي ملخصات بعد');
    }

    return response({
      message: 'تم جلب جميع الملخصات التي قمت بشرائها بنجاح',
      statusCode: 200,
      data: notes,
    });
  }

  /**
   * Fetch all notes with pagination and sorting
   * @param page - Current page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param sortBy - Field to sort by (default: createdAt)
   * @param sortOrder - Sort order: asc or desc (default: desc)
   * @returns Paginated notes with metadata
   */

  public async getAllNotes(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    // Allowed sort fields
    const sortOptions: Record<string, string> = {
      price: 'price',
      year: 'year',
      title: 'title',
      createdAt: 'createdAt',
    };

    const sortField = sortOptions[sortBy] || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [notes, total] = await Promise.all([
      this.noteModel
        .find()
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.noteModel.countDocuments(),
    ]);

    if (!notes || notes.length === 0) {
      throw new NotFoundException('No notes available');
    }

    return {
      message: 'Notes retrieved successfully',
      data: notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statusCode: 200,
    };
  }

  /** Get single note by ID */
  public async getSingleNote(id: string) {
    const singleNote = await this.noteModel.findOne({ _id: id }).lean();

    // get owner data in the same query
    const ownerData = await this.usersModel
      .findById(singleNote?.owner_id)
      .select('fullName email university');

    if (!singleNote) {
      throw new NotFoundException('لم يتم العثور على هذا الملخص');
    }

    return response({
      message: 'تم جلب تفاصيل الملخص بنجاح',
      data: { ownerData, ...singleNote },
      statusCode: 200,
    });
  }

  /** Delete note by ID */
  public async deleteNote(noteId: string, userId: string) {
    const note = await this.noteModel.findById(noteId);

    if (!note) {
      throw new NotFoundException('الملخص المطلوب غير موجود');
    }

    if (note.owner_id !== userId) {
      throw new BadRequestException('غير مسموح لك بحذف هذا الملخص');
    }

    const deletedNote = await this.noteModel.findByIdAndDelete(noteId);

    if (!deletedNote) {
      throw new NotFoundException('حدث خطأ أثناء الحذف');
    }

    return response({
      message: 'تم حذف الملخص بنجاح',
      statusCode: 200,
    });
  }

  /** Get notes by user */
  public async getUserNotes(userId: string) {
    const notes = await this.noteModel.find({ owner_id: userId }).lean();

    if (!notes || notes.length === 0) {
      throw new NotFoundException('لا توجد ملخصات خاصة بك حالياً');
    }

    return response({
      message: 'تم جلب جميع ملخصاتك بنجاح',
      statusCode: 200,
      data: notes,
    });
  }

  /** get like notes */
  public async getLikesNotes(userId: string) {
    const user = await this.usersModel.findById(userId).select('likesList');

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const noteIds = user.likesList.map(
      (item: { noteId: string }) => item.noteId,
    );

    const notes = await this.noteModel.find({ _id: { $in: noteIds } });

    return response({
      data: notes,
      message: 'تم جلب الملخصات المعجب بها',
      statusCode: 200,
    });
  }

  /** Add review to note */
  public async addReview(
    noteId: string,
    review: {
      rating: number;
      comment: string;
      userId: string;
      userName: string;
    },
  ) {
    const note = await this.noteModel.findById(noteId);
    if (!note) {
      throw new NotFoundException('الملخص المطلوب غير موجود');
    }

    const newReview = {
      _id: new Types.ObjectId().toString(),
      ...review,
    };

    note.reviews.push(newReview);
    await note.save();

    return response({
      message: 'تم إضافة المراجعة بنجاح',
      statusCode: 201,
      data: [newReview],
    });
  }

  /** Update review */
  public async updateReview(
    noteId: string,
    reviewId: string,
    userId: string,
    updateData: UpdateReviewDto,
  ) {
    const note = await this.noteModel.findById(noteId);
    if (!note) throw new NotFoundException('الملخص غير موجود');

    const review = note.reviews.find((item) => item._id === reviewId);

    if (!review) throw new NotFoundException('المراجعة غير موجودة');

    if (review.userId !== userId) {
      throw new UnauthorizedException('غير مسموح لك بتعديل هذه المراجعة');
    }

    if (updateData.rating !== undefined) review.rating = updateData.rating;
    if (updateData.comment !== undefined) review.comment = updateData.comment;

    await note.save();

    return response({
      message: 'تم تعديل المراجعة بنجاح',
      statusCode: 200,
    });
  }

  /** Delete review */
  public async deleteReview(noteId: string, reviewId: string, userId: string) {
    const note = await this.noteModel.findById(noteId);
    if (!note) throw new NotFoundException('الملخص غير موجود');

    const review = note.reviews.find((item) => item._id === reviewId);

    if (!review) throw new NotFoundException('المراجعة غير موجودة');

    if (review.userId !== userId) {
      throw new UnauthorizedException('غير مسموح لك بحذف هذه المراجعة');
    }

    note.reviews = note.reviews.filter((item) => item._id !== reviewId);
    await note.save();

    return response({
      message: 'تم حذف المراجعة بنجاح',
      statusCode: 200,
      data: [{ reviewId }],
    });
  }

  public purchaseNote(noteId, userId) {
    console.log(noteId);
    console.log(userId);
  }
  /** user make like to note and store noteId in like_list in user Schema */

  public async likeNote(noteId: string, userId: string) {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyLiked = user.likesList.some(
      (like: { noteId: string }) => like.noteId === noteId,
    );
    if (alreadyLiked) {
      return response({
        message: 'الملخص موجود بالفعل في قائمة الإعجابات',
        statusCode: 400,
      });
    }
    await this.usersModel.updateOne(
      { _id: userId },
      { $push: { likesList: { noteId } } },
    );
    return response({
      message: 'تم إضافة الملخص إلى قائمة الإعجابات',
      statusCode: 200,
    });
  }

  public async unlikeNote(noteId: string, userId: string) {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyLiked = user.likesList.some(
      (like: { noteId: string }) => like.noteId === noteId,
    );

    if (!alreadyLiked) {
      return response({
        message: 'الملخص غير موجود في قائمة الإعجابات',
        statusCode: 200,
      });
    }

    await this.usersModel.updateOne(
      { _id: userId },
      { $pull: { likesList: { noteId } } },
    );

    return response({
      message: 'تمت إزالة الملخص من قائمة الإعجابات',
      statusCode: 200,
    });
  }

  public async likeOrNot(noteId: string, userId: string) {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyLiked = user.likesList.some(
      (like: { noteId: string }) => like.noteId === noteId,
    );

    return response({
      message: `${alreadyLiked ? 'الملخص موجود في قائمة الإعجابات' : 'الملخص غير موجود في قائمة الإعجابات'}`,
      data: alreadyLiked,
      statusCode: 200,
    });
  }

  private async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'images' },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              const err = new Error(error.message || 'Cloudinary upload error');
              err.name = (error as { name?: string }).name || 'CloudinaryError';
              reject(err);
              return;
            }
            if (!result) {
              reject(new Error('Cloudinary upload failed without a result.'));
              return;
            }
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  private async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'pdfs' },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              const err = new Error(error.message || 'Cloudinary upload error');
              err.name = (error as { name?: string }).name || 'CloudinaryError';
              reject(err);
              return;
            }
            if (!result) {
              reject(new Error('Cloudinary upload failed without a result.'));
              return;
            }
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
