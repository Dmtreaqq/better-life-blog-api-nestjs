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
import { IdInputDto } from '../../../common/dto/id.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post(':id/posts')
  async createPostForBlog(
    @Body() dto: Omit<CreatePostInputDto, 'blogId'>,
    @Param() param: IdInputDto,
  ) {
    const postId = await this.postsService.createPostForBlog(dto, param.id);

    return this.postsQueryRepository.getByIdOrThrow(postId);
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Query() query: PostQueryGetParams,
    @Param() params: IdInputDto,
  ) {
    return this.postsQueryRepository.getAll(query, params.id);
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
  async getById(@Param() params: IdInputDto) {
    return this.blogsQueryRepository.getByIdOrThrow(params.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editBlog(@Param() params: IdInputDto, @Body() dto: UpdateBlogInput) {
    return this.blogsService.editBlog(params.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param() params: IdInputDto) {
    await this.blogsService.deleteBlog(params.id);
  }
}
