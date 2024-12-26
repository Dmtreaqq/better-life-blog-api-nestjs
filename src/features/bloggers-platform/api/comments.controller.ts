import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CommentsQueryRepository } from '../repositories/query/comments.query-repository';
import { IdInputDto } from '../../../common/dto/id.input-dto';
import { JwtOptionalAuthGuard } from '../../../common/guards/jwt-optional-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getById(@Param() params: IdInputDto) {
    return this.commentsQueryRepository.getByIdOrThrow(params.id);
  }
}
