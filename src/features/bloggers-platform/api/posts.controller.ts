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
import { CommentsQueryRepository } from '../repositories/query/comments.query-repository';
import { CommentsQueryGetParams } from './input-dto/get-comments-query.dto';
import { IdInputDto } from '../../../common/dto/id.input-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':postId/comments')
  async getCommentsForPost(
    @Param() params: IdInputDto,
    @Query() query: CommentsQueryGetParams,
  ) {
    return this.commentsQueryRepository.getAll(query, params.id);
  }

  @Get()
  async getAll(
    @Query() query: PostQueryGetParams,
  ): Promise<BasePaginationViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Get(':id')
  async getById(@Param() params: IdInputDto): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrThrow(params.id);
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.postsService.createPost(dto);

    return this.postsQueryRepository.getByIdOrThrow(postId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param() params: IdInputDto) {
    await this.postsService.deletePost(params.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editPost(@Param() params: IdInputDto, @Body() dto: UpdatePostInputDto) {
    return this.postsService.editPost(params.id, dto);
  }
}
