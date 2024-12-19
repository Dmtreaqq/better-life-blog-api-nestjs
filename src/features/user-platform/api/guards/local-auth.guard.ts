import { BadRequestException, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginUserDto } from '../input-dto/login-user.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // transform the request object to class instance
    const body = plainToClass(LoginUserDto, request.body);

    // get a list of errors
    const errors = await validate(body);

    // extract error messages from the errors array
    const errorsForResponse = [];
    errors.forEach((error) => {
      errorsForResponse.push({
        field: error.property,
        message: error.constraints[Object.keys(error.constraints)[0]],
      });
    });

    if (errorsForResponse.length > 0) {
      throw new BadRequestException(errorsForResponse);
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
