import { CreateReactionDto } from '../../dto/create-reaction.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReactionRelationType } from '../../api/enums/ReactionRelationType';
import { UsersRepository } from '../../../user-platform/repositories/users.repository';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reaction, ReactionModelType } from '../../domain/reaction.entity';
import { PostsRepository } from '../../repositories/posts.repository';
import { CommentsRepository } from '../../repositories/comments.repository';
import { ReactionStatus } from '../../api/enums/ReactionStatus';

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
    private commentsRepository: CommentsRepository,
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

    // CHECK IF USER ALREADY LEFT A REACTION ON THIS POST or COMMENT
    const userReactionAtThisEntity = user.userReactions.find(
      (userReact) => userReact.commentOrPostId === commentOrPostId,
    );

    // IF REACTION FROM THIS USER NOT EXIST CREATE A NEW ONE (LIKE OR DISLIKE)
    if (!userReactionAtThisEntity) {
      if (reactionStatus === ReactionStatus.None) {
        return;
      }
      const reaction = this.ReactionModel.createInstance({
        reactionStatus,
        reactionRelationType,
        userId,
        commentOrPostId,
      });

      if (reactionRelationType === ReactionRelationType.Post) {
        const post = await this.postsRepository.getById(commentOrPostId);
        user.userReactions.push({
          status: reaction.reactionStatus,
          commentOrPostId: post.id,
          type: ReactionRelationType.Post,
        });
        post.reactions.push(reaction);
        await this.usersRepository.save(user);
        await this.postsRepository.save(post);
        return;
      }

      if (reactionRelationType === ReactionRelationType.Comment) {
        const comment = await this.commentsRepository.getById(commentOrPostId);
        user.userReactions.push({
          status: reaction.reactionStatus,
          commentOrPostId: comment.id,
          type: ReactionRelationType.Comment,
        });
        comment.reactions.push(reaction);
        await this.usersRepository.save(user);
        await this.commentsRepository.save(comment);
        return;
      }
    }

    // IF REACTION DO EXIST !!!

    if (userReactionAtThisEntity) {
      // IF USER TRY TO SET SAME REACTION
      if ((userReactionAtThisEntity.status as any) === reactionStatus) {
        return;
      }

      // IF USER WANT TO REMOVE ACTION (NONE)
      if (reactionStatus === ReactionStatus.None) {
        // IF POST
        if (reactionRelationType === ReactionRelationType.Post) {
          const userReactionIdToDelete = userReactionAtThisEntity.id;
          const index = user.userReactions.findIndex(
            (item) => item.id === userReactionIdToDelete,
          );
          if (index !== -1) {
            user.userReactions.splice(index, 1); // Remove the element at the found index
          }
          await this.usersRepository.save(user);

          const post = await this.postsRepository.getById(commentOrPostId);
          console.log(post);
          const postReactionIdToDelete = post.reactions.find(
            (react) => react.userId === user.id,
          ).id;
          console.log(postReactionIdToDelete);
          const indexS = post.reactions.findIndex(
            (item) => item.id === postReactionIdToDelete,
          );
          console.log(indexS);

          if (indexS !== -1) {
            post.reactions.splice(indexS, 1);
          }
          await this.postsRepository.save(post);

          return;
        }

        // IF COMMENT
        if (reactionRelationType === ReactionRelationType.Comment) {
          const userReactionIdToDelete = userReactionAtThisEntity.id;
          const index = user.userReactions.findIndex(
            (item) => item.id === userReactionIdToDelete,
          );
          if (index !== -1) {
            user.userReactions.splice(index, 1);
          }
          await this.usersRepository.save(user);

          const comment =
            await this.commentsRepository.getById(commentOrPostId);

          const commentReactionIdToDelete = comment.reactions.find(
            (react) => react.userId === user.id,
          ).id;

          const indexS = comment.reactions.findIndex(
            (item) => item.id === commentReactionIdToDelete,
          );
          if (indexS !== -1) {
            comment.reactions.splice(indexS, 1);
          }
          await this.commentsRepository.save(comment);

          return;
        }
      }
    }
  }
}
