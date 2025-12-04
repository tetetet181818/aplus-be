/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sales } from '../schemas/sales.schema';
import response from '../utils/response.pattern';
import { CreateSalesDto } from './dtos/create-sales.dto';
import { NotificationService } from '../notification/notification.service';
import { User } from '../schemas/users.schema';
import { Note } from '../schemas/note.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel('Sales')
    private readonly salesModel: Model<Sales>,

    @InjectModel(User.name)
    private readonly usersModel: Model<User>,

    @InjectModel(Note.name)
    private readonly notesModel: Model<Note>,

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

      data: stats[0],
      statusCode: 200,
    };
  }

  async getUserStatisticsSales(userId: string) {
    const [notes, sales, salesByDate, notesByDate] = await Promise.all([
      this.notesModel.find({ owner_id: userId }).lean(),

      this.salesModel
        .find({ sellerId: userId })
        .select('note_title createdAt amount state')
        .lean(),

      // Sales count by date
      this.salesModel.aggregate([
        { $match: { sellerId: userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),

      // Notes count by date
      this.notesModel.aggregate([
        { $match: { owner_id: userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
    ]);

    // Totals
    const totalAmount = sales.reduce((acc, s) => acc + (s.amount || 0), 0);
    const totalReviews = notes.reduce(
      (acc, n) => acc + (n.reviews?.length || 0),
      0,
    );

    // Ratings
    const totalRatingSum = notes.reduce((acc, note) => {
      const noteSum = (note.reviews || []).reduce(
        (sum, r) => sum + (r.rating || 0),
        0,
      );
      return acc + noteSum;
    }, 0);

    const globalRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

    const salesMap = new Map(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      salesByDate.map((item) => [item.date, item.count]),
    );

    const notesMap = new Map(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      notesByDate.map((item) => [item.date, item.count]),
    );

    // Merge dates
    const allDates = new Set([...salesMap.keys(), ...notesMap.keys()]);

    const mergedStats = Array.from(allDates).map((date) => ({
      date,
      sale: salesMap.get(date) || 0,
      note: notesMap.get(date) || 0,
    }));

    // Sort by date
    mergedStats.sort((a, b) => (a.date > b.date ? 1 : -1));

    const salesSummaryByNote = await this.salesModel.aggregate([
      { $match: { sellerId: userId } },
      {
        $group: {
          _id: '$note_id',
          note_title: { $first: '$note_title' },
          count: { $sum: 1 },
          totalProfit: { $sum: '$amount' },
          date: { $first: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          note_id: '$_id',
          note_title: 1,
          count: 1,
          totalProfit: 1,
          date: 1,
        },
      },
    ]);

    return {
      noteCount: notes.length,
      salesCount: sales.length,
      totalAmount,
      globalRating,
      stateSales: salesByDate,
      stateNotes: mergedStats,
      sales: salesSummaryByNote,
    };
  }

  async getDetailsSalesNote(
    userId: string,
    noteId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const note = await this.notesModel.findById(noteId).lean();

    if (note?.owner_id !== userId) {
      throw new BadRequestException('غير مسموح لك بروية تفاصيل هذا الملخص');
    }

    const skip = (page - 1) * limit;

    const sales = await this.salesModel
      .find({ note_id: noteId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalSalesCount = await this.salesModel.countDocuments({
      note_id: noteId,
    });

    const stateSales = await this.salesModel.aggregate([
      { $match: { note_id: noteId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      sales,
      stateSales,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalSalesCount / limit),
        totalSales: totalSalesCount,
      },
    };
  }
}
