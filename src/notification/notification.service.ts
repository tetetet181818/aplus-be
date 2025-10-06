import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../schemas/notification.schema';
import response from 'src/utils/response.pattern';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  /** Create new notification */
  async create({
    userId,
    title,
    message,
    type = 'info',
  }: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }) {
    const notification = await this.notificationModel.create({
      userId,
      title,
      message,
      type,
    });

    if (!notification) {
      throw new NotFoundException('Failed to create notification');
    }
    return response({
      message: 'Notification created successfully',
      statusCode: 201,
    });
  }

  async getAll(userId: string) {
    if (!userId) {
      throw new NotFoundException('userId is not found');
    }
    const allNotifications = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return response({
      data: allNotifications,
      message: 'All notifications fetched successfully',
      statusCode: 200,
    });
  }

  /**  Mark single notification as read */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true },
    );
    if (!notification) throw new NotFoundException('Notification not found');
    return response({
      data: [notification],
      message: 'Notification marked as read',
      statusCode: 200,
    });
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany({ userId }, { read: true });
    return response({
      message: 'All notifications marked as read',
      statusCode: 200,
    });
  }

  async clearAll(userId: string) {
    await this.notificationModel.deleteMany({ userId });
    return response({
      message: 'All notifications cleared',
      statusCode: 200,
    });
  }
}
