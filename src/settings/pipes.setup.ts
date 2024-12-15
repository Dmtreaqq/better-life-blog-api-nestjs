import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];
        errors.forEach((error) => {
          errorsForResponse.push({
            field: error.property,
            message: error.constraints[Object.keys(error.constraints)[0]],
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
}
