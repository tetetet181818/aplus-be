import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sales } from '../schemas/sales.schema';
import response from '../utils/response.pattern';
import { CreateSalesDto } from './dtos/create-sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,
  ) {}

  /** create sale */
  public async createSale(body: CreateSalesDto) {
    const sale = await this.salesModel.create(body);

    if (!sale) {
      throw new NotFoundException('حدث خطأ أثناء إنشاء المبيعات');
    }

    return response({
      message: 'تم إنشاء المبيعات بنجاح',
      data: sale,
      statusCode: 201,
    });
  }

  /** Get all sales */
  public async getAllSales() {
    const sales = await this.salesModel.find().lean();

    if (!sales) {
      throw new NotFoundException('حدث خطأ أثناء جلب المبيعات');
    }
    if (sales.length === 0) {
      return response({
        message: 'لا توجد مبيعات متاحة حالياً',
        data: sales,
        statusCode: 200,
      });
    }

    return response({
      message: 'تم جلب جميع المبيعات بنجاح',
      data: sales,
      statusCode: 200,
    });
  }

  /** Get single sale */
  public async getSingleSale(id: string) {
    const sale = await this.salesModel.findById(id).lean();

    if (!sale) {
      throw new NotFoundException('حدث خطأ أثناء جلب المبيعات');
    }

    return response({
      message: 'تم جلب تفاصيل المبيعات بنجاح',
      data: sale,
      statusCode: 200,
    });
  }
}
