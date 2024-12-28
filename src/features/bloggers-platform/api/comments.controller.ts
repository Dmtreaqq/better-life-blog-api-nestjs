import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../repositories/query/comments.query-repository';
import { IdInputDto } from '../../../common/dto/id.input-dto';
import { JwtOptionalAuthGuard } from '../../../common/guards/jwt-optional-auth.guard';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserContext } from '../../../common/dto/user-context.dto';
import { UpdateCommentInputDto } from './input-dto/update-comment-input.dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { CreateUpdateReactionInput } from './input-dto/create-update-reaction.input.dto';
import { UpdateReactionCommand } from '../application/usecases/update-reaction.usecase';
import { ReactionRelationType } from './enums/ReactionRelationType';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getById(
    @Param() params: IdInputDto,
    @GetUser() userContext: UserContext,
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrThrow(
      params.id,
      userContext.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteById(
    @Param() params: IdInputDto,
    @GetUser() userContext: UserContext,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentCommand(userContext.id, params.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async editById(
    @Param() params: IdInputDto,
    @GetUser() userContext: UserContext,
    @Body() dto: UpdateCommentInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand({
        userId: userContext.id,
        commentId: params.id,
        content: dto.content,
      }),
    );
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
        reactionRelationType: ReactionRelationType.Comment,
      }),
    );
  }
}
