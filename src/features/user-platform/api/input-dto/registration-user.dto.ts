import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

const loginRegex = new RegExp('^[a-zA-Z0-9_-]*$');

export class RegistrationUserDto {
  @Matches(loginRegex)
  @MaxLength(10)
  @MinLength(3)
  @IsNotEmpty()
  @Trim()
  @IsString()
  login: string;

  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  @Trim()
  @IsString()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @Trim()
  @IsString()
  email: string;
}
