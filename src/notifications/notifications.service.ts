import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>
  ) {}

  async create(userId: string, title: string, message: string, type: string = 'INFO'): Promise<Notification> {
    const notification = new this.notificationModel({ userId, title, message, type });
    return notification.save();
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
  }

  async markAllAsRead(userId: string): Promise<any> {
    return this.notificationModel.updateMany({ userId }, { read: true }).exec();
  }

  async removeAllForUser(userId: string): Promise<any> {
    return this.notificationModel.deleteMany({ userId }).exec();
  }
}
