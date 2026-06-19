import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { envValidationSchema } from './env.validation';

const isStaging = process.env.APP_ENV === 'staging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Local: .env | Staging DB locally: .env.staging then .env fallback
      envFilePath: isStaging ? ['.env.staging', '.env'] : '.env',
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
})
export class AppConfigModule {}
