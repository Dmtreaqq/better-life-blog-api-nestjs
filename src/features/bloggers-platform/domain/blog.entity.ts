import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogInput } from '../api/input-dto/create-blog.dto';

const urlRegex = new RegExp(
  '^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$',
);

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, maxlength: 15, required: true, unique: true })
  name: string;

  @Prop({ type: String, maxlength: 500, required: true })
  description: string;

  @Prop({ type: String, maxlength: 100, match: urlRegex, required: true })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true })
  isMembership: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  static createInstance(dto: CreateBlogInput): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;
