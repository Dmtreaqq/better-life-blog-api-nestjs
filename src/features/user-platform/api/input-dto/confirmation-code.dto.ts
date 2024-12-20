import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

export class ConfirmationCodeDto {
  @IsNotEmpty()
  @Trim()
  @IsString()
  code: string;
}
