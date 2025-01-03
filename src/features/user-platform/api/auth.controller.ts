import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UsersQueryRepository } from '../repositories/query/users.query-repository';
import { MeViewDto } from './view-dto/users.view-dto';
import { UserDocument } from '../domain/user.entity';
import { RegistrationUserDto } from './input-dto/registration-user.dto';
import { ConfirmationCodeDto } from './input-dto/confirmation-code.dto';
import { EmailDto } from './input-dto/email.dto';
import { ConfirmNewPasswordDto } from './input-dto/confirm-new-password.dto';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserContext } from '../../../common/dto/user-context.dto';
import { Response } from 'express';
import { add } from 'date-fns/add';
import { JwtRefreshAuthGuard } from '../../../common/guards/jwt-refresh-auth.guard';
import { UserAgent } from '../../../common/decorators/user-agent.decorator';
import { UserDeviceSessionsService } from '../application/user-device-sessions.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) res: Response,
    @GetUser() userContext: UserContext,
  ) {
    const loginResult = await this.authService.login(
      userContext.id,
      ip,
      userAgent,
    );
    res.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: add(new Date(), { hours: 24 }),
    });

    return {
      accessToken: loginResult.accessToken,
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() dto: RegistrationUserDto) {
    await this.authService.register(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmRegistration(@Body() dto: ConfirmationCodeDto) {
    await this.authService.confirmRegistration(dto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @GetUser() userContext: { deviceId: string; id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userContext.deviceId, userContext.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      expires: add(new Date(), { hours: 24 }),
    });
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(
    @GetUser() userContext: { id: string; deviceId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokensPair(
      userContext.deviceId,
      userContext.id,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: add(new Date(), { hours: 24 }),
    });

    return tokens;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async resendConfirmRegistration(@Body() dto: EmailDto) {
    await this.authService.resendConfirmRegistration(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async recoverPassword(@Body() dto: EmailDto) {
    await this.authService.recoverPassword(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async confirmNewPassword(@Body() dto: ConfirmNewPasswordDto) {
    await this.authService.confirmNewPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser() userContext: UserContext): Promise<MeViewDto> {
    const user = await this.usersQueryRepository.getByIdOrThrow(userContext.id);

    return MeViewDto.mapToView(user as UserDocument);
  }
}
