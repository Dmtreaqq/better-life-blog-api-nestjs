import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePostInputDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  blogId: string;
}
