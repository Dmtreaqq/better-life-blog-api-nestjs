import { InjectModel } from '@nestjs/mongoose';

import { Injectable } from '@nestjs/common';

import {
  UserDeviceSession,
  UserDeviceSessionModelType,
} from '../../domain/user-device-session.entity';
import { UserDeviceSessionsViewDto } from '../../api/view-dto/user-device-sessions.view-dto';

@Injectable()
export class UserDeviceSessionsQueryRepository {
  constructor(
    @InjectModel(UserDeviceSession.name)
    private UserDeviceSessionModel: UserDeviceSessionModelType,
  ) {}

  async getAll(userId: string): Promise<UserDeviceSessionsViewDto[]> {
    const sessions = await this.UserDeviceSessionModel.find({
      userId,
    });

    const items = sessions.map(UserDeviceSessionsViewDto.mapToView);

    return items;
  }
}
