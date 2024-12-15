//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
//базовый класс для query параметров с пагинацией

class PaginationParams {
  //для трансформации в number
  @Type(() => Number)
  pageNumber: number = 1;
  @Type(() => Number)
  pageSize: number = 10;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

//базовый класс для query параметров с сортировкой и пагинацией
//поле sortBy должно быть реализовано в наследниках
export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.DESC;

  abstract sortBy: T;
}
