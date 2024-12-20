import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ConfirmNewPasswordDto {
  @MaxLength(20)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
