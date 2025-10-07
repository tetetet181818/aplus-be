import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Withdrawal } from '../schemas/withdrawal.schema';
import response from '../utils/response.pattern';
import { CreateWithdrawalDto } from './dtos/create-withdrawals.dto';
import { UpdateWithdrawalDto } from './dtos/update-withdrawals.dto';
import { User } from '../schemas/users.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectModel('Withdrawal')
    private readonly withdrawalModel: Model<Withdrawal>,
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
    private readonly notificationService: NotificationService,
  ) {}

  public async createWithdrawal(body: CreateWithdrawalDto, userId: string) {
    const newWithdrawal = { userId, ...body };

    const user = await this.usersModel
      .findById(userId)
      .select('fullName email withdrawalTimes');

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم إنشاء طلب سحب جديد 💸',
      message:
        'تم استلام طلب السحب الخاص بك، وسيتم مراجعته من قِبل الإدارة في أقرب وقت ممكن ',
      type: 'withdrawal',
    });
    // check if user still has withdrawal times left
    if (user.withdrawalTimes === 0) {
      throw new BadRequestException('رصيد مرات السحب المتاحة يساوي صفر');
    }

    // create the withdrawal
    const withdrawal = await this.withdrawalModel.create(newWithdrawal);

    if (!withdrawal) {
      throw new NotFoundException('حدث خطأ أثناء إنشاء عملية السحب');
    }

    // decrement user's withdrawal times
    user.withdrawalTimes = user.withdrawalTimes - 1;
    await user.save();

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم إنشاء طلب سحب جديد 💸',
      message: `تم استلام طلب السحب الخاص بك بقيمه ${body.amount}، وسيتم مراجعته من قِبل الإدارة في أقرب وقت ممكن `,
      type: 'withdrawal',
    });
    return {
      message: 'تم إنشاء عملية السحب بنجاح',
      data: withdrawal,
      statusCode: 201,
    };
  }

  public async getAllWithdrawals() {
    const withdrawals = await this.withdrawalModel.find().lean();

    if (!withdrawals) {
      throw new NotFoundException('حدث خطأ أثناء جلب التحويلات');
    }

    if (withdrawals.length === 0) {
      return response({
        message: 'لا توجد تحويلات متاحة حالياً',
        data: withdrawals,
        statusCode: 200,
      });
    }

    return response({
      message: 'تم جلب جميع التحويلات بنجاح',
      data: withdrawals,
      statusCode: 200,
    });
  }

  public async getSingleWithdrawal(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('حدث خطأ أثناء جلب التحويل');
    }

    const withdrawal = await this.withdrawalModel.findById(id).lean();

    if (!withdrawal) {
      throw new NotFoundException('حدث خطأ أثناء جلب التحويل');
    }

    return response({
      message: 'تم جلب تفاصيل التحويل بنجاح',
      data: withdrawal,
      statusCode: 200,
    });
  }

  public async updateWithdrawal(id: string, body: UpdateWithdrawalDto) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('حدث خطأ أثناء جلب التحويل');
    }

    const withdrawal = await this.withdrawalModel.findById(id);

    if (!withdrawal) {
      throw new NotFoundException('حدث خطأ أثناء جلب التحويل');
    }

    const updatedWithdrawal = await this.withdrawalModel.findByIdAndUpdate(
      id,
      body,
      { new: true },
    );

    if (!updatedWithdrawal) {
      throw new NotFoundException('حدث خطأ أثناء تحديث التحويل');
    }

    return response({
      message: 'تم تحديث التحويل بنجاح',
      statusCode: 200,
    });
  }

  public async deleteWithdrawal(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new NotFoundException('حدث خطأ أثناء جلب التحويل');
    }

    const withdrawal = await this.withdrawalModel.findByIdAndDelete(id).lean();

    if (!withdrawal) {
      throw new NotFoundException('حدث خطأ أثناء حذف التحويل');
    }

    return response({
      message: 'تم حذف التحويل بنجاح',
      statusCode: 200,
    });
  }

  public async getAllUserWithdrawals(userId: string) {
    try {
      const withdrawals = await this.withdrawalModel.find({ userId });

      if (withdrawals.length === 0) {
        return response({
          message: 'لا توجد تحويلات متاحة حالياً',
          data: withdrawals,
          statusCode: 200,
        });
      }

      return response({
        message: 'تم جلب جميع التحويلات بنجاح',
        data: withdrawals,
        statusCode: 200,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('حدث خطأ أثناء جلب التحويلات');
    }
  }
}
