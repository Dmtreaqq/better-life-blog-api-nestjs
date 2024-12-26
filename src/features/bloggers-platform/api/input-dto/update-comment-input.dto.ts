import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';

export class UpdateCommentInputDto {
  @MaxLength(300)
  @MinLength(20)
  @IsNotEmpty()
  @Trim()
  @IsString()
  content: string;
}
