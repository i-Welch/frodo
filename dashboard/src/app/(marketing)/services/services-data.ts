import type { SolutionSection } from '../solutions/solutions-data';

/**
 * The consulting practice's services. Drives /services, /services/[slug], the
 * homepage services grid, the sitemap and llms.txt. Copy rules (enforced by
 * test/content/positioning.test.ts): vendors are hands-on experience, never
 * partners; no credentials claimed; no prices.
 */

/**
 * Disclosure for every place the site talks about vendor independence. RAVEN's
 * own verification software pays data providers (Plaid, Socure and others), so
 * the site never claims RAVEN has no commercial relationship with vendors.
 */
export const SOFTWARE_DISCLOSURE =
  'RAVEN also sells its own borrower verification software, which uses data providers including Plaid and Socure. Using it is never a condition of an engagement, and when it is one of the options, RAVEN says so.';

export interface Service {
  slug: string;
  /** ISO date of last substantive content update */
  updated: string;
  /** Short label for cards and nav */
  navLabel: string;
  /** Eyebrow label over the H1 */
  eyebrow: string;
  h1: string;
  /** Title tag, 60 chars max */
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  sections: SolutionSection[];
  /** What the bank walks away with */
  deliverables: string[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  /** Show the free digital lending audit form. Off for pre-open banks, which have no call reports yet. */
  showAudit: boolean;
}

export const SERVICES: Service[] = [
  {
    slug: 'new-bank-launch',
    updated: '2026-11-22',
    navLabel: 'New bank launch',
    eyebrow: 'New Banks',
    h1: 'Operational Setup for New Banks, From Conditional Approval to Opening Day',
    metaTitle: 'De Novo Bank Consulting: Operations and Technology Setup',
    metaDescription:
      'Help for de novo banks between conditional approval and opening: vendor selection and sequencing, operating processes, and examiner-ready documentation.',
    intro: [
      'A de novo bank has to stand up a core, digital banking, account opening, lending, BSA/AML and verification in the months between conditional approval and opening day, while operating under heightened supervision for its first three years. Most organizers meet that stack one vendor pitch at a time.',
      'RAVEN works with the organizing team to decide what to buy, in what order, and how each piece is run once it is live, so the programs promised in the business plan exist in practice on the first exam.',
    ],
    sections: [
      {
        heading: 'Sequence the stack before signing it',
        paragraphs: [
          'Core contracts run five to seven years and decide what every later vendor can integrate with. The order of decisions matters as much as the decisions: core and digital banking first, then account opening and lending, with verification and BSA/AML tooling chosen to work with both.',
        ],
        bullets: [
          'Vendor shortlists and evaluation criteria for each layer of the stack',
          'Contract and integration questions to ask before the demo, not after',
          'A build calendar that ties each vendor to the opening date',
        ],
      },
      {
        heading: 'Operating processes that hold up on the first exam',
        paragraphs: [
          'Examiners test whether the bank’s programs work, not whether they are written down. The processes behind account opening, lending, fraud, vendor management and incident response have to be designed with the systems that run them.',
        ],
        bullets: [
          'Account opening and lending workflows mapped end to end',
          'Fraud and identity controls tied to the CIP and BSA program',
          'Vendor management and third-party risk files started on day one',
        ],
      },
    ],
    deliverables: [
      'Technology stack plan with vendor shortlists and a build calendar',
      'Operating process maps for account opening, lending and fraud',
      'Examiner-ready documentation of how each system supports the business plan',
    ],
    faqs: [
      {
        q: 'When should a de novo bring in technology help?',
        a: 'Before the core contract is signed. Most of the hard-to-reverse decisions are made in the first weeks after conditional approval, and some organizers start during the application.',
      },
      {
        q: 'Do you resell any of the vendors?',
        a: `No. RAVEN is not a reseller for cores, digital banking platforms or origination systems. ${SOFTWARE_DISCLOSURE}`,
      },
    ],
    related: [
      { href: '/de-novo-watch', label: 'De Novo Watch: every 2026 filing, approval and opening' },
      { href: '/solutions/de-novo-bank-technology', label: 'The de novo bank technology stack' },
      { href: '/blog/how-to-start-a-bank', label: 'How to start a bank: the de novo playbook' },
      { href: '/glossary/de-novo-bank', label: 'Glossary: de novo bank' },
    ],
    showAudit: false,
  },
  {
    slug: 'technology-integration',
    updated: '2026-11-22',
    navLabel: 'Technology integration',
    eyebrow: 'Stack Modernization',
    h1: 'Core, LOS and Verification Integration for Community Banks',
    metaTitle: 'Bank Technology Integration and Core Modernization',
    metaDescription:
      'Hands-on integration help for banks modernizing their stack: cloud core (Finxact), loan origination (Vesta), income verification (Plaid) and digital account opening.',
    intro: [
      'Modernizing a bank’s stack usually fails in the seams: the core speaks one data model, the origination system another, and verification data arrives as PDFs someone retypes. The vendors each own their piece. Nobody owns the joins.',
      'RAVEN owns the joins. Isaac has done this work hands-on with the Finxact cloud core, Plaid income verification and the Vesta loan origination system, and brings that experience to the bank’s own stack, whichever vendors it runs.',
    ],
    sections: [
      {
        heading: 'Where the hands-on experience is',
        paragraphs: [
          'The work below is direct implementation experience, not a reseller or partner arrangement.',
        ],
        bullets: [
          'Core: the Finxact cloud core',
          'Loan origination: the Vesta LOS',
          'Income and asset verification: Plaid income verification and bank-connected data',
          'Digital account opening and identity verification flows',
        ],
      },
      {
        heading: 'From vendor selection to a working integration',
        paragraphs: [
          'An integration project starts with what data has to move where, and who is accountable when it doesn’t. The plan is written before the statement of work is signed, so the bank can hold vendors to it.',
        ],
        bullets: [
          'Integration architecture and data mapping across core, LOS and verification',
          'Vendor selection support with technical due diligence',
          'Implementation oversight, testing plans and cutover readiness',
        ],
      },
    ],
    deliverables: [
      'Integration architecture and data map for the bank’s stack',
      'Technical due diligence on shortlisted vendors',
      'Test and cutover plan with named owners',
    ],
    faqs: [
      {
        q: 'Do you only work with Finxact, Vesta and Plaid?',
        a: 'No. Those are where the hands-on experience is deepest. The same integration approach applies to Jack Henry, Fiserv, FIS and CSI cores and to other origination systems.',
      },
      {
        q: 'Are you a reseller or implementation partner for these vendors?',
        a: `No. RAVEN is not a reseller or implementation partner for the vendors it helps integrate. ${SOFTWARE_DISCLOSURE}`,
      },
    ],
    related: [
      { href: '/bank-tech-stack', label: 'Bank Tech Stack: what Southeast banks run' },
      { href: '/glossary/loan-origination-system', label: 'Glossary: loan origination system' },
      { href: '/glossary/income-verification', label: 'Glossary: income verification' },
      { href: '/blog/community-bank-compete-neobank-core', label: 'Can a community bank compete on a neobank core?' },
    ],
    showAudit: true,
  },
  {
    slug: 'ai-governance',
    updated: '2026-11-22',
    navLabel: 'AI integration and governance',
    eyebrow: 'AI in Banking',
    h1: 'AI Integration and Governance for Banks',
    metaTitle: 'AI Governance for Banks: Policy, Model Risk and Vendors',
    metaDescription:
      'Help banks adopt AI tools and govern them: AI use policy, model risk management, third-party risk under the 2023 interagency guidance, examiner documentation.',
    intro: [
      'Banks are adopting AI through vendors faster than their governance can follow: fraud scoring, document processing, customer service, underwriting assistance. Each tool is a model the bank is accountable for, whether or not the bank built it.',
      'RAVEN helps banks choose where AI is worth using, integrate it into real workflows, and put the governance in place that examiners will ask about.',
    ],
    sections: [
      {
        heading: 'Integration first, then governance that fits it',
        paragraphs: [
          'Governance written in the abstract does not survive contact with a real tool. The work starts with the use cases the bank actually has, then writes the controls around them.',
        ],
        bullets: [
          'Use-case review: where AI pays for itself and where it adds risk',
          'Integration with existing systems and review workflows',
          'Human review points for decisions that affect customers',
        ],
      },
      {
        heading: 'The framework examiners expect',
        paragraphs: [
          'Supervisors apply existing guidance to AI: model risk management in the SR 11-7 style, and third-party risk management under the 2023 interagency guidance. A bank needs to show it inventoried its models, validated them proportionately, and monitors them.',
        ],
        bullets: [
          'AI use policy and acceptable-use rules for staff',
          'Model inventory, risk tiering and validation approach',
          'Vendor due diligence for AI tools under third-party risk management',
          'Board and examiner-facing documentation',
        ],
      },
    ],
    deliverables: [
      'AI use policy and model inventory',
      'Risk tiering and validation plan for each AI tool',
      'Third-party risk files for AI vendors',
      'Board briefing on AI use and controls',
    ],
    faqs: [
      {
        q: 'We only use AI inside vendor products. Does this apply to us?',
        a: 'Yes. Under third-party risk management guidance the bank remains responsible for the vendor’s model, so it needs to know what the model does and how it is monitored.',
      },
      {
        q: 'Do we need a separate AI policy?',
        a: 'Most banks extend their model risk and vendor management policies and add an acceptable-use policy for staff. The right shape depends on how many tools are in use.',
      },
    ],
    related: [
      { href: '/blog/community-bank-ai-lending-guide', label: 'A community bank guide to AI in lending' },
      { href: '/blog/fintech-bank-charter-rush-2026', label: 'The 2026 fintech bank charter rush' },
    ],
    showAudit: true,
  },
  {
    slug: 'security-readiness',
    updated: '2026-11-22',
    navLabel: 'Security readiness',
    eyebrow: 'Security and IT Risk',
    h1: 'Security and IT Exam Readiness Assessments for Banks',
    metaTitle: 'Bank Security and IT Exam Readiness Assessment',
    metaDescription:
      'Security and IT risk gap assessments for banks against the FFIEC IT Examination Handbook and NIST CSF 2.0, with vendor risk and examiner readiness.',
    intro: [
      'An IT examination looks at how the bank governs technology risk: its vendors, its access controls, its incident response, its recovery plans. New banks face it within the first year. Community banks modernizing their stack face it every time the stack changes.',
      'RAVEN runs readiness and gap assessments against the FFIEC IT Examination Handbook and NIST CSF 2.0, and turns the gaps into a remediation plan the bank can act on before the examiners arrive.',
    ],
    sections: [
      {
        heading: 'What the assessment covers',
        paragraphs: [
          'The assessment reads the bank’s documentation and configuration against what examiners test, and checks that the controls on paper match how the systems actually run.',
        ],
        bullets: [
          'Information security program and governance',
          'Vendor and third-party risk, including core and digital banking providers',
          'Access management, logging and incident response',
          'Business continuity and disaster recovery',
        ],
      },
      {
        heading: 'Readiness, not a certified audit',
        paragraphs: [
          'This is a readiness and gap assessment, not a formal certified audit or penetration test. When the bank needs those, RAVEN scopes them and they are delivered with a partner, with RAVEN coordinating so findings land in one remediation plan.',
        ],
      },
    ],
    deliverables: [
      'Gap assessment against the FFIEC IT Examination Handbook and NIST CSF 2.0',
      'Prioritized remediation plan with owners',
      'Scope for any formal audit or penetration test, delivered with a partner',
    ],
    faqs: [
      {
        q: 'Is this a replacement for our annual IT audit?',
        a: 'No. It prepares the bank for the audit and the exam. Formal audits and penetration tests are delivered with a partner.',
      },
      {
        q: 'Can a pre-open de novo use this?',
        a: 'Yes. A de novo can be assessed against its planned stack and policies before opening, which is when gaps are cheapest to fix.',
      },
    ],
    related: [
      { href: '/legal/security', label: 'How RAVEN secures its own systems' },
      { href: '/services/ai-governance', label: 'AI integration and governance' },
    ],
    showAudit: true,
  },
  {
    slug: 'fintech-partnerships',
    updated: '2026-11-22',
    navLabel: 'Fintech partnerships',
    eyebrow: 'Bank–Fintech Programs',
    h1: 'Fintech Partnership Programs for Banks',
    metaTitle: 'Bank Fintech Partnership Program Consulting',
    metaDescription:
      'Help banks evaluate, launch and run fintech lending partnerships, from someone who built the banking arm at Upstart and Affirm.',
    intro: [
      'Fintech lending runs through partner banks. Done well, a partnership brings a bank loan volume and deposits it could not reach alone. Done badly, it brings consent orders: regulators have spent the last few years pressing partner banks on compliance, oversight and recordkeeping.',
      'Isaac built the banking arm at Upstart and at Affirm, the fintech side of exactly these programs. RAVEN helps banks see a partnership from both sides before they sign one, and run it once they have.',
    ],
    sections: [
      {
        heading: 'Evaluating a partner',
        paragraphs: [
          'The questions that matter are about control: who owns the customer, who sees the data, who answers for compliance, and what happens when the fintech changes its product.',
        ],
        bullets: [
          'Partner due diligence: compliance program, credit model, data and controls',
          'Program economics and concentration limits',
          'Contract terms for oversight, data access and exit',
        ],
      },
      {
        heading: 'Running the program',
        paragraphs: [
          'Oversight is an operating process, not a contract clause. The bank needs its own view of the loans, the complaints and the compliance testing.',
        ],
        bullets: [
          'Ongoing monitoring, reporting and testing',
          'Recordkeeping and reconciliation the bank controls',
          'Examiner-ready documentation of the bank’s oversight',
        ],
      },
    ],
    deliverables: [
      'Partner due diligence report',
      'Program oversight framework and reporting',
      'Contract review focused on oversight, data and exit',
    ],
    faqs: [
      {
        q: 'Should a community bank take on a fintech partnership?',
        a: 'Only with the staff and systems to oversee it. The first piece of work is usually deciding whether the bank can, and what it would need first.',
      },
      {
        q: 'Do you represent fintechs?',
        a: 'No. RAVEN works for the bank.',
      },
    ],
    related: [
      { href: '/glossary/banking-as-a-service', label: 'Glossary: banking as a service' },
      { href: '/blog/affirm-vs-community-bank-personal-loans', label: 'Affirm vs. a community bank personal loan' },
      { href: '/blog/community-banks-lose-loans-fintechs', label: 'Why community banks lose loans to fintechs' },
    ],
    showAudit: true,
  },
  {
    slug: 'verification-software',
    updated: '2026-11-22',
    navLabel: 'Verification software',
    eyebrow: 'RAVEN Software',
    h1: 'RAVEN Borrower Verification Software',
    metaTitle: 'RAVEN Borrower Verification Software for Banks',
    metaDescription:
      'Software RAVEN built: one link verifies a borrower’s identity, income, credit, employment and property data, with an examiner-ready audit trail.',
    intro: [
      'RAVEN also builds software. Its borrower verification product replaces the document chase at intake: the bank sends one link, the borrower connects their accounts in about five minutes, and the bank gets a complete, source-verified report.',
      'It works alongside the bank’s existing core and loan origination system, with no core conversion and no new system for loan officers to learn.',
    ],
    sections: [
      {
        heading: 'How it works',
        paragraphs: [
          'A loan officer or account-opening flow sends a branded link by text or email. The borrower confirms their identity, connects their bank account and consents to sharing their data from any browser. The report comes back formatted for the loan file.',
        ],
      },
      {
        heading: 'What is in the report',
        paragraphs: ['Every data point is sourced and timestamped, with consent records for regulatory review.'],
        bullets: [
          'Identity: name, SSN and date of birth verified across sources, with fraud scoring and watchlist screening',
          'Income and assets: balances, income streams and 12 months of transactions',
          'Credit: scores, tradelines and liabilities',
          'Employment: employer-verified title, salary and dates',
          'Property: address verification, valuations, tax and ownership data',
        ],
      },
    ],
    deliverables: [
      'Branded borrower verification flow',
      'Print-ready verification report per borrower',
      'Field-level audit trail for examiners',
    ],
    faqs: [
      {
        q: 'Do we have to use the software to work with RAVEN?',
        a: 'No. The software is one service. Most consulting work has nothing to do with it.',
      },
      {
        q: 'Which systems does it work with?',
        a: 'It sits in front of the bank’s core and loan origination system rather than inside them. See the integrations pages for the cores and LOS platforms it runs alongside.',
      },
    ],
    related: [
      { href: '/solutions', label: 'All verification solutions' },
      { href: '/integrations', label: 'Cores and LOS platforms it works alongside' },
    ],
    showAudit: true,
  },
];

/** How working with RAVEN goes, in three steps. No prices. */
export const ENGAGEMENT_STEPS: { title: string; body: string }[] = [
  {
    title: 'Start with a call or a free audit',
    body: 'New banks start with a call about where they are in the charter process. Operating banks can also request a free digital lending audit built from their public call report and HMDA data.',
  },
  {
    title: 'A scoped project',
    body: 'A defined piece of work with a clear deliverable: a vendor selection, an integration, an AI governance framework, a security readiness review.',
  },
  {
    title: 'Ongoing advisory',
    body: 'For banks that want someone on call, a fractional-CTO style retainer covering technology decisions, vendor management and exam preparation.',
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
