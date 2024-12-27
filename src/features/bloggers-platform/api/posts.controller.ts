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
  UseGuards,
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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateCommentInputDto } from './input-dto/create-comment-input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../application/usecases/create-comment.usecase';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserContext } from '../../../common/dto/user-context.dto';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../common/guards/jwt-optional-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction, ReactionModelType } from '../domain/reaction.entity';
import { PostsRepository } from '../repositories/posts.repository';
import { CreateUpdateReactionInput } from './input-dto/create-update-reaction.input.dto';
import { UpdateReactionCommand } from '../application/usecases/update-reaction.usecase';
import { ReactionRelationType } from './enums/ReactionRelationType';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
    @InjectModel(Reaction.name) private ReactionModel: ReactionModelType,
    private postsRepository: PostsRepository,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id/comments')
  async getCommentsForPost(
    @Param() params: IdInputDto,
    @Query() query: CommentsQueryGetParams,
  ) {
    return this.commentsQueryRepository.getAll(query, params.id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAll(
    @Query() query: PostQueryGetParams,
    @GetUser() userContext: UserContext,
  ): Promise<BasePaginationViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query, '', userContext.id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getById(
    @Param() params: IdInputDto,
    @GetUser() userContext: UserContext,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.getByIdOrThrow(params.id, userContext.id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.postsService.createPost(dto);

    return this.postsQueryRepository.getByIdOrThrow(postId);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param() params: IdInputDto) {
    await this.postsService.deletePost(params.id);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async editPost(@Param() params: IdInputDto, @Body() dto: UpdatePostInputDto) {
    return this.postsService.editPost(params.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createCommentForPost(
    @Body() commentInputDto: CreateCommentInputDto,
    @Param() params: IdInputDto,
    @GetUser() userContext: UserContext,
  ) {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand({
        ...commentInputDto,
        postId: params.id,
        userId: userContext.id,
      }),
    );

    return this.commentsQueryRepository.getByIdOrThrow(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async setLikeStatus(
    @Param() params: IdInputDto,
    @GetUser() userContext: UserContext,
    @Body() dto: CreateUpdateReactionInput,
  ) {
    await this.commandBus.execute(
      new UpdateReactionCommand({
        userId: userContext.id,
        commentOrPostId: params.id,
        reactionStatus: dto.likeStatus,
        reactionRelationType: ReactionRelationType.Post,
      }),
    );
  }
}
