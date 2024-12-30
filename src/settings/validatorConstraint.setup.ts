import { INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';

export const validatorConstraintSetup = (app: INestApplication) => {
  useContainer(app, {
    fallbackOnErrors: true,
  });
};
