import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../repositories/query/comments.query-repository';
import { IdInputDto } from '../../../common/dto/id.input-dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getById(@Param() params: IdInputDto) {
    return this.commentsQueryRepository.getByIdOrThrow(params.id);
  }
}
