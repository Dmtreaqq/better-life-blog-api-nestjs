import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { BasePaginationViewDto } from '../../../../common/dto/base-pagination.view-dto';
import { FilterQuery } from 'mongoose';
import { CommentsQueryGetParams } from '../../api/input-dto/get-comments-query.dto';
import { Comment } from '../../domain/comment.entity';
import {
  ReactionModelStatus,
  ReactionStatus,
} from '../../api/enums/ReactionStatus';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../../user-platform/domain/user.entity';
import { Post, PostModelType } from '../../domain/post.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async getAll(
    query: CommentsQueryGetParams,
    postId: string,
    userId?: string,
  ): Promise<BasePaginationViewDto<CommentViewDto[]>> {
    const post = await this.PostModel.findById(postId);
    if (!post) {
      throw new NotFoundException();
    }

    const filter: FilterQuery<Comment> = {};
    filter.postId = postId;

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    let user: UserDocument | null = null;
    let userCommentReactionStatus: ReactionStatus = ReactionStatus.None;

    if (userId) {
      user = await this.UserModel.findById(userId);
    }

    const findUserReactionForComment = (commId: string): ReactionStatus => {
      if (!userId) return userCommentReactionStatus;

      if (user && user.userReactions?.length > 0) {
        userCommentReactionStatus = user.userReactions.find(
          (userReact) => userReact.commentOrPostId === commId,
        )?.status as any;
      } else {
        return userCommentReactionStatus;
      }

      return userCommentReactionStatus;
    };

    const items = comments.map((comm) =>
      CommentViewDto.mapToView(comm, findUserReactionForComment(comm.id)),
    );

    return BasePaginationViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrThrow(id: string, userId?: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findById(id);

    if (!comment) {
      throw new NotFoundException([
        {
          message: 'Comment not found',
          field: 'id',
        },
      ]);
    }

    let userCommentReactionStatus: ReactionModelStatus | null = null;
    if (userId) {
      const user = await this.UserModel.findById(userId);
      if (user && user.userReactions?.length > 0) {
        const userCommentReaction = user.userReactions.find(
          (userReact) => userReact.commentOrPostId === comment.id,
        );

        userCommentReactionStatus = userCommentReaction?.status;
      }
    }

    return CommentViewDto.mapToView(comment, userCommentReactionStatus as any);
  }
}
