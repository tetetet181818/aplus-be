import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from '../schemas/note.schema';
import response from '../utils/response.pattern';
import { CreateNoteDto } from './dtos/create-note.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel('Note')
    private readonly noteModel: Model<Note>,
    private readonly config: ConfigService,
  ) {}

  /** Get all notes */
  public async getAllNotes() {
    const notes = await this.noteModel.find().lean();

    if (!notes || notes.length === 0) {
      throw new NotFoundException('لا توجد ملخصات متاحة حالياً');
    }

    return response({
      message: 'تم جلب جميع الملخصات بنجاح',
      data: notes,
      statusCode: 200,
    });
  }

  /** Create new note */
  public async createNote(body: CreateNoteDto, userId: string) {
    const file_path = 'https://www.google.com';
    const newNote = await this.noteModel.create({
      owner_id: userId,
      file_path,
      ...body,
    });

    if (!newNote) {
      throw new BadRequestException('حدث خطأ أثناء إنشاء الملخص');
    }

    return response({
      data: [newNote],
      message: 'تم إنشاء الملخص بنجاح، يمكنك الآن عرضه أو تعديله',
      statusCode: 201,
    });
  }

  /** Get single note by ID */
  public async getSingleNote(id: string) {
    const singleNote = await this.noteModel.findById(id).lean();

    if (!singleNote) {
      throw new NotFoundException('لم يتم العثور على هذا الملخص');
    }

    return response({
      message: 'تم جلب تفاصيل الملخص بنجاح',
      data: [singleNote],
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

  /** purchase note */
  public async purchaseNote(noteId: string, userId: string) {
    const note = await this.noteModel.findById(noteId);
    if (!note) {
      throw new NotFoundException('الملخص غير موجود');
    }

    if (note.purchased_by?.includes(userId)) {
      throw new BadRequestException('لقد قمت بشراء هذا الملخص بالفعل');
    }

    if (note.purchased_by) {
      note.purchased_by.push(userId);
    }

    await note.save();

    return response({
      message: 'تم شراء الملخص بنجاح ✅',
      statusCode: 200,
    });
  }

  /** get purchased notes */
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
}
