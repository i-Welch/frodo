import { getAuth } from '@/lib/auth/server';

type Handlers = ReturnType<ReturnType<typeof getAuth>['handler']>;
type RouteContext = Parameters<Handlers['GET']>[1];

export const GET = (request: Request, ctx: RouteContext) => getAuth().handler().GET(request, ctx);
export const POST = (request: Request, ctx: RouteContext) => getAuth().handler().POST(request, ctx);
