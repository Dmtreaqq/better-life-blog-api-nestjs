import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserInputDto {
  // TODO: MAKE TRIM CUSTOM

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  @IsString()
  login: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  @IsString()
  email: string;
}
