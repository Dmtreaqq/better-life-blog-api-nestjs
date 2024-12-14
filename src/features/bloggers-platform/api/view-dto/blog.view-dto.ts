import { BlogDocument } from '../../domain/blog.entity';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;

  static mapToView(blog: BlogDocument): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.isMembership = blog.isMembership;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;

    return dto;
  }
}
