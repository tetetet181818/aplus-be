import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../schemas/notification.schema';
import response from '../utils/response.pattern';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @Inject(forwardRef(() => NotificationGateway))
    private gateway?: NotificationGateway,
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
    type?:
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
      | 'withdrawal'
      | 'sales'
      | 'auth'
      | 'notes'
      | 'purchase';
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
    
    // Emit real-time notification to the user
    if (this.gateway && notification) {
      this.gateway.emitNewNotification(userId, notification.toObject());
    }
    
    return {
      notification,
      response: response({
        message: 'Notification created successfully',
        statusCode: 201,
        data: notification,
      }),
    };
  }

  async getAll(userId: string) {
    if (!userId) {
      throw new NotFoundException('userId is not found');
    }
    const allNotifications = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    
    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      read: false,
    });
    
    return response({
      data: {
        notifications: allNotifications,
        unreadCount,
      },
      message: 'All notifications fetched successfully',
      statusCode: 200,
    });
  }

  /** Get unread count */
  async getUnreadCount(userId: string) {
    if (!userId) {
      throw new NotFoundException('userId is not found');
    }
    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      read: false,
    });
    return response({
      data: { unreadCount },
      message: 'Unread count fetched successfully',
      statusCode: 200,
    });
  }

  /** Mark single notification as read */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true },
    );
    if (!notification) throw new NotFoundException('Notification not found');
    
    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      read: false,
    });
    
    return {
      notification,
      unreadCount,
      response: response({
        data: {
          notification,
          unreadCount,
        },
        message: 'Notification marked as read',
        statusCode: 200,
      }),
    };
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true },
    );
    
    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      read: false,
    });
    
    return {
      updatedCount: result.modifiedCount,
      unreadCount,
      response: response({
        message: 'All notifications marked as read',
        statusCode: 200,
        data: {
          updatedCount: result.modifiedCount,
          unreadCount,
        },
      }),
    };
  }

  async clearAll(userId: string) {
    await this.notificationModel.deleteMany({ userId });
    return response({
      message: 'All notifications cleared',
      statusCode: 200,
    });
  }
}
