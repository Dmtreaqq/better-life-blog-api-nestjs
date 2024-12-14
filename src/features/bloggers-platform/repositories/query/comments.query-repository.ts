import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { BasePaginationViewDto } from '../../../../common/dto/base-pagination.view-dto';
import { FilterQuery } from 'mongoose';
import { CommentsQueryGetParams } from '../../api/input-dto/get-comments-query.dto';
import { Comment } from '../../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getAll(
    query: CommentsQueryGetParams,
    postId: string,
  ): Promise<BasePaginationViewDto<CommentViewDto[]>> {
    const filter: FilterQuery<Comment> = {};
    filter.postId = postId;

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    const items = comments.map(CommentViewDto.mapToView);

    return BasePaginationViewDto.mapToView({
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items,
    });
  }

  async getByIdOrThrow(id: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findById(id);

    if (!comment) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Comment not found',
            field: 'id',
          },
        ],
      });
    }

    return CommentViewDto.mapToView(comment);
  }
}
