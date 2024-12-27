import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../common/decorators/custom-trim.decorator';
import { ReactionStatus } from '../enums/ReactionStatus';

export class CreateUpdateReactionInput {
  @IsEnum(ReactionStatus)
  @IsNotEmpty()
  @Trim()
  @IsString()
  likeStatus: ReactionStatus;
}
