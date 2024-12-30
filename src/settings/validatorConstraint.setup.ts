import { INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
import { CommonConfig } from '../common/common.config';

export const validatorConstraintSetup = async (
  app: INestApplication,
  commonConfig: CommonConfig,
) => {
  const appContext = app.select(await AppModule.forRoot(commonConfig));
  useContainer(appContext, {
    fallbackOnErrors: true,
  });
};
