// How each product type's criteria combine into the overall score. Kept in the
// repo but never shown on pages or quoted in articles (Isaac's call,
// 2026-11-26): pages describe what each criterion measures, not its weight.
// Each product's weights must sum to 1 (tested).

export const WEIGHTS: Record<string, Record<string, number>> = {
  savings: {
    rate: 0.35,
    fees: 0.2,
    movement: 0.2,
    access: 0.15,
    protections: 0.1,
  },
};

/** Savings: the APY that earns a full 10 on rate. Revisit when top no-strings rates move a lot. */
export const SAVINGS_RATE_TOP = 4.0;
