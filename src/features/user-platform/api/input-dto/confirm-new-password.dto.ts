import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

export class ConfirmNewPasswordDto {
  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  @Trim()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  recoveryCode: string;
}
