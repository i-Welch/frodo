import type { WhiteLabelConfig } from './types';
import { arthurStateBank } from './arthur-state-bank';
import { firstRelianceBank } from './first-reliance-bank';
import { colonyBankcorp } from './colony-bankcorp';
import { carolinaBankTrust } from './carolina-bank-trust';
import { coastalStatesBank } from './coastal-states-bank';
import { oconeeFederal } from './oconee-federal';
import { andersonBrothersBank } from './anderson-brothers-bank';
import { southernFirstBank } from './southern-first-bank';

/** All white-label demo configs. Add a new bank by dropping a config here. */
export const WL_CONFIGS: WhiteLabelConfig[] = [
  arthurStateBank,
  firstRelianceBank,
  colonyBankcorp,
  carolinaBankTrust,
  coastalStatesBank,
  oconeeFederal,
  andersonBrothersBank,
  southernFirstBank,
];

export function getWlConfig(slug: string): WhiteLabelConfig | undefined {
  return WL_CONFIGS.find((c) => c.slug === slug);
}
