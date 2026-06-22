/**
 * White-label borrower experience — backend types.
 *
 * This is the server-side home for the config, flow, rate, and intake shapes
 * that the front-end demo currently models in
 * dashboard/src/app/(whitelabel)/_config. The Elysia API is the source of
 * truth; the Next journey becomes a thin client over /api/v1/wl/* (see
 * docs/whitelabel-platform-design.md).
 */

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export type ProductType =
  | 'heloc'
  | 'home-equity'
  | 'mortgage'
  | 'personal'
  | 'auto'
  | 'business'
  | 'deposit';

export type FlowKind = 'data_only' | 'rate_range' | 'full_application';

export interface WLBranding {
  name: string;
  shortName: string;
  wordmark: string;
  tagline?: string;
  primary: string;
  primaryDark: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  font: string;
  googleFont?: string;
  radius: string;
}

export interface WLProduct {
  id: string;
  type: ProductType;
  label: string;
  blurb: string;
  iconPath: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  purposes: string[];
  rateTeaser?: string;
  disclosure?: string;
  allowedFlows?: FlowKind[];
  webDefaultFlow?: FlowKind;
}

export interface ProviderStep {
  module: ModuleName;
  provider: ProviderName;
  label: string;
  interactive?: boolean;
}

export type ModuleName =
  | 'identity'
  | 'contact'
  | 'residence'
  | 'employment'
  | 'financial'
  | 'credit';

export type ProviderName =
  | 'Plaid'
  | 'Socure'
  | 'Truework'
  | 'FullContact'
  | 'Melissa'
  | 'Experian'
  | 'TransUnion';

export interface RateTermOption {
  termMonths: number;
  apr: number;
}

export interface RateTier {
  label: string;
  minScore: number;
  maxLtv?: number;
  terms: RateTermOption[];
}

export interface RateCard {
  tiers: RateTier[];
  fallbackTerms: RateTermOption[];
  defaultTermMonths?: number;
}

export type CoreSystem = 'fis' | 'fiserv' | 'jackhenry' | 'none';

export interface CoreSyncConfig {
  system: CoreSystem;
  displayName: string;
  mode: 'mock' | 'live';
}

export interface WhiteLabelConfig {
  slug: string;
  branding: WLBranding;
  products: WLProduct[];
  defaultFlows?: FlowKind[];
  purposes: { value: string; label: string }[];
  providerRouting: Record<string, ProviderStep[]>;
  rateCard: Record<string, RateCard>;
  coreSync: CoreSyncConfig;
  loTeam: { name: string; title: string; nmls?: string };
}

/** The browser-safe subset of the config (no rate grid, routing, or core internals). */
export interface PublicWhiteLabelConfig {
  slug: string;
  branding: WLBranding;
  products: Omit<WLProduct, never>[];
  defaultFlows: FlowKind[];
  purposes: { value: string; label: string }[];
  coreSyncDisplayName: string;
  loTeam: { name: string; title: string; nmls?: string };
}

/* ------------------------------------------------------------------ */
/* Rate estimate                                                       */
/* ------------------------------------------------------------------ */

export interface RateEstimateOption {
  termMonths: number;
  apr: number;
  monthlyPayment: number;
}

export interface RateEstimate {
  tierLabel: string;
  fallback: boolean;
  options: RateEstimateOption[];
  selectedTermMonths: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
}

/* ------------------------------------------------------------------ */
/* Flows                                                               */
/* ------------------------------------------------------------------ */

export type Stage =
  | 'frontDoor'
  | 'product'
  | 'modulePicker'
  | 'applicant'
  | 'consent'
  | 'dataPull'
  | 'rate'
  | 'decision'
  | 'confirmation';

export type CreditPull = 'none' | 'soft' | 'hard';
export type Terminal = 'routeToLo' | 'rateRange' | 'decision';

export interface FlowDefinition {
  kind: FlowKind;
  label: string;
  path: string;
  stages: Stage[];
  creditPull: CreditPull;
  terminal: Terminal;
  isLegalApplication: boolean;
  consentTemplate: string;
}

/* ------------------------------------------------------------------ */
/* Mock enrichment profile                                             */
/* ------------------------------------------------------------------ */

export interface MockProfile {
  identity: { fullName: string; dobMasked: string; ssnLast4: string; verified: true; kycDecision: 'pass'; fraudScore: number };
  contact: { email: string; phone: string; phoneVerified: true };
  residence: { address: string; ownership: 'own' | 'rent'; propertyType: string; estimatedValue: number; mortgageBalance: number; moveInYear: number };
  employment: { employer: string; title: string; verified: true; annualIncome: number; tenureYears: number };
  financial: { institution: string; checkingBalance: number; savingsBalance: number; monthlyIncome: number; monthlyDebt: number };
  credit: { score: number; bureau: 'Experian'; openTradelines: number; derogatories: number };
}

/* ------------------------------------------------------------------ */
/* Intake (the single entity, decision B)                              */
/* ------------------------------------------------------------------ */

export type IntakeStatus =
  | 'started'
  | 'data_ready'
  | 'rate_ready'
  | 'submitted'
  | 'under_review'
  | 'routed';

export interface PullStep {
  module: ModuleName;
  provider: ProviderName;
  label: string;
  interactive?: boolean;
}

export interface Intake {
  intakeId: string;
  /** Friendly application id for loan flows (e.g. APP-482193); absent for data_only. */
  applicationId?: string;
  slug: string;
  flow: FlowKind;
  mode: 'demo' | 'live';
  status: IntakeStatus;
  steps: PullStep[];
  profile: MockProfile;
  applicant: { fullName: string; email: string; phone?: string };
  product?: WLProduct;
  amount?: number;
  purpose?: string;
  estimate?: RateEstimate | null;
  ltv?: number | null;
  dti?: number | null;
  isLegalApplication: boolean;
  createdAt: string;
}

export type SubmitResult =
  | { terminal: 'routeToLo' }
  | { terminal: 'rateRange'; estimate: RateEstimate }
  | { terminal: 'decision'; status: 'under_review' };
