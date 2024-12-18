import { BaseSortablePaginationParams } from '../../../../common/dto/base-query-params.input';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  @IsEnum(UsersSortBy)
  @IsOptional()
  sortBy = UsersSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  searchLoginTerm: string | null = null;

  @IsString()
  @IsOptional()
  searchEmailTerm: string | null = null;
}
