import { BaseSortablePaginationParams } from '../../../../common/dto/base-query-params.input';
import { IsEnum, IsOptional } from 'class-validator';

enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogId = 'blogId',
  BlogName = 'blogName',
}

export class PostQueryGetParams extends BaseSortablePaginationParams<PostsSortBy> {
  @IsEnum(PostsSortBy)
  @IsOptional()
  sortBy = PostsSortBy.CreatedAt;
}
