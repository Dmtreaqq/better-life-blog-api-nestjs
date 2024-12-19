import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendConfirmEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
