import { ConfigModule } from '@nestjs/config';

export const configDynamicModule = ConfigModule.forRoot({
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    `.env.production`,
  ],
  isGlobal: true,
});
