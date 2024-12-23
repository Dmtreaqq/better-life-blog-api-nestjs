import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from '../application/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../repositories/query/users.query-repository';
import { MeViewDto } from './view-dto/users.view-dto';
import { UserDocument } from '../domain/user.entity';
import { RegistrationUserDto } from './input-dto/registration-user.dto';
import { ConfirmationCodeDto } from './input-dto/confirmation-code.dto';
import { EmailDto } from './input-dto/email.dto';
import { ConfirmNewPasswordDto } from './input-dto/confirm-new-password.dto';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserContext } from '../../../common/dto/user-context.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@GetUser() userContext: UserContext) {
    return this.authService.login(userContext.id);
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

    // TODO: Maybe use queryRepo here
    return MeViewDto.mapToView(user as UserDocument);
  }
}
