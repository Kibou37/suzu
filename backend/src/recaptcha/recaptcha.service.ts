import { BadRequestException, Injectable } from '@nestjs/common';

type RecaptchaVerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
  private readonly secretKey = process.env.RECAPTCHA_SECRET_KEY;
  private readonly minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5');

  isEnabled(): boolean {
    return Boolean(this.secretKey);
  }

  async verify(
    token: string | undefined,
    expectedAction: string,
  ): Promise<void> {
    if (!this.secretKey) {
      return;
    }

    if (!token?.trim()) {
      throw new BadRequestException('reCAPTCHA verification is required');
    }

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: this.secretKey,
          response: token,
        }),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('reCAPTCHA verification failed');
    }

    const data = (await response.json()) as RecaptchaVerifyResponse;

    if (!data.success) {
      throw new BadRequestException('reCAPTCHA verification failed');
    }

    if (data.action && data.action !== expectedAction) {
      throw new BadRequestException('reCAPTCHA action mismatch');
    }

    if (typeof data.score === 'number' && data.score < this.minScore) {
      throw new BadRequestException('reCAPTCHA score too low');
    }
  }
}
