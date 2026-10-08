import { app } from './app';

/**
 * Adapter for Next.js route handlers: forwards the request to the Elysia app.
 * Each catch-all route file re-exports these.
 */
const handler = (request: Request): Promise<Response> => Promise.resolve(app.fetch(request));

export const handlers = {
  GET: handler,
  POST: handler,
  PUT: handler,
  PATCH: handler,
  DELETE: handler,
  OPTIONS: handler,
  HEAD: handler,
};
