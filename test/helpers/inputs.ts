import { CreateBlogInput } from '../../src/features/bloggers-platform/api/input-dto/create-blog.dto';
import { CreatePostInputDto } from '../../src/features/bloggers-platform/api/input-dto/create-post-input.dto';

export const createBlogInput: CreateBlogInput = {
  name: 'SomeBlog',
  description: 'Some description',
  websiteUrl: 'https://somewebsite.com',
};

export const createPostInput: CreatePostInputDto = {
  title: 'Post Title',
  shortDescription: 'Short Description',
  content: 'Post Content',
  blogId: 'you missed blogID',
};
