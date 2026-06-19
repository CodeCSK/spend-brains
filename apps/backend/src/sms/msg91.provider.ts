import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Msg91Config, RootConfig } from '../config';
import type { SmsProvider } from './sms-provider.interface';

const MSG91_OTP_URL = 'https://control.msg91.com/api/v5/otp';

@Injectable()
export class Msg91Provider implements SmsProvider {
  private readonly logger = new Logger(Msg91Provider.name);
  private readonly config: Msg91Config;

  constructor(configService: ConfigService<RootConfig, true>) {
    this.config = configService.get('msg91', { infer: true });
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    if (this.isDevBypass()) {
      this.logger.log(`[dev] OTP for ${phone}: ${otp}`);
      return;
    }

    const mobile = phone.replace('+', '');
    const response = await fetch(MSG91_OTP_URL, {
      method: 'POST',
      headers: {
        authkey: this.config.authKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        template_id: this.config.otpTemplateId,
        mobile,
        otp,
        otp_length: 6,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`MSG91 OTP failed (${response.status}): ${body}`);
      throw new Error('Failed to send OTP via MSG91');
    }
  }

  private isDevBypass(): boolean {
    const key = this.config.authKey;
    return (
      key === 'your-msg91-auth-key' ||
      key.startsWith('test-') ||
      key === 'test-msg91-auth-key'
    );
  }
}
