import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostQueryGetParams } from '../../api/input-dto/get-posts-query.dto';
import { BasePaginationViewDto } from '../../../../common/dto/base-pagination.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getAll(
    query: PostQueryGetParams,
  ): Promise<BasePaginationViewDto<PostViewDto[]>> {
    const posts = await this.PostModel.find({})
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments({});

    const items = posts.map(PostViewDto.mapToView);

    return BasePaginationViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrThrow(id: string): Promise<PostViewDto> {
    const post = await this.PostModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return PostViewDto.mapToView(post);
  }
}
