/**
 * Base error class for all provider errors.
 * Carries structured context: provider name, HTTP status, retryability, and raw response.
 */
export class ProviderError extends Error {
  constructor(
    public provider: string,
    public statusCode: number | null,
    message: string,
    public retryable: boolean,
    public raw?: unknown,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ProviderAuthError extends ProviderError {
  constructor(provider: string, message: string, raw?: unknown) {
    super(provider, 401, message, false, raw);
    this.name = 'ProviderAuthError';
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(provider: string, message: string, raw?: unknown) {
    super(provider, 429, message, true, raw);
    this.name = 'ProviderRateLimitError';
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(provider: string, message: string) {
    super(provider, null, message, true);
    this.name = 'ProviderTimeoutError';
  }
}

export class ProviderUnavailableError extends ProviderError {
  constructor(provider: string, message: string, raw?: unknown) {
    super(provider, 503, message, true, raw);
    this.name = 'ProviderUnavailableError';
  }
}
