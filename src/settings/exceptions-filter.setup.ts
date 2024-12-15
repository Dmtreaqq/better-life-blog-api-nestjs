import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import * as process from 'node:process';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV !== 'production') {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: (exception as any).message || 'Internal server error',
      });
    } else {
      response.status(status).json({
        message: 'Some server error occured',
      });
    }
  }
}

@Catch(HttpException)
class CustomHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus();

    if (status === 500 && process.env.NODE_ENV !== 'production') {
      response.status(status).json(exception);
    }

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((errMsg) => {
        errorResponse.errorsMessages.push(errMsg);
      });

      response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
    } else {
      response.status(status).json(exception.getResponse());
    }
  }
}

export function exceptionsFilterSetup(app: INestApplication) {
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new CustomHttpExceptionsFilter(),
  );
}
