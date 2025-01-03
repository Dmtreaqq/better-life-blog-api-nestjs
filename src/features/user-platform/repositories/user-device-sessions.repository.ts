import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserDeviceSession,
  UserDeviceSessionDocument,
  UserDeviceSessionModelType,
} from '../domain/user-device-session.entity';
import { UserDocument } from '../domain/user.entity';

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

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<UserDeviceSessionDocument> {
    return this.UserDeviceSessionModel.findOne({
      deviceId,
      userId,
    });
  }

  async delete(session: UserDeviceSessionDocument) {
    const result = await session.deleteOne();

    if (result.deletedCount !== 1) {
      throw new BadRequestException([
        {
          message: 'Entity was not deleted for some reason',
          field: 'id',
        },
      ]);
    }
  }
}
