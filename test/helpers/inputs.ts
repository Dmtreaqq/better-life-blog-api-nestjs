import { CreateBlogInput } from '../../src/features/bloggers-platform/api/input-dto/create-blog.dto';

export const createBlogInput: CreateBlogInput = {
  name: 'SomeBlog',
  description: 'Some description',
  websiteUrl: 'https://somewebsite.com',
};
