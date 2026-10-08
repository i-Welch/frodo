// ---------------------------------------------------------------------------
// OTP delivery abstraction
// ---------------------------------------------------------------------------

export interface OtpProvider {
  sendOtp(channel: 'email' | 'phone', destination: string, code: string): Promise<void>;
}

/**
 * Console-based OTP provider for development/testing.
 * Logs the OTP code to the console instead of sending it.
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

/**
 * Initialize the OTP provider based on environment.
 * Call this at startup after env vars are loaded.
 *
 * Uses Resend (email) + Telnyx (SMS) in production/staging, console in development/test.
 */
export async function initOtpProvider(): Promise<void> {
  const env: string = process.env.NODE_ENV ?? 'development';
  if (env === 'production' || env === 'staging') {
    const { MessagingOtpProvider } = await import('./messaging-otp-provider');
    provider = new MessagingOtpProvider();
  }
  // Otherwise, keep the ConsoleOtpProvider default
}
