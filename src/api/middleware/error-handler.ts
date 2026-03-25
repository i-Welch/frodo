import { Elysia } from 'elysia';
import { logger } from '../../logger.js';
import type { ApiError } from '../../types.js';

// ---------------------------------------------------------------------------
// Custom error classes
// ---------------------------------------------------------------------------

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(msg = 'Not found') {
    super(404, 'not_found', msg);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(msg: string) {
    super(422, 'validation_error', msg);
    this.name = 'ValidationError';
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') {
    super(403, 'forbidden', msg);
    this.name = 'ForbiddenError';
  }
}

// ---------------------------------------------------------------------------
// Global error handler plugin
// ---------------------------------------------------------------------------

/**
 * Global Elysia error handler that catches all errors and formats them
 * as structured ApiError JSON responses.
 *
 * Mount this on the top-level Elysia instance. It handles:
 * - AppError subclasses (NotFoundError, ValidationError, ForbiddenError)
 * - AuthError from api-key-auth middleware
 * - Generic/unknown errors → 500
 */
export const errorHandler = new Elysia({ name: 'error-handler' })
  .onError({ as: 'global' }, ({ error, set, ...ctx }) => {
    // Try to get the request logger from context (set by request-id middleware)
    const log = (ctx as Record<string, unknown>).log as
      | typeof logger
      | undefined;
    const reqLogger = log ?? logger;

    // AuthError (from api-key-auth.ts) — has an `apiError` property
    if (error && typeof error === 'object' && 'apiError' in error) {
      const apiError = (error as { apiError: ApiError }).apiError;
      set.status = apiError.status;
      reqLogger.warn(
        { err: error, status: apiError.status, code: apiError.code },
        apiError.message,
      );
      return apiError;
    }

    // AppError subclasses
    if (error instanceof AppError) {
      set.status = error.status;
      const response: ApiError = {
        status: error.status,
        code: error.code,
        message: error.message,
      };
      if (error.status >= 500) {
        reqLogger.error({ err: error, status: error.status, code: error.code }, error.message);
      } else {
        reqLogger.warn({ status: error.status, code: error.code }, error.message);
      }
      return response;
    }

    // Unknown / generic errors → 500
    reqLogger.error({ err: error }, 'Unhandled error');
    set.status = 500;
    const response: ApiError = {
      status: 500,
      code: 'internal_error',
      message: 'Internal server error',
    };
    return response;
  });
