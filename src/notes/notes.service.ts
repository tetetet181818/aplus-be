import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import axios from 'axios';
import { Note } from '../schemas/note.schema';
import response from '../utils/response.pattern';
import { CreateNoteDto } from './dtos/create-note.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { User } from '../schemas/users.schema';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';
import { SalesService } from '../sales/sales.service';
import { PLATFORM_DECREMENT_PERCENT, PLATFORM_FREE } from '../utils/constants';
import { UpdateNoteDto } from './dtos/update.note.dto';
import { Express } from 'express';
import type { Response } from 'express';
import { Sales } from '../schemas/sales.schema';
@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<Note>,
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
    @InjectModel(Sales.name)
    private readonly saleModel: Model<Sales>,
    private readonly config: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly salesService: SalesService,
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

      await this.notificationService.create({
        userId,
        title: 'تم انشاء ملخص جديد',
        message: `تم انشاء ملخص جديد بنجاح باسم ${newNote.title}`,
        type: 'notes',
      });

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

  /**
   * Retrieves all purchased notes for a specific user,
   * along with their related sales records.
   */
  public async getPurchasedNotes(userId: string) {
    // Get all notes purchased by the user
    const notes = await this.noteModel
      .find({
        purchased_by: { $in: [userId] },
      })
      .select('-__v -reviews -purchased_by')
      .sort({ createdAt: -1 })
      .lean();

    if (!notes || notes.length === 0) {
      throw new NotFoundException('لم تقم بشراء أي ملخصات بعد');
    }

    // Get all sales linked to those notes
    const sales = await this.saleModel
      .find({
        note_id: { $in: notes.map((note) => note._id) },
        buyerId: userId,
      })
      .lean();

    const notesWithSales = notes.map((note) => {
      const sale = sales.find(
        (s) => s.note_id.toString() === note._id.toString(),
      );
      return {
        ...note,
        saleId: sale?._id || null,
      };
    });

    return response({
      message: 'تم جلب جميع الملخصات التي قمت بشرائها بنجاح',
      statusCode: 200,
      data: notesWithSales,
    });
  }

  /**
   * Retrieves all notes with optional filtering, pagination, and sorting.
   * Supports case-insensitive title search.
   * Can sort primarily by maxDownloads, maxPrice, or minPrice.
   *
   * @param {number} page - The current page number.
   * @param {number} limit - The number of items per page.
   * @param {string} sortBy - The field to sort by (default: createdAt).
   * @param {'asc'|'desc'} sortOrder - The sort order (default: desc).
   * @param {string} [title] - Optional filter by title (case-insensitive).
   * @param {string} [university] - Optional filter by university.
   * @param {string} [college] - Optional filter by college.
   * @param {string} [year] - Optional filter by year.
   * @param {boolean} [maxDownloads] - Sort primarily by highest downloads.
   * @param {boolean} [maxPrice] - Sort primarily by highest price.
   * @param {boolean} [minPrice] - Sort primarily by lowest price.
   */
  public async getAllNotes(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    title?: string,
    university?: string,
    college?: string,
    year?: string,
    maxDownloads: boolean = false,
    maxPrice: boolean = false,
    minPrice: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, string> = {
      price: 'price',
      year: 'year',
      title: 'title',
      createdAt: 'createdAt',
    };

    const sortField = sortOptions[sortBy] || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const filters: Record<string, any> = {};
    if (title) filters.title = { $regex: title, $options: 'i' };
    if (university) filters.university = university;
    if (college) filters.college = college;
    if (year) filters.year = year;

    let sort: Record<string, 1 | -1>;
    if (maxDownloads) {
      sort = { downloads: -1, [sortField]: sortDirection };
    } else if (maxPrice) {
      sort = { price: -1, [sortField]: sortDirection };
    } else if (minPrice) {
      sort = { price: 1, [sortField]: sortDirection };
    } else {
      sort = { [sortField]: sortDirection };
    }

    const [notes, total] = await Promise.all([
      this.noteModel.find(filters).sort(sort).skip(skip).limit(limit).lean(),
      this.noteModel.countDocuments(filters),
    ]);

    if (!notes || notes.length === 0) {
      return {
        message: 'لا توجد ملخصات مطابقة للبحث.',
        statusCode: 200,
        data: [],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    return {
      message: 'تم استرجاع الملخصات بنجاح',
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
    const user = await this.usersModel.findById(userId).select('fullName');

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم حذف الملخص بنجاح 🎉',
      message: `تم حذف الملخص "${note.title}" بنجاح. شكراً لك 🎉`,
    });

    return response({
      message: 'تم حذف الملخص بنجاح',
      statusCode: 200,
    });
  }

  /** Get notes by user */
  public async getUserNotes(userId: string) {
    const notes = await this.noteModel
      .find({ owner_id: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!notes) {
      throw new NotFoundException('لا توجد ملخصات خاصة بك حالياً');
    }

    return response({
      message: 'تم جلب جميع ملخصاتك بنجاح',
      statusCode: 200,
      data: notes?.length > 0 ? notes : [],
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
      data: notes?.length > 0 ? notes : [],
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

    const userAvatar =
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(review.userName) +
      '&background=random&length=1&size=128';

    const newReview = {
      _id: new Types.ObjectId().toString(),
      userAvatar,
      ...review,
    };

    note.reviews.push(newReview);
    await note.save();
    const user = await this.usersModel.findById(review.userId);

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم إضافة تقييم جديد 🎉',
      message: `تم إضافة تقييم جديدة للملخص "${note.title}"`,
    });

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

    const review = note?.reviews.find((item) => item._id === reviewId);

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

    const user = await this.usersModel.findById(review.userId);

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم حذف تقييم جديد',
      message: `تم حذف تقييم للملخص "${note.title}`,
    });

    return response({
      message: 'تم حذف المراجعة بنجاح',
      statusCode: 200,
      data: [{ reviewId }],
    });
  }

  /**  purchase note */
  public async purchaseNote(
    noteId: string,
    userId: string,
    body: { invoice_id: string; status?: string },
  ) {
    const note = await this.noteModel.findById(noteId);
    if (!note) {
      throw new NotFoundException('الملخص المطلوب غير موجود');
    }

    if (note.owner_id === userId) {
      throw new BadRequestException('لا يمكنك شراء ملخص خاص بك');
    }

    if (note.purchased_by?.includes(userId)) {
      throw new BadRequestException('لقد قمت بشراء هذا الملخص مسبقاً');
    }

    // create sales partion
    await this.salesService.createSale({
      sellerId: note.owner_id.toString(),
      buyerId: userId,
      note_id: noteId,
      amount: note.price - PLATFORM_DECREMENT_PERCENT * note.price,
      commission: PLATFORM_DECREMENT_PERCENT * note.price,
      payment_method: 'credit_card',
      note_title: note.title,
      invoice_id: body.invoice_id,
      status: body.status || '',
      message:
        'Thank you for your purchase! You can now access the note in your dashboard.',
      platform_fee: PLATFORM_FREE,
    });

    const updateNote = await this.noteModel.updateOne(
      { _id: noteId },
      { $push: { purchased_by: userId } },
    );

    note.downloads += 1;
    await note.save();

    if (!updateNote) {
      throw new NotFoundException('حدث خطاء اثناء شراء الملخص');
    }

    const seller = await this.usersModel.findById(note.owner_id);

    if (!seller) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    seller.balance += note.price - PLATFORM_DECREMENT_PERCENT * note.price;
    await seller.save();

    return response({
      message: 'تم شراء الملخص بنجاح',
      statusCode: 200,
    });
  }

  public async createPaymentLink({
    noteId,
    userId,
    amount,
  }: {
    noteId: string;
    userId: string;
    amount: string;
  }) {
    const domain =
      this.config.get<string>('NODE_ENV') === 'production'
        ? this.config.get<string>('FRONTEND_SERVER_PRODUCTION')
        : this.config.get<string>('FRONTEND_SERVER_DEVELOPMENT');
    try {
      const res = await axios.post(
        'https://api.moyasar.com/v1/invoices',
        {
          amount: Math.round(parseFloat(amount) * 100),
          currency: 'SAR',
          description: `شراء ملخص رقم ${noteId}`,
          callback_url: `${domain}/api/payment/callback`,
          success_url: `${domain}/payment-success?noteId=${noteId}&userId=${userId}`,
          back_url: `${domain}/checkout?noteId=${noteId}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Basic ' +
              btoa(`${this.config.get<string>('MOYASAR_API_SECRET_KEY')}`),
          },
        },
      );
      return response({
        message: 'create payment link successfully',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: res.data,
        statusCode: 200,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Moyasar error:', error.res?.data || error.message);
      throw error;
    }
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

  public async updateNote(noteId: string, body: UpdateNoteDto, userId: string) {
    const note = await this.noteModel.findById(noteId);

    if (!note) {
      throw new NotFoundException('عذرًا، لم يتم العثور على الملاحظة المطلوبة');
    }

    if (note.owner_id !== userId) {
      throw new UnauthorizedException(
        'عذرًا، لا تملك صلاحية لتعديل هذه الملاحظة',
      );
    }

    const updatedNote = await this.noteModel
      .findByIdAndUpdate(noteId, body, { new: true })
      .exec();

    if (!updatedNote) {
      throw new NotFoundException(
        'حدث خطأ أثناء تحديث الملاحظة، حاول مرة أخرى',
      );
    }

    return response({
      message: 'تم تحديث الملاحظة بنجاح',
      data: updatedNote,
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
      const originalName = file.originalname || 'note.pdf';
      const baseName = originalName.replace(/\.[^/.]+$/, '');

      cloudinary.uploader
        .upload_stream(
          { folder: 'pdfs', resource_type: 'raw', public_id: baseName },
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
