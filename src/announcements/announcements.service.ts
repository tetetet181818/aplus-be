import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Announcement,
  AnnouncementDocument,
} from '../schemas/announcement.schema';
import { Course, CourseDocument } from '../schemas/courses.schema';
import { CreateAnnouncementDto } from './dtos/create-announcement.dto';
import { RespondToAnnouncementDto } from './dtos/respond-to-announcement.dto';
import response from '../utils/response.pattern';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async createAnnouncement(
    courseId: string,
    userId: string,
    createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    if (course.ownerId !== userId) {
      throw new UnauthorizedException(
        'ليس لديك صلاحية لإضافة إعلاانات لهذه الدورة',
      );
    }

    const { title, content, type, options } = createAnnouncementDto;

    if (type === 'question' && (!options || options.length < 2)) {
      throw new BadRequestException('يجب إضافة خيارين على الأقل للسؤال');
    }

    const announcement = await this.announcementModel.create({
      courseId,
      creatorId: userId,
      title,
      content,
      type: type || 'announcement',
      options: options || [],
    });

    return response({
      message: 'تم إضافة الإعلان بنجاح',
      data: announcement,
      statusCode: 201,
    });
  }

  async getCourseAnnouncements(courseId: string) {
    const announcements = await this.announcementModel
      .find({ courseId })
      .sort({ createdAt: -1 })
      .exec();

    return response({
      message: 'تم جلب الإعلانات بنجاح',
      data: announcements,
      statusCode: 200,
    });
  }

  async respondToAnnouncement(
    announcementId: string,
    studentId: string,
    respondDto: RespondToAnnouncementDto,
  ) {
    const announcement = await this.announcementModel.findById(announcementId);
    if (!announcement) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    if (announcement.type !== 'question') {
      throw new BadRequestException('هذا الإعلان ليس سؤالاً');
    }

    const hasResponded = announcement.responses.some(
      (r) => r.studentId === studentId,
    );
    if (hasResponded) {
      throw new BadRequestException('لقد قمت بالرد بالفعل');
    }

    // Validate if the answer is one of the options
    if (!announcement.options.includes(respondDto.answer)) {
      throw new BadRequestException('الإجابة المختارة غير صالحة');
    }

    announcement.responses.push({
      studentId,
      answer: respondDto.answer,
      respondedAt: new Date(),
    });

    await announcement.save();

    return response({
      message: 'تم تسجيل ردك بنجاح',
      data: announcement,
      statusCode: 200,
    });
  }

  async deleteAnnouncement(announcementId: string, userId: string) {
    const announcement = await this.announcementModel.findById(announcementId);
    if (!announcement) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    if (announcement.creatorId !== userId) {
      throw new UnauthorizedException('ليس لديك صلاحية لحذف هذا الإعلان');
    }

    await this.announcementModel.findByIdAndDelete(announcementId);

    return response({
      message: 'تم حذف الإعلان بنجاح',
      statusCode: 200,
    });
  }
}
