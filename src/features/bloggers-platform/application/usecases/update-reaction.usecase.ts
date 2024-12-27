import { CreateReactionDto } from '../../dto/create-reaction.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReactionRelationType } from '../../api/enums/ReactionRelationType';
import { UsersRepository } from '../../../user-platform/repositories/users.repository';
import { UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostModelType } from '../../domain/post.entity';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { Reaction, ReactionModelType } from '../../domain/reaction.entity';
import { ReactionModelStatus } from '../../api/enums/ReactionStatus';
import { PostsRepository } from '../../repositories/posts.repository';

export class UpdateReactionCommand {
  constructor(public dto: CreateReactionDto) {}
}

@CommandHandler(UpdateReactionCommand)
export class UpdateReactionUseCase
  implements ICommandHandler<UpdateReactionCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
    @InjectModel(Reaction.name) private ReactionModel: ReactionModelType,
  ) {}

  async execute(command: UpdateReactionCommand): Promise<void> {
    const { userId, reactionStatus, reactionRelationType, commentOrPostId } =
      command.dto;
    // CHECK IF USER VALID
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    // IF ITS A POST
    if (reactionRelationType === ReactionRelationType.Post) {
      // IF REACTION FROM THIS USER NOT EXIST CREATE A NEW ONE (LIKE OR DISLIKE)
      const reaction = this.ReactionModel.createInstance({
        reactionStatus,
        reactionRelationType,
        userId,
        commentOrPostId,
      });

      const post = await this.postsRepository.getById(commentOrPostId);

      post.reactions.push(reaction);

      await this.postsRepository.save(post);
      return;
    }
  }
}
