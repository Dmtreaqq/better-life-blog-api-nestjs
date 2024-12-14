import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { BlogModelType } from '../bloggers-platform/domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel('Blog')
    private BlogModel: BlogModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAll() {
    this.BlogModel.deleteMany();
  }
}
