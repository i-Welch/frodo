// ---------------------------------------------------------------------------
// OTP delivery abstraction
// ---------------------------------------------------------------------------

export interface OtpProvider {
  sendOtp(channel: 'email' | 'phone', destination: string, code: string): Promise<void>;
}

/**
 * Console-based OTP provider for development.
 * In production, replace with an SES/SNS/Twilio implementation.
 */
export class ConsoleOtpProvider implements OtpProvider {
  async sendOtp(channel: 'email' | 'phone', destination: string, code: string): Promise<void> {
    console.log(`[OTP] Sending ${code} to ${destination} via ${channel}`);
  }
}

let provider: OtpProvider = new ConsoleOtpProvider();

export function setOtpProvider(p: OtpProvider): void {
  provider = p;
}

export function getOtpProvider(): OtpProvider {
  return provider;
}
