import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

export class CreateBlogInput {
  @MaxLength(15)
  @IsNotEmpty()
  @Trim()
  @IsString()
  name: string;

  @MaxLength(500)
  @IsNotEmpty()
  @Trim()
  @IsString()
  description: string;

  @IsUrl()
  @MaxLength(100)
  @IsNotEmpty()
  @Trim()
  @IsString()
  websiteUrl: string;
}
