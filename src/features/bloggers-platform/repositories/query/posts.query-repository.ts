import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostQueryGetParams } from '../../api/input-dto/get-posts-query.dto';
import { BasePaginationViewDto } from '../../../../common/dto/base-pagination.view-dto';
import { FilterQuery } from 'mongoose';
import { BlogModelType } from '../../domain/blog.entity';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel('Blog') private BlogModel: BlogModelType,
  ) {}

  async getAll(
    query: PostQueryGetParams,
    blogId: string = '',
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
      throw new NotFoundException([
        {
          message: 'User not found',
          field: 'id',
        },
      ]);
    }

    return PostViewDto.mapToView(post);
  }
}
