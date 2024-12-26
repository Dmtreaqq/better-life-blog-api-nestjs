import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { exceptionsFilterSetup } from './exceptions-filter.setup';
import { CommonConfig } from '../common/common.config';
import { cookieParserSetup } from './cookie-parser.setup';

export function appSetup(app: INestApplication, commonConfig: CommonConfig) {
  exceptionsFilterSetup(app, commonConfig);
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, commonConfig);
  cookieParserSetup(app);
}
