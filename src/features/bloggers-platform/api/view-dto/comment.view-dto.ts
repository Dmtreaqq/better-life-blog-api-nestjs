import { CommentDocument } from '../../domain/comment.entity';
import { ReactionModelStatus, ReactionStatus } from '../enums/ReactionStatus';
import { ReactionDocument } from '../../domain/reaction.entity';

class CommentatorInfo {
  userId: string;
  userLogin: string;
}

class LikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
}

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  likesInfo: LikesInfo;
  createdAt!: Date;

  static mapToView(
    comment: CommentDocument,
    userStatus: ReactionStatus | null,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.commentatorInfo = {
      userId: comment.commentatorId,
      userLogin: comment.commentatorLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: this.countLikes(comment.reactions as any),
      dislikesCount: this.countDislikes(comment.reactions as any),
      myStatus: userStatus ?? ReactionStatus.None,
    };
    dto.content = comment.content;

    return dto;
  }

  private static countLikes(reactions: ReactionDocument[]): number {
    const likes = reactions.filter(
      (reaction) => reaction.reactionStatus === ReactionModelStatus.Like,
    );

    return likes.length;
  }

  private static countDislikes(reactions: ReactionDocument[]): number {
    const likes = reactions.filter(
      (reaction) => reaction.reactionStatus === ReactionModelStatus.Dislike,
    );

    return likes.length;
  }
}
