import { handlers } from '@/server/next-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } = handlers;
