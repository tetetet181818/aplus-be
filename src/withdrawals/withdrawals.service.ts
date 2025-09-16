import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Withdrawal } from '../schemas/withdrawal.schema';
import response from '../utils/response.pattern';
import { CreateWithdrawalDto } from './dtos/create-withdrawals.dto';
import { UpdateWithdrawalDto } from './dtos/update-withdrawals.dto';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectModel('Withdrawal')
    private readonly withdrawalModel: Model<Withdrawal>,
  ) {}

  public async createWithdrawal(body: CreateWithdrawalDto) {
    const withdrawal = await this.withdrawalModel.create(body);

    if (!withdrawal) {
      throw new NotFoundException('حدث خطأ أثناء إنشاء التحويل');
    }

    return response({
      message: 'تم إنشاء التحويل بنجاح',
      data: withdrawal,
      statusCode: 201,
    });
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
}
