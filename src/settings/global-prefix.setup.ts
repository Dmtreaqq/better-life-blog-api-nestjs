import { INestApplication } from '@nestjs/common';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX || 'api');
}
