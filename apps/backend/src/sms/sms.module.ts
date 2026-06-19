import { Module } from '@nestjs/common';
import { Msg91Provider } from './msg91.provider';
import { SMS_PROVIDER } from './sms-provider.interface';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  controllers: [SmsController],
  providers: [
    {
      provide: SMS_PROVIDER,
      useClass: Msg91Provider,
    },
    SmsService,
  ],
  exports: [SmsService],
})
export class SmsModule {}
