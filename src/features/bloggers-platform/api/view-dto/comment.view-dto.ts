import { CommentDocument } from '../../domain/comment.entity';
import { ReactionStatus } from '../enums/ReactionStatus';

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

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.commentatorInfo = {
      userId: comment.commentatorId,
      userLogin: comment.commentatorLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: ReactionStatus.None,
    };
    dto.content = comment.content;

    return dto;
  }
}
