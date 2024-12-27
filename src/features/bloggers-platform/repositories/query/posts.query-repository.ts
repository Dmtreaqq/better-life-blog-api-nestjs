import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostQueryGetParams } from '../../api/input-dto/get-posts-query.dto';
import { BasePaginationViewDto } from '../../../../common/dto/base-pagination.view-dto';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { BlogModelType } from '../../domain/blog.entity';
import {
  UserDocument,
  UserModelType,
} from '../../../user-platform/domain/user.entity';
import {
  ReactionModelStatus,
  ReactionStatus,
} from '../../api/enums/ReactionStatus';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel('Blog') private BlogModel: BlogModelType,
    @InjectModel('User') private UserModel: UserModelType,
  ) {}

  async getAll(
    query: PostQueryGetParams,
    blogId: string = '',
    userId?: string,
  ): Promise<BasePaginationViewDto<PostViewDto[]>> {
    if (isValidObjectId(blogId)) {
      const blog = await this.BlogModel.findById(blogId);
      if (!blog) {
        throw new NotFoundException([
          {
            message: 'Blog not found while get posts',
            field: 'blogId',
          },
        ]);
      }
    }

    const filter: FilterQuery<Post> = {};
    if (blogId !== '' && isValidObjectId(blogId)) {
      filter.blogId = blogId;
    }

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    let user: UserDocument | null = null;
    let userPostReactionStatus: ReactionStatus = ReactionStatus.None;

    if (userId) {
      user = await this.UserModel.findById(userId);
    }

    const findUserReactionForPost = (postId: string): ReactionStatus => {
      if (!userId) return userPostReactionStatus;

      if (user && user.userReactions?.length > 0) {
        userPostReactionStatus = user.userReactions.find(
          (userReact) => userReact.commentOrPostId === postId,
        ).status as any;
      } else {
        return userPostReactionStatus;
      }

      return userPostReactionStatus;
    };

    const items = posts.map((post) => {
      return PostViewDto.mapToView(post, findUserReactionForPost(post.id));
    });

    return BasePaginationViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrThrow(id: string, userId?: string): Promise<PostViewDto> {
    const post = await this.PostModel.findById(id);

    if (!post) {
      throw new NotFoundException([
        {
          message: 'User not found',
          field: 'id',
        },
      ]);
    }

    let userPostReactionStatus: ReactionModelStatus | null = null;
    if (userId) {
      const user = await this.UserModel.findById(userId);
      if (user && user.userReactions?.length > 0) {
        const userPostReaction = user.userReactions.find(
          (userReact) => userReact.commentOrPostId === post.id,
        );

        userPostReactionStatus = userPostReaction.status;
      }
    }

    return PostViewDto.mapToView(post, userPostReactionStatus as any);
  }
}
