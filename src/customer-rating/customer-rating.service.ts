import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        'تعذر إنشاء التقييم في الوقت الحالي.',
      );
    }
  }

  async findAll() {
    const allCustomerRatings = await this.customerRatingModel
      .find()
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
}
