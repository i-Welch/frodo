import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino/file',
          options: { destination: 1 },
        },
      }
    : {}),
});

export interface LogContext {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  module?: string;
  source?: string;
}

export function createChildLogger(context: LogContext) {
  return logger.child(context);
}
