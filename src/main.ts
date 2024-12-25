import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './settings/app.setup';
import { CommonConfig } from './common/common.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const commonConfig = app.get<CommonConfig>(CommonConfig);
  const port = commonConfig.port;

  appSetup(app, commonConfig);

  await app.listen(port ?? 3020);

  console.log('App started at ' + port + ' port');
}
bootstrap();
