import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RootConfig, TurnstileConfig } from '../config';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly config: TurnstileConfig;

  constructor(configService: ConfigService<RootConfig, true>) {
    this.config = configService.get('turnstile', { infer: true });
  }

  async verify(token: string | undefined): Promise<void> {
    if (!this.isRequired()) {
      return;
    }

    if (!token) {
      throw new BadRequestException('captchaToken is required for web clients');
    }

    if (!this.config.secretKey) {
      this.logger.warn(
        'Turnstile enabled but TURNSTILE_SECRET_KEY is missing — skipping verification',
      );
      return;
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: this.config.secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      this.logger.error(`Turnstile verify HTTP error: ${response.status}`);
      throw new BadRequestException('CAPTCHA verification failed');
    }

    const result = (await response.json()) as { success?: boolean };
    if (!result.success) {
      throw new BadRequestException('CAPTCHA verification failed');
    }
  }

  isRequired(): boolean {
    return this.config.enabled;
  }
}
