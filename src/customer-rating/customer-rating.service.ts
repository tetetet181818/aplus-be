import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateCustomerRatingDto } from './dto/create-customer-rating.dto';
import { UpdateCustomerRatingDto } from './dto/update-customer-rating.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerRating } from '../schemas/customer-rating.schema';
import response from '../utils/response.pattern';

@Injectable()
export class CustomerRatingService {
  constructor(
    @InjectModel(CustomerRating.name)
    private readonly customerRatingModel: Model<CustomerRating>,
  ) {}

  async create(
    customerId: string,
    fullName: string,
    createCustomerRatingDto: CreateCustomerRatingDto,
  ) {
    try {
      if (!customerId || !fullName) {
        throw new BadRequestException('معلومات العميل مطلوبة لإضافة التقييم.');
      }

      if (
        !createCustomerRatingDto ||
        Object.keys(createCustomerRatingDto).length === 0
      ) {
        throw new BadRequestException(
          'بيانات التقييم غير مكتملة أو غير صحيحة.',
        );
      }

      const existingRating = await this.customerRatingModel.findOne({
        customerId,
      });
      if (existingRating) {
        throw new ConflictException('تمت إضافة تقييم لهذا العميل مسبقًا.');
      }

      const createdRating = await this.customerRatingModel.create({
        customerId,
        fullName,
        ...createCustomerRatingDto,
      });

      if (!createdRating) {
        throw new InternalServerErrorException(
          'حدث خطأ أثناء حفظ التقييم، حاول مرة أخرى.',
        );
      }

      return response({
        message: 'تم إضافة التقييم بنجاح، شكرًا لمشاركتك 💬',
        statusCode: 201,
        data: createdRating,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof ConflictException) throw error;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.name === 'ValidationError') {
        throw new BadRequestException('البيانات المرسلة غير صالحة.');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new ConflictException('تم العثور على تقييم مكرر لنفس العميل.');
      }

      throw new InternalServerErrorException(
        'تعذر إنشاء التقييم في الوقت الحالي، حاول لاحقًا.',
      );
    }
  }

  async findAll() {
    const allCustomerRatings = await this.customerRatingModel
      .find({ isPublish: true })
      .sort({ createdAt: -1 })
      .exec();

    if (allCustomerRatings.length === 0) {
      response({
        message: 'لا توجد تقييمات متاحة حالياً.',
        statusCode: 200,
        data: [],
      });
    }

    if (!allCustomerRatings) {
      throw new NotFoundException('لم يتم العثور على أي تقييمات حتى الآن.');
    }

    return response({
      message: 'تم جلب جميع التقييمات بنجاح',
      statusCode: 200,
      data: allCustomerRatings,
    });
  }

  async update(id: string, updateCustomerRatingDto: UpdateCustomerRatingDto) {
    const updated = await this.customerRatingModel
      .findByIdAndUpdate(id, updateCustomerRatingDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('لم يتم العثور على التقييم المطلوب لتحديثه.');
    }

    return response({
      message: 'تم تحديث التقييم بنجاح ',
      statusCode: 200,
      data: updated,
    });
  }

  async remove(id: string) {
    const deleted = await this.customerRatingModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('لم يتم العثور على التقييم المطلوب لحذفه.');
    }

    return response({
      message: 'تم حذف التقييم بنجاح ',
      statusCode: 200,
    });
  }

  async userRatedBefore(customerId: string) {
    const existingRating = await this.customerRatingModel
      .findOne({ customerId })
      .exec();

    return !!existingRating;
  }

  async publishRating(id: string) {
    const published = await this.customerRatingModel
      .findByIdAndUpdate(
        id,
        { isPublish: true },
        {
          new: true,
        },
      )
      .exec();

    if (!published) {
      throw new NotFoundException('لم يتم العثور على التقييم المطلوب للنشر.');
    }

    return response({
      message: 'تم نشر التقييم بنجاح ',
      statusCode: 200,
      data: published,
    });
  }

  async unPublishRating(id: string) {
    const unpublished = await this.customerRatingModel
      .findByIdAndUpdate(
        id,
        { isPublish: false },
        {
          new: true,
        },
      )
      .exec();

    if (!unpublished) {
      throw new NotFoundException('لم يتم العثور على التقييم المطلوب للنشر.');
    }

    return response({
      message: 'تم الغاء نشر التقييم بنجاح ',
      statusCode: 200,
      data: unpublished,
    });
  }

  async getCustomerRatingForDashboard() {
    const customerRating = await this.customerRatingModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    return response({
      message: 'تم جلب تقييمات العملاء للوحة التحكم بنجاح',
      statusCode: 200,
      data: customerRating,
    });
  }
}
