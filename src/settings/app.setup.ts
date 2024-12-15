import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { exceptionsFilterSetup } from './exceptions-filter.setup';

export function appSetup(app: INestApplication) {
  exceptionsFilterSetup(app);
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
}
