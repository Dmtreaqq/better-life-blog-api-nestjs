import { CommentDocument } from '../../domain/comment.entity';

class CommentatorInfo {
  userId!: string;
  userLogin!: string;
}

export class CommentViewDto {
  id!: string;
  content!: string;
  commentatorInfo!: CommentatorInfo;
  createdAt!: Date;

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.commentatorInfo.userId = comment.commentatorId;
    dto.commentatorInfo.userLogin = comment.commentatorLogin;
    dto.createdAt = comment.createdAt;

    return dto;
  }
}
