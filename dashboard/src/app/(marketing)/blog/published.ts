// Single source of truth for which blog articles are PUBLISHED (indexed in the
// sitemap, listed in llms.txt). An article whose slug is absent here can still
// render at its URL (draft/preview state) but is not surfaced anywhere.
//
// Blog article slugs — phased rollout to avoid content flood signals.
// To publish a phase: uncomment the slugs on/after the target date and deploy.
//
// Phase 1 LIVE (Jun 26): foundational institutional + 7 SEO articles (LinkedIn Jun 30–Jul 10)
// Phase 2 LIVE (Jul 7): bank deep dives (queensborough through first-community-bank)
// Phase 3 (Jul 14): uncomment first-capital through white-label + security-federal
// Phase 4 (Jul 16): uncomment digital-account-opening + open-banking
// Phase 5 (Jul 21): uncomment bank-travelers through south-atlantic
// Phase 6 (Jul 28): uncomment first-reliance-outgrew-florence through colony-bankcorp
// Phase 7 (Aug 4):  uncomment chime + southern-bank-nc
// Phase 8 (Aug 11): uncomment jack-henry + fiserv (core-specific SEO)

export const BLOG_SLUGS = [
  // — Institutional research (Jul 2026) —
  'southern-bank-spartanburg-side-door',
  'south-carolina-de-novo-drought',
  // — De Novo Watch (Jul 2026) —
  'portrait-bank-winter-park-de-novo',
  'glades-bank-broward-de-novo',
  // — Institutional research & macro (Feb–Mar 2026) —
  'first-party-fraud-community-banks',
  'account-opening-fraud-prevention',
  'suspect-fraud-cant-prove-it',
  'how-to-start-a-bank',
  'de-novo-bank-day-one-fraud-program',
  'one-in-116-mortgage-fraud',
  'one-link-complete-verification',
  'how-figure-closes-heloc-in-5-days',
  '59-billion-compliance-burden',
  'next-generation-borrowers-wont-wait',
  'community-banks-are-losing-the-lending-race',
  'why-it-takes-42-days-to-close-a-mortgage',
  // — SEO articles (May–Jun 2026, LinkedIn Jun 30–Jul 10) —
  'community-bank-compete-neobank-core',
  'community-banks-lose-loans-fintechs',
  'community-bank-ceo-digital-lending-2026',
  'community-bank-digital-lending-platform-guide',
  'community-bank-borrower-experience-roi',
  'what-neobanks-get-right-community-banks',
  'fintech-grade-loan-application-community-bank',
  // — Established articles (already had varied dates, May–Jun 2026) —
  'foreclosure-wave-hiding-in-plain-sight',
  'southern-first-bank-upstate-sc-bet',
  'income-verification-fintech-vs-bank',
  'anderson-brothers-bank-myrtle-beach-bet',
  'trillion-dollar-ipo-wave-2026',
  'arthur-state-bank-upstate-bet',
  'affirm-vs-community-bank-personal-loans',
  'oconee-federal-quiet-comeback',
  'coastal-states-bank-boat-bank',
  'rocket-mortgage-22-days-how',
  // — Phase 2 LIVE (Jul 7): bank deep dives, Mar–Apr 2026 dates —
  'queensborough-national-bank-trust-deep-dive',
  'first-palmetto-bank-sc-performance-deep-dive',
  'beacon-community-bank-charleston-growth-capacity',
  'optus-bank-cdfi-columbia-growth',
  'countybank-greenwood-sc-sba-deep-dive',
  'first-community-bank-sc-cre-merger-growth',
  // — Phase 3: add Jul 14 (+ promote community-bank-ai + white-label via LinkedIn) —
  // 'first-capital-bank-charleston-growth-digital-gap',
  // 'ccnb-myrtle-beach-merger-growth-2026',
  // 'security-federal-bank-cdfi-rate-rebound-aiken',
  // 'community-bank-ai-lending-guide',
  // 'white-label-borrower-portal-community-bank',
  // — Phase 4: add Jul 16 (promote digital-account + open-banking via LinkedIn posts 10–11) —
  // 'digital-account-opening-community-bank',
  // 'open-banking-community-bank-guide',
  // — Phase 5: add Jul 21 (remaining June bank deep dives) —
  // 'bank-travelers-rest-greenville-growth-engine',
  // 'conway-national-bank-grand-strand-dominance',
  // 'south-atlantic-bank-coastal-growth-engine',
  'first-reliance-sells-at-the-top',
  // — Phase 6: add Jul 28 —
  // 'first-reliance-outgrew-florence',
  // 'carolina-bank-between-two-economies',
  // 'colony-bankcorp-farm-to-fees',
  // — Phase 7: add Aug 4 —
  // 'chime-account-opening-deposit-war',
  // 'southern-bank-nc-digital-bet',
  // — Phase 8: add Aug 11 (core-specific SEO: Jack Henry + Fiserv, LinkedIn posts 12–13) —
  // 'jack-henry-symitar-loan-origination',
  // 'fiserv-premier-digital-lending',
  // — SEO drafts (Jul 18): review before publishing, then also add to articles-index.ts —
  // 'the-work-number-alternatives-community-banks',
  // 'best-digital-account-opening-software-community-banks',
];

