import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserDeviceSession,
  UserDeviceSessionDocument,
  UserDeviceSessionModelType,
} from '../domain/user-device-session.entity';

@Injectable()
export class UserDeviceSessionsRepository {
  constructor(
    @InjectModel(UserDeviceSession.name)
    private UserDeviceSessionModel: UserDeviceSessionModelType,
  ) {}

  async save(deviceSession: UserDeviceSessionDocument) {
    await deviceSession.save();
  }

  async findOne(id: string): Promise<UserDeviceSessionDocument> {
    return this.UserDeviceSessionModel.findById(id);
  }
}
