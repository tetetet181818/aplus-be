import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      type: 'purchase',
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

  public async getSalesByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const sales = await this.salesModel
      .find({ sellerId: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await this.salesModel.countDocuments({ sellerId: userId });

    if (!sales) {
      throw new NotFoundException('حدث خطأ أثناء جلب المبيعات');
    }

    if (sales.length === 0) {
      return {
        message: 'لا توجد مبيعات متاحة حالياً لهذا المستخدم',
        data: [],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        statusCode: 200,
      };
    }

    return {
      message: 'تم جلب المبيعات بنجاح',
      data: sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statusCode: 200,
    };
  }

  async getSalesUserStats(sellerId: string) {
    const stats = await this.salesModel.aggregate([
      {
        $match: {
          sellerId: new Types.ObjectId(sellerId),
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $group: {
          _id: null,
          firstDate: { $first: '$createdAt' },
          totalSales: { $sum: 1 },
          salesList: {
            $push: {
              date: '$createdAt',
              state: '$state',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          firstDate: 1,
          totalSales: 1,
          salesList: 1,
        },
      },
    ]);

    if (!stats.length) {
      return {
        message: 'No sales found for this user',
        data: [],
        statusCode: 200,
      };
    }

    return {
      message: 'Sales statistics fetched successfully',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: stats[0],
      statusCode: 200,
    };
  }
}
