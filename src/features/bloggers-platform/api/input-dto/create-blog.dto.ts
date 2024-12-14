import { IsNotEmpty } from 'class-validator';

export class CreateBlogInput {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  websiteUrl: string;
}
