import { BaseSortablePaginationParams } from '../../../../common/dto/base-query-params.input';
import { IsEnum, IsOptional } from 'class-validator';

enum CommentsSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}

export class CommentsQueryGetParams extends BaseSortablePaginationParams<CommentsSortBy> {
  @IsEnum(CommentsSortBy)
  @IsOptional()
  sortBy = CommentsSortBy.CreatedAt;
}
