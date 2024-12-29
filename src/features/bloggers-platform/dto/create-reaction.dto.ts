import { ReactionStatus } from '../api/enums/ReactionStatus';
import { ReactionRelationType } from '../api/enums/ReactionRelationType';

export class CreateReactionDto {
  login?: string;
  userId: string;
  commentOrPostId: string;
  reactionStatus: ReactionStatus;
  reactionRelationType: ReactionRelationType;
}
