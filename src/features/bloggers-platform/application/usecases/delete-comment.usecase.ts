import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-platform/repositories/users.repository';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommentsRepository } from '../../repositories/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public userId: string,
    public commentId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute(command: DeleteCommentCommand) {
    const user = await this.usersRepository.findById(command.userId);
    if (!user) {
      throw new UnauthorizedException([
        {
          message: 'There is no user',
          field: 'userId',
        },
      ]);
    }

    const comment = await this.commentsRepository.getByIdOrThrow(
      command.commentId,
    );

    if (comment.commentatorId !== user.id) {
      throw new ForbiddenException([
        {
          message: 'You try delete the comment that is not your own',
          field: 'commentId',
        },
      ]);
    }

    await this.commentsRepository.deleteComment(comment);
  }
}
