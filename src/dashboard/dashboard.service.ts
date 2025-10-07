/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from '../schemas/note.schema';
import { User } from '../schemas/users.schema';
import response from '../utils/response.pattern';
import { Sales } from '../schemas/sales.schema';
import { Withdrawal } from '../schemas/withdrawal.schema';
import { CompleteWithdrawalDto } from './dtos/completeWithdrawal.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<Note>,

    @InjectModel(User.name)
    private readonly usersModel: Model<User>,

    @InjectModel(Sales.name)
    private readonly salesModel: Model<Sales>,

    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<Withdrawal>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Get dashboard overview statistics.
   *
   * Includes:
   * - Total users
   * - Total notes
   * - Monthly growth rate for users and notes
   * - Latest 5 users
   * - Latest 5 sales
   *
   * Growth rate formula:
   *   (currentPeriod - previousPeriod) / previousPeriod * 100
   *
   * @returns {Promise<object>} Dashboard statistics response
   */
  public async getOverview() {
    // Count totals
    const totalUsers = await this.usersModel.countDocuments().exec();
    const totalNotes = await this.noteModel.countDocuments().exec();

    // Define time ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Count users this month vs last month
    const usersThisMonth = await this.usersModel.countDocuments({
      createdAt: { $gte: startOfThisMonth, $lte: now },
    });

    const usersLastMonth = await this.usersModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const userGrowthRate =
      usersLastMonth > 0
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : usersThisMonth > 0
          ? 100
          : 0;

    // Count notes this month vs last month
    const notesThisMonth = await this.noteModel.countDocuments({
      createdAt: { $gte: startOfThisMonth, $lte: now },
    });

    const notesLastMonth = await this.noteModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const notesGrowthRate =
      notesLastMonth > 0
        ? ((notesThisMonth - notesLastMonth) / notesLastMonth) * 100
        : notesThisMonth > 0
          ? 100
          : 0;

    // Latest 5 users
    const latestUsers = await this.usersModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    // Latest 5 sales
    const latestSales = await this.salesModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return response({
      message: 'Dashboard Overview',
      data: {
        totalUsers,
        totalNotes,
        userGrowthRate: `${userGrowthRate.toFixed(2)}%`,
        notesGrowthRate: `${notesGrowthRate.toFixed(2)}%`,
        latestUsers,
        latestSales,
      },
      statusCode: 200,
    });
  }

  /** Get all users with pagination */
  public async getAllUsers(page: number, limit: number) {
    // Ensure positive integers
    const currentPage = Math.max(1, page);
    const pageSize = Math.max(1, limit);

    // Calculate skip
    const skip = (currentPage - 1) * pageSize;

    // Fetch total count (for total pages)
    const totalItems = await this.usersModel.countDocuments().exec();

    // Fetch paginated users
    const users = await this.usersModel
      .find()
      .sort({ createdAt: -1 }) // optional: newest first
      .skip(skip)
      .limit(pageSize)
      .exec();

    return response({
      message: 'Users fetched successfully',
      data: {
        users,
        pagination: {
          totalItems,
          currentPage,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: currentPage * pageSize < totalItems,
          hasPrevPage: currentPage > 1,
        },
      },
      statusCode: 200,
    });
  }

  /** Delete a user by ID */
  public async deleteUser(id: string) {
    const user = await this.usersModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // if deleting user also delete related data if needed
    const deletedNotes = await this.noteModel
      .deleteMany({ owner_id: id })
      .exec();

    if (!deletedNotes) {
      console.log(`Deleted notes for user ${id}`);
    }
    const deletedUser = await this.usersModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return response({
      message: 'تم حذف المستخدم بنجاح',
      statusCode: 200,
    });
  }

  async getUsersStats() {
    const stats = await this.usersModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          users: '$count',
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      message: 'Users stats by day',
      data: stats,
      statusCode: 200,
    };
  }

  async searchUsers(query: {
    fullName?: string;
    email?: string;
    university?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      fullName,
      email,
      university,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = query;

    const filter: {
      fullName?: any;
      email?: any;
      university?: any;
      createdAt?: any;
    } = {};

    // Search by fullName (regex for partial match)
    if (fullName) {
      filter.fullName = { $regex: fullName, $options: 'i' };
    }

    // Search by email
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    // Search by university
    if (university) {
      filter.university = { $regex: university, $options: 'i' };
    }

    // Filter by createdAt date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.usersModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.usersModel.countDocuments(filter),
    ]);

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllNotes(page: number, limit: number) {
    // Ensure positive integers
    const currentPage = Math.max(1, page);
    const pageSize = Math.max(1, limit);

    // Calculate skip
    const skip = (currentPage - 1) * pageSize;
    const notes = await this.noteModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();
    const totalItems = await this.noteModel.countDocuments().exec();
    return {
      message: 'Notes fetched successfully',
      data: {
        notes,
        pagination: {
          totalItems,
          currentPage,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: currentPage * pageSize < totalItems,
          hasPrevPage: currentPage > 1,
        },
      },
      statusCode: 200,
    };
  }

  /**
   * Get notes statistics grouped by day
   * - Aggregates notes createdAt by year/month/day
   * - Returns date + notes count
   */
  async getNotesStats() {
    const stats = await this.noteModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          notes: '$count',
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      message: 'Notes stats by day',
      data: stats,
      statusCode: 200,
    };
  }

  async MakeNotePublish(id: string) {
    const updateNote = await this.noteModel.findByIdAndUpdate(
      id,
      { isPublish: true },
      { new: true },
    );

    if (!updateNote) {
      throw new NotFoundException('الملاحظة غير موجودة');
    }
    const user = await this.usersModel.findById(updateNote.owner_id).exec();
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم نشر ملاحظة جديدة ',
      message:
        'تهانينا! تم نشر ملاحظتك بنجاح وهي الآن متاحة للطلاب الآخرين. شكرًا لمساهمتك في مجتمعنا التعليمي!',
      type: 'notes',
    });
    return response({
      message: 'تم نشر الملاحظة بنجاح',
      statusCode: 200,
    });
  }

  async MakeNoteUnPublish(id: string) {
    const updateNote = await this.noteModel.findByIdAndUpdate(
      id,
      { isPublish: false },
      { new: true },
    );

    if (!updateNote) {
      throw new NotFoundException('الملاحظة غير موجودة');
    }

    const user = await this.usersModel.findById(updateNote.owner_id).exec();
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم إلغاء نشر ملاحظة ',
      message:
        'تم إلغاء نشر ملاحظتك. إذا كان لديك أي أسئلة، يرجى التواصل مع الدعم.',
      type: 'notes',
    });

    return response({
      message: 'تم إلغاء نشر الملاحظة بنجاح',
      statusCode: 200,
    });
  }

  /** get all sales with pagination */
  async getAllSales(page: number, limit: number) {
    // Ensure positive integers
    const currentPage = Math.max(1, page);
    const pageSize = Math.max(1, limit);

    // Calculate skip
    const skip = (currentPage - 1) * pageSize;
    const sales = await this.salesModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();
    const totalItems = await this.salesModel.countDocuments().exec();
    return {
      message: 'Sales fetched successfully',
      data: {
        sales,
        pagination: {
          totalItems,
          currentPage,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: currentPage * pageSize < totalItems,
          hasPrevPage: currentPage > 1,
        },
      },
      statusCode: 200,
    };
  }

  /* get sales statistics */
  async getSalesStats() {
    const stats = await this.salesModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          sales: '$count',
          totalAmount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      message: 'Sales stats by day',
      data: stats,
      statusCode: 200,
    };
  }

  async getSingleSale(id: string) {
    const sale = await this.salesModel.findById(id).exec();
    if (!sale) {
      throw new NotFoundException('المبيع غير موجود');
    }
    return {
      message: 'Sale fetched successfully',
      data: sale,
      statusCode: 200,
    };
  }

  async getAllWithdrawals(page: number, limit: number) {
    // Ensure positive integers
    const currentPage = Math.max(1, page);
    const pageSize = Math.max(1, limit);

    // Calculate skip
    const skip = (currentPage - 1) * pageSize;
    const withdrawals = await this.withdrawalModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();
    const totalItems = await this.withdrawalModel.countDocuments().exec();
    return {
      message: 'Withdrawals fetched successfully',
      data: {
        withdrawals,
        pagination: {
          totalItems,
          currentPage,
          pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: currentPage * pageSize < totalItems,
          hasPrevPage: currentPage > 1,
        },
      },
      statusCode: 200,
    };
  }

  /**
   *  Get daily withdrawal statistics
   * Groups all withdrawal documents by day and calculates:
   * - Number of withdrawals
   * - Total withdrawn amount per day
   */
  async getWithdrawalsStats() {
    const stats = await this.withdrawalModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          withdrawals: '$count',
          totalAmount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      message: 'Withdrawals stats by day',
      data: stats,
      statusCode: 200,
    };
  }

  /**
   * Get count of withdrawals grouped by status
   * Example output:
   * {
   *   message: "Withdrawal statuses fetched successfully",
   *   data: [
   *     { status: "pending", count: 12 },
   *     { status: "accepted", count: 8 },
   *     { status: "rejected", count: 3 }
   *   ],
   *   statusCode: 200
   * }
   */

  async getWithdrawalsStatuses() {
    // Aggregate actual counts from DB
    const statuses = await this.withdrawalModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    const expectedStatuses = ['pending', 'accepted', 'rejected', 'completed'];

    const result = expectedStatuses.map((status) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const found = statuses.find((s) => s.status === status);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return { status, count: found ? found.count : 0 };
    });

    return {
      message: 'Withdrawal statuses fetched successfully',
      data: result,
      statusCode: 200,
    };
  }

  async acceptedWithdrawal(id: string) {
    const updateWithdrawal = await this.withdrawalModel.findByIdAndUpdate(
      id,
      { status: 'accepted' },
      { new: true },
    );

    if (!updateWithdrawal) {
      throw new NotFoundException('طلب السحب غير موجود');
    }
    const user = await this.usersModel.findById(updateWithdrawal.userId).exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم قبول طلب سحب 💸',
      message:
        'تم قبول طلب السحب الخاص بك، وسيتم معالجة المبلغ في أقرب وقت ممكن.',
      type: 'withdrawal',
    });

    return response({
      message: 'تم قبول طلب السحب بنجاح',
      statusCode: 200,
    });
  }

  async rejectedWithdrawal(id: string) {
    const updateWithdrawal = await this.withdrawalModel.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true },
    );
    const withdrawal = await this.withdrawalModel.findById(id).exec();

    if (!withdrawal) {
      throw new NotFoundException('طلب السحب غير موجود');
    }

    const user = await this.usersModel.findById(withdrawal.userId).exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم رفض طلب سحب 💸',
      message:
        'تم رفض طلب السحب الخاص بك. إذا كان لديك أي أسئلة، يرجى التواصل مع الدعم.',
      type: 'withdrawal',
    });

    if (!updateWithdrawal) {
      throw new NotFoundException('طلب السحب غير موجود');
    }
    return response({
      message: 'تم قبول طلب السحب بنجاح',
      statusCode: 200,
    });
  }

  async completedWithdrawal(id: string, body: CompleteWithdrawalDto) {
    const { routingNumber, routingDate } = body;

    const updateWithdrawal = await this.withdrawalModel.findByIdAndUpdate(
      id,
      { status: 'completed', routingNumber, routingDate },
      { new: true },
    );

    if (!updateWithdrawal) {
      throw new NotFoundException('طلب السحب غير موجود');
    }

    const user = await this.usersModel.findById(updateWithdrawal.userId).exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // update balance user and send notification
    user.balance -= updateWithdrawal.amount;
    await user.save();

    await this.notificationService.create({
      userId: user?._id.toString() || '',
      title: 'تم إكمال طلب سحب 💸',
      message: 'تم إكمال طلب السحب الخاص بك. يرجى التحقق من حسابك المصرفي.',
      type: 'withdrawal',
    });

    return response({
      message: 'تم قبول طلب السحب بنجاح',
      statusCode: 200,
    });
  }

  async getSingleWithdrawal(id: string) {
    const withdrawal = await this.withdrawalModel.findById(id).lean().exec();
    if (!withdrawal) {
      throw new NotFoundException('طلب السحب غير موجود');
    }

    const user = await this.usersModel
      .findById(withdrawal.userId)
      .select('fullName email university balance')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      message: 'تم جلب طلب السحب بنجاح',
      data: {
        withdrawal,
        user,
      },
      statusCode: 200,
    };
  }
}
