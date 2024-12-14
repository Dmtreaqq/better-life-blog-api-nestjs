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
import { PostViewDto } from './view-dto/post.view-dto';
import { PostsQueryRepository } from '../repositories/query/posts.query-repository';
import { PostsService } from '../application/posts.service';
import { CreatePostInputDto } from './input-dto/create-post-input.dto';
import { PostQueryGetParams } from './input-dto/get-posts-query.dto';
import { BasePaginationViewDto } from '../../../common/dto/base-pagination.view-dto';
import { UpdatePostInputDto } from './input-dto/update-post-input.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  async getAll(
    @Query() query: PostQueryGetParams,
  ): Promise<BasePaginationViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrThrow(id);
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.postsService.createPost(dto);

    return this.postsQueryRepository.getByIdOrThrow(postId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id') id: string) {
    await this.postsService.deletePost(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editPost(@Param('id') id: string, @Body() dto: UpdatePostInputDto) {
    return this.postsService.editPost(id, dto);
  }
}
