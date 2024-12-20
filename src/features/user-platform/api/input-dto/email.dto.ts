import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

export class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  @Trim()
  @IsString()
  email: string;
}
