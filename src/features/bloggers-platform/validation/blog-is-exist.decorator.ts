import { Injectable } from '@nestjs/common';
import {
  isMongoId,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../repositories/blogs.repository';

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // validate(value: any, args: ValidationArguments) {
  //   return this.blogsRepository.blogIsExist(value);
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args?: ValidationArguments) {
    if (!isMongoId(value)) {
      return false;
    }
    const blog = await this.blogsRepository.blogIsExist(value);

    return blog;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog ${validationArguments?.value} not exist`;
  }
}

export function BlogIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    });
  };
}
