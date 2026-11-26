import { SAVINGS } from './savings';
import { STATE_LABELS, SCORECARD_STATES, type ProductType, type StateCode } from './types';

// Every live product scorecard. /scorecard-update adds a product type by adding
// its data file and definition (see savings.ts) and listing it here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PRODUCT_TYPES: ProductType<any>[] = [SAVINGS];

/** Product types planned next, shown on the index so readers know what is coming. */
export const COMING_NEXT = ['Checking accounts', 'HELOCs', 'CDs', 'Money market accounts', 'Personal loans', 'Auto loans'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function productType(slug: string): ProductType<any> | undefined {
  return PRODUCT_TYPES.find((p) => p.slug === slug);
}

export function stateFromScorecardSlug(slug: string): StateCode | undefined {
  return SCORECARD_STATES.find((s) => STATE_LABELS[s].slug === slug);
}

export const SITE = 'https://reportraven.tech';
export const scorecardPath = (product: string, state?: StateCode) =>
  `/scorecards/${product}${state ? `/${STATE_LABELS[state].slug}` : ''}`;
