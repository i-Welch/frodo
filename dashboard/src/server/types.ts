export interface Duration {
  days?: number;
  hours?: number;
  minutes?: number;
}

export enum VerificationTier {
  None = 0,
  BasicOTP = 1,
  EnhancedOTP = 2,
  Identity = 3,
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

/**
 * Converts a Duration to milliseconds.
 * Returns 0 if all fields are undefined or zero.
 */
export function durationToMs(d: Duration): number {
  const days = d.days ?? 0;
  const hours = d.hours ?? 0;
  const minutes = d.minutes ?? 0;
  return days * 86_400_000 + hours * 3_600_000 + minutes * 60_000;
}
