import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../../../common/guards/jwt-refresh-auth.guard';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserDeviceSessionsQueryRepository } from '../repositories/query/user-device-sessions.query-repository';
import { UserDeviceSessionsViewDto } from './view-dto/user-device-sessions.view-dto';
import { IdInputDto } from '../../../common/dto/id.input-dto';
import { UserDeviceSessionsService } from '../application/user-device-sessions.service';
import { UserContext } from '../../../common/dto/user-context.dto';

@UseGuards(JwtRefreshAuthGuard)
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private userDeviceSessionsQueryRepository: UserDeviceSessionsQueryRepository,
    private userDeviceSessionsService: UserDeviceSessionsService,
  ) {}

  @Get()
  async getAllDeviceSessions(
    @GetUser() userContext: UserContext,
  ): Promise<UserDeviceSessionsViewDto[]> {
    return this.userDeviceSessionsQueryRepository.getAll(userContext.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDeviceSession(
    @GetUser() userContext: { id: string; deviceId: string },
  ) {
    await this.userDeviceSessionsService.deleteAllDeviceSessionExceptCurrent(
      userContext.deviceId,
      userContext.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceSession(
    @Param() params: IdInputDto,
    @GetUser() userContext: { id: string; deviceId: string },
  ) {
    await this.userDeviceSessionsService.deleteSpecificDeviceSession(
      params.id,
      userContext.id,
    );
  }
}
