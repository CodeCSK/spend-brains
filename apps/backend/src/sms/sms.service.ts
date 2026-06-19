import { Inject, Injectable } from '@nestjs/common';
import type { SmsProvider } from './sms-provider.interface';
import { SMS_PROVIDER } from './sms-provider.interface';

@Injectable()
export class SmsService {
  constructor(@Inject(SMS_PROVIDER) private readonly provider: SmsProvider) {}

  sendOtp(phone: string, otp: string): Promise<void> {
    return this.provider.sendOtp(phone, otp);
  }
}
