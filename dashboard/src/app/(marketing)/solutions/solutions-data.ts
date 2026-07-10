export interface SolutionSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Solution {
  slug: string;
  /** Target keyword phrase, used in H1 */
  h1: string;
  /** Title tag, under 60 chars */
  metaTitle: string;
  metaDescription: string;
  /** Eyebrow label over the H1 */
  eyebrow: string;
  intro: string[];
  sections: SolutionSection[];
  faqs: { q: string; a: string }[];
  relatedGlossary: { slug: string; label: string }[];
  relatedArticles: { slug: string; title: string }[];
}

export const SOLUTIONS: Solution[] = [
  {
    slug: 'bank-verification-software',
    h1: 'Bank Verification Software Built for Community Banks',
    metaTitle: 'Bank Verification Software for Community Banks',
    metaDescription:
      'RAVEN verifies identity, income, employment, credit, bank, and property data from one borrower link. No core replacement, no LOS required, live in days.',
    eyebrow: 'Verification Platform',
    intro: [
      'Bank verification software confirms who a borrower is and whether the facts on their application are true: identity, income, employment, assets, credit, and property. Most community banks assemble this from phone calls, borrower-supplied PDFs, and three or four single-purpose vendors.',
      'RAVEN replaces that assembly with one link. The borrower authorizes their data once; the bank receives a complete verification report, built from source data across seven providers, in minutes.',
    ],
    sections: [
      {
        heading: 'One link instead of a vendor for every data type',
        paragraphs: [
          'The verification stack at a typical community bank is fragmented by data type: an identity vendor, a credit pull, The Work Number for employment, fax forms for deposits, and a processor stitching it together by hand. Each vendor is a contract, an integration, and a place for files to stall.',
        ],
        bullets: [
          'Identity verified against authoritative sources, not uploaded documents',
          'Income and employment direct from payroll systems of record',
          'Bank balances and transaction history via consented account connections',
          'Credit, property, and lien data in the same report',
          'One audit trail across all of it, timestamped for examiners',
        ],
      },
      {
        heading: 'A fraud control, not just a speed play',
        paragraphs: [
          'Cotality puts material misrepresentation at 1 in 116 mortgage applications, and income misrepresentation leads Fannie Mae fraud findings at 46%. Every one of those schemes depends on the bank trusting artifacts the applicant supplies: editable paystubs, doctored statements, phone numbers that ring to accomplices.',
          'Source-verified data removes the artifact class entirely. A payroll record can’t be inflated with a template, and a fake employer’s staffed phone line never enters the loop, because nobody calls it.',
        ],
      },
      {
        heading: 'Works with the systems you already run',
        paragraphs: [
          'RAVEN sits in front of your existing workflow rather than replacing it. There is no core conversion, no LOS dependency, and no six-month implementation. Banks send their first verification link the week they onboard, and reports arrive as structured data plus an examiner-ready PDF.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does bank verification software do?',
        a: 'It confirms the facts on a loan or account application (identity, income, employment, assets, credit, property) using authoritative data sources instead of borrower-supplied documents, and documents the whole process for auditors.',
      },
      {
        q: 'Does RAVEN require replacing our core or LOS?',
        a: 'No. RAVEN works alongside any core (Jack Henry, Fiserv, CSI, and others) because it operates at the intake and verification layer. Reports arrive as structured data and PDF, so they fit whatever workflow you run today.',
      },
      {
        q: 'How long does implementation take?',
        a: 'Days, not months. Because there is no core integration dependency, most banks send their first verification link within the first week.',
      },
      {
        q: 'Is the borrower experience white-labeled?',
        a: 'Yes. Borrowers see your bank’s name and branding through the entire verification flow.',
      },
    ],
    relatedGlossary: [
      { slug: 'verification-of-deposit', label: 'Verification of Deposit (VOD)' },
      { slug: 'verification-of-employment', label: 'Verification of Employment (VOE)' },
      { slug: 'asset-verification', label: 'Asset Verification' },
    ],
    relatedArticles: [
      { slug: 'one-link-complete-verification', title: 'One Link, Complete Verification: How RAVEN Works' },
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
    ],
  },
  {
    slug: 'digital-account-opening',
    h1: 'Digital Account Opening That Doesn’t Invite Fraud',
    metaTitle: 'Digital Account Opening for Community Banks',
    metaDescription:
      'Verification-first digital account opening for community banks: open deposit accounts online in minutes with source-verified identity, without the fraud wave.',
    eyebrow: 'Account Opening',
    intro: [
      'Neobanks captured 44% of new checking accounts in 2024. Community banks opened 16% of theirs digitally. The gap isn’t preference: customers repeatedly say they’d rather bank locally. It’s that opening an account at most community banks still requires a branch visit, and the online version, where it exists, loses 92% of mobile applicants before they finish.',
      'RAVEN provides the verification layer that makes digital account opening work: a branded flow where identity, funding account, and (for interest-bearing products) income are confirmed at the source before the account is booked.',
    ],
    sections: [
      {
        heading: 'The fraud objection, taken seriously',
        paragraphs: [
          'Plenty of community banks tried online account opening and turned it off after a fraud wave. That experience is real, but the diagnosis usually isn’t. Those channels collected the same self-reported data as the paper process, at internet speed, with no source verification. A front door with no ID check invites exactly what it got.',
          'Verification-first account opening inverts the model: the applicant’s identity is validated against authoritative sources (including SSA-level SSN checks that catch synthetic identities), their funding account is confirmed as real and theirs, and only then does the application reach your team. Digital intake done this way is a stronger fraud posture than a branch visit, because branch staff can’t check SSN issuance records by eye.',
        ],
      },
      {
        heading: 'Minutes to open, not days',
        paragraphs: [
          'The winning account-opening flows complete in under five minutes on a phone. That is the standard your applicants calibrated to with Chime and their mortgage lender’s app, and it is achievable for a community bank without touching the core: RAVEN handles intake and verification, then hands your team a complete, verified file for booking.',
        ],
        bullets: [
          'White-labeled flow on your domain, your branding',
          'Identity, SSN, and watchlist checks at the source',
          'Instant funding-account verification (no micro-deposit abandonment)',
          'Complete file delivered to your team, examiner-ready audit trail included',
        ],
      },
    ],
    faqs: [
      {
        q: 'How do you prevent fraud in online account opening?',
        a: 'By verifying at the source before booking: authoritative identity and SSN validation (which catches synthetic identities), instant funding-account ownership checks, and device and behavior signals, instead of trusting typed-in application data.',
      },
      {
        q: 'Do we need to integrate with our core to launch?',
        a: 'No. RAVEN delivers verified, structured applications to your team; booking to the core can stay manual at first and be automated later. That is what makes launch a matter of days.',
      },
      {
        q: 'What happens to applicants who fail verification?',
        a: 'You decide. Hard failures (fabricated identity, unverifiable SSN) can be declined automatically; soft mismatches route to your staff for review, with the full evidence attached.',
      },
    ],
    relatedGlossary: [
      { slug: 'bank-account-verification', label: 'Bank Account Verification' },
      { slug: 'synthetic-identity-fraud', label: 'Synthetic Identity Fraud' },
    ],
    relatedArticles: [
      { slug: 'digital-account-opening-community-bank', title: 'Digital Account Opening for Community Banks: The Deposit Side of the Gap' },
      { slug: 'chime-account-opening-deposit-war', title: 'The 92% Problem' },
    ],
  },
  {
    slug: 'deposit-account-opening-software',
    h1: 'Deposit Account Opening Software: What to Look For',
    metaTitle: 'Deposit Account Opening Software for Banks',
    metaDescription:
      'How to evaluate deposit account opening software as a community bank: verification depth, abandonment math, core dependencies, and where RAVEN fits.',
    eyebrow: 'Account Opening',
    intro: [
      'Deposit account opening software is the system that takes a new customer from "I want an account" to a funded, booked account. The category ranges from $500K enterprise onboarding suites to thin form-builders that collect applications without verifying anything. Community banks evaluating the category usually care about four things: completion rate, fraud control, core compatibility, and time to launch.',
    ],
    sections: [
      {
        heading: 'The evaluation checklist',
        paragraphs: [
          'Most demos show the happy path. The differences that matter show up in the details:',
        ],
        bullets: [
          'Completion rate on mobile: the industry average abandonment is brutal (92% on mobile); ask for the vendor’s real funnel numbers',
          'Verification depth: does it validate identity and funding at the source, or just collect typed answers?',
          'Synthetic identity coverage: SSN validation against issuance records, not just credit-header matching',
          'Funding: instant account verification vs. micro-deposits (micro-deposits add days and abandonment)',
          'Core dependency: can you launch without a core project, and automate booking later?',
          'Audit trail: will an examiner see who verified what, when, from which source?',
        ],
      },
      {
        heading: 'Where RAVEN fits',
        paragraphs: [
          'RAVEN is the verification-first version of this category: a white-labeled intake flow backed by source verification of identity and funding, delivered without a core integration project. It is built for banks that want to open accounts digitally without repeating the fraud experience that made them turn the channel off the first time.',
          'Because the verified file arrives as structured data plus PDF, booking can stay in your existing process on day one. Banks typically launch in days and automate the core hand-off later, if at all.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does deposit account opening software cost?',
        a: 'Enterprise onboarding suites commonly run six figures annually with multi-month implementations. RAVEN prices for community banks and launches in days; book a demo for specifics on your volume.',
      },
      {
        q: 'Can we open business accounts with it?',
        a: 'Yes. Business account opening adds owner identity verification and business financial data to the same flow, so your team receives a verified file before first contact.',
      },
      {
        q: 'Does it work if we keep account booking manual?',
        a: 'Yes, and that is the recommended way to launch. Verification is the hard part; booking a verified application into the core takes your staff minutes.',
      },
    ],
    relatedGlossary: [
      { slug: 'bank-account-verification', label: 'Bank Account Verification' },
      { slug: 'synthetic-identity-fraud', label: 'Synthetic Identity Fraud' },
    ],
    relatedArticles: [
      { slug: 'digital-account-opening-community-bank', title: 'Digital Account Opening for Community Banks: The Deposit Side of the Gap' },
      { slug: 'what-neobanks-get-right-community-banks', title: 'What Neobanks Get Right (and What Community Banks Already Have)' },
    ],
  },
  {
    slug: 'kyc-software',
    h1: 'KYC Software for Community Banks',
    metaTitle: 'KYC Software for Community Banks',
    metaDescription:
      'KYC and CIP verification for community banks: authoritative identity checks, synthetic identity detection, and an examiner-ready audit trail from one link.',
    eyebrow: 'Compliance',
    intro: [
      'KYC software automates the Customer Identification Program (CIP) work that BSA requires at every new relationship: verify the customer’s identity, screen against watchlists, and keep records an examiner can reconstruct. US banks spend $59 billion a year on BSA/AML compliance, and at community banks under $100M in assets it consumes 8.7% of noninterest expense, roughly three times the burden at larger institutions.',
      'RAVEN performs CIP verification as part of the same borrower link that verifies income and assets, so KYC stops being a separate workflow bolted onto intake.',
    ],
    sections: [
      {
        heading: 'Identity verified at the source',
        paragraphs: [
          'Document-based CIP (photocopy the license, file it) satisfies the letter of the rule while missing the modern failure mode: synthetic identities, where a real SSN pairs with a fabricated person and no document is technically fake. The Federal Reserve calls synthetic identity fraud the fastest-growing financial crime in the country, with an estimated $6 billion in lender losses.',
          'RAVEN validates that the name, SSN, and date of birth belong together according to authoritative sources, screens OFAC and watchlists, and flags identity elements that don’t corroborate, before the relationship is booked.',
        ],
      },
      {
        heading: 'The audit trail is the product',
        paragraphs: [
          'When examiners review CIP, the question is not whether you checked, it is whether you can prove what you checked, when, and against what source. Every RAVEN verification produces a timestamped, source-attributed record: which data came from which provider, what matched, what was flagged, and who reviewed exceptions.',
        ],
        bullets: [
          'CIP identity verification against authoritative data, not just documents',
          'OFAC and watchlist screening in the same pass',
          'Synthetic-identity signals: SSN issuance consistency, thin-file anomalies',
          'Timestamped, source-attributed audit log per verification',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does RAVEN satisfy CIP requirements?',
        a: 'RAVEN performs documentary and non-documentary identity verification with full source attribution, which maps to CIP’s verification and recordkeeping requirements. Your BSA officer defines the program; RAVEN executes and documents the verification steps.',
      },
      {
        q: 'How is this different from the KYC module in our core?',
        a: 'Core KYC modules typically run at booking, on data someone already typed in. RAVEN verifies at intake, from source data, and covers the lending side (income, employment, assets) in the same pass, so compliance and underwriting stop duplicating work.',
      },
      {
        q: 'Does it screen for OFAC and sanctions?',
        a: 'Yes, watchlist screening runs as part of every identity verification, and the screening result is part of the audit record.',
      },
    ],
    relatedGlossary: [
      { slug: 'synthetic-identity-fraud', label: 'Synthetic Identity Fraud' },
      { slug: 'bank-account-verification', label: 'Bank Account Verification' },
    ],
    relatedArticles: [
      { slug: '59-billion-compliance-burden', title: 'The $59 Billion Compliance Burden' },
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
    ],
  },
  {
    slug: 'automated-income-verification',
    h1: 'Automated Income Verification',
    metaTitle: 'Automated Income Verification for Lenders',
    metaDescription:
      'Verify income in seconds from payroll and bank data instead of paystubs and phone calls. Coverage for W-2, gig, and self-employed borrowers.',
    eyebrow: 'Income & Employment',
    intro: [
      'Automated income verification replaces paystubs, W-2s, and verification phone calls with data pulled directly from payroll systems and bank accounts, with the borrower’s consent, in seconds. Community banks commonly pay $55 to $280 per file through legacy channels like The Work Number and IRS transcripts; source-data pulls cost a few dollars and come back before the borrower finishes the application.',
    ],
    sections: [
      {
        heading: 'How it works',
        paragraphs: [
          'The borrower authenticates with their payroll provider or bank inside your branded flow. RAVEN returns employer, role, tenure, pay frequency, gross and net income, and year-to-date earnings from the payroll system of record. Where payroll coverage runs out (gig workers, the self-employed, cash-adjacent income), bank transaction analysis identifies recurring income deposits and their sources.',
        ],
        bullets: [
          'Payroll-source income and employment in one pull',
          'Bank-transaction income analysis for non-W-2 borrowers',
          'Year-to-date and historical earnings, not a single snapshot',
          'Refreshable before closing without re-asking the borrower',
        ],
      },
      {
        heading: 'The fraud math',
        paragraphs: [
          'Income misrepresentation is the leading category in Fannie Mae’s confirmed fraud findings, at 46% of cases, and it works because paystubs are trivially editable and verification calls ring numbers the applicant supplied. Payroll-sourced income can’t be inflated with a template, and it never involves calling anyone. Automating income verification is usually evaluated as a cost cut; the larger return may be the fraud it never lets in.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What percentage of borrowers can be verified automatically?',
        a: 'Payroll connections cover the large majority of W-2 employment; bank transaction analysis extends coverage to gig and self-employed income. The remainder falls back to documents inside the same flow, so there is one process either way.',
      },
      {
        q: 'Is automated income verification accepted by the GSEs?',
        a: 'Yes. Fannie Mae’s Day 1 Certainty and Freddie Mac’s AIM validate digitally sourced income and grant rep-and-warrant relief on validated components.',
      },
      {
        q: 'What does it cost compared to The Work Number?',
        a: 'Legacy verifications run $55 to $280 per file. Source-data verification runs in the low single-digit dollars per pull.',
      },
    ],
    relatedGlossary: [
      { slug: 'income-verification', label: 'Income Verification' },
      { slug: 'verification-of-income-and-assets', label: 'Verification of Income and Assets' },
    ],
    relatedArticles: [
      { slug: 'income-verification-fintech-vs-bank', title: 'The $70 Phone Call: How Fintechs Are Killing the Income Verification Tax' },
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
    ],
  },
  {
    slug: 'instant-employment-verification',
    h1: 'Instant Employment Verification',
    metaTitle: 'Instant Employment Verification (VOE) for Lenders',
    metaDescription:
      'Instant VOE from payroll systems of record: employer, role, tenure, and income in seconds, immune to the fake-employer schemes that defeat phone verification.',
    eyebrow: 'Income & Employment',
    intro: [
      'Instant employment verification confirms where an applicant works, in what role, and for how long, directly from the payroll system of record, in seconds. It replaces the verbal VOE: the phone call to an employer number that, at most banks, still happens days before every closing.',
    ],
    sections: [
      {
        heading: 'The phone call is the attack surface',
        paragraphs: [
          'Fannie Mae’s fraud program maintains a watchlist of 63 fictitious employers: purpose-built fake companies, some with websites and staffed phone lines, that exist to answer verification calls. A fraud ring that prints a fake paystub also staffs the callback number. The verbal VOE assumes the phone number proves the employer; the schemes are built on exactly that assumption.',
          'Payroll-sourced VOE never places the call. The employer’s existence is established by the payroll provider’s commercial relationship, and the data (role, tenure, pay) comes from the system that actually runs payroll.',
        ],
      },
      {
        heading: 'Built for the two moments VOE happens',
        paragraphs: [
          'Lenders verify employment at underwriting and again within days of closing. Because RAVEN’s verification is a data pull rather than a document request, the pre-closing re-verification is a refresh, not a new ask of the borrower or a processor’s afternoon on the phone.',
        ],
        bullets: [
          'Employer, role, hire date, and pay in one consented pull',
          'Pre-closing re-verification as a one-click refresh',
          'No callback numbers, no fictitious-employer exposure',
          'Falls back to document collection in the same flow when payroll coverage misses',
        ],
      },
    ],
    faqs: [
      {
        q: 'How fast is instant employment verification?',
        a: 'Seconds once the borrower authorizes the payroll connection, compared with hours to days for callback-based verification services.',
      },
      {
        q: 'What if the employer isn’t in a payroll database?',
        a: 'The flow falls back to document collection and manual verification for that borrower, inside the same audit trail, so exceptions don’t become a separate process.',
      },
      {
        q: 'Does instant VOE satisfy the verbal VOE requirement?',
        a: 'GSE guidelines accept validated digital employment data in place of the traditional verbal VOE; Day 1 Certainty and AIM formalize this. Your investor overlays govern the final word.',
      },
    ],
    relatedGlossary: [
      { slug: 'verification-of-employment', label: 'Verification of Employment (VOE)' },
      { slug: 'income-verification', label: 'Income Verification' },
    ],
    relatedArticles: [
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
      { slug: 'rocket-mortgage-22-days-how', title: 'How Rocket Mortgage Closes in 22 Days' },
    ],
  },
  {
    slug: 'de-novo-bank-technology',
    h1: 'The De Novo Bank Technology Stack: Verified From Day One',
    metaTitle: 'De Novo Bank Technology: The Day-One Verification Stack',
    metaDescription:
      'Your business plan promised examiners a fraud program. RAVEN gives de novo banks source-verified onboarding through one link, live before you open.',
    eyebrow: 'De Novo Banks',
    intro: [
      'A de novo bank assembles its entire technology stack in the window between conditional approval and opening day: core, digital banking, and the verification layer that decides who gets to become a customer. Most stack conversations focus on the core. The decision examiners will actually test first is verification.',
      'Your application promised the FDIC a working BSA and fraud program. RAVEN makes that program real before you open: identity, income, employment, bank, and address data verified at the source through one borrower link, with the audit trail examiners expect from a bank under de novo conditions.',
    ],
    sections: [
      {
        heading: 'Day one is an exam, not a launch',
        paragraphs: [
          'A de novo operates under heightened supervision for its first three years, and its first examinations test whether the programs in the business plan exist in practice. A fraud program that consists of collecting documents and calling phone numbers is the industry’s legacy default, and it is exactly the intake model that fraud rings industrialized against. Starting from scratch means you get to skip that mistake entirely.',
        ],
        bullets: [
          'CIP-grade identity verification against authoritative sources, with synthetic-identity signals',
          'OFAC and watchlist screening on every applicant',
          'Income and employment from payroll systems of record, assets from consented bank connections',
          'A timestamped, source-attributed audit record per verification, built for examiner review',
        ],
      },
      {
        heading: 'Fits beside the core bundle, not inside it',
        paragraphs: [
          'De novos typically sign a core bundle (Jack Henry, Fiserv, FIS, or CSI) that covers ledger, digital banking, and payments. RAVEN is the verification layer in front of that bundle: applicants verify through your branded flow, and your team books complete, source-verified files into whatever core you chose. There is no core dependency, so verification can be live before your core conversion finishes, and it moves with you if the stack changes later.',
        ],
      },
      {
        heading: 'Digital intake as a fraud control, not a fraud vector',
        paragraphs: [
          'Plenty of established banks turned off online account opening after fraud waves, because their digital channels collected the same self-reported data as their paper process at internet speed. A de novo that launches verification-first gets the opposite result: every applicant is validated against authoritative sources before the account is booked, which makes the digital channel the most controlled intake path the bank has. Deposit growth is the de novo mandate; verified digital intake is how it happens without the fraud tax.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can RAVEN be live before the bank opens?',
        a: 'Yes. RAVEN has no core dependency, so the verification flow can be configured and tested during the pre-opening buildout and be operational on day one.',
      },
      {
        q: 'Does this satisfy what examiners look for in the de novo period?',
        a: 'RAVEN executes and documents CIP identity verification, watchlist screening, and income/employment/asset verification with full source attribution. Your BSA officer defines the program; RAVEN is the working evidence of it.',
      },
      {
        q: 'How does pricing work for a bank with no volume yet?',
        a: 'Pricing scales with verification volume, so a de novo pays for what it actually processes rather than an enterprise license sized for a bank ten times its age. Book a call for specifics.',
      },
      {
        q: 'Which cores does it work with?',
        a: 'Any of them. RAVEN operates at the intake layer in front of Jack Henry, Fiserv, FIS, CSI, and others; verified files arrive as structured data plus an examiner-ready PDF.',
      },
    ],
    relatedGlossary: [
      { slug: 'de-novo-bank', label: 'De Novo Bank' },
      { slug: 'synthetic-identity-fraud', label: 'Synthetic Identity Fraud' },
    ],
    relatedArticles: [
      { slug: 'de-novo-bank-day-one-fraud-program', title: 'The De Novo Bank’s Day-One Fraud Program' },
      { slug: 'how-to-start-a-bank', title: 'How to Start a Bank: The De Novo Playbook' },
    ],
  },
];

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}
