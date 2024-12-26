import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersQueryRepository } from './repositories/query/users.query-repository';
import { CryptoService } from './application/crypto.service';
import { AuthService } from './application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './api/guards/local.strategy';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { CommunicationModule } from '../communication/communication.module';
import { CommonConfig } from '../../common/common.config';
import { UserPlatformConfig } from './config/user-platform.config';

// TODO: спросить почему мьі добавили паспорт модуль
@Module({
  imports: [
    CommunicationModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (
        commonConfig: CommonConfig,
        userPlatformConfig: UserPlatformConfig,
      ) => {
        return {
          secret: commonConfig.accessTokenSecret,
          signOptions: {
            expiresIn: `${userPlatformConfig.accessTokenExpiration}m`,
          },
        };
      },
      inject: [CommonConfig, UserPlatformConfig],
      extraProviders: [UserPlatformConfig],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
    AuthService,
    LocalStrategy,
  ],
  exports: [MongooseModule],
})
export class UserPlatformModule {}
