import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configUtilityHelper } from './utils/configUtilityHelper';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

enum Environments {
  Production = 'production',
  Development = 'development',
  Testing = 'testing',
}

@Injectable()
export class CommonConfig {
  constructor(private configService: ConfigService<any, true>) {
    configUtilityHelper.validateConfig(this);
  }

  @IsNumber()
  port: number = Number(this.configService.get('PORT'));

  @IsString()
  mongoUri: string = this.configService.get('MONGO_URI');

  @IsEnum(Environments)
  env: string = this.configService.get('NODE_ENV');

  @IsBoolean()
  includeTestingModule: boolean = configUtilityHelper.convertToBoolean(
    this.configService.get('IS_TEST_MODULE_INCLUDE'),
  );

  @IsBoolean()
  isSwaggerEnabled: boolean = configUtilityHelper.convertToBoolean(
    this.configService.get('IS_SWAGGER_ENABLED'),
  );

  @IsString()
  accessTokenSecret: string = this.configService.get('JWT_SECRET');
}
