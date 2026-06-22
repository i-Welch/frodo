/**
 * White-label data client selector.
 *
 * The journey imports `client` from here and never knows which implementation
 * it gets. Default is the in-browser MockClient, so the demo deploys to Vercel
 * and runs with no backend. Set NEXT_PUBLIC_WL_BACKEND=1 to route the journey
 * through the Elysia backend (/api/v1/wl/*) instead, where sandbox vs live and
 * mock vs real providers are decided server-side.
 */
import type { WhiteLabelClient } from './client';
import { mockClient } from './mock-client';
import { ApiClient } from './api-client';

export const client: WhiteLabelClient =
  process.env.NEXT_PUBLIC_WL_BACKEND === '1' ? new ApiClient() : mockClient;

export type { WhiteLabelClient } from './client';
export type { Intake, StartIntakeInput, SubmitResult, PullStep, VerifyApplicant, VerifyRequestData } from './client';
