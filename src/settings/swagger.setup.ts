import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommonConfig } from '../common/common.config';

export function swaggerSetup(
  app: INestApplication,
  commonConfig: CommonConfig,
) {
  if (commonConfig.isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Better Life Blog API')
      .addBearerAuth()
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('swagger', app, documentFactory, {
      customSiteTitle: 'Better Life Swagger',
    });
  }
}
