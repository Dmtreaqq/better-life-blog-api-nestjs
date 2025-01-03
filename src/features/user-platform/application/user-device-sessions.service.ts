import { Injectable } from '@nestjs/common';
import { UserDeviceSessionsRepository } from '../repositories/user-device-sessions.repository';
import { CreateDeviceSessionDto } from '../dto/create-device-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserDeviceSession,
  UserDeviceSessionModelType,
} from '../domain/user-device-session.entity';

@Injectable()
export class UserDeviceSessionsService {
  constructor(
    @InjectModel(UserDeviceSession.name)
    private UserDeviceSessionModel: UserDeviceSessionModelType,
    private userDeviceSessionsRepository: UserDeviceSessionsRepository,
  ) {}

  async createDeviceSession(dto: CreateDeviceSessionDto) {
    const instance = this.UserDeviceSessionModel.createInstance(dto);

    await this.userDeviceSessionsRepository.save(instance);
  }
}
