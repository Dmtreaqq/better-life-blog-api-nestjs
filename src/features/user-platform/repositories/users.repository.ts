import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Document } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument> {
    return this.UserModel.findById(id);
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ confirmationCode: code });
  }

  async findByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserDocument | null> {
    const userWithEmail = await this.UserModel.findOne({
      $or: [{ email }, { login }],
    });

    return userWithEmail || null;
  }

  async findByLogin(login: string): Promise<UserDocument> {
    return this.UserModel.findOne({
      where: {
        login,
      },
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async getByIdOrThrow(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException([
        {
          message: 'User not found',
          field: 'id',
        },
      ]);
    }

    return user;
  }

  async delete(user: UserDocument) {
    const result = await user.deleteOne();

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
