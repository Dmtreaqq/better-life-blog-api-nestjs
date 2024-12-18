import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersQueryRepository } from './repositories/query/users.query-repository';
import { CryptoService } from './application/crypto.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
  ],
  exports: [MongooseModule],
})
export class UserPlatformModule {}
