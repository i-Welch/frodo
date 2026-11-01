// FDIC certificate numbers for tracked banks that have one (chartered, open, or
// charter moves), keyed by the row's `name`. They link each row to the bank's
// peer snapshot. Kept apart from de-novo-data.ts so the weekly update can
// rewrite rows without touching this. Verify against FDIC BankFind.
export const FDIC_CERTS: Record<string, number> = {
  'Portrait Bank': 59381,
  'Echelon Bank': 59377,
  BankMiami: 59354,
  'Southern Bank': 16288,
  'First City Bank': 16281,
};
