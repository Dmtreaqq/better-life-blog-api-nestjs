import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './settings/app.setup';
import { CommonConfig } from './common/common.config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const commonConfig = appContext.get<CommonConfig>(CommonConfig);
  await appContext.close();
  const dynamicAppModule = await AppModule.forRoot(commonConfig);

  const app = await NestFactory.create(dynamicAppModule);

  const port = commonConfig.port;
  await appSetup(app, commonConfig);

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(port ?? 3020);

  console.log('App started at ' + port + ' port');
}
bootstrap();
