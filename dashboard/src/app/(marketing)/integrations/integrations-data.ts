export interface IntegrationSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Integration {
  slug: string;
  name: string;
  category: 'verification' | 'core' | 'los';
  /** Short blurb shown on the index card */
  description: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  intro: string[];
  sections: IntegrationSection[];
  faqs: { q: string; a: string }[];
}

export interface IntegrationCategory {
  key: 'verification' | 'core' | 'los';
  label: string;
  blurb: string;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    key: 'verification',
    label: 'Verification & Data Providers',
    blurb: 'These sources power every RAVEN verification report.',
  },
  {
    key: 'core',
    label: 'Core Banking Systems',
    blurb:
      'RAVEN works alongside any core with no integration required. Verified data arrives as structured JSON and an examiner-ready PDF, and your team books it exactly as they do now.',
  },
  {
    key: 'los',
    label: 'Loan Origination Systems',
    blurb:
      'Verified files fit any LOS pipeline: structured data plus an examiner-ready PDF, reviewed before the application enters your workflow.',
  },
];

export const INTEGRATIONS: Integration[] = [
  // ————————————————————————————————————————————————————
  // Verification & Data Providers
  // ————————————————————————————————————————————————————
  {
    slug: 'plaid',
    name: 'Plaid',
    category: 'verification',
    description: 'Bank account and transaction data for asset, income, and buying-pattern verification.',
    h1: 'RAVEN + Plaid: Bank Data Verification',
    metaTitle: 'Plaid Integration for Bank Verification',
    metaDescription:
      'RAVEN uses Plaid to verify bank balances, transaction history, and spending patterns as part of borrower verification for community banks.',
    eyebrow: 'Live Integration',
    intro: [
      'RAVEN embeds Plaid Link directly in the borrower verification flow. Once a borrower consents and connects an account, RAVEN pulls balances, transaction history, and account ownership straight from the bank, no statements uploaded, no numbers retyped.',
      'That connection feeds five modules in a single pull: financial (balances and cash flow), buying-patterns (recurring spend and merchant categories), credit liabilities (existing debt obligations visible in transaction history), identity cross-checks, and residence signals from recurring rent or mortgage payments.',
    ],
    sections: [
      {
        heading: 'What Plaid verifies inside RAVEN',
        paragraphs: [],
        bullets: [
          'Account balances and ownership, confirmed at the source',
          'Transaction history for income and cash-flow analysis',
          'Recurring debt payments for liability verification',
          'Spending-pattern signals for underwriting context',
        ],
      },
      {
        heading: 'Why this replaces bank statements',
        paragraphs: [
          'Uploaded PDF statements can be edited with the same tools that produce them. A live Plaid connection reads the account directly from the institution, so the balance a bank sees is the balance that exists, not a document someone formatted to look right.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the Plaid integration live today?',
        a: 'Yes. Plaid is one of RAVEN’s five active providers and runs in every production verification that includes bank data.',
      },
      {
        q: 'What happens if a borrower’s bank isn’t supported by Plaid?',
        a: 'The flow falls back to manual statement upload for that borrower, inside the same audit trail, so an unsupported institution never blocks the application.',
      },
      {
        q: 'Does RAVEN store bank credentials?',
        a: 'No. Plaid Link handles authentication directly with the bank; RAVEN never sees or stores login credentials.',
      },
    ],
  },
  {
    slug: 'socure',
    name: 'Socure',
    category: 'verification',
    description: 'Identity verification, KYC risk scoring, fraud signals, and watchlist screening.',
    h1: 'RAVEN + Socure: Identity Verification and Fraud Screening',
    metaTitle: 'Socure Integration for Identity Verification',
    metaDescription:
      'RAVEN uses Socure RiskOS for KYC identity verification, fraud and watchlist screening, and synthetic identity detection in every borrower flow.',
    eyebrow: 'Live Integration',
    intro: [
      'RAVEN runs Socure’s RiskOS platform for every identity verification: KYC checks, fraud scoring, watchlist screening, and the risk signals that catch synthetic identities before an account or loan gets booked.',
      'The borrower experience includes a Socure-verify step with an OTP challenge and an “is this you?” confirmation, with a manual fallback path for edge cases so no legitimate applicant gets stuck.',
    ],
    sections: [
      {
        heading: 'What Socure verifies inside RAVEN',
        paragraphs: [],
        bullets: [
          'CIP-grade identity verification against authoritative sources',
          'OFAC and watchlist screening',
          'Fraud and synthetic-identity risk scoring',
          'SSN issuance and consistency checks',
        ],
      },
      {
        heading: 'Why identity comes first',
        paragraphs: [
          'Every other module in RAVEN, income, employment, assets, depends on knowing the applicant is who they claim to be. Running Socure at the front of the flow means downstream verifications are attached to a confirmed identity, not a name typed into a form.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the Socure integration live today?',
        a: 'Yes. Socure RiskOS is active in production and runs identity verification for every RAVEN applicant.',
      },
      {
        q: 'What happens if identity verification fails?',
        a: 'Hard failures can be configured to decline automatically; soft mismatches route to your staff for manual review with the full evidence attached.',
      },
      {
        q: 'Does this satisfy CIP requirements?',
        a: 'Socure’s documentary and non-documentary checks map to CIP’s verification and recordkeeping requirements. Your BSA officer defines the program; RAVEN executes and documents the verification steps.',
      },
    ],
  },
  {
    slug: 'truework',
    name: 'Truework',
    category: 'verification',
    description: 'Employment verification direct from payroll systems of record.',
    h1: 'RAVEN + Truework: Instant Employment Verification',
    metaTitle: 'Truework Integration for Employment Verification',
    metaDescription:
      'RAVEN uses Truework to verify employment, tenure, and income directly from payroll systems of record, replacing the verbal VOE phone call.',
    eyebrow: 'Live Integration',
    intro: [
      'RAVEN connects to Truework for asynchronous employment verification pulled from payroll systems of record, replacing the phone call to an employer number that most banks still make before every closing.',
      'A webhook handler validates each response and an enricher attaches identity data to the request, so employment results land back in the borrower’s file automatically once the payroll provider responds.',
    ],
    sections: [
      {
        heading: 'What Truework verifies inside RAVEN',
        paragraphs: [],
        bullets: [
          'Employer name, role, and hire date',
          'Pay frequency and current income',
          'Employment status (active, terminated, on leave)',
        ],
      },
      {
        heading: 'Why this closes the fictitious-employer gap',
        paragraphs: [
          'Verbal VOE assumes the phone number on the application proves the employer is real. Fraud rings that print fake paystubs often staff that same callback line. Payroll-sourced verification never places the call; the employer’s existence is established by its commercial relationship with the payroll provider.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the Truework integration live today?',
        a: 'Yes. Truework is active in production and handles employment verification for RAVEN applicants whose employer reports to a supported payroll system.',
      },
      {
        q: 'How long does verification take?',
        a: 'It runs asynchronously; most responses return within minutes, though coverage and speed depend on whether the employer’s payroll provider is in Truework’s network.',
      },
      {
        q: 'What if the employer isn’t covered?',
        a: 'The flow falls back to document collection and manual verification inside the same audit trail, so gaps in payroll coverage don’t become a separate process.',
      },
    ],
  },
  {
    slug: 'melissa',
    name: 'Melissa',
    category: 'verification',
    description: 'Address verification, property and ownership data, and identity cross-checks.',
    h1: 'RAVEN + Melissa: Address and Property Verification',
    metaTitle: 'Melissa Integration for Address Verification',
    metaDescription:
      'RAVEN uses Melissa Personator to verify residence, property ownership, and identity details, with property data linked from the same address record.',
    eyebrow: 'Live Integration',
    intro: [
      'RAVEN uses Melissa’s Personator Consumer API to verify residence: confirming the address is real, checking ownership status and property type, and cross-writing name, date of birth, phone, and email into the identity and contact modules where they corroborate.',
      'Every Personator lookup captures an AddressKey, the identifier Melissa uses to link an address to its underlying property records.',
    ],
    sections: [
      {
        heading: 'What Melissa verifies inside RAVEN',
        paragraphs: [],
        bullets: [
          'Address existence and deliverability',
          'Ownership status, property type, and estimated move-in date',
          'Cross-checks against applicant-supplied name, date of birth, phone, and email',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the Melissa integration live today?',
        a: 'Yes. Melissa Personator is active in production for residence verification.',
      },
      {
        q: 'What does the address verification return?',
        a: 'Address existence and deliverability, ownership status, property type, and identity cross-checks against the applicant’s stated details, all keyed to the verified address record.',
      },
    ],
  },
  {
    slug: 'fullcontact',
    name: 'FullContact',
    category: 'verification',
    description: 'Contact verification and enrichment from email or phone.',
    h1: 'RAVEN + FullContact: Contact Verification',
    metaTitle: 'FullContact Integration for Contact Verification',
    metaDescription:
      'RAVEN uses FullContact to verify and enrich borrower contact details from an email address or phone number.',
    eyebrow: 'Live Integration',
    intro: [
      'RAVEN uses FullContact to verify and enrich contact information from a single email address or phone number, adding confidence to the contact module alongside identity and residence data.',
    ],
    sections: [
      {
        heading: 'What FullContact verifies inside RAVEN',
        paragraphs: [],
        bullets: ['Email and phone validity', 'Contact enrichment signals that corroborate applicant-supplied details'],
      },
    ],
    faqs: [
      {
        q: 'Is the FullContact integration live today?',
        a: 'Yes. FullContact is active in production for contact verification.',
      },
      {
        q: 'What information does FullContact need to run?',
        a: 'Just an email address or a phone number; either is enough to return a contact verification result.',
      },
    ],
  },

  // ————————————————————————————————————————————————————
  // Core Banking Systems
  // ————————————————————————————————————————————————————
  {
    slug: 'jack-henry',
    name: 'Jack Henry',
    category: 'core',
    description: 'Works alongside Symitar and SilverLake today with no core integration required.',
    h1: 'RAVEN + Jack Henry: Verified Data for Symitar and SilverLake',
    metaTitle: 'Jack Henry Integration',
    metaDescription:
      'RAVEN works alongside Jack Henry Symitar and SilverLake with no core integration required. Verified borrower files arrive as structured data and an examiner-ready PDF.',
    eyebrow: 'Core Banking',
    intro: [
      'RAVEN runs in front of Jack Henry without touching the core. Borrowers verify identity, income, employment, and assets through a RAVEN link; your team receives a complete, verified file as structured data and an examiner-ready PDF, then books it into Symitar or SilverLake exactly as they do now.',
      'Because verification happens before the core, there is nothing to certify, no jXchange or SymXchange project, and no dependency on a Jack Henry integration slot.',
    ],
    sections: [
      {
        heading: 'How it works with Symitar and SilverLake',
        paragraphs: [
          'No core project, no vendor certification cycle, no waiting on an integration slot. Banks running Symitar or SilverLake can send their first verification link this week: the verified file arrives complete, and booking stays in the workflow your team already knows.',
        ],
      },
      {
        heading: 'Connecting RAVEN to Jack Henry',
        paragraphs: [
          'You connect RAVEN to your Jack Henry instance through jXchange (SilverLake) or SymXchange (Symitar) with credentials your admin controls, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN against your jXchange or SymXchange environment with scoped service credentials',
          'Configure: we set up field mappings and booking rules with your team',
          'Onboard: send your first verification link and book verified customers the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need a Jack Henry integration project to use RAVEN?',
        a: 'No. RAVEN operates at the intake and verification layer, in front of the core. There is no jXchange or SymXchange work, no certification cycle, and no core dependency.',
      },
      {
        q: 'How does verified data get into Symitar or SilverLake?',
        a: 'Your team books it exactly as they do now. The difference is the file arrives complete and source-verified, as structured JSON plus an examiner-ready PDF, instead of as a stack of documents to chase.',
      },
      {
        q: 'Does this work with Banno?',
        a: 'RAVEN is independent of the digital banking layer, so it runs the same whether or not you use Banno.',
      },
    ],
  },
  {
    slug: 'fiserv',
    name: 'Fiserv',
    category: 'core',
    description: 'Works alongside DNA and Premier today with no core integration required.',
    h1: 'RAVEN + Fiserv: Verified Data for DNA and Premier',
    metaTitle: 'Fiserv Integration',
    metaDescription:
      'RAVEN works alongside Fiserv DNA and Premier with no core integration required. Verified borrower files arrive as structured data and an examiner-ready PDF.',
    eyebrow: 'Core Banking',
    intro: [
      'RAVEN runs in front of Fiserv without touching the core. Borrowers verify identity, income, employment, and assets through a RAVEN link; your team receives a complete, verified file as structured data and an examiner-ready PDF, then books it into DNA or Premier exactly as they do now.',
      'Because verification happens before the core, there is nothing to certify through Communicator Open or AppMarket, and no dependency on a Fiserv integration project.',
    ],
    sections: [
      {
        heading: 'How it works with DNA and Premier',
        paragraphs: [
          'No core project, no vendor certification cycle. Banks running DNA or Premier can send their first verification link this week: the verified file arrives complete, and booking stays in the workflow your team already knows.',
        ],
      },
      {
        heading: 'Connecting RAVEN to Fiserv',
        paragraphs: [
          'You connect RAVEN to your Fiserv core through Communicator Open with credentials your admin controls, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN against your Communicator Open environment with scoped service credentials',
          'Configure: we set up field mappings and booking rules with your team',
          'Onboard: send your first verification link and book verified customers the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need a Fiserv integration project to use RAVEN?',
        a: 'No. RAVEN operates at the intake and verification layer, in front of the core. There is no Communicator Open work, no AppMarket dependency, and no certification cycle.',
      },
      {
        q: 'How does verified data get into DNA or Premier?',
        a: 'Your team books it exactly as they do now. The difference is the file arrives complete and source-verified, as structured JSON plus an examiner-ready PDF, instead of as a stack of documents to chase.',
      },
    ],
  },
  {
    slug: 'fis',
    name: 'FIS',
    category: 'core',
    description: 'Works alongside Horizon and IBS today with no core integration required.',
    h1: 'RAVEN + FIS: Verified Data for Horizon and IBS',
    metaTitle: 'FIS Integration',
    metaDescription:
      'RAVEN works alongside FIS Horizon and IBS with no core integration required. Verified borrower files arrive as structured data and an examiner-ready PDF.',
    eyebrow: 'Core Banking',
    intro: [
      'RAVEN runs in front of FIS without touching the core. Borrowers verify identity, income, employment, and assets through a RAVEN link; your team receives a complete, verified file as structured data and an examiner-ready PDF, then books it into Horizon or IBS exactly as they do now.',
      'Because verification happens before the core, there is nothing to certify and no dependency on an FIS integration project.',
    ],
    sections: [
      {
        heading: 'How it works with Horizon and IBS',
        paragraphs: [
          'No core project, no vendor certification cycle. Banks running Horizon or IBS can send their first verification link this week: the verified file arrives complete, and booking stays in the workflow your team already knows.',
        ],
      },
      {
        heading: 'Connecting RAVEN to FIS',
        paragraphs: [
          'You connect RAVEN to your FIS core through Code Connect, FIS’s API gateway for Horizon and IBS, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN through FIS Code Connect with scoped API credentials your admin controls',
          'Configure: we set up field mappings and booking rules with your team',
          'Onboard: send your first verification link and book verified customers the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need an FIS integration project to use RAVEN?',
        a: 'No. RAVEN operates at the intake and verification layer, in front of the core. There is no certification cycle and no core dependency.',
      },
      {
        q: 'How does verified data get into Horizon or IBS?',
        a: 'Your team books it exactly as they do now. The difference is the file arrives complete and source-verified, as structured JSON plus an examiner-ready PDF, instead of as a stack of documents to chase.',
      },
    ],
  },
  {
    slug: 'csi',
    name: 'CSI',
    category: 'core',
    description: 'Works alongside CSI cores today with no core integration required.',
    h1: 'RAVEN + CSI: Verified Data for Your Core',
    metaTitle: 'CSI Integration',
    metaDescription:
      'RAVEN works alongside CSI cores with no core integration required. Verified borrower files arrive as structured data and an examiner-ready PDF.',
    eyebrow: 'Core Banking',
    intro: [
      'RAVEN runs in front of CSI without touching the core. Borrowers verify identity, income, employment, and assets through a RAVEN link; your team receives a complete, verified file as structured data and an examiner-ready PDF, then books it into your CSI core exactly as they do now.',
      'Because verification happens before the core, there is nothing to certify and no dependency on a CSI integration project.',
    ],
    sections: [
      {
        heading: 'How it works with CSI',
        paragraphs: [
          'No core project, no vendor certification cycle. Banks running CSI can send their first verification link this week: the verified file arrives complete, and booking stays in the workflow your team already knows.',
        ],
      },
      {
        heading: 'Connecting RAVEN to CSI',
        paragraphs: [
          'You connect RAVEN to your CSI core through CSIbridge, CSI’s open API platform, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN through CSIbridge with scoped API credentials your admin controls',
          'Configure: we set up field mappings and booking rules with your team',
          'Onboard: send your first verification link and book verified customers the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need a CSI integration project to use RAVEN?',
        a: 'No. RAVEN operates at the intake and verification layer, in front of the core. There is no certification cycle and no core dependency.',
      },
      {
        q: 'How does verified data get into our CSI core?',
        a: 'Your team books it exactly as they do now. The difference is the file arrives complete and source-verified, as structured JSON plus an examiner-ready PDF, instead of as a stack of documents to chase.',
      },
    ],
  },

  // ————————————————————————————————————————————————————
  // Loan Origination Systems
  // ————————————————————————————————————————————————————
  {
    slug: 'ncino',
    name: 'nCino',
    category: 'los',
    description: 'Verified applicant files that fit any nCino pipeline.',
    h1: 'RAVEN + nCino: Verified Files Into Your Pipeline',
    metaTitle: 'nCino Integration',
    metaDescription:
      'RAVEN delivers source-verified borrower files that fit any nCino pipeline: structured data plus an examiner-ready PDF, verified before the application enters your workflow.',
    eyebrow: 'Loan Origination',
    intro: [
      'RAVEN verifies identity, income, employment, and assets before an application ever reaches your pipeline. The verified file arrives as structured data and an examiner-ready PDF that your team attaches inside nCino as part of their normal workflow.',
    ],
    sections: [
      {
        heading: 'How it works with nCino',
        paragraphs: [
          'Verification runs entirely outside nCino, so there is no LOS dependency to launch. Your team reviews a complete, source-verified file before it enters your existing pipeline, and the audit trail travels with it.',
        ],
      },
      {
        heading: 'Connecting RAVEN to nCino',
        paragraphs: [
          'You connect RAVEN to your nCino instance through its Salesforce-native APIs with a scoped integration user, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN with a scoped Salesforce integration user your admin controls',
          'Configure: we map verified fields to your nCino record types with your team',
          'Onboard: verified applications land in your pipeline the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need nCino to use RAVEN?',
        a: 'No. RAVEN operates independently of any LOS and fits alongside nCino or any other origination system.',
      },
      {
        q: 'How do verified files get into nCino?',
        a: 'The verified file arrives as structured data and PDF; your team attaches it to the nCino record as part of their normal workflow, with every verification source-attributed for review.',
      },
    ],
  },
  {
    slug: 'meridianlink',
    name: 'MeridianLink',
    category: 'los',
    description: 'Verified applicant files that fit any MeridianLink pipeline.',
    h1: 'RAVEN + MeridianLink: Verified Files Into Your Pipeline',
    metaTitle: 'MeridianLink Integration',
    metaDescription:
      'RAVEN delivers source-verified borrower files that fit any MeridianLink pipeline: structured data plus an examiner-ready PDF, verified before the application enters your workflow.',
    eyebrow: 'Loan Origination',
    intro: [
      'RAVEN verifies identity, income, employment, and assets before an application ever reaches your pipeline. The verified file arrives as structured data and an examiner-ready PDF that your team attaches inside MeridianLink Consumer or Mortgage as part of their normal workflow.',
    ],
    sections: [
      {
        heading: 'How it works with MeridianLink',
        paragraphs: [
          'Verification runs entirely outside MeridianLink, so there is no LOS dependency to launch. Your team reviews a complete, source-verified file before it enters your existing pipeline, and the audit trail travels with it.',
        ],
      },
      {
        heading: 'Connecting RAVEN to MeridianLink',
        paragraphs: [
          'You connect RAVEN to MeridianLink Consumer or Mortgage through MeridianLink’s partner APIs with credentials your admin controls, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN against your MeridianLink environment with scoped API credentials',
          'Configure: we map verified fields to your loan records with your team',
          'Onboard: verified applications land in your pipeline the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need MeridianLink to use RAVEN?',
        a: 'No. RAVEN operates independently of any LOS and fits alongside MeridianLink or any other origination system.',
      },
      {
        q: 'How do verified files get into MeridianLink?',
        a: 'The verified file arrives as structured data and PDF; your team attaches it to the MeridianLink record as part of their normal workflow, with every verification source-attributed for review.',
      },
    ],
  },
  {
    slug: 'baker-hill',
    name: 'Baker Hill NextGen',
    category: 'los',
    description: 'Verified applicant files that fit any Baker Hill pipeline.',
    h1: 'RAVEN + Baker Hill NextGen: Verified Files Into Your Pipeline',
    metaTitle: 'Baker Hill NextGen Integration',
    metaDescription:
      'RAVEN delivers source-verified borrower files that fit any Baker Hill NextGen pipeline: structured data plus an examiner-ready PDF, verified before the application enters your workflow.',
    eyebrow: 'Loan Origination',
    intro: [
      'RAVEN verifies identity, income, employment, and assets before an application ever reaches your pipeline. The verified file arrives as structured data and an examiner-ready PDF that your team attaches inside Baker Hill NextGen as part of their normal workflow.',
    ],
    sections: [
      {
        heading: 'How it works with Baker Hill NextGen',
        paragraphs: [
          'Verification runs entirely outside Baker Hill, so there is no LOS dependency to launch. Your team reviews a complete, source-verified file before it enters your existing pipeline, and the audit trail travels with it.',
        ],
      },
      {
        heading: 'Connecting RAVEN to Baker Hill',
        paragraphs: [
          'You connect RAVEN to Baker Hill NextGen through its partner integration APIs with credentials your admin controls, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN against your NextGen environment with scoped API credentials',
          'Configure: we map verified fields to your loan records with your team',
          'Onboard: verified applications land in your pipeline the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need Baker Hill to use RAVEN?',
        a: 'No. RAVEN operates independently of any LOS and fits alongside Baker Hill NextGen or any other origination system.',
      },
      {
        q: 'How do verified files get into Baker Hill?',
        a: 'The verified file arrives as structured data and PDF; your team attaches it to the Baker Hill NextGen record as part of their normal workflow, with every verification source-attributed for review.',
      },
    ],
  },
  {
    slug: 'abrigo',
    name: 'Abrigo',
    category: 'los',
    description: 'Verified applicant files that fit any Abrigo pipeline.',
    h1: 'RAVEN + Abrigo: Verified Files Into Your Pipeline',
    metaTitle: 'Abrigo Integration',
    metaDescription:
      'RAVEN delivers source-verified borrower files that fit any Abrigo pipeline: structured data plus an examiner-ready PDF, verified before the application enters your workflow.',
    eyebrow: 'Loan Origination',
    intro: [
      'RAVEN verifies identity, income, employment, and assets before an application ever reaches your pipeline. The verified file arrives as structured data and an examiner-ready PDF that your team attaches inside Abrigo as part of their normal workflow.',
    ],
    sections: [
      {
        heading: 'How it works with Abrigo',
        paragraphs: [
          'Verification runs entirely outside Abrigo, so there is no LOS dependency to launch. Your team reviews a complete, source-verified file before it enters your existing pipeline, and the audit trail travels with it.',
        ],
      },
      {
        heading: 'Connecting RAVEN to Abrigo',
        paragraphs: [
          'You connect RAVEN to your Abrigo lending suite through its API integration layer with credentials your admin controls, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN against your Abrigo environment with scoped API credentials',
          'Configure: we map verified fields to your loan records with your team',
          'Onboard: verified applications land in your pipeline the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need Abrigo to use RAVEN?',
        a: 'No. RAVEN operates independently of any LOS and fits alongside Abrigo or any other origination system.',
      },
      {
        q: 'How do verified files get into Abrigo?',
        a: 'The verified file arrives as structured data and PDF; your team attaches it to the Abrigo record as part of their normal workflow, with every verification source-attributed for review.',
      },
    ],
  },
  {
    slug: 'ice-encompass',
    name: 'ICE Mortgage Technology (Encompass)',
    category: 'los',
    description: 'Verified applicant files that fit any Encompass pipeline.',
    h1: 'RAVEN + Encompass: Verified Files Into Your Pipeline',
    metaTitle: 'ICE Mortgage Technology Encompass Integration',
    metaDescription:
      'RAVEN delivers source-verified borrower files that fit any Encompass pipeline: structured data plus an examiner-ready PDF, verified before the application enters your workflow.',
    eyebrow: 'Loan Origination',
    intro: [
      'RAVEN verifies identity, income, employment, and assets before an application ever reaches your pipeline. The verified file arrives as structured data and an examiner-ready PDF that your team attaches inside Encompass as part of their normal workflow.',
    ],
    sections: [
      {
        heading: 'How it works with Encompass',
        paragraphs: [
          'Verification runs entirely outside Encompass, so there is no LOS dependency to launch. Your team reviews a complete, source-verified file before it enters your existing pipeline, and the audit trail travels with it.',
        ],
      },
      {
        heading: 'Connecting RAVEN to Encompass',
        paragraphs: [
          'You connect RAVEN to your Encompass instance through Encompass Partner Connect, ICE’s API framework for lender-authorized integrations, we help you configure your RAVEN integration, and you can start onboarding customers instantly.',
        ],
        bullets: [
          'Connect: authorize RAVEN through Encompass Partner Connect with credentials your admin controls',
          'Configure: we map verified fields to your loan records with your team',
          'Onboard: verified applications land in your pipeline the same day',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do we need Encompass to use RAVEN?',
        a: 'No. RAVEN operates independently of any LOS and fits alongside Encompass or any other origination system.',
      },
      {
        q: 'How do verified files get into Encompass?',
        a: 'The verified file arrives as structured data and PDF; your team attaches it to the Encompass record as part of their normal workflow, with every verification source-attributed for review.',
      },
    ],
  },
];

export function getIntegrationsByCategory(categoryKey: string): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === categoryKey);
}

export function getIntegration(slug: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.slug === slug);
}
