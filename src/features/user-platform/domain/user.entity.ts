import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';

const emailRegex = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
const loginRegex = new RegExp('^[a-zA-Z0-9_-]*$');

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    match: loginRegex,
    minlength: 3,
    maxlength: 10,
    required: true,
  })
  login: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, match: emailRegex, maxlength: 50, required: true })
  email: string;

  @Prop({ type: Boolean, default: true })
  isConfirmed: boolean;

  @Prop({ type: String, default: '0' })
  confirmationCode: string;

  @Prop({ type: String, default: new Date().toISOString() })
  confirmationCodeExpirationDate: string;

  @Prop({ type: String, default: '0' })
  recoveryCode: string;

  @Prop({ type: String, default: new Date().toISOString() })
  recoveryCodeExpirationDate: string;

  @Prop({ type: Date })
  createdAt: Date;

  static createInstance(dto: CreateUserDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.password = dto.password;
    user.login = dto.login;
    user.confirmationCode = dto.confirmationCode;
    user.isConfirmed = dto.isConfirmed;
    user.recoveryCode = dto.recoveryCode;
    user.recoveryCodeExpirationDate = dto.recoveryCodeExpirationDate;
    user.confirmationCodeExpirationDate = dto.confirmationCodeExpirationDate;

    return user as UserDocument;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
