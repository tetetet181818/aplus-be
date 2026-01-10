import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  Course,
  CourseDocument,
  CourseModule,
  CourseLesson,
} from '../schemas/courses.schema';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { CreateModuleDto } from './dtos/create-module.dto';
import { AddLessonDto } from './dtos/add-lesson.dto';
import type { JwtPayload } from '../utils/types';
import response from '../utils/response.pattern';
import { AwsService } from '../aws/aws.service';
import { CoursesGateway } from './courses.gateway';
import type { Express } from 'express';
import { GetCoursesQueryDto } from './dtos/get-courses-query.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly awsService: AwsService,
    private readonly coursesGateway: CoursesGateway,
  ) {}

  /**
   * Helper method to sort modules and lessons by queue number
   */
  private sortModulesAndLessons(course: CourseDocument): void {
    if (course.modules && course.modules.length > 0) {
      course.modules.sort((a, b) => a.queueNumber - b.queueNumber);
      course.modules.forEach((module) => {
        if (module.lessons && module.lessons.length > 0) {
          module.lessons.sort((a, b) => a.queueNumber - b.queueNumber);
        }
      });
    }
  }

  public async getAllCourses(query: GetCoursesQueryDto) {
    const {
      page = 1,
      limit = 10,
      title,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: FilterQuery<CourseDocument> = {};

    if (title) {
      // Escape special regex characters to prevent crashes
      const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: new RegExp(safeTitle, 'i') };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: { $gte?: number; $lte?: number } = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      filter.price = priceFilter;
    }

    if (minRating !== undefined || maxRating !== undefined) {
      const ratingFilter: { $gte?: number; $lte?: number } = {};
      if (minRating !== undefined) ratingFilter.$gte = minRating;
      if (maxRating !== undefined) ratingFilter.$lte = maxRating;
      filter.rating = ratingFilter;
    }

    const skip = (page - 1) * limit;

    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [courses, total] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.courseModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.courseModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return response({
      data: {
        courses: courses,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      message: 'تم جلب الدورات بنجاح',
      statusCode: 200,
    });
  }

  public async getCourse(courseId: string) {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    return response({
      data: course,
      message: 'تم جلب الدورة بنجاح',
      statusCode: 200,
    });
  }

  public async createCourse(
    body: CreateCourseDto,
    payload: JwtPayload,
    thumbnail: Express.Multer.File,
  ) {
    try {
      if (!payload.id) {
        throw new BadRequestException(
          'معرف المستخدم غير موجود، يرجى تسجيل الدخول أولاً',
        );
      }

      if (!payload.email) {
        throw new BadRequestException(
          'البريد الإلكتروني غير موجود، يرجى تسجيل الدخول أولاً',
        );
      }

      if (!payload.fullName) {
        throw new BadRequestException(
          'الاسم غير موجود، يرجى تسجيل الدخول أولاً',
        );
      }

      if (!thumbnail) {
        throw new BadRequestException('يجب تحميل صورة مصغرة للدورة');
      }

      const userId = payload.id || '';

      this.coursesGateway.emitProgress(userId, 0, 'بدء رفع الدورة...');

      this.coursesGateway.emitProgress(
        userId,
        50,
        'جاري رفع الصورة المصغرة...',
      );
      const thumbnailUrl = await this.awsService.uploadThumbnail(thumbnail);

      this.coursesGateway.emitProgress(userId, 90, 'جاري حفظ بيانات الدورة...');

      const courseData: Partial<Course> = {
        title: body.title,
        description: body.description,
        thumbnail: thumbnailUrl,
        price: Number(body.price),
        ownerId: payload.id,
        ownerName: payload.fullName,
        ownerEmail: payload.email,
        ownerPhone: body.ownerPhone,
        category: body.category,
        rating: 0,
        modules: [],
      };

      const newCourse = await this.courseModel.create(courseData);

      if (!newCourse) {
        this.coursesGateway.emitError(
          userId,
          'حدث خلل غير متوقع أثناء إنشاء الدورة',
        );
        throw new InternalServerErrorException(
          'حدث خلل غير متوقع أثناء إنشاء الدورة، حاول مجددًا بعد قليل',
        );
      }

      this.sortModulesAndLessons(newCourse);

      this.coursesGateway.emitProgress(userId, 100, 'تم إنشاء الدورة بنجاح!');
      const result = {
        course: newCourse,
      };
      this.coursesGateway.emitComplete(userId, result);

      return response({
        data: result,
        message: 'تم إنشاء الدورة بنجاح، يمكنك الآن إضافة الوحدات والدروس',
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
          `بعض البيانات غير صحيحة: ${(err as { message: string }).message}`,
        );
      }

      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: unknown }).code === 11000
      ) {
        throw new BadRequestException(
          'هذه الدورة موجودة بالفعل، حاول باسم مختلف',
        );
      }

      console.error('Unexpected error in createCourse:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      this.coursesGateway.emitError(payload.id || '', errorMessage);
      throw new InternalServerErrorException(
        'عذرًا، حدث خطأ غير متوقع أثناء إنشاء الدورة. الرجاء المحاولة لاحقًا',
      );
    }
  }

  /** Update course by ID */
  public async updateCourse(
    courseId: string,
    body: UpdateCourseDto,
    userId: string,
    thumbnail?: Express.Multer.File,
  ) {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('عذرًا، لم يتم العثور على الدورة المطلوبة');
    }

    if (course.ownerId !== userId) {
      throw new UnauthorizedException(
        'عذرًا، لا تملك صلاحية لتعديل هذه الدورة',
      );
    }

    const updateData: Partial<Course> = { ...body };

    if (thumbnail) {
      const thumbnailUrl = await this.awsService.uploadThumbnail(thumbnail);
      updateData.thumbnail = thumbnailUrl;
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(courseId, updateData, { new: true })
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('حدث خطأ أثناء تحديث الدورة، حاول مرة أخرى');
    }

    this.sortModulesAndLessons(updatedCourse);

    return response({
      message: 'تم تحديث الدورة بنجاح',
      data: updatedCourse,
      statusCode: 200,
    });
  }

  /** Create a new module in a course */
  public async createModule(
    courseId: string,
    userId: string,
    body: CreateModuleDto,
  ) {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('عذرًا، لم يتم العثور على الدورة المطلوبة');
    }

    if (course.ownerId !== userId) {
      throw new UnauthorizedException(
        'عذرًا، لا تملك صلاحية لإضافة وحدات لهذه الدورة',
      );
    }

    const existingModules = course.modules || [];
    const nextQueueNumber =
      existingModules.length > 0
        ? Math.max(...existingModules.map((m) => m.queueNumber)) + 1
        : 1;

    const newModule: CourseModule = {
      _id: new Types.ObjectId().toString(),
      title: body.title,
      queueNumber: nextQueueNumber,
      lessons: [],
    };

    course.modules.push(newModule);
    await course.save();

    this.sortModulesAndLessons(course);

    return response({
      message: 'تم إنشاء الوحدة بنجاح',
      data: {
        module: newModule,
        course,
      },
      statusCode: 201,
    });
  }

  /** Add a lesson (video) to a module */
  public async addLesson(
    courseId: string,
    moduleId: string,
    userId: string,
    body: AddLessonDto,
    video: Express.Multer.File,
  ) {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('عذرًا، لم يتم العثور على الدورة المطلوبة');
    }

    if (course.ownerId !== userId) {
      throw new UnauthorizedException(
        'عذرًا، لا تملك صلاحية لإضافة دروس لهذه الدورة',
      );
    }

    const module = course.modules.find((m) => m._id === moduleId);
    if (!module) {
      throw new NotFoundException('عذرًا، لم يتم العثور على الوحدة المطلوبة');
    }

    const videoUrl = await this.awsService.uploadCourseVideo(video);

    const existingLessons = module.lessons || [];
    const nextQueueNumber =
      existingLessons.length > 0
        ? Math.max(...existingLessons.map((l) => l.queueNumber)) + 1
        : 1;

    const newLesson: CourseLesson = {
      _id: new Types.ObjectId().toString(),
      queueNumber: nextQueueNumber,
      url: videoUrl,
      title: body.title,
      status: body.status || 'unpublished',
    };

    module.lessons.push(newLesson);
    await course.save();

    this.sortModulesAndLessons(course);

    return response({
      message: 'تم إضافة الدرس بنجاح',
      data: {
        lesson: newLesson,
        course,
      },
      statusCode: 201,
    });
  }
}
