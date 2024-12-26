import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configUtilityHelper } from './utils/configUtilityHelper';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Trim } from './decorators/custom-trim.decorator';

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

  @IsNumber({}, { message: 'Set Env variable PORT, example: 3000' })
  port: number = Number(this.configService.get('PORT'));

  @IsNotEmpty({ message: 'MONGO_URI should not be empty' })
  @Trim()
  @IsString({ message: 'MONGO_URI should be a string' })
  mongoUri: string = this.configService.get('MONGO_URI');

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configUtilityHelper.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('NODE_ENV');

  @IsBoolean({ message: 'IS_TEST_MODULE_INCLUDE should be boolean' })
  includeTestingModule: boolean = configUtilityHelper.convertToBoolean(
    this.configService.get('IS_TEST_MODULE_INCLUDE'),
  );

  @IsBoolean({ message: 'IS_SWAGGER_ENABLED should be boolean' })
  isSwaggerEnabled: boolean = configUtilityHelper.convertToBoolean(
    this.configService.get('IS_SWAGGER_ENABLED'),
  );

  @IsNotEmpty({ message: 'JWT_SECRET should not be empty' })
  @Trim()
  @IsString({ message: 'JWT_SECRET should be a string' })
  accessTokenSecret: string = this.configService.get('JWT_SECRET');

  @IsNotEmpty({ message: 'BASIC_LOGIN should be not empty' })
  @Trim()
  @IsString({ message: 'BASIC_LOGIN should be a string' })
  basicLogin: string = this.configService.get('BASIC_LOGIN');
}
