import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateDeviceSessionDto } from '../dto/create-device-session.dto';

@Schema({ timestamps: true })
export class UserDeviceSession {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: Number, required: true })
  issuedAt: number;

  @Prop({ type: Number, required: true })
  expirationDate: number;

  static createInstance(
    dto: CreateDeviceSessionDto,
  ): UserDeviceSessionDocument {
    const deviceSession = new this();

    deviceSession.deviceId = dto.deviceId;
    deviceSession.deviceName = dto.deviceName;
    deviceSession.ip = dto.ip;
    deviceSession.userId = dto.userId;
    deviceSession.issuedAt = dto.issuedAt;
    deviceSession.expirationDate = dto.expirationDate;

    return deviceSession as UserDeviceSessionDocument;
  }
}

export const UserDeviceSessionSchema =
  SchemaFactory.createForClass(UserDeviceSession);
UserDeviceSessionSchema.loadClass(UserDeviceSession);

export type UserDeviceSessionDocument = HydratedDocument<UserDeviceSession>;
export type UserDeviceSessionModelType = Model<UserDeviceSessionDocument> &
  typeof UserDeviceSession;
