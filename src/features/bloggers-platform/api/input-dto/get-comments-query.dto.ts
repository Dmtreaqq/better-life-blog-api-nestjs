import { BaseSortablePaginationParams } from '../../../../common/dto/base-query-params.input';

enum CommentsSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}

export class CommentsQueryGetParams extends BaseSortablePaginationParams<CommentsSortBy> {
  sortBy = CommentsSortBy.CreatedAt;
}
