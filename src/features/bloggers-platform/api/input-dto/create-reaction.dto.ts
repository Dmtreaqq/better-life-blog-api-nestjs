import { ReactionModelStatus, ReactionStatus } from '../enums/ReactionStatus';
import { ReactionRelationType } from '../enums/ReactionRelationType';

export class CreateReactionDto {
  userId: string;
  commentOrPostId: string;
  reactionStatus: ReactionModelStatus;
  reactionRelationType: ReactionRelationType;
}
