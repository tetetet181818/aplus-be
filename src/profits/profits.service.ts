import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schema';
import { PLATFORM_DECREMENT_PERCENT } from '../utils/constants';

@Injectable()
export class ProfitsService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {}
  public async getAllProfits(
    page: number,
    limit: number,
    fullName?: string,
    email?: string,
  ) {
    // Set default values and parse to numbers
    const currentPage = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));

    // Build search query
    const query: { [key: string]: any } = {
      balance: { $gt: 0 }, // Exclude users with balance = 0
    };

    if (fullName && fullName.trim()) {
      query.fullName = { $regex: fullName.trim(), $options: 'i' };
    }

    if (email && email.trim()) {
      query.email = { $regex: email.trim(), $options: 'i' };
    }

    // Calculate skip value for pagination
    const skip = (currentPage - 1) * pageSize;

    // Get total count for pagination metadata
    const totalCount = await this.userModel.countDocuments(query);
    const users = await this.userModel
      .find(query)
      .select('fullName email balance')
      .skip(skip)
      .limit(pageSize)
      .lean()
      .exec();

    const percent = PLATFORM_DECREMENT_PERCENT;

    const usersInfo = users.map((user) => {
      const profit = user.balance * percent;
      const total = user.balance + profit;

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        balance: parseFloat(user.balance.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      };
    });

    // Calculate statistics
    const totalProfitsAmount = usersInfo.reduce(
      (sum, user) => sum + user.profit,
      0,
    );
    const totalBalanceAmount = usersInfo.reduce(
      (sum, user) => sum + user.balance,
      0,
    );
    const totalAmount = usersInfo.reduce((sum, user) => sum + user.total, 0);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: usersInfo,
      message: 'Profits retrieved successfully',
      statusCode: 200,
      statistics: {
        totalUsers: totalCount,
        totalBalance: parseFloat(totalBalanceAmount.toFixed(2)),
        totalProfits: parseFloat(totalProfitsAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      },
      pagination: {
        currentPage,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }
}
