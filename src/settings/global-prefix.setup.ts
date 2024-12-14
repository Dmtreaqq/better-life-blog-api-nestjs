import { INestApplication } from '@nestjs/common';

export const API_PREFIX = '/api';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix('api');
}
