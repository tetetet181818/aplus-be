import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sales } from '../schemas/sales.schema';
import response from '../utils/response.pattern';
import { CreateSalesDto } from './dtos/create-sales.dto';
import { NotificationService } from '../notification/notification.service';
import { User } from '../schemas/users.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
    private readonly notificationService: NotificationService,
  ) {}

  /** create sale */
  public async createSale(body: CreateSalesDto) {
    const sale = await this.salesModel.create(body);

    if (!sale) {
      throw new NotFoundException('حدث خطأ أثناء إنشاء المبيعات');
    }

    await this.notificationService.create({
      userId: sale.sellerId.toString(),
      title: '💰 تم بيع أحد ملخّصاتك!',
      message:
        'مبروك! تم شراء أحد ملخّصاتك بنجاح، نتمنى لك المزيد من المبيعات 🎉',
      type: 'sales',
    });

    await this.notificationService.create({
      userId: sale.buyerId.toString(),
      title: '🎉 تهانينا! تم شراء الملخّص الخاص بك',
      message:
        'تمت عملية الشراء بنجاح، نتمنى لك تجربة مفيدة وممتعة مع ملخّصك الجديد 📚',
      type: 'sales',
    });

    return response({
      message: 'تم إنشاء المبيعات بنجاح ',
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

    const buyer = await this.usersModel
      .findById(sale?.buyerId)
      .select('fullName email university balance')
      .lean();
    const seller = await this.usersModel
      .findById(sale?.sellerId)
      .select('fullName email university balance')
      .lean();
    if (!sale) {
      throw new NotFoundException('حدث خطأ أثناء جلب المبيعات');
    }

    return response({
      message: 'تم جلب تفاصيل المبيعات بنجاح',
      data: { buyer, seller, sale },
      statusCode: 200,
    });
  }
}
