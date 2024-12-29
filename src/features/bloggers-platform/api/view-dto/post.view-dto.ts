import { PostDocument } from '../../domain/post.entity';
import { ReactionModelStatus, ReactionStatus } from '../enums/ReactionStatus';
import { ReactionDocument } from '../../domain/reaction.entity';

class LikesDetails {
  addedAt: Date;
  userId: string;
  login: string;
}

class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikesDetails[];
}

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;

  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(
    post: PostDocument,
    userStatus: ReactionStatus | null,
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: this.countLikes(post.reactions as any),
      dislikesCount: this.countDislikes(post.reactions as any),
      myStatus: userStatus ?? ReactionStatus.None,
      newestLikes: this.countThreeLastLikesWithDetails(
        post.reactions as any,
      ) as any,
    };

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

  private static countThreeLastLikesWithDetails(
    reactions: ReactionDocument[],
  ): LikesDetails[] {
    const likes = reactions.filter(
      (reaction) => reaction.reactionStatus === ReactionModelStatus.Like,
    );

    return likes
      .slice(-3)
      .reverse()
      .map((like) => ({
        login: like.login,
        addedAt: like.createdAt,
        userId: like.userId,
      }));
  }
}
