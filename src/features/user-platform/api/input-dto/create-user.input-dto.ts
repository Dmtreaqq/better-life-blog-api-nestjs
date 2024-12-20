import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

export class CreateUserInputDto {
  @MinLength(3)
  @MaxLength(10)
  @IsNotEmpty()
  @Trim()
  @IsString()
  login: string;

  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty()
  @Trim()
  @IsString()
  password: string;

  @IsEmail()
  @MaxLength(50)
  @IsNotEmpty()
  @Trim()
  @IsString()
  email: string;
}
