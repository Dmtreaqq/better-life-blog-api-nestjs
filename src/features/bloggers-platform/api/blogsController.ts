import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateBlogInput } from './input-dto/create-blog.dto';
import { BlogsService } from '../application/blogs.service';
import { UpdateBlogInput } from './input-dto/update-blog.dto';
import { BlogsQueryRepository } from '../repositories/query/blogs.query-repository';

import { BlogQueryGetParams } from './input-dto/get-blogs-query.dto';
import { BasePaginationViewDto } from '../../../common/dto/base-pagination.view-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { PostsQueryRepository } from '../repositories/query/posts.query-repository';
import { PostQueryGetParams } from './input-dto/get-posts-query.dto';
import { PostsService } from '../application/posts.service';
import { CreatePostInputDto } from './input-dto/create-post-input.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post(':id/posts')
  async createPostForBlog(@Body() dto: Omit<CreatePostInputDto, 'blogId'>, @Param('id') blogId: string) {
    const postId = await this.postsService.createPostForBlog(dto, blogId);

    return this.postsQueryRepository.getByIdOrThrow(postId);
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Query() query: PostQueryGetParams,
    @Param('id') blogId: string,
  ) {
    return this.postsQueryRepository.getAll(query, blogId);
  }

  @Post()
  async createBlog(@Body() dto: CreateBlogInput) {
    const blogId = await this.blogsService.createBlog(dto);

    return this.blogsQueryRepository.getByIdOrThrow(blogId);
  }

  @Get()
  async getAll(
    @Query() query: BlogQueryGetParams,
  ): Promise<BasePaginationViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.blogsQueryRepository.getByIdOrThrow(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editBlog(@Param('id') id: string, @Body() dto: UpdateBlogInput) {
    return this.blogsService.editBlog(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id') id: string) {
    await this.blogsService.deleteBlog(id);
  }
}
