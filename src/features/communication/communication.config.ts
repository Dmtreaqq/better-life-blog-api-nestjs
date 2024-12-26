import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../common/decorators/custom-trim.decorator';
import { configUtilityHelper } from '../../common/utils/configUtilityHelper';

@Injectable()
export class CommunicationConfig {
  constructor(private configService: ConfigService) {
    configUtilityHelper.validateConfig(this);
  }

  @IsNotEmpty({ message: 'MAILJET_API_KEY should not be empty' })
  @Trim()
  @IsString({ message: 'MAILJET_API_KEY should be a string' })
  mailJetApiKey: string = this.configService.get('MAILJET_API_KEY');

  @IsNotEmpty({ message: 'MAILJET_SECRET_KEY should not be empty' })
  @Trim()
  @IsString({ message: 'MAILJET_SECRET_KEY should be a string' })
  mailJetSecretKey: string = this.configService.get('MAILJET_SECRET_KEY');
}
