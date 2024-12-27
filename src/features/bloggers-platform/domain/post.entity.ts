import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { Reaction, ReactionSchema } from './reaction.entity';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, maxlength: 30, required: true })
  title: string;

  @Prop({ type: String, maxlength: 100, required: true })
  shortDescription: string;

  @Prop({ type: String, maxlength: 1000, required: true })
  content: string;

  @Prop({ type: String, maxlength: 15, required: true })
  blogName: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop([ReactionSchema])
  reactions: Reaction[];

  static createInstance(dto: CreatePostDto): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocumentOverride = {
  reactions: Types.DocumentArray<Reaction>;
};

export type PostDocument = HydratedDocument<Post, PostDocumentOverride>;

export type PostModelType = Model<PostDocument> & typeof Post;
