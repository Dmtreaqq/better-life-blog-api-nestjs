import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../repositories/query/comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.commentsQueryRepository.getByIdOrThrow(id);
  }
}
