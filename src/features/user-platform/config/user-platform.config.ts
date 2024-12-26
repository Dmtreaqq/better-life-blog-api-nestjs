import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configUtilityHelper } from '../../../common/utils/configUtilityHelper';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Injectable()
export class UserPlatformConfig {
  constructor(private configService: ConfigService) {
    configUtilityHelper.validateConfig(this);
  }

  @IsNumber({}, { message: 'ACCESS_TOKEN_EXPIRATION should be a number' })
  @IsNotEmpty({ message: 'ACCESS_TOKEN_EXPIRATION should not be empty' })
  accessTokenExpiration: number = Number(
    this.configService.get('ACCESS_TOKEN_EXPIRATION'),
  );
}
