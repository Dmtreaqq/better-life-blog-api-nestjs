import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersRepository } from '../repositories/users.repository';
import { CryptoService } from './crypto.service';
import { JwtService } from '@nestjs/jwt';
import { UserContext } from '../../../common/dto/user-context.dto';
import { RegistrationUserDto } from '../api/input-dto/registration-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { add } from 'date-fns/add';
import { ConfirmationCodeDto } from '../api/input-dto/confirmation-code.dto';
import { EmailService } from '../../communication/email.service';
import { EmailDto } from '../api/input-dto/email.dto';
import { ConfirmNewPasswordDto } from '../api/input-dto/confirm-new-password.dto';
import { CommonConfig } from '../../../common/common.config';
import { UserPlatformConfig } from '../config/user-platform.config';
import { UserDeviceSessionsService } from './user-device-sessions.service';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private commonConfig: CommonConfig,
    private userPlatformConfig: UserPlatformConfig,
    private userDeviceSessionsService: UserDeviceSessionsService,
  ) {}

  async login(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { id: userId } as UserContext;

    const deviceId = randomUUID();

    const tokens = {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.commonConfig.accessTokenSecret,
        expiresIn: this.userPlatformConfig.accessTokenExpiration + 's',
      }),
      refreshToken: await this.jwtService.signAsync(
        { ...payload, deviceId, version: randomUUID() + 1 },
        {
          secret: this.commonConfig.refreshTokenSecret,
          expiresIn: this.userPlatformConfig.refreshTokenExpiration + 's',
        },
      ),
    };

    // START SESSION
    const decodedRefreshToken = this.jwtService.decode<JwtPayload>(
      tokens.refreshToken,
    );

    await this.userDeviceSessionsService.createDeviceSession({
      userId,
      deviceId,
      ip: ip ?? 'Unknown Ip',
      issuedAt: decodedRefreshToken.iat,
      expirationDate: decodedRefreshToken.exp,
      deviceName: userAgent ?? 'Unknown name',
    });

    return tokens;
  }

  async refreshTokensPair(
    deviceId: string,
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { id: userId } as UserContext;

    const tokens = {
      accessToken: await this.jwtService.signAsync(payload, {
        secret: this.commonConfig.accessTokenSecret,
        expiresIn: this.userPlatformConfig.accessTokenExpiration + 's',
      }),
      refreshToken: await this.jwtService.signAsync(
        { ...payload, deviceId, version: randomUUID() + 1 },
        {
          secret: this.commonConfig.refreshTokenSecret,
          expiresIn: this.userPlatformConfig.refreshTokenExpiration + 's',
        },
      ),
    };

    const { iat, exp } = this.jwtService.decode<JwtPayload>(
      tokens.refreshToken,
    );

    await this.userDeviceSessionsService.updateDeviceSession(
      deviceId,
      userId,
      iat,
      exp,
    );

    return tokens;
  }

  async register(dto: RegistrationUserDto) {
    const isUserExist = await this.usersRepository.findByLoginOrEmail(
      dto.login,
      dto.email,
    );
    if (isUserExist && isUserExist.email === dto.email) {
      throw new BadRequestException([
        {
          message: 'Incorrect',
          field: 'email',
        },
      ]);
    }

    if (isUserExist && isUserExist.login === dto.login) {
      throw new BadRequestException([
        {
          message: 'Incorrect',
          field: 'login',
        },
      ]);
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
      confirmationCode: randomUUID(),
      recoveryCode: randomUUID(),
      isConfirmed: false,
      confirmationCodeExpirationDate: add(new Date(), {
        minutes: 3,
      }).toISOString(),
      recoveryCodeExpirationDate: add(new Date(), {
        minutes: 3,
      }).toISOString(),
    });

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.confirmationCode, dto.email)
      .catch((e) => console.log(e));
  }

  async confirmRegistration(dto: ConfirmationCodeDto) {
    const user = await this.usersRepository.findByConfirmationCode(dto.code);
    if (!user) {
      throw new BadRequestException([
        {
          message: 'Incorrect code',
          field: 'code',
        },
      ]);
    }

    if (user.isConfirmed) {
      throw new BadRequestException([
        {
          message: 'Code already used',
          field: 'code',
        },
      ]);
    }

    if (new Date().toISOString() > user.confirmationCodeExpirationDate) {
      throw new BadRequestException([
        {
          message: 'Code expired',
          field: 'code',
        },
      ]);
    }

    if (dto.code !== user.confirmationCode) {
      throw new BadRequestException([
        {
          message: 'Incorrect code',
          field: 'code',
        },
      ]);
    }

    user.isConfirmed = true;

    await this.usersRepository.save(user);
  }

  async resendConfirmRegistration(dto: EmailDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException([
        {
          message: 'Invalid email',
          field: 'email',
        },
      ]);
    }

    if (user.isConfirmed === true) {
      throw new BadRequestException([
        {
          message: 'Email already confirmed',
          field: 'email',
        },
      ]);
    }

    user.confirmationCodeExpirationDate = add(new Date(), {
      minutes: 3,
    }).toISOString();
    user.confirmationCode = randomUUID();

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.confirmationCode, dto.email)
      .catch((e) => console.log(e));
  }

  async recoverPassword(dto: EmailDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      return;
    }

    user.recoveryCodeExpirationDate = add(new Date(), {
      minutes: 3,
    }).toISOString();

    user.recoveryCode = randomUUID();

    await this.usersRepository.save(user);

    this.emailService
      .sendRecoverPasswordEmail(user.recoveryCode, dto.email)
      .catch((e) => console.log(e));
  }

  async confirmNewPassword(dto: ConfirmNewPasswordDto) {
    const user = await this.usersRepository.findByRecoveryCode(
      dto.recoveryCode,
    );
    if (!user || user.recoveryCode !== dto.recoveryCode) {
      throw new BadRequestException([
        {
          message: 'Incorrect code',
          field: 'recoveryCode',
        },
      ]);
    }

    if (new Date().toISOString() > user.recoveryCodeExpirationDate) {
      throw new BadRequestException([
        {
          message: 'Expired code',
          field: 'recoveryCode',
        },
      ]);
    }

    user.password = await this.cryptoService.createPasswordHash(
      dto.newPassword,
    );

    await this.usersRepository.save(user);
  }

  async validateUser(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersRepository.findByLoginOrEmail(
      loginOrEmail,
      loginOrEmail,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    const compareResult = await this.cryptoService.comparePasswords({
      password,
      hash: user.password,
    });

    if (compareResult) {
      return { id: user.id };
    }

    throw new UnauthorizedException();
  }

  async logout(deviceId: string, userId: string) {
    // const decodedToken = this.jwtService.decode<{
    //   deviceId: string;
    //   userId: string;
    // }>(refreshToken);

    await this.userDeviceSessionsService.deleteCurrentDeviceSession(deviceId, userId);
  }
}