// Real publish (or last substantive update) dates per article (ISO). Google
// distrusts sitemaps whose lastModified changes on every deploy, so these must
// reflect actual content dates. Extracted from publishedDate/updatedDate in
// blog/[slug]/page.tsx — keep in sync when adding or updating articles.
export const BLOG_DATES: Record<string, string> = {
  'southern-bank-spartanburg-side-door': '2026-07-22',
  'south-carolina-de-novo-drought': '2026-07-22',
  'portrait-bank-winter-park-de-novo': '2026-07-11',
  'glades-bank-broward-de-novo': '2026-07-11',
  'first-party-fraud-community-banks': '2026-07-10',
  'account-opening-fraud-prevention': '2026-07-10',
  'suspect-fraud-cant-prove-it': '2026-07-10',
  'how-to-start-a-bank': '2026-07-10',
  'de-novo-bank-day-one-fraud-program': '2026-07-10',
  'one-in-116-mortgage-fraud': '2026-07-04',
  'jack-henry-symitar-loan-origination': '2026-06-26',
  'fiserv-premier-digital-lending': '2026-06-26',
  'first-reliance-sells-at-the-top': '2026-06-21',
  'community-bank-ai-lending-guide': '2026-06-26',
  'white-label-borrower-portal-community-bank': '2026-06-26',
  'digital-account-opening-community-bank': '2026-06-26',
  'open-banking-community-bank-guide': '2026-06-26',
  'fintech-grade-loan-application-community-bank': '2026-06-16',
  'what-neobanks-get-right-community-banks': '2026-06-09',
  'community-bank-borrower-experience-roi': '2026-06-02',
  'community-bank-digital-lending-platform-guide': '2026-05-26',
  'community-bank-ceo-digital-lending-2026': '2026-05-19',
  'community-banks-lose-loans-fintechs': '2026-05-12',
  'community-bank-compete-neobank-core': '2026-05-05',
  'south-atlantic-bank-coastal-growth-engine': '2026-06-20',
  'conway-national-bank-grand-strand-dominance': '2026-06-13',
  'bank-travelers-rest-greenville-growth-engine': '2026-06-11',
  'security-federal-bank-cdfi-rate-rebound-aiken': '2026-05-21',
  'ccnb-myrtle-beach-merger-growth-2026': '2026-05-14',
  'first-capital-bank-charleston-growth-digital-gap': '2026-05-07',
  'first-community-bank-sc-cre-merger-growth': '2026-04-30',
  'countybank-greenwood-sc-sba-deep-dive': '2026-04-23',
  'optus-bank-cdfi-columbia-growth': '2026-04-16',
  'beacon-community-bank-charleston-growth-capacity': '2026-04-09',
  'first-palmetto-bank-sc-performance-deep-dive': '2026-04-02',
  'queensborough-national-bank-trust-deep-dive': '2026-03-26',
  'southern-bank-nc-digital-bet': '2026-06-25',
  'chime-account-opening-deposit-war': '2026-06-24',
  'first-reliance-outgrew-florence': '2026-06-22',
  'colony-bankcorp-farm-to-fees': '2026-06-17',
  'carolina-bank-between-two-economies': '2026-06-17',
  'rocket-mortgage-22-days-how': '2026-06-15',
  'coastal-states-bank-boat-bank': '2026-06-12',
  'oconee-federal-quiet-comeback': '2026-06-10',
  'arthur-state-bank-upstate-bet': '2026-06-06',
  'affirm-vs-community-bank-personal-loans': '2026-06-06',
  'trillion-dollar-ipo-wave-2026': '2026-06-04',
  'anderson-brothers-bank-myrtle-beach-bet': '2026-05-31',
  'income-verification-fintech-vs-bank': '2026-05-30',
  'southern-first-bank-upstate-sc-bet': '2026-05-24',
  'foreclosure-wave-hiding-in-plain-sight': '2026-05-24',
  'why-it-takes-42-days-to-close-a-mortgage': '2026-03-24',
  'community-banks-are-losing-the-lending-race': '2026-03-17',
  'next-generation-borrowers-wont-wait': '2026-03-10',
  '59-billion-compliance-burden': '2026-03-03',
  'how-figure-closes-heloc-in-5-days': '2026-02-24',
  'one-link-complete-verification': '2026-02-17',
  'the-work-number-alternatives-community-banks': '2026-07-18',
  'best-digital-account-opening-software-community-banks': '2026-07-18',
};
