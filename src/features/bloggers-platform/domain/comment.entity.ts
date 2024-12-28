import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Reaction, ReactionSchema } from './reaction.entity';

const loginRegex = new RegExp('^[a-zA-Z0-9_-]*$');

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  commentatorId: string;

  @Prop({
    type: String,
    match: loginRegex,
    minlength: 3,
    maxlength: 10,
    required: true,
  })
  commentatorLogin: string;

  @Prop({ type: String, minlength: 20, maxlength: 300, required: true })
  content: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop([ReactionSchema])
  reactions: Reaction[];

  static createInstance(dto: CreateCommentDto): CommentDocument {
    const comment = new this();

    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.commentatorId = dto.userId;

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocumentOverride = {
  reactions: Types.DocumentArray<Reaction>;
};

export type CommentDocument = HydratedDocument<
  Comment,
  CommentDocumentOverride
>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
