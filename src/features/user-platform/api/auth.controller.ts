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
import { JwtOptionalAuthGuard } from '../../../common/guards/jwt-optional-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req): Promise<MeViewDto> {
    const user = await this.usersQueryRepository.getByIdOrThrow(req.user.id);

    // TODO: Maybe use queryRepo here
    return MeViewDto.mapToView(user as UserDocument);
  }
}
