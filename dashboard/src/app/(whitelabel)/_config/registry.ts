import type { WhiteLabelConfig } from './types';
import { arthurStateBank } from './arthur-state-bank';
import { firstRelianceBank } from './first-reliance-bank';
import { colonyBankcorp } from './colony-bankcorp';
import { carolinaBankTrust } from './carolina-bank-trust';
import { coastalStatesBank } from './coastal-states-bank';
import { oconeeFederal } from './oconee-federal';
import { andersonBrothersBank } from './anderson-brothers-bank';
import { southernFirstBank } from './southern-first-bank';
import { southernBankTrust } from './southern-bank-trust';
import { southAtlanticBank } from './south-atlantic-bank';
import { conwayNationalBank } from './conway-national-bank';
import { bankOfTravelersRest } from './bank-of-travelers-rest';
import { securityFederalBank } from './security-federal-bank';
import { coastalCarolinaNationalBank } from './coastal-carolina-national-bank';
import { firstCapitalBankCharleston } from './first-capital-bank-charleston';
import { firstPalmettoBank } from './first-palmetto-bank';
import { beaconCommunityBank } from './beacon-community-bank';
import { queensboroughNationalBank } from './queensborough-national-bank';
import { firstCommunityBankSc } from './first-community-bank-sc';
import { countybank } from './countybank';
import { optusBank } from './optus-bank';
import { oconeStateBank } from './oconee-state-bank';
import { amerisBank } from './ameris-bank';
import { unitedBank } from './united-bank';

/** All white-label demo configs. Add a new bank by dropping a config here. */
export const WL_CONFIGS: WhiteLabelConfig[] = [
  southernBankTrust,
  arthurStateBank,
  firstRelianceBank,
  colonyBankcorp,
  carolinaBankTrust,
  coastalStatesBank,
  oconeeFederal,
  andersonBrothersBank,
  southernFirstBank,
  southAtlanticBank,
  conwayNationalBank,
  bankOfTravelersRest,
  securityFederalBank,
  coastalCarolinaNationalBank,
  firstCapitalBankCharleston,
  firstPalmettoBank,
  beaconCommunityBank,
  queensboroughNationalBank,
  firstCommunityBankSc,
  countybank,
  optusBank,
  oconeStateBank,
  amerisBank,
  unitedBank,
];

export function getWlConfig(slug: string): WhiteLabelConfig | undefined {
  return WL_CONFIGS.find((c) => c.slug === slug);
}
