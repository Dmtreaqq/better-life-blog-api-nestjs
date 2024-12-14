import { BaseSortablePaginationParams } from '../../../../common/dto/base-query-params.input';

enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
}

export class BlogQueryGetParams extends BaseSortablePaginationParams<BlogsSortBy> {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
