export abstract class BasePaginationViewDto<T> {
  abstract items: T;
  totalCount: number;
  pagesCount: number;
  pageSize: number;
  page: number;

  public static mapToView<T>(data: {
    items: T;
    page: number;
    pageSize: number;
    totalCount: number;
  }): BasePaginationViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount:
        data.totalCount <= data.pageSize
          ? 1
          : Math.ceil(data.totalCount / data.pageSize),
      page: data.page,
      pageSize: data.pageSize,
      items: data.items,
    };
  }
}
