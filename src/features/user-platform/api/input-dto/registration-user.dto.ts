import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const loginRegex = new RegExp('^[a-zA-Z0-9_-]*$');

export class RegistrationUserDto {
  @Matches(loginRegex)
  @MaxLength(10)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  login: string;

  @MaxLength(20)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
