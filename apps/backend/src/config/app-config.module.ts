import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { envValidationSchema } from './env.validation';

const appEnv = process.env.APP_ENV ?? 'local';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // First match wins — mode file overrides shared .env
      envFilePath: [`.env.${appEnv}`, '.env'],
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
})
export class AppConfigModule {}
