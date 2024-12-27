import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateReactionDto } from '../api/input-dto/create-reaction.dto';
import { ReactionModelStatus } from '../api/enums/ReactionStatus';
import { ReactionRelationType } from '../api/enums/ReactionRelationType';

@Schema({ timestamps: true })
export class Reaction {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  commentOrPostId: string;

  @Prop({ type: String, enum: ReactionModelStatus, required: true })
  reactionStatus: ReactionModelStatus;

  @Prop({ type: String, enum: ReactionRelationType, required: true })
  reactionRelationType: ReactionRelationType;

  @Prop({ type: Date })
  createdAt: Date;

  static createInstance(dto: CreateReactionDto): ReactionDocument {
    const like = new this();

    like.userId = dto.userId;
    like.commentOrPostId = dto.commentOrPostId;
    like.reactionStatus = dto.reactionStatus;
    like.reactionRelationType = dto.reactionRelationType;

    return like as ReactionDocument;
  }
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
ReactionSchema.loadClass(Reaction);

export type ReactionDocument = HydratedDocument<Reaction>;

export type ReactionModelType = Model<ReactionDocument> & typeof Reaction;
