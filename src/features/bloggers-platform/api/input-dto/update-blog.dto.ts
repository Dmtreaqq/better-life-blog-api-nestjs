import { IsNotEmpty } from 'class-validator';

export class UpdateBlogInput {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  websiteUrl: string;
}
