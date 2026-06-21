import type { WhiteLabelConfig } from './types';
import { arthurStateBank } from './arthur-state-bank';

/** All white-label demo configs. Add a new bank by dropping a config here. */
export const WL_CONFIGS: WhiteLabelConfig[] = [arthurStateBank];

export function getWlConfig(slug: string): WhiteLabelConfig | undefined {
  return WL_CONFIGS.find((c) => c.slug === slug);
}
