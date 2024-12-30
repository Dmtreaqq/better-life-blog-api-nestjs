import {
  isMongoId,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';
import {
  BlogIsExist,
  BlogIsExistConstraint,
} from '../../validation/blog-is-exist.decorator';

export class CreatePostInputDto {
  @MaxLength(30)
  @IsNotEmpty()
  @Trim()
  @IsString()
  title: string;

  @MaxLength(100)
  @IsNotEmpty()
  @Trim()
  @IsString()
  shortDescription: string;

  @MaxLength(1000)
  @IsNotEmpty()
  @Trim()
  @IsString()
  content: string;

  @BlogIsExist()
  @IsMongoId()
  @IsNotEmpty()
  @Trim()
  @IsString()
  blogId: string;
}

export class CreatePostForBlogInputDto {
  @MaxLength(30)
  @IsNotEmpty()
  @Trim()
  @IsString()
  title: string;

  @MaxLength(100)
  @IsNotEmpty()
  @Trim()
  @IsString()
  shortDescription: string;

  @MaxLength(1000)
  @IsNotEmpty()
  @Trim()
  @IsString()
  content: string;
}
