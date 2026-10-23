export interface GlossarySection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  abbreviation?: string;
  /** ISO date of last substantive content update; falls back to the site-wide date in sitemap.ts */
  updated?: string;
  /** Title tag, under 60 chars */
  metaTitle: string;
  /** Meta description, ~150 chars */
  metaDescription: string;
  /** One or two sentence definition — first thing on the page, and the DefinedTerm JSON-LD description */
  definition: string;
  sections: GlossarySection[];
  faqs: { q: string; a: string }[];
  relatedTerms: string[];
  relatedArticles: { slug: string; title: string }[];
  relatedSolution?: { slug: string; label: string };
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: 'verification-of-deposit',
    term: 'Verification of Deposit',
    abbreviation: 'VOD',
    metaTitle: 'What Is a Verification of Deposit (VOD)?',
    metaDescription:
      'A verification of deposit (VOD) confirms a borrower’s bank balances and account history directly with their bank. How VODs work, how long they take, and the faster alternative.',
    definition:
      'A verification of deposit (VOD) is a lender’s confirmation, obtained directly from a borrower’s bank, that the accounts and balances listed on a loan application actually exist. It typically covers current balance, average balance over the past two months, account open date, and account status.',
    sections: [
      {
        heading: 'What a VOD actually confirms',
        paragraphs: [
          'Underwriters use the VOD to answer two questions: does the borrower really have the funds they claim, and have those funds been sitting in the account long enough to be trusted? A balance that appeared last week could be a borrowed down payment or a manufactured reserve, which is why the form asks for average balance and account age, not just a snapshot.',
        ],
        bullets: [
          'Current balance and average balance (usually two months)',
          'Date the account was opened',
          'Account type and status',
          'Any loans the borrower holds at that institution',
        ],
      },
      {
        heading: 'The traditional process, and why it drags',
        paragraphs: [
          'The classic VOD is a form (Fannie Mae Form 1006) that the lender sends to the borrower’s bank, which the bank’s deposit operations team completes and returns. Turnaround runs from a couple of days to more than a week, and every VOD is a task for two banks’ back offices at once. Some banks charge a fee per request; others quietly deprioritize them.',
          'The paper VOD also verifies exactly one moment in time, on a document that passes through several hands. Underwriters routinely follow up for updated statements anyway.',
        ],
      },
      {
        heading: 'The modern version: consented account data',
        paragraphs: [
          'The current alternative is direct account connectivity: the borrower authorizes a data pull from their bank, and the lender receives balances, transaction history, and account metadata sourced from the bank’s own systems in minutes. GSE programs (Fannie Mae Day 1 Certainty, Freddie Mac AIM) accept this form of asset validation and can waive documentation requirements when it’s used.',
          'Source data also does what a form can’t: it shows the deposit pattern over months, which makes a staged balance or an undisclosed loan payment visible instead of invisible.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How long does a verification of deposit take?',
        a: 'A traditional form-based VOD typically takes 3 to 7 business days, depending on the responding bank. Digital asset verification through consented account data returns the same information in minutes.',
      },
      {
        q: 'Is a VOD the same as a bank statement?',
        a: 'No. A bank statement is a borrower-supplied document; a VOD is confirmed by the bank itself. That distinction matters for fraud: statements can be edited, a VOD (or direct account data) cannot.',
      },
      {
        q: 'Do lenders still require VODs?',
        a: 'Many lenders now accept digital asset verification in place of the paper form, and GSE programs explicitly support it. The requirement is to validate the assets, not to use any particular form.',
      },
    ],
    relatedTerms: ['asset-verification', 'bank-account-verification', 'verification-of-income-and-assets'],
    relatedArticles: [
      { slug: 'why-it-takes-42-days-to-close-a-mortgage', title: 'Why It Takes 42 Days to Close a Mortgage' },
      { slug: 'one-link-complete-verification', title: 'One Link, Complete Verification: How RAVEN Works' },
    ],
    relatedSolution: { slug: 'bank-verification-software', label: 'Bank verification software' },
  },
  {
    slug: 'verification-of-employment',
    term: 'Verification of Employment',
    abbreviation: 'VOE',
    updated: '2026-07-13',
    metaTitle: 'Verification of Employment (VOE): Written, Verbal, Instant',
    metaDescription:
      'How written (WVOE) and verbal (VVOE) verification of employment works: Fannie Mae requirements, timing rules, costs, fraud risks, and instant payroll-sourced VOE.',
    definition:
      'A verification of employment (VOE) is a lender’s confirmation that a borrower works where the application says they work, in the role and at the income stated. Mortgage lenders typically perform a written VOE (Form 1005) during underwriting and a verbal VOE within 10 business days of closing.',
    sections: [
      {
        heading: 'The written VOE (WVOE)',
        paragraphs: [
          'The written VOE, often abbreviated WVOE, is a form the lender sends to the employer during underwriting. Fannie Mae Form 1005 is the standard: it asks the employer to confirm position, hire date, base pay, overtime and bonus history, and the probability of continued employment. Lenders order a WVOE when paystubs and W-2s are unavailable or insufficient, or when income structure needs employer confirmation (commission, recent job changes, employment gaps).',
          'Turnaround depends entirely on the employer. Large employers route WVOEs to a service like The Work Number; small employers may take days to return the form, and every request is a task on someone’s desk at both companies.',
        ],
      },
      {
        heading: 'The verbal VOE (VVOE)',
        paragraphs: [
          'The verbal VOE, or VVOE, is a phone call made shortly before closing to confirm the borrower still works there. It exists because income that disappears between application and closing is one of the fastest ways a performing loan becomes a problem loan.',
          'There is no GSE-mandated VVOE form, but the call must be documented, and most lenders use an internal worksheet that captures: the name and title of the person who placed the call, the date of the call, the name and title of the employer contact who answered, the business name, and, critically, the source of the phone number. The number must be obtained independently (directory assistance, the employer’s verified website, a database), not taken from the application, because a borrower-supplied number can ring to anyone.',
        ],
      },
      {
        heading: 'Fannie Mae VOE requirements',
        paragraphs: [
          'Fannie Mae’s Selling Guide (B3-3.1-07) requires a verbal VOE for each employed borrower within 10 business days prior to the note date. For self-employed borrowers, the requirement is different: the lender must verify the existence of the business through a third party (a CPA, regulatory agency, or licensing bureau) within 120 calendar days prior to the note date.',
          'The written VOE can be waived when income is validated through Desktop Underwriter’s validation service (Day 1 Certainty): if DU validates income from an eligible data vendor, the lender gets relief from the documentation requirement. Freddie Mac’s AIM program works the same way on the automated-asset-and-income side. The verbal VOE requirement, however, does not disappear under either program.',
        ],
      },
      {
        heading: 'The fraud problem with phone-based VOE',
        paragraphs: [
          'The verbal VOE has a structural weakness: the lender calls a phone number that ultimately traces back to information the borrower supplied. Fannie Mae’s fraud team maintains a list of fictitious employers, 63 named entities and growing, invented specifically to answer these calls. Some maintain websites and staffed phone lines whose only job is to confirm employment for co-conspirators.',
          'Income misrepresentation is the most common finding in Fannie Mae fraud investigations, at 46% of confirmed cases. The VOE call, as traditionally performed, is not a strong control against it. It is one of the main channels for [first-party fraud](/glossary/first-party-fraud): a real applicant misrepresenting their own employment or income.',
        ],
      },
      {
        heading: 'Instant VOE from payroll data',
        paragraphs: [
          'Payroll-sourced verification flips the trust model. Instead of calling a number, the lender receives employment and income data directly from the payroll system of record (with the borrower’s consent) in seconds. The employer’s identity is established by the payroll provider’s relationship, not by whoever answers a phone. It also captures what a call can’t: pay frequency, year-to-date earnings, and deductions.',
          'Because it is a data pull rather than a document request, the pre-closing re-verification becomes a refresh instead of a new round of phone tag. This is how [instant employment verification](/solutions/instant-employment-verification) works in RAVEN.',
        ],
      },
      {
        heading: 'Written vs. verbal vs. payroll-sourced VOE',
        paragraphs: [],
        table: {
          headers: ['', 'Written VOE (WVOE)', 'Verbal VOE (VVOE)', 'Payroll-sourced VOE'],
          rows: [
            [
              'What it confirms',
              'Position, hire date, base pay, probability of continued employment',
              'Borrower is still employed at the stated employer',
              'Employer, role, hire date, pay frequency, year-to-date earnings',
            ],
            [
              'When it happens',
              'During underwriting',
              'Within 10 business days of the note date',
              'Any point in the loan; re-verification is a refresh',
            ],
            ['Turnaround', 'Days, employer-dependent', 'Minutes to days of phone tag', 'Seconds'],
            [
              'Fraud resistance',
              'Form can be completed by a coached contact',
              'Defeated by fictitious-employer schemes',
              'Data comes from the payroll system of record',
            ],
            ['Typical cost', 'Staff time, or $55–$280 via a service', 'Staff time', 'A few dollars per pull'],
          ],
        },
      },
    ],
    faqs: [
      {
        q: 'When do lenders verify employment?',
        a: 'Twice, typically: a written or data-sourced VOE during underwriting, and a verbal re-verification within about 10 business days of closing to confirm nothing changed.',
      },
      {
        q: 'What is a WVOE?',
        a: 'A WVOE is a written verification of employment: a form (Fannie Mae Form 1005 for conforming loans) that the employer completes to confirm position, hire date, pay, and the probability of continued employment. Lenders order it when paystubs and W-2s aren’t sufficient on their own.',
      },
      {
        q: 'What is a verbal VOE (VVOE)?',
        a: 'A VVOE is a phone call the lender makes within 10 business days before closing to confirm the borrower is still employed. The lender must document who called, who answered, and where the phone number came from; the number has to be sourced independently, not taken from the application.',
      },
      {
        q: 'What are Fannie Mae’s verbal VOE requirements?',
        a: 'Per Selling Guide B3-3.1-07: for employed borrowers, a verbal VOE within 10 business days prior to the note date. For self-employed borrowers, verification that the business exists through a third party within 120 calendar days prior to the note date. DU income validation can waive the written VOE, but not the verbal one.',
      },
      {
        q: 'How long is a VOE valid?',
        a: 'Income documentation, including a written VOE, must generally be no more than 120 days old at the note date under GSE guidelines. The verbal VOE has a tighter window: within 10 business days of the note date, which is why it lands in closing week.',
      },
      {
        q: 'How much does a VOE cost?',
        a: 'Third-party VOE services like The Work Number commonly charge $55 to $280 per verification depending on the product. Payroll-API verification typically costs a few dollars per pull.',
      },
      {
        q: 'Can a VOE be faked?',
        a: 'Phone-based VOEs can be and are defeated by fictitious employer schemes. Payroll-sourced VOE is materially harder to fake because the data comes from the payroll system of record rather than a person answering a phone.',
      },
    ],
    relatedTerms: ['income-verification', 'verification-of-income-and-assets', 'first-party-fraud', 'synthetic-identity-fraud'],
    relatedArticles: [
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
      { slug: 'income-verification-fintech-vs-bank', title: 'The $70 Phone Call: How Fintechs Are Killing the Income Verification Tax' },
      { slug: 'the-work-number-alternatives-community-banks', title: 'The Work Number Alternatives for Community Banks (2026)' },
    ],
    relatedSolution: { slug: 'instant-employment-verification', label: 'Instant employment verification' },
  },
  {
    slug: 'verification-of-mortgage',
    term: 'Verification of Mortgage',
    abbreviation: 'VOM',
    metaTitle: 'What Is a Verification of Mortgage (VOM)?',
    metaDescription:
      'A verification of mortgage (VOM) documents a borrower’s payment history on an existing mortgage. When lenders require one and how undisclosed debt slips past it.',
    definition:
      'A verification of mortgage (VOM) is a report from a borrower’s current mortgage servicer documenting the loan’s payment history, balance, and standing. Lenders request it when a credit report doesn’t show enough detail about an existing or recently paid mortgage.',
    sections: [
      {
        heading: 'When a VOM comes up',
        paragraphs: [
          'VOMs matter most for borrowers whose mortgage history doesn’t surface cleanly on a credit report: loans held by small servicers or private lenders, recently assumed loans, or land contracts. The underwriter wants 12 to 24 months of payment history, the current balance, and whether the borrower has been late.',
        ],
      },
      {
        heading: 'The undisclosed debt connection',
        paragraphs: [
          'The VOM only covers mortgages the lender knows about, and that’s the growing hole. Undisclosed real estate debt was the fastest-rising mortgage fraud category in Cotality’s 2025 report, up 12% year over year: borrowers acquire an investment property, then omit it from the next application so their debt-to-income ratio looks clean.',
          'Bank transaction data closes that gap in a way document requests can’t. A recurring monthly payment to a mortgage servicer that doesn’t match any disclosed loan is exactly the signal underwriters need, and it only appears when verification runs on source data instead of borrower-listed accounts.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does a VOM show?',
        a: 'Payment history (usually 12-24 months), current balance, monthly payment amount, and whether the loan is current. Some servicers include the original loan amount and open date.',
      },
      {
        q: 'How is a VOM different from a credit report?',
        a: 'A credit report shows what the servicer reported to the bureaus, which can be incomplete or stale, and some private lenders never report at all. A VOM comes from the servicer directly.',
      },
    ],
    relatedTerms: ['verification-of-deposit', 'income-verification', 'asset-verification'],
    relatedArticles: [
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
    ],
    relatedSolution: { slug: 'bank-verification-software', label: 'Bank verification software' },
  },
  {
    slug: 'asset-verification',
    term: 'Asset Verification',
    metaTitle: 'Asset Verification for Mortgage Lending, Explained',
    metaDescription:
      'Asset verification confirms a borrower has the funds to close and the reserves to qualify. Methods, seasoning rules, large-deposit review, and digital alternatives.',
    definition:
      'Asset verification is the process of confirming that a borrower actually holds the funds needed for a down payment, closing costs, and required reserves, and that those funds are legitimately theirs. It covers bank and investment accounts and looks at both balances and the history behind them.',
    sections: [
      {
        heading: 'What underwriters look for',
        paragraphs: [
          'Verification isn’t just a balance check. Underwriters trace where the money came from: funds must generally be "seasoned" (in the account for 60+ days) or sourced with a paper trail. Large recent deposits trigger letters of explanation because an undocumented $20,000 that appeared last month might be an undisclosed loan that changes the borrower’s debt picture.',
        ],
        bullets: [
          'Sufficient funds to close, plus required reserves',
          'Seasoning: how long the funds have been in the account',
          'Large deposit review and sourcing',
          'Gift funds documented with gift letters',
        ],
      },
      {
        heading: 'Documents vs. data',
        paragraphs: [
          'The document path collects two months of statements per account, chases missing pages, and repeats near closing when statements go stale. The data path has the borrower connect accounts once; the lender receives balances and transaction history from the institution’s systems, refreshable at closing without asking the borrower for anything again.',
          'Both GSEs accept digital asset verification, and it carries representation and warranty relief in programs like Day 1 Certainty because source data is more reliable than PDFs. Edited statements are one of the most common artifacts in mortgage fraud files; connected account data removes that entire artifact class.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What counts as an asset for mortgage qualification?',
        a: 'Checking, savings, money market, CDs, investment and retirement accounts (with haircuts for volatility and withdrawal penalties), and documented gift funds. Cash on hand generally doesn’t count because it can’t be verified.',
      },
      {
        q: 'Why do lenders ask about large deposits?',
        a: 'An unexplained deposit could be an undisclosed loan, which changes the borrower’s debt-to-income ratio, or funds from an impermissible source. Anything larger than roughly half the borrower’s monthly income typically needs documentation.',
      },
      {
        q: 'How long does asset verification take?',
        a: 'Days to weeks by document collection, depending on how quickly the borrower produces complete statements. Minutes via consented account connections.',
      },
    ],
    relatedTerms: ['verification-of-deposit', 'verification-of-income-and-assets', 'bank-account-verification'],
    relatedArticles: [
      { slug: 'how-figure-closes-heloc-in-5-days', title: 'How Figure Closes a HELOC in 5 Days' },
      { slug: 'rocket-mortgage-22-days-how', title: 'How Rocket Mortgage Closes in 22 Days' },
    ],
    relatedSolution: { slug: 'bank-verification-software', label: 'Bank verification software' },
  },
  {
    slug: 'verification-of-income-and-assets',
    term: 'Verification of Income and Assets',
    abbreviation: 'VOI/VOA',
    metaTitle: 'Verification of Income and Assets (VOI/VOA) Explained',
    metaDescription:
      'How lenders verify income and assets together: document collection vs. single-source digital verification, GSE programs that reward it, and what it costs.',
    definition:
      'Verification of income and assets (often VOI and VOA) is the combined process of confirming what a borrower earns and what they hold. It anchors the debt-to-income and reserves math that most credit decisions rest on, and it’s the most document-heavy stage of a traditional loan file.',
    sections: [
      {
        heading: 'The traditional checklist',
        paragraphs: [
          'A conventional file collects paystubs, W-2s, tax returns or IRS transcripts for income, plus two months of statements per account for assets. Each document is borrower-supplied, individually reviewed, and frequently re-requested when pages are missing or versions go stale. Industry estimates put loan teams’ document-chasing at hours per file, and the average mortgage file at roughly 500 pages.',
        ],
      },
      {
        heading: 'Single-source digital verification',
        paragraphs: [
          'Modern verification collapses the checklist into two authorizations: a payroll connection for income and employment, and bank connections for assets. Data arrives from systems of record in minutes. Fannie Mae’s Day 1 Certainty and Freddie Mac’s AIM validate these reports and grant representation and warranty relief on validated components, which is the GSEs’ way of saying source data beats documents.',
          'The same reports serve fraud control: income comes from payroll systems instead of editable paystubs, and asset history reveals undisclosed obligations that never appear on an application.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between VOI and VOE?',
        a: 'VOE confirms the employment relationship (employer, role, tenure); VOI confirms the earnings. Payroll-sourced reports typically cover both in a single pull.',
      },
      {
        q: 'What are Day 1 Certainty and AIM?',
        a: 'Fannie Mae and Freddie Mac programs that validate digitally sourced income, asset, and employment data during automated underwriting, and relieve the lender of certain repurchase risks on validated components.',
      },
      {
        q: 'Do borrowers have to share bank login credentials?',
        a: 'Modern account connections use OAuth-style authorization at the borrower’s own bank, so credentials are never shared with the lender or the verification provider.',
      },
    ],
    relatedTerms: ['income-verification', 'asset-verification', 'verification-of-employment'],
    relatedArticles: [
      { slug: 'one-link-complete-verification', title: 'One Link, Complete Verification: How RAVEN Works' },
      { slug: 'why-it-takes-42-days-to-close-a-mortgage', title: 'Why It Takes 42 Days to Close a Mortgage' },
    ],
    relatedSolution: { slug: 'automated-income-verification', label: 'Automated income verification' },
  },
  {
    slug: 'income-verification',
    term: 'Income Verification',
    metaTitle: 'Income Verification: Methods, Costs, and Fraud Risk',
    metaDescription:
      'Every method lenders use to verify income: paystubs, W-2s, IRS transcripts, The Work Number, payroll APIs, and bank transaction data. Costs and fraud tradeoffs of each.',
    definition:
      'Income verification is how a lender confirms that an applicant’s stated earnings are real, stable, and likely to continue. It applies across mortgages, consumer loans, auto lending, and account opening, and the method chosen drives both the cost per file and the fraud exposure.',
    sections: [
      {
        heading: 'The methods, ranked by trust model',
        paragraphs: [
          'Every income verification method sits somewhere on a spectrum from "trust what the applicant hands you" to "trust the system of record."',
        ],
        bullets: [
          'Paystubs and W-2s: borrower-supplied documents, editable with consumer software; the artifact behind most income fraud',
          'IRS transcripts (Form 4506-C): authoritative but slow, and they lag a full tax year',
          'Employment databases (e.g. The Work Number): fast when the employer is covered, at $55 to $280 per verification',
          'Payroll API connections: consented, real-time data from the payroll system of record, typically a few dollars per pull',
          'Bank transaction income: recurring deposit analysis from connected accounts; covers gig and self-employed income that payroll misses',
        ],
      },
      {
        heading: 'Why the method matters more than the policy',
        paragraphs: [
          'Income misrepresentation is the leading category in Fannie Mae’s confirmed fraud findings at 46%, and it survives because the dominant verification artifacts are documents the applicant controls. Moving the same underwriting policy from documents to source data changes the fraud math without changing a single credit standard.',
          'It also changes the economics: community banks commonly pay more per verification through legacy channels than fintechs pay for an entire application’s worth of source data.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the fastest way to verify income?',
        a: 'Payroll API verification returns employer, role, and earnings data in seconds. Bank transaction analysis is similarly fast and covers income types payroll systems miss.',
      },
      {
        q: 'How do lenders verify self-employed income?',
        a: 'Traditionally through two years of tax returns and profit-and-loss statements. Bank transaction data increasingly supplements this by showing actual deposit patterns in business and personal accounts.',
      },
      {
        q: 'Can pay stubs be faked?',
        a: 'Yes, easily; template services sell realistic paystubs for a few dollars. This is why source-based verification has become the fraud-control standard, not just a speed upgrade.',
      },
    ],
    relatedTerms: ['verification-of-employment', 'verification-of-income-and-assets', 'synthetic-identity-fraud'],
    relatedArticles: [
      { slug: 'income-verification-fintech-vs-bank', title: 'The $70 Phone Call: How Fintechs Are Killing the Income Verification Tax' },
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
    ],
    relatedSolution: { slug: 'automated-income-verification', label: 'Automated income verification' },
  },
  {
    slug: 'bank-account-verification',
    term: 'Bank Account Verification',
    metaTitle: 'Bank Account Verification: Instant vs. Micro-Deposits',
    metaDescription:
      'Bank account verification confirms account ownership and status before payments or funding. Instant verification vs. micro-deposits, and where each fits.',
    definition:
      'Bank account verification confirms that a bank account exists, is open, and belongs to the person claiming it, before a lender or business moves money to or from it. It underpins loan funding, ACH payment setup, and increasingly, account-opening fraud checks.',
    sections: [
      {
        heading: 'Micro-deposits vs. instant verification',
        paragraphs: [
          'The legacy method sends two small deposits and asks the customer to report the amounts: cheap, but it takes one to three days, and abandons a meaningful share of users who never come back to finish. Instant verification authenticates the customer at their bank in real time and returns ownership, status, and balance data in seconds.',
          'For lenders the difference is not just UX. Instant verification also returns the account’s standing and history, which feeds fraud screening: a days-old account receiving a loan disbursement is a different risk than a five-year-old primary checking account.',
        ],
      },
      {
        heading: 'Where it fits in lending',
        paragraphs: [
          'Three moments in the loan lifecycle depend on knowing an account is real and owned by the borrower: funding the loan, setting up autopay, and (in a verification-first intake) screening the applicant before underwriting spends any time on the file. Community banks that verify accounts at intake inherit a fraud control that most legacy processes apply only at the very end, after the work is already done.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How long does bank account verification take?',
        a: 'Micro-deposit verification takes 1 to 3 business days. Instant verification through a bank data connection completes in seconds.',
      },
      {
        q: 'What does account verification return?',
        a: 'At minimum, confirmation of ownership and account status. Data-connection methods also return balance, account age, and transaction history where authorized.',
      },
    ],
    relatedTerms: ['verification-of-deposit', 'asset-verification', 'synthetic-identity-fraud'],
    relatedArticles: [
      { slug: 'chime-account-opening-deposit-war', title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy' },
      { slug: 'best-digital-account-opening-software-community-banks', title: 'Best Digital Account Opening Software for Community Banks (2026)' },
      { slug: 'open-banking-community-bank-guide', title: 'Open Banking for Community Banks: What Plaid, Fiserv, and Jack Henry Actually Support' },
    ],
    relatedSolution: { slug: 'digital-account-opening', label: 'Digital account opening' },
  },
  {
    slug: 'fdic-deposit-insurance-application',
    term: 'FDIC Deposit Insurance Application',
    updated: '2026-10-19',
    metaTitle: 'FDIC Deposit Insurance Application: How It Works',
    metaDescription:
      'How a proposed bank applies for FDIC deposit insurance: the seven statutory factors, public notice, conditional approval orders, and what organizers file.',
    definition:
      'An FDIC deposit insurance application is the filing a proposed bank must win before it can open: Section 5 of the Federal Deposit Insurance Act requires FDIC approval before a new institution’s deposits are insured. It runs alongside the charter application to the OCC or the state banking regulator.',
    sections: [
      {
        heading: 'Two approvals, filed in parallel',
        paragraphs: [
          'A new bank needs a charter and deposit insurance. The charter comes from the OCC for a national bank or from the state banking regulator for a state bank; deposit insurance comes from the FDIC in every case. Organizers usually file both at once so the reviews run in parallel, and the FDIC application follows its Statement of Policy on Applications for Deposit Insurance.',
          'The filing is built around the business plan: three years of projections, the capital raise, the proposed directors and executives, the market the bank will serve, and the policies and programs it will operate, from lending and BSA/AML to information security.',
        ],
      },
      {
        heading: 'The seven statutory factors',
        paragraphs: ['Section 6 of the Federal Deposit Insurance Act lists what the FDIC must weigh:'],
        bullets: [
          'The financial history and condition of the institution',
          'The adequacy of its capital structure',
          'Its future earnings prospects',
          'The general character and fitness of its management',
          'The risk it presents to the Deposit Insurance Fund',
          'The convenience and needs of the community it will serve',
          'Whether its corporate powers are consistent with the purposes of the Act',
        ],
      },
      {
        heading: 'Public notice, conditional approval, opening',
        paragraphs: [
          'The applicant publishes a public notice of the filing, and the FDIC publishes the applications it has received and acted on, which is how trackers such as RAVEN’s De Novo Watch follow the pipeline. Approval arrives as an order with conditions: minimum paid-in capital, the de novo period requirements (including a tier-1 leverage ratio of at least 8% for the first three years), audits, and FDIC review of changes to the business plan, directors, or senior executives. The order typically lapses if the bank does not open within a set period, often 12 months.',
          'Between the order and opening day, the bank finishes its capital raise and builds out its operations, including the technology stack and the fraud and identity verification controls the business plan promised examiners.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does a national bank need FDIC deposit insurance approval?',
        a: 'Yes. The OCC grants the national charter, but deposit insurance for any new bank requires FDIC approval under Section 5 of the Federal Deposit Insurance Act. Organizers file both applications, usually at the same time.',
      },
      {
        q: 'What does the FDIC evaluate in a deposit insurance application?',
        a: 'Seven statutory factors: financial history and condition, capital adequacy, future earnings prospects, management’s character and fitness, risk to the Deposit Insurance Fund, the convenience and needs of the community, and whether the bank’s corporate powers are consistent with the Act.',
      },
      {
        q: 'What happens after the FDIC approves an application?',
        a: 'The FDIC issues an order with conditions, such as minimum paid-in capital and the three-year de novo requirements. The bank must meet them and open within the period the order sets, often 12 months, or the approval lapses.',
      },
      {
        q: 'Where can I see pending deposit insurance applications?',
        a: 'The FDIC publishes the applications it has received and acted on. RAVEN’s De Novo Watch (reportraven.tech/de-novo-watch) tracks them with capital, leadership, and technology choices, verified against the FDIC lists.',
      },
    ],
    relatedTerms: ['de-novo-bank', 'customer-identification-program', 'new-account-fraud'],
    relatedArticles: [
      { slug: 'how-to-start-a-bank', title: 'How to Start a Bank: The De Novo Playbook' },
      { slug: 'glades-bank-broward-de-novo', title: 'Glades Bank and Trust: A $45M Filing for the County the Banks Left Behind' },
      { slug: 'de-novo-bank-day-one-fraud-program', title: 'The De Novo Bank’s Day-One Fraud Program' },
    ],
    relatedSolution: { slug: 'de-novo-bank-technology', label: 'De Novo Bank Technology' },
  },
  {
    slug: 'de-novo-bank',
    term: 'De Novo Bank',
    metaTitle: 'What Is a De Novo Bank?',
    metaDescription:
      'A de novo bank is a newly chartered bank built from scratch. Capital requirements, the application timeline, the three-year de novo period, and what founders assemble before day one.',
    definition:
      'A de novo bank is a newly chartered bank started from scratch rather than acquired or converted from an existing charter. The term (Latin for "anew") covers the bank from its organizing group’s first filing through its early years of operation, during which regulators apply heightened supervision.',
    sections: [
      {
        heading: 'What it takes to open one',
        paragraphs: [
          'A de novo needs a charter (national, from the OCC, or state, from the state banking regulator), deposit insurance from the FDIC, and capital sized to its business plan. The FDIC expects a tier-1 leverage ratio of at least 8% throughout the first three years, which means day-one capital equal to 8% of what the bank projects its assets will be in year three. Recent community bank approvals have raised $20 million to $40 million.',
          'The realistic timeline runs 18 to 24 months from early planning to opening day: several months assembling the organizing group, business plan, and management team; roughly six to eight months from filing to decision; then the buildout between conditional approval and grand opening, which is when the technology stack, policies, and staff come together.',
        ],
      },
      {
        heading: 'The three-year de novo period',
        paragraphs: [
          'Approval comes with conditions that hold for the first three years: maintaining the capital commitments in the application, annual financial statement audits, fidelity bond coverage, and limits on deviating from the approved business plan. Examiners treat a de novo’s first exams as a test of whether the programs promised in the application, including BSA/AML and fraud controls, actually exist and function.',
        ],
      },
      {
        heading: 'Why so few community de novos exist',
        paragraphs: [
          'New bank formation collapsed after 2008 and never fully recovered. 2025 illustrated the current shape of the pipeline: 31 charter applications were filed, but most came from fintechs, payment platforms, and digital-asset firms seeking limited-purpose or trust charters. Only four new banks actually opened. True full-service community de novos number roughly ten to fifteen per year nationally, which makes each one a significant local event and a closely watched supervisory project.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much capital does it take to start a bank?',
        a: 'The FDIC has cited $15 million to $30 million as a working range, and recent community bank approvals have raised $20 million to $40 million. The binding rule is an 8% tier-1 leverage ratio maintained against projected year-three assets.',
      },
      {
        q: 'How long does the de novo application process take?',
        a: 'Roughly six to eight months from filing to FDIC decision, but the full journey from organizing group to opening day typically runs 18 to 24 months.',
      },
      {
        q: 'What is the de novo period?',
        a: 'The first three years of operation, during which the FDIC holds the bank to the capital, audit, and business-plan conditions of its approval and examines it more frequently than an established bank.',
      },
      {
        q: 'What do examiners expect from a de novo on day one?',
        a: 'Working versions of everything the business plan promised: capital at the committed level, staffed compliance and BSA functions, and operating fraud and identity verification controls, not roadmap items.',
      },
    ],
    relatedTerms: ['fdic-deposit-insurance-application', 'industrial-loan-company', 'banking-as-a-service', 'synthetic-identity-fraud'],
    relatedArticles: [
      { slug: 'de-novo-bank-day-one-fraud-program', title: 'The De Novo Bank’s Day-One Fraud Program' },
      { slug: 'how-to-start-a-bank', title: 'How to Start a Bank: The De Novo Playbook' },
      { slug: 'glades-bank-broward-de-novo', title: 'Glades Bank and Trust: A $45M Filing for the County the Banks Left Behind' },
      { slug: 'portrait-bank-winter-park-de-novo', title: 'Portrait Bank: The $43M Bet That Orlando Wants Its Hometown Bank Back' },
      { slug: 'south-carolina-de-novo-drought', title: 'No One Starts Banks in South Carolina Anymore' },
      { slug: 'florida-new-bank-charters-2026', title: "Florida's 2026 De Novo Comeback Has an $8.4 Billion Hole" },
    ],
    relatedSolution: { slug: 'de-novo-bank-technology', label: 'De novo bank technology stack' },
  },
  {
    slug: 'industrial-loan-company',
    term: 'Industrial Loan Company',
    abbreviation: 'ILC',
    updated: '2026-10-22',
    metaTitle: 'What Is an Industrial Loan Company (ILC)?',
    metaDescription:
      'An industrial loan company is an FDIC-insured, state-chartered bank a commercial company can own. How the ILC exemption works, who is applying, and the debate.',
    definition:
      'An industrial loan company (ILC), also called an industrial bank, is a state-chartered, FDIC-insured bank that a commercial company can own without becoming a bank holding company supervised by the Federal Reserve. Most are chartered in Utah, with a smaller number in Nevada.',
    sections: [
      {
        heading: 'How the ILC exemption works',
        paragraphs: [
          'The Competitive Equality Banking Act of 1987 excluded qualifying industrial loan companies from the Bank Holding Company Act’s definition of “bank.” The ILC itself is a real bank: it makes loans, takes FDIC-insured deposits, and is examined by its state regulator and the FDIC. Its parent, though, can be an automaker, a retailer or a fintech, and it does not face the consolidated Federal Reserve supervision that applies to a bank holding company.',
          'The exemption comes with limits. An ILC with more than $100 million in assets generally cannot offer demand deposits such as checking accounts unless it qualifies under a grandfather provision. Since 2021, FDIC rules (12 CFR Part 354) also require a parent company to sign written commitments with the FDIC covering capital and liquidity support for the bank, reporting, and examination of the parent’s relationship with the ILC.',
        ],
      },
      {
        heading: 'Who is applying now',
        paragraphs: [
          'ILCs have become the charter of choice for consumer fintechs and commercial companies that want insured deposits without holding company supervision. As of October 20, 2026, the FDIC’s list of pending deposit insurance applications included five proposed Utah ILCs and two in Nevada. [De Novo Watch](/de-novo-watch) tracks the full list:',
        ],
        bullets: [
          'Utah: PayPal Bank, OneMain Bank, Klarna Bank USA, Albert Bank and Flex Bank',
          'Nevada: Affirm Bank and Upgrade Bank',
        ],
      },
      {
        heading: 'Recent approvals',
        paragraphs: [
          'On January 22, 2026, the FDIC approved deposit insurance for Ford Credit Bank and GM Financial Bank, two Utah ILCs owned by automakers. Each must maintain a 15% tier 1 leverage ratio, well above the 8% the FDIC typically expects of a community de novo, along with capital and liquidity support from its parent. None of the fintech ILC applicants had received a decision as of October 2026, and OneMain’s application had been pending since March 2025.',
        ],
      },
      {
        heading: 'The debate',
        paragraphs: [
          'Critics call the exemption the ILC loophole, arguing it mixes banking and commerce and leaves the parent outside bank-level supervision. In August 2026, the Bank Policy Institute and the Independent Community Bankers of America urged the FDIC not to insure Albert, or any ILC applicant, until Congress closes it. A bill introduced in January 2026 to close the gap is pending in the Senate Banking Committee. The FDIC opened a review of its ILC policy in July 2025.',
          'For community banks the practical concern is deposits. An ILC owned by a payments app or retailer can put an insured savings account one screen away from millions of existing customers, with no branch network to fund.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is an industrial loan company FDIC insured?',
        a: 'Yes. An ILC cannot operate without FDIC deposit insurance, and the FDIC examines it alongside the state regulator. What differs is the parent: it is not supervised as a bank holding company.',
      },
      {
        q: 'Which states charter industrial loan companies?',
        a: 'Utah charters most of them, and Nevada charters a smaller number. Of the seven fintech and consumer lender ILC applications pending with the FDIC in October 2026, five were in Utah and two in Nevada.',
      },
      {
        q: 'Why do fintechs want ILC charters?',
        a: 'An ILC lets a fintech fund loans with its own insured deposits instead of renting a partner bank, and keep the economics it now shares with that partner, without the parent becoming a bank holding company.',
      },
      {
        q: 'How long does ILC approval take?',
        a: 'It varies widely and can take years. OneMain’s Utah ILC application was received by the FDIC in March 2025 and was still pending in October 2026. Track every pending application on RAVEN’s De Novo Watch.',
      },
    ],
    relatedTerms: ['de-novo-bank', 'banking-as-a-service', 'bank-account-verification'],
    relatedArticles: [
      { slug: 'fintech-bank-charter-rush-2026', title: 'PayPal, Klarna and Revolut Want Bank Charters. Here’s the Full List' },
      { slug: 'how-to-start-a-bank', title: 'How to Start a Bank: The De Novo Playbook' },
    ],
    relatedSolution: { slug: 'de-novo-bank-technology', label: 'De novo bank technology stack' },
  },
  {
    slug: 'banking-as-a-service',
    term: 'Banking-as-a-Service',
    abbreviation: 'BaaS',
    updated: '2026-10-22',
    metaTitle: 'What Is Banking-as-a-Service (BaaS)?',
    metaDescription:
      'Banking-as-a-service lets a fintech offer accounts, cards or loans through a chartered sponsor bank. How BaaS works, the regulatory crackdown, and why fintechs now want charters.',
    definition:
      'Banking-as-a-service (BaaS) is an arrangement in which a chartered bank, called the sponsor or partner bank, lets a non-bank company offer deposit accounts, cards or loans under its own brand. The bank holds the deposits or originates the loans and remains responsible to its regulators for the program.',
    sections: [
      {
        heading: 'How BaaS works',
        paragraphs: [
          'The fintech owns the app, the brand and the customer relationship. The sponsor bank holds the charter: deposits sit at the bank, usually in pooled accounts eligible for pass-through FDIC insurance, and loans are originated on the bank’s books before many are sold back to the fintech or investors. Some programs add a middleware company between the two that handles ledgers and connections. The bank earns fees and deposits; the fintech gets to market without a charter.',
          'Many of the best-known consumer fintechs run this way. Affirm works with Celtic Bank and Lead Bank, Upgrade with Cross River and Celtic, Flex with Lead Bank and Column, and Mission Lane with TAB Bank and WebBank.',
        ],
      },
      {
        heading: 'The regulatory crackdown',
        paragraphs: [
          'The model drew heavy scrutiny after 2022. Federal regulators issued final interagency guidance on third-party risk management in June 2023, and several sponsor banks entered enforcement actions over BSA/AML, consumer compliance and oversight of fintech partners, including Cross River (FDIC, 2023) and Evolve Bank & Trust (Federal Reserve, 2024).',
          'The April 2024 bankruptcy of middleware provider Synapse showed the risk to consumers: when the ledger between fintech apps and their partner banks broke down, end users lost access to funds for months. Pass-through deposit insurance only protects a customer if the bank or its agents keep records that show who owns each dollar.',
        ],
      },
      {
        heading: 'From renting a bank to becoming one',
        paragraphs: [
          'Higher compliance costs at sponsor banks, and a friendlier charter environment, have pushed fintechs toward charters of their own. As of October 2026, at least 14 of the 27 pending FDIC deposit insurance applications [came from fintechs and consumer lenders](/blog/fintech-bank-charter-rush-2026). Mission Lane, for example, plans to move its card program to its own bank over three years. For a community bank with a sponsor business, that is fee income and deposits that can leave when the partner gets a charter.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a sponsor bank?',
        a: 'The chartered, FDIC-insured bank behind a fintech’s accounts, cards or loans. It holds the deposits or originates the loans and answers to regulators for the program’s compliance.',
      },
      {
        q: 'Is money in a fintech app FDIC insured?',
        a: 'Only the portion held at an insured bank, and only if the records show which customer owns which funds. FDIC insurance does not cover the failure of the fintech or a middleware provider, which is what the Synapse bankruptcy exposed.',
      },
      {
        q: 'Why are fintechs applying for their own charters?',
        a: 'A charter lets them fund loans with their own insured deposits and keep the economics they share with a partner bank. Regulators have also been approving more charters since 2025.',
      },
    ],
    relatedTerms: ['industrial-loan-company', 'de-novo-bank', 'new-account-fraud'],
    relatedArticles: [
      { slug: 'fintech-bank-charter-rush-2026', title: 'PayPal, Klarna and Revolut Want Bank Charters. Here’s the Full List' },
      { slug: 'community-banks-lose-loans-fintechs', title: 'Why Community Banks Lose Loans to Fintechs (and How to Win Them Back)' },
    ],
  },
  {
    slug: 'loan-origination-system',
    term: 'Loan Origination System',
    abbreviation: 'LOS',
    updated: '2026-10-22',
    metaTitle: 'What Is a Loan Origination System (LOS)?',
    metaDescription:
      'A loan origination system runs a loan from application to closing. What an LOS does, mortgage vs. consumer vs. commercial systems, and which ones Southeast banks use.',
    definition:
      'A loan origination system (LOS) is the software a lender uses to move a loan from application through underwriting, approval and closing. It holds the application data, orders verifications and disclosures, routes the file to underwriters, and hands the closed loan to the core banking system for servicing.',
    sections: [
      {
        heading: 'What an LOS does',
        paragraphs: [
          'The LOS is the system of record for a loan while it is being made. A borrower usually starts in a point-of-sale (POS) front end, the online application, which feeds the LOS. From there the LOS manages the file: collecting income, employment and asset documentation, pulling credit, running decision rules, generating the disclosures the loan type requires, producing closing documents, and finally booking the loan to the core.',
          'Most of the time a loan spends in origination is spent waiting on evidence. The LOS can track that a pay stub or bank statement is missing, but it cannot make the borrower upload it faster or confirm it is real. That is why [income verification](/glossary/income-verification) and [asset verification](/glossary/asset-verification) are where applications tend to stall.',
        ],
      },
      {
        heading: 'Mortgage, consumer and commercial systems',
        paragraphs: [
          'Few banks run one LOS for everything. Mortgage origination, with its TRID disclosures and investor delivery requirements, usually runs on a dedicated mortgage LOS such as [ICE Encompass](/integrations/ice-encompass). Consumer loans and credit cards often run on a separate consumer platform such as [MeridianLink](/integrations/meridianlink). Commercial and small-business lending frequently uses a third system, such as [nCino](/integrations/ncino) or [Baker Hill](/integrations/baker-hill).',
          'The result is that one bank can present a borrower with two or three different application experiences, each with its own login, document upload and status page.',
        ],
      },
      {
        heading: 'What Southeast banks run',
        paragraphs: [
          'RAVEN’s [Bank Tech Stack](/bank-tech-stack) tracker identifies the vendors behind 32 Southeast banks and credit unions from their public application flows. As of October 2026:',
        ],
        bullets: [
          'Mortgage: ICE Encompass appears in 16 of the 22 mortgage stacks we could identify, and Finastra Mortgagebot in 4.',
          'Consumer lending: no vendor dominates. Of 11 identified consumer loan applications, MeridianLink and Finastra Mortgagebot run 3 each, four other vendors run one each, and one bank built its own.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between an LOS and a POS?',
        a: 'The point-of-sale (POS) system is the borrower-facing application. The loan origination system (LOS) is the lender’s back office that manages the file from that application through closing. Some vendors sell both, and many banks pair one vendor’s POS with another’s LOS.',
      },
      {
        q: 'What is the most common mortgage LOS?',
        a: 'ICE Encompass is the most widely used mortgage LOS in RAVEN’s Southeast tracker, appearing in 16 of the 22 mortgage stacks identified as of October 2026.',
      },
      {
        q: 'Does an LOS replace the core banking system?',
        a: 'No. The LOS handles a loan until it closes, then books it to the core banking system, which services it for the rest of its life.',
      },
      {
        q: 'Why do loans still take weeks with an LOS?',
        a: 'The LOS organizes the file but depends on the borrower and third parties for evidence: pay stubs, employment confirmations and bank statements. Waiting on and reviewing those documents is where most of the time goes.',
      },
    ],
    relatedTerms: ['income-verification', 'verification-of-employment', 'asset-verification'],
    relatedArticles: [
      { slug: 'why-it-takes-42-days-to-close-a-mortgage', title: 'Why It Takes 42 Days to Close a Mortgage (And What That’s Costing Your Bank)' },
      { slug: 'income-verification-fintech-vs-bank', title: 'The $70 Phone Call: How Fintechs Are Killing the Income Verification Tax' },
    ],
    relatedSolution: { slug: 'automated-income-verification', label: 'Automated income verification' },
  },
  {
    slug: 'digital-banking-platform',
    term: 'Digital Banking Platform',
    updated: '2026-10-22',
    metaTitle: 'What Is a Digital Banking Platform?',
    metaDescription:
      'A digital banking platform powers a bank’s online and mobile banking. How it relates to the core, who the vendors are, and which ones Southeast banks run.',
    definition:
      'A digital banking platform is the software behind a bank’s online banking website and mobile app: balances, transfers, bill pay, mobile check deposit and alerts. It sits on top of the core banking system, which keeps the actual account records.',
    sections: [
      {
        heading: 'How it fits with the core',
        paragraphs: [
          'The core banking system is the ledger: it holds accounts, posts transactions and calculates interest. The digital banking platform is the customer-facing layer that reads from and writes to the core. Banks either buy the platform from their core provider, such as Jack Henry’s Banno or Fiserv’s digital banking products, or from an independent vendor such as Q2 or Apiture that connects to many cores.',
          'Switching cores is a multi-year project, so the digital banking platform is often where a bank changes the customer experience without touching the ledger.',
        ],
      },
      {
        heading: 'What Southeast banks run',
        paragraphs: [
          'RAVEN’s [Bank Tech Stack](/bank-tech-stack) tracker identifies the vendors behind 32 Southeast banks and credit unions. Of the 17 where we could identify the digital banking platform as of October 2026:',
        ],
        bullets: [
          'Banno (Jack Henry): 7',
          'Fiserv: 5',
          'Q2: 2',
          'Apiture, FIS and Smiley Technologies: 1 each',
        ],
      },
      {
        heading: 'Where the platform stops',
        paragraphs: [
          'A digital banking platform serves people who are already customers. Opening an account or applying for a loan usually happens somewhere else. In all 5 institutions where we identified both vendors, account opening ran on a different vendor than digital banking, so a new customer’s first experience with the bank is a different product, often with a different look, login and document upload, from the app they will use afterward.',
          'That gap matters because the application is where most prospects drop out. A polished mobile app does not help a customer who abandoned the [account opening](/solutions/digital-account-opening) form before they ever got to it.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between a digital banking platform and a core banking system?',
        a: 'The core banking system keeps the account records and posts transactions. The digital banking platform is the website and mobile app customers use to see and move their money, connected to the core.',
      },
      {
        q: 'What is Banno?',
        a: 'Banno is Jack Henry’s digital banking platform for banks and credit unions. It is the most common digital banking platform in RAVEN’s Southeast tracker, used by 7 of the 17 institutions where the platform was identified as of October 2026.',
      },
      {
        q: 'Does the digital banking platform handle account opening?',
        a: 'Often not. In RAVEN’s Southeast tracker, every institution where both vendors were identified used a different vendor for account opening than for digital banking.',
      },
    ],
    relatedTerms: ['loan-origination-system', 'bank-account-verification', 'customer-identification-program'],
    relatedArticles: [
      { slug: 'best-digital-account-opening-software-community-banks', title: 'Best Digital Account Opening Software for Community Banks (2026)' },
      { slug: 'chime-account-opening-deposit-war', title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy' },
    ],
    relatedSolution: { slug: 'digital-account-opening', label: 'Digital account opening' },
  },
  {
    slug: 'know-your-customer',
    term: 'Know Your Customer',
    abbreviation: 'KYC',
    updated: '2026-10-22',
    metaTitle: 'What Is Know Your Customer (KYC) in Banking?',
    metaDescription:
      'KYC is how banks verify who a customer is and understand the risk they pose. The parts of a KYC program, how it differs from CIP, and what it means for account opening.',
    definition:
      'Know Your Customer (KYC) is the set of processes a bank uses to verify a customer’s identity, understand the nature of the relationship, and monitor it over time for suspicious activity. In the US it is not one rule but the combination of the Customer Identification Program, customer due diligence and ongoing monitoring requirements under the Bank Secrecy Act.',
    sections: [
      {
        heading: 'The parts of a KYC program',
        paragraphs: [
          'KYC is usually described in layers, each building on the last:',
        ],
        bullets: [
          '[Customer Identification Program](/glossary/customer-identification-program) (CIP): collect and verify name, date of birth, address and identification number before opening the account, and check government lists.',
          'Customer due diligence (CDD): understand what the account is for and what activity to expect, so the bank can build a risk profile. For legal entities, FinCEN’s CDD Rule, in effect since May 11, 2018, also requires identifying and verifying the beneficial owners.',
          'Enhanced due diligence (EDD): more scrutiny for higher-risk customers, such as cash-intensive businesses or politically exposed persons.',
          'Ongoing monitoring: watching activity against the expected profile, updating customer information when risk changes, and filing suspicious activity reports when warranted.',
        ],
      },
      {
        heading: 'KYC vs. CIP',
        paragraphs: [
          'CIP is the identity piece of KYC: the specific, rule-defined steps to confirm a person is who they claim to be. KYC is broader. A bank can pass CIP on an applicant whose identity is real and still miss what KYC is meant to catch: that the account will be used for something other than what was described, or that the applicant’s stated income and employment do not hold up.',
        ],
      },
      {
        heading: 'Where KYC meets account opening',
        paragraphs: [
          'For a digital applicant, every KYC question has to be answered inside the application. Each manual step, such as a document upload, a branch visit to show ID, or a callback to confirm employment, is a point where real customers abandon the form. The banks that open accounts quickly answer the same questions from authoritative sources instead: identity data verified against issuers and services like [eCBSV](/glossary/ecbsv), and the funding account and income confirmed directly with the customer’s bank or payroll provider.',
          'Speed is not the only reason. Fraud that walks through CIP, such as [synthetic identities](/glossary/synthetic-identity-fraud) and [first-party fraud](/glossary/first-party-fraud), is caught by checking the facts on the application against data the applicant cannot edit.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between KYC and CIP?',
        a: 'CIP is the identity verification requirement: collect and verify four data points and check government lists. KYC is the wider program that also includes customer due diligence, enhanced due diligence for higher-risk customers, and ongoing monitoring.',
      },
      {
        q: 'Is KYC a legal requirement for banks?',
        a: 'Yes. US banks must maintain a Customer Identification Program, perform customer due diligence including beneficial ownership for legal entity customers, and monitor accounts for suspicious activity under the Bank Secrecy Act and its implementing rules.',
      },
      {
        q: 'Can KYC be done fully online?',
        a: 'Yes. The CIP rule allows non-documentary verification, so identity, due diligence and funding checks can all be completed digitally when the bank verifies the information against reliable independent sources.',
      },
    ],
    relatedTerms: ['customer-identification-program', 'ecbsv', 'synthetic-identity-fraud'],
    relatedArticles: [
      { slug: 'account-opening-fraud-prevention', title: 'Preventing Fraud at Account Opening Without Killing the Channel' },
      { slug: '59-billion-compliance-burden', title: 'The $59 Billion Compliance Burden' },
    ],
    relatedSolution: { slug: 'kyc-software', label: 'KYC software' },
  },
  {
    slug: 'return-on-assets',
    term: 'Return on Assets',
    abbreviation: 'ROA',
    updated: '2026-10-22',
    metaTitle: 'What Is Return on Assets (ROA) for a Bank?',
    metaDescription:
      'Return on assets measures how much profit a bank earns on its balance sheet. The formula, what counts as a good ROA for a community bank, and what moves it.',
    definition:
      'Return on assets (ROA) is a bank’s net income divided by its average total assets, usually annualized. It shows how much profit the bank earns for every dollar on its balance sheet, and it is the most common single measure of bank profitability.',
    sections: [
      {
        heading: 'How ROA is calculated',
        paragraphs: [
          'ROA = net income ÷ average total assets. Quarterly figures are annualized, so a bank that earns $5 million in a quarter on $2 billion of average assets reports an ROA of about 1.0% ($20 million a year ÷ $2 billion). Using average rather than period-end assets keeps a large deposit inflow on the last day of the quarter from distorting the ratio.',
        ],
      },
      {
        heading: 'What counts as a good ROA',
        paragraphs: [
          'Banks have thin margins by design: they are highly leveraged, so a small return on assets becomes a much larger return on equity. For community banks, an ROA around 1% is the long-standing rule of thumb for solid performance, and sustained results well above that usually reflect a low-cost deposit base, a lean expense structure, or both.',
          'For example, First Community Bank in South Carolina reported a 1.34% return on average assets for the third quarter of 2026, according to its earnings release (see our [First Community profile](/blog/first-community-bank-sc-cre-merger-growth)).',
        ],
      },
      {
        heading: 'What moves it',
        paragraphs: [
          'ROA is the product of everything else on the income statement: the [net interest margin](/glossary/net-interest-margin) earned on loans and securities, fee income, operating expenses (captured in the [efficiency ratio](/glossary/efficiency-ratio)), credit losses and taxes. One-time items, such as a securities sale or a gain on a branch sale, can swing a single quarter, which is why analysts look at several quarters or a core ROA that strips them out.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a good ROA for a bank?',
        a: 'Around 1% is the common benchmark for a well-run community bank. Results consistently above that point to strong margins or low costs; results well below it usually mean thin margins, high expenses or elevated credit losses.',
      },
      {
        q: 'What is the difference between ROA and ROE?',
        a: 'ROA divides net income by assets; return on equity (ROE) divides it by shareholders’ equity. Because banks fund most assets with deposits, ROE is typically around ten times ROA.',
      },
      {
        q: 'Where can I find a bank’s ROA?',
        a: 'In its quarterly earnings release, or for any FDIC-insured bank in the call report data published by the FDIC.',
      },
    ],
    relatedTerms: ['net-interest-margin', 'efficiency-ratio', 'loan-to-deposit-ratio'],
    relatedArticles: [
      { slug: 'first-community-bank-sc-cre-merger-growth', title: 'First Community Bank SC: A $2.4B Bank, a Georgia Deal and a New CEO' },
      { slug: 'southern-first-bank-upstate-sc-bet', title: 'The Bank That Bet on Upstate South Carolina (And Won)' },
    ],
  },
  {
    slug: 'net-interest-margin',
    term: 'Net Interest Margin',
    abbreviation: 'NIM',
    updated: '2026-10-22',
    metaTitle: 'What Is Net Interest Margin (NIM) for a Bank?',
    metaDescription:
      'Net interest margin is the spread a bank earns between what loans and securities yield and what deposits cost. The formula, what drives it, and why deposits matter most.',
    definition:
      'Net interest margin (NIM) is a bank’s net interest income (interest earned on loans and securities minus interest paid on deposits and borrowings) divided by its average earning assets. It is the core spread that pays for a bank’s operations.',
    sections: [
      {
        heading: 'How NIM is calculated',
        paragraphs: [
          'NIM = net interest income ÷ average earning assets, annualized. Earning assets are the loans, securities and interest-bearing balances that generate interest; cash in the vault and premises do not count. Banks often report NIM on a tax-equivalent basis, grossing up tax-exempt municipal income so it compares fairly with taxable income.',
        ],
      },
      {
        heading: 'What drives it',
        paragraphs: [
          'Two sides move the margin. On the asset side: loan mix and pricing, how fast loans and securities reprice, and how much of the balance sheet sits in low-yielding securities. On the funding side: how much of the bank is funded by noninterest-bearing checking accounts versus CDs, money market accounts and wholesale borrowings.',
          'Two South Carolina banks reporting the same week show the range. First Community reported a 3.59% tax-equivalent margin for the third quarter of 2026, and Southern First reported 3.02% according to their earnings releases (see our profiles of [First Community](/blog/first-community-bank-sc-cre-merger-growth) and [Southern First](/blog/southern-first-bank-upstate-sc-bet)).',
        ],
      },
      {
        heading: 'Why deposits decide it',
        paragraphs: [
          'Loan yields are set largely by the market. Deposit costs are where a community bank has an edge or loses one. Every operating checking account a bank opens replaces higher-cost funding, which is why account opening conversion is a margin question, not just a marketing one. A bank that loses the primary checking relationship to an app keeps paying for the deposits it has to buy instead.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a good net interest margin?',
        a: 'It depends on the business model and the rate environment. Community banks with strong core deposit bases and loan-heavy balance sheets typically run higher margins than banks funded by CDs or holding large securities portfolios.',
      },
      {
        q: 'What is the difference between net interest margin and net interest spread?',
        a: 'Spread is the yield on earning assets minus the rate paid on interest-bearing liabilities. NIM divides net interest income by all earning assets, so it also credits the value of free funding such as noninterest-bearing deposits and equity.',
      },
      {
        q: 'How do rate cuts affect NIM?',
        a: 'It depends on what reprices first. Banks whose loans reset quickly while deposit costs lag can see margins compress; banks with high deposit costs that can lower them quickly can see margins expand.',
      },
    ],
    relatedTerms: ['return-on-assets', 'efficiency-ratio', 'loan-to-deposit-ratio'],
    relatedArticles: [
      { slug: 'chime-account-opening-deposit-war', title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy' },
      { slug: 'southern-first-bank-upstate-sc-bet', title: 'The Bank That Bet on Upstate South Carolina (And Won)' },
    ],
    relatedSolution: { slug: 'deposit-account-opening-software', label: 'Deposit account opening software' },
  },
  {
    slug: 'efficiency-ratio',
    term: 'Efficiency Ratio',
    updated: '2026-10-22',
    metaTitle: 'What Is a Bank Efficiency Ratio?',
    metaDescription:
      'The efficiency ratio shows how many cents a bank spends to earn a dollar of revenue. The formula, what counts as efficient, and where community bank costs go.',
    definition:
      'A bank’s efficiency ratio is its noninterest expense divided by its revenue (net interest income plus noninterest income). It shows how many cents the bank spends to earn each dollar of revenue, so lower is better.',
    sections: [
      {
        heading: 'How it is calculated',
        paragraphs: [
          'Efficiency ratio = noninterest expense ÷ (net interest income + noninterest income). A bank with $60 million in operating expenses and $100 million in revenue has an efficiency ratio of 60%: it spends 60 cents to earn each dollar. Many banks also report an adjusted ratio that excludes one-time items such as merger costs or securities losses.',
        ],
      },
      {
        heading: 'What counts as efficient',
        paragraphs: [
          'Below 60% is a common benchmark for an efficient community bank, and the best performers run in the low 50s or below. Ratios in the 70s or higher leave little room for credit losses or investment. Scale helps, which is one reason smaller banks pursue mergers, but business model matters more than size: a branch-light commercial bank and a branch-heavy retail bank of the same size can land far apart.',
        ],
      },
      {
        heading: 'Where the costs go',
        paragraphs: [
          'Salaries and benefits are the largest line at most community banks, followed by occupancy and technology. Manual work in lending and account opening shows up here directly: every application that needs someone to chase a pay stub, call an employer or review an uploaded bank statement adds staff time per loan. Automating verification is one of the few ways to grow volume without growing that line in step.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a good efficiency ratio for a bank?',
        a: 'Below 60% is generally considered efficient for a community bank, and top performers run near or below 50%. Lower means the bank spends less to earn each dollar of revenue.',
      },
      {
        q: 'Is a lower efficiency ratio always better?',
        a: 'Usually, but not always. A bank can cut its ratio by underinvesting in technology, compliance or staff, which tends to cost it later. The trend over several years says more than a single quarter.',
      },
      {
        q: 'Does the efficiency ratio include loan loss provisions?',
        a: 'No. Provisions for credit losses are excluded, so the ratio measures operating cost against revenue before credit costs.',
      },
    ],
    relatedTerms: ['return-on-assets', 'net-interest-margin', 'loan-origination-system'],
    relatedArticles: [
      { slug: '59-billion-compliance-burden', title: 'The $59 Billion Compliance Burden' },
      { slug: 'why-it-takes-42-days-to-close-a-mortgage', title: 'Why It Takes 42 Days to Close a Mortgage (And What That’s Costing Your Bank)' },
    ],
    relatedSolution: { slug: 'automated-income-verification', label: 'Automated income verification' },
  },
  {
    slug: 'loan-to-deposit-ratio',
    term: 'Loan-to-Deposit Ratio',
    abbreviation: 'LDR',
    updated: '2026-10-22',
    metaTitle: 'What Is a Loan-to-Deposit Ratio (LDR)?',
    metaDescription:
      'The loan-to-deposit ratio compares a bank’s loans with its deposits. The formula, what a high or low ratio signals, and why deposit growth limits loan growth.',
    definition:
      'The loan-to-deposit ratio (LDR) is a bank’s total loans divided by its total deposits. It shows how much of the money customers have deposited the bank has lent out, and it is a quick read on both liquidity and how hard the balance sheet is working.',
    sections: [
      {
        heading: 'How it is calculated',
        paragraphs: [
          'LDR = total loans ÷ total deposits. First Community Bank in South Carolina, for example, reported $1.61 billion in loans and $2.01 billion in deposits at September 30, 2026, a loan-to-deposit ratio of about 80%, according to its earnings release (see our [First Community profile](/blog/first-community-bank-sc-cre-merger-growth)).',
        ],
      },
      {
        heading: 'What high and low ratios signal',
        paragraphs: [
          'A low ratio, say under 70%, means much of the deposit base sits in securities or cash, which is safe but earns less. A ratio near or above 100% means the bank is lending out more than it gathers in deposits and relies on borrowings, brokered deposits or other wholesale funding to fill the gap, which costs more and can be less stable. Many community banks aim for somewhere in the 80% to 90% range.',
        ],
      },
      {
        heading: 'Why deposits limit loan growth',
        paragraphs: [
          'For a bank near the top of its range, the constraint on new lending is not demand, it is funding. Each new loan has to be matched by a new deposit or by more expensive borrowed money. That makes deposit gathering, and how easily a new customer can open and fund an account, a direct input into how much a bank can lend.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a good loan-to-deposit ratio?',
        a: 'Many community banks target roughly 80% to 90%. Lower ratios leave earnings on the table; ratios near or above 100% mean the bank depends on more expensive, less stable funding.',
      },
      {
        q: 'Can a loan-to-deposit ratio be over 100%?',
        a: 'Yes. It means the bank has lent more than its deposits and funds the difference with borrowings or other wholesale sources.',
      },
    ],
    relatedTerms: ['net-interest-margin', 'return-on-assets', 'digital-banking-platform'],
    relatedArticles: [
      { slug: 'first-community-bank-sc-cre-merger-growth', title: 'First Community Bank SC: A $2.4B Bank, a Georgia Deal and a New CEO' },
      { slug: 'chime-account-opening-deposit-war', title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy' },
    ],
    relatedSolution: { slug: 'deposit-account-opening-software', label: 'Deposit account opening software' },
  },
  {
    slug: 'cre-concentration',
    term: 'CRE Concentration',
    updated: '2026-10-22',
    metaTitle: 'CRE Concentration: The 100% and 300% Tests',
    metaDescription:
      'How regulators measure commercial real estate concentration at banks: the 100% construction test, the 300% total CRE test, and what happens when a bank crosses them.',
    definition:
      'CRE concentration is the size of a bank’s commercial real estate loan book relative to its capital. Under interagency guidance from the FDIC, Federal Reserve and OCC, banks whose CRE lending crosses set thresholds draw closer supervisory review of how they manage that risk.',
    sections: [
      {
        heading: 'The two thresholds',
        paragraphs: [
          'The 2006 interagency guidance on concentrations in commercial real estate lending names two screens, measured against the bank’s total capital (in call report analysis, commonly tier 1 capital plus the allowance for credit losses). A bank may be identified for further supervisory analysis if:',
        ],
        bullets: [
          'Construction, land development and other land loans are 100% or more of total capital, or',
          'Total CRE loans are 300% or more of total capital, and the CRE portfolio has grown 50% or more over the prior 36 months.',
        ],
      },
      {
        heading: 'What crossing them means',
        paragraphs: [
          'The thresholds are not limits. A bank above them is not breaking a rule, and many well-run community banks operate there for years. What changes is the scrutiny: examiners expect board-approved concentration limits, stress testing of the CRE book, strong appraisal and underwriting standards, and capital that reflects the risk. Banks that cannot show those controls can face pressure to slow CRE growth or hold more capital.',
          'Owner-occupied commercial property is excluded from the total CRE measure, because repayment depends on the occupant’s business rather than rents or a sale. Multifamily, non-owner-occupied office, retail and industrial property, and construction loans all count.',
        ],
      },
      {
        heading: 'Why community banks run close to the line',
        paragraphs: [
          'CRE is where many community banks have a real advantage: local knowledge of properties, developers and markets that national lenders do not have. It is also where consumer and small business lending has drifted away to fintechs and larger banks, leaving CRE as a larger share of what remains. RAVEN’s analysis of [OptimumBank](/blog/optimumbank-98-percent-cre-growth) walks through the 300% test using a real call report.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the 300% CRE concentration test?',
        a: 'Under 2006 interagency guidance, a bank whose total commercial real estate loans are 300% or more of total capital, with CRE growth of 50% or more over the prior 36 months, may be identified for closer supervisory review.',
      },
      {
        q: 'Is it illegal for a bank to exceed 300% CRE concentration?',
        a: 'No. The thresholds are screening tools, not limits. Banks above them are expected to show stronger risk management, including concentration limits, stress testing and adequate capital.',
      },
      {
        q: 'Do owner-occupied commercial loans count toward CRE concentration?',
        a: 'No. Loans secured by owner-occupied commercial property are excluded from the total CRE measure, because repayment comes from the operating business rather than the property.',
      },
    ],
    relatedTerms: ['call-report', 'return-on-assets', 'loan-to-deposit-ratio'],
    relatedArticles: [
      { slug: 'optimumbank-98-percent-cre-growth', title: 'The 98.7% Bank' },
      { slug: 'first-community-bank-sc-cre-merger-growth', title: 'First Community Bank SC: A $2.4B Bank, a Georgia Deal and a New CEO' },
    ],
  },
  {
    slug: 'call-report',
    term: 'Call Report',
    updated: '2026-10-22',
    metaTitle: 'What Is a Bank Call Report?',
    metaDescription:
      'The call report is the quarterly financial filing every FDIC-insured bank submits. What it contains, when it is due, where to find it, and the credit union equivalent.',
    definition:
      'A call report, formally the Consolidated Reports of Condition and Income, is the quarterly financial filing every FDIC-insured bank submits to its federal regulator. It contains the bank’s balance sheet, income statement and detailed schedules on loans, deposits, capital and asset quality, and almost all of it is public.',
    sections: [
      {
        heading: 'What it contains',
        paragraphs: [
          'Banks file one of three FFIEC forms depending on size and whether they have foreign offices (FFIEC 031, 041 or the streamlined 051 for smaller banks). Each covers the same core: assets and liabilities, income and expense, loans by type, past-due and nonaccrual loans, charge-offs, deposits by type, and regulatory capital. From those schedules come the ratios analysts use, such as [return on assets](/glossary/return-on-assets), [net interest margin](/glossary/net-interest-margin), the [efficiency ratio](/glossary/efficiency-ratio) and the [loan-to-deposit ratio](/glossary/loan-to-deposit-ratio).',
        ],
      },
      {
        heading: 'When it is filed and where to find it',
        paragraphs: [
          'Call reports are as of the last day of each calendar quarter and generally due 30 days later. The data is published through the FFIEC Central Data Repository and the FDIC’s BankFind Suite, which makes it the most complete public picture of any bank, including the many community banks that are not publicly traded and publish no earnings release.',
          'Credit unions file their own quarterly equivalent, the NCUA 5300 Call Report, which the NCUA publishes for every federally insured credit union.',
        ],
      },
      {
        heading: 'Why it matters',
        paragraphs: [
          'For a private community bank, the call report is often the only financial disclosure there is. RAVEN’s bank deep dives and audits start from it, alongside [HMDA](/glossary/hmda) mortgage data, to measure lending mix, growth and efficiency against peers.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How often do banks file call reports?',
        a: 'Quarterly. Each report is as of the last day of the quarter and is generally due 30 days after quarter end.',
      },
      {
        q: 'Are bank call reports public?',
        a: 'Yes, almost entirely. Call report data for every FDIC-insured bank is available through the FFIEC Central Data Repository and the FDIC’s BankFind Suite.',
      },
      {
        q: 'Do credit unions file call reports?',
        a: 'Yes. Federally insured credit unions file the NCUA 5300 Call Report each quarter, and the NCUA publishes the data.',
      },
    ],
    relatedTerms: ['return-on-assets', 'net-interest-margin', 'hmda'],
    relatedArticles: [
      { slug: 'optimumbank-98-percent-cre-growth', title: 'The 98.7% Bank' },
      { slug: 'southern-first-bank-upstate-sc-bet', title: 'The Bank That Bet on Upstate South Carolina (And Won)' },
    ],
  },
  {
    slug: 'hmda',
    term: 'HMDA',
    abbreviation: 'HMDA',
    updated: '2026-10-22',
    metaTitle: 'What Is HMDA Data? Home Mortgage Disclosure Act',
    metaDescription:
      'HMDA requires mortgage lenders to report every application they receive. Who must report, what the data includes, and how it shows a bank’s real mortgage volume.',
    definition:
      'The Home Mortgage Disclosure Act (HMDA), enacted in 1975 and implemented by Regulation C, requires most mortgage lenders to report data on every home loan application they receive. The resulting public dataset shows each lender’s applications, originations and denials by loan type, geography and borrower characteristics.',
    sections: [
      {
        heading: 'Who must report',
        paragraphs: [
          'Coverage depends on an institution’s size, location and volume. Depository institutions above an annual asset threshold with a branch in a metropolitan area generally report if they originated at least 25 closed-end mortgages in each of the two preceding calendar years, or at least 200 open-end lines of credit such as HELOCs. Many small rural banks and credit unions fall below the thresholds and do not report.',
        ],
      },
      {
        heading: 'What the data shows',
        paragraphs: [
          'Each reported application records the loan type and purpose, amount, property location, action taken (originated, denied, withdrawn and so on), and, for most lenders, pricing and borrower demographics. Lenders submit a Loan/Application Register each year, and the CFPB and FFIEC publish the combined data, with some fields modified to protect borrower privacy.',
          'For anyone studying a bank, HMDA is the best public measure of real mortgage activity: how many loans it actually closed, in which counties, and how often applications ended in denial or withdrawal.',
        ],
      },
      {
        heading: 'How RAVEN uses it',
        paragraphs: [
          'Every RAVEN audit sizes a bank’s mortgage volume from its HMDA filings rather than estimates. Combined with the [call report](/glossary/call-report), it gives a grounded picture of how much verification work a lending team actually does.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does HMDA stand for?',
        a: 'The Home Mortgage Disclosure Act, a 1975 federal law implemented by the CFPB’s Regulation C.',
      },
      {
        q: 'Which lenders have to report HMDA data?',
        a: 'Most mortgage lenders above the coverage thresholds: generally those with a metropolitan-area branch that originated at least 25 closed-end mortgages in each of the two prior years, or at least 200 open-end lines of credit, plus asset-size tests for banks and credit unions.',
      },
      {
        q: 'Is HMDA data public?',
        a: 'Yes. The CFPB and FFIEC publish it annually, with some fields modified or removed to protect borrower privacy.',
      },
    ],
    relatedTerms: ['call-report', 'income-verification', 'loan-origination-system'],
    relatedArticles: [
      { slug: 'why-it-takes-42-days-to-close-a-mortgage', title: 'Why It Takes 42 Days to Close a Mortgage (And What That’s Costing Your Bank)' },
      { slug: 'southern-first-bank-upstate-sc-bet', title: 'The Bank That Bet on Upstate South Carolina (And Won)' },
    ],
  },
  {
    slug: 'synthetic-identity-fraud',
    term: 'Synthetic Identity Fraud',
    metaTitle: 'What Is Synthetic Identity Fraud?',
    metaDescription:
      'Synthetic identity fraud combines a real SSN with a fabricated person. Why it costs lenders $6B, why community banks struggle to catch it, and what detects it.',
    definition:
      'Synthetic identity fraud is the creation of a fictitious person by combining real personally identifiable information, most often a legitimate Social Security number, with a fabricated name, date of birth, or address. The resulting identity belongs to no actual person, yet it can pass standard verification checks and build a credit history over years.',
    sections: [
      {
        heading: 'How a synthetic identity gets built',
        paragraphs: [
          'The scheme starts with an SSN that has little or no credit history attached, frequently a child’s or a recent immigrant’s. The fraudster pairs it with an invented name and applies for credit repeatedly until a lender’s system creates a credit file. From there the identity is cultivated like a real customer: small tradelines, on-time payments, growing limits. The payoff is the "bust-out," maxing every line and disappearing, sometimes years after the identity was seeded.',
          'The Federal Reserve estimates synthetic identity fraud has cost US lenders $6 billion, and calls it the fastest-growing financial crime in the country.',
        ],
      },
      {
        heading: 'Why community banks are particularly exposed',
        paragraphs: [
          'Synthetic identities have no victim to complain, so the fraud surfaces as an ordinary charge-off rather than a fraud report. Detection requires cross-referencing identity elements against authoritative sources: does this SSN’s issuance history match this date of birth, does this person exist anywhere except a credit header? Document-based onboarding, which is what most community bank processes rely on, checks none of that.',
          'The Social Security Administration’s eCBSV service (electronic SSN verification) and multi-source identity checks exist precisely for this gap: they validate that the name, SSN, and date of birth belong together according to the issuing authority, not according to the application.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How is synthetic identity fraud different from identity theft?',
        a: 'Identity theft impersonates a real person, who eventually notices and disputes. A synthetic identity is a fabricated person, so there is no victim to raise the alarm; losses usually get booked as credit losses instead of fraud.',
      },
      {
        q: 'How do lenders detect synthetic identities?',
        a: 'By validating identity elements against authoritative sources (SSA eCBSV, document + biometric checks, multi-bureau consistency) and by treating thin, fast-growing credit files with inconsistent histories as review triggers.',
      },
      {
        q: 'Why is it called a bust-out?',
        a: 'The endgame of a synthetic identity: after building credit limits over months or years, the fraudster draws every available line at once and abandons the identity.',
      },
    ],
    relatedTerms: ['first-party-fraud', 'bust-out-fraud', 'ecbsv', 'new-account-fraud'],
    relatedArticles: [
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
    ],
    relatedSolution: { slug: 'kyc-software', label: 'KYC software' },
  },
  {
    slug: 'first-party-fraud',
    term: 'First-Party Fraud',
    updated: '2026-07-13',
    metaTitle: 'First-Party Fraud: Definition, Detection & Prevention',
    metaDescription:
      'First-party fraud: a real person lying about facts or intent, now 36% of reported fraud. How it differs from third-party fraud, and how lenders detect and prevent it.',
    definition:
      'First-party fraud, sometimes called first-party abuse, is fraud committed by a person using their own, real identity while misrepresenting facts or intent for financial gain: inflating income on a loan application, disputing legitimate charges, or taking credit with no intention to repay. Because the identity is genuine, it passes the checks built to catch impostors.',
    sections: [
      {
        heading: 'The fastest-growing fraud category',
        paragraphs: [
          'LexisNexis Risk Solutions found first-party fraud made up 36% of all reported fraud in 2024, up from 15% a year earlier, overtaking scams as the leading form of fraud globally. Inflation and cost-of-living pressure feed it: ordinary customers rationalize an inflated income figure or a false chargeback in ways they never would a stolen card.',
        ],
      },
      {
        heading: 'First-party vs. third-party vs. synthetic fraud',
        paragraphs: [
          'The three categories differ in whose identity is used and where the lie lives. Third-party fraud is identity theft: a real victim, an impostor, and controls built to spot the mismatch. [Synthetic identity fraud](/glossary/synthetic-identity-fraud) fabricates a person from real elements. First-party fraud uses a genuine identity and lies about everything around it.',
        ],
        table: {
          headers: ['', 'First-party fraud', 'Third-party fraud', 'Synthetic identity fraud'],
          rows: [
            [
              'Identity used',
              'The fraudster’s own, real identity',
              'A real victim’s stolen identity',
              'A fabricated person built on real elements, often a real SSN',
            ],
            [
              'The lie',
              'The facts and intent: income, debts, repayment',
              'Who is applying',
              'That the person exists at all',
            ],
            [
              'Who disputes it',
              'No one; there is no consumer victim',
              'The person whose identity was stolen',
              'No one; the person isn’t real',
            ],
            [
              'How the loss books',
              'Usually as a credit loss or charge-off',
              'As fraud, once the victim disputes',
              'As a default with no one to pursue',
            ],
            [
              'What catches it',
              'Verifying the claims at the source',
              'Identity verification and device signals',
              'SSN validation (eCBSV) and credit-file forensics',
            ],
          ],
        },
      },
      {
        heading: 'What it looks like in practice',
        paragraphs: [],
        bullets: [
          'Application fraud: inflating income, hiding debts, or misstating employment to qualify for credit',
          'Chargeback abuse ("friendly fraud"): disputing purchases that were legitimately made and received',
          'Never-pay: opening credit with no intent to repay, sometimes after months of normal behavior',
          '[Bust-out](/glossary/bust-out-fraud): cultivating limits and drawing everything at once',
          'Goods-lost claims: asserting an ordered item never arrived',
        ],
      },
      {
        heading: 'How lenders detect first-party fraud',
        paragraphs: [
          'Detection starts from an uncomfortable fact: the applicant will pass every identity check, because the identity is real. What can be checked are the claims. Income and employment verified against the payroll system of record instead of borrower-supplied paystubs; debts read from bank transaction data instead of self-report; disputed purchases checked against delivery confirmation and usage evidence.',
          'Behavioral signals fill in the rest: credit-seeking velocity across institutions, utilization patterns, and application details that shift between attempts. The hardest part is organizational, not technical. First-party losses usually book as charge-offs, so they land on the credit team’s desk and never get studied as fraud, which means most institutions systematically undercount it.',
        ],
      },
      {
        heading: 'How to prevent first-party fraud',
        paragraphs: [
          'Prevention concentrates at origination, because that is where the misrepresentation happens. Source-data verification of income and employment (a payroll pull rather than a paystub upload) removes the easiest lie from the application. Bank transaction data surfaces undisclosed obligations before underwriting prices the loan. [eCBSV](/glossary/ecbsv) validates that name, SSN, and date of birth match Social Security records, which closes the adjacent synthetic-identity path.',
          'Source verification also deters. An applicant who knows income will be read from the payroll system rather than a document they control is far less likely to inflate it, so the control pays for itself partly in applications that never turn fraudulent.',
        ],
      },
      {
        heading: 'Why KYC doesn’t catch it',
        paragraphs: [
          'Identity verification answers "is this person real and who they say they are," and for first-party fraud the honest answer is yes. The lie lives in the facts around the identity: the income, the debts, the intent. That is why first-party losses usually surface as credit losses rather than fraud cases, quietly mispricing the loan book while the fraud program watches for impostors.',
          'The control that works is verifying the claims, not just the claimant: income and employment from payroll systems instead of paystubs, debts from bank transaction data instead of self-report, disputes checked against delivery and usage evidence. A first-party fraudster can pass an identity check; they cannot make a payroll system report income that doesn’t exist.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between first-party and third-party fraud?',
        a: 'Third-party fraud uses someone else’s identity (identity theft). First-party fraud uses one’s own identity but misrepresents facts or intent. Synthetic identity fraud sits between them: a fabricated person built on real identity elements.',
      },
      {
        q: 'What is a first-party fraudster?',
        a: 'A person who commits fraud as themselves: a real applicant with a genuine identity who inflates income, hides debts, disputes legitimate charges, or borrows with no intent to repay. They pass identity checks because the identity is authentic; the fraud is in the claims.',
      },
      {
        q: 'What is first-party abuse?',
        a: 'Another name for first-party fraud, used especially for the softer end of the spectrum: chargeback abuse, returns abuse, and promotion abuse committed by real customers on their own accounts. The mechanics are the same: a genuine identity misrepresenting facts.',
      },
      {
        q: 'How big is first-party fraud?',
        a: 'LexisNexis measured it at 36% of all reported fraud in 2024, up from 15% the year before, making it the leading fraud category globally. Each dollar lost costs North American financial institutions over $5 in total impact.',
      },
      {
        q: 'How do lenders detect first-party fraud?',
        a: 'By verifying claims at the source: payroll-based income and employment verification, bank transaction data that reveals undisclosed obligations, and behavioral signals like credit-seeking velocity. Identity checks alone cannot catch it.',
      },
      {
        q: 'Is first-party fraud a crime?',
        a: 'Yes. Knowingly misrepresenting income, employment, or debts on a loan application is fraud, and on a mortgage application it is a federal offense. In practice it is prosecuted far less often than third-party fraud because losses book as credit losses and there is no consumer victim driving a case.',
      },
    ],
    relatedTerms: ['bust-out-fraud', 'synthetic-identity-fraud', 'verification-of-employment', 'income-verification'],
    relatedArticles: [
      { slug: 'first-party-fraud-community-banks', title: 'First-Party Fraud: The Applicant Is Real. The Application Isn’t.' },
      { slug: 'one-in-116-mortgage-fraud', title: 'One in 116 Mortgage Applications Is Lying to You' },
      { slug: 'the-work-number-alternatives-community-banks', title: 'The Work Number Alternatives for Community Banks (2026)' },
    ],
    relatedSolution: { slug: 'bank-verification-software', label: 'Bank verification software' },
  },
  {
    slug: 'bust-out-fraud',
    term: 'Bust-Out Fraud',
    metaTitle: 'What Is Bust-Out Fraud?',
    metaDescription:
      'Bust-out fraud builds credit trust over months, then draws every line at once and disappears. How the scheme works, the warning signs, and why losses hide in charge-offs.',
    definition:
      'Bust-out fraud is a long-game scheme in which a fraudster, using a synthetic identity or their own, builds a trustworthy credit profile over months or years, then draws every available credit line at once and disappears. The name comes from the final move: busting out of the carefully cultivated accounts.',
    sections: [
      {
        heading: 'The three stages',
        paragraphs: [],
        bullets: [
          'Seeding: open small accounts, often with a synthetic identity that has been aged into a credit file',
          'Cultivation: months of on-time payments, gradual limit increases, new tradelines added on the strengthened profile',
          'Bust-out: max every line, sometimes paying with checks that will bounce to temporarily restore limits, then vanish',
        ],
      },
      {
        heading: 'Why it hides in the loan book',
        paragraphs: [
          'A bust-out looks like a model customer until the last week. When the loss lands, it usually books as a charge-off, a credit decision gone bad, rather than a fraud case, because there is often no identity theft victim to dispute anything. That misclassification matters: it sends the loss to the credit team instead of the fraud team, and the pattern never gets studied.',
          'Warning signs cluster late: rapid credit-seeking across institutions, utilization jumping across every line simultaneously, payment-then-draw cycles, and contact details that quietly change ahead of the draw. Earlier detection lives at onboarding: synthetic-identity checks and SSN validation stop the seeded identities before the cultivation phase begins.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is bust-out fraud first-party or synthetic?',
        a: 'Both patterns exist. Synthetic bust-outs use fabricated identities and leave no one to pursue. First-party bust-outs use real identities, and the perpetrator often claims financial hardship rather than fraud.',
      },
      {
        q: 'How long does a bust-out scheme take?',
        a: 'Typically months to two years. The cultivation phase is what makes the scheme work: the longer the good behavior, the higher the limits at bust-out time.',
      },
      {
        q: 'What stops bust-out fraud?',
        a: 'At onboarding: authoritative identity and SSN validation that catches synthetic identities before they enter the book. In the portfolio: monitoring for simultaneous utilization spikes, cross-institution credit velocity, and payment-then-draw patterns.',
      },
    ],
    relatedTerms: ['synthetic-identity-fraud', 'first-party-fraud', 'new-account-fraud'],
    relatedArticles: [
      { slug: 'first-party-fraud-community-banks', title: 'First-Party Fraud: The Applicant Is Real. The Application Isn’t.' },
    ],
    relatedSolution: { slug: 'kyc-software', label: 'KYC software' },
  },
  {
    slug: 'new-account-fraud',
    term: 'New Account Fraud',
    metaTitle: 'What Is New Account Fraud (Account Opening Fraud)?',
    metaDescription:
      'New account fraud opens bank accounts with stolen, synthetic, or misrepresented identities: mule accounts, deposit fraud, bonus abuse. Why digital channels get hit and what stops it.',
    definition:
      'New account fraud (also called account opening fraud) is the opening of a deposit or credit account using a stolen identity, a synthetic identity, or the fraudster’s own identity with intent to defraud: money mule accounts, first-deposit check fraud, or sign-up bonus abuse. It is the fraud category that made many banks turn off online account opening entirely.',
    sections: [
      {
        heading: 'The shapes it takes',
        paragraphs: [],
        bullets: [
          'Stolen-identity accounts: opened in a real victim’s name, used to receive fraud proceeds or launch further fraud',
          'Synthetic accounts: fabricated identities seeding future bust-outs',
          'Mule accounts: opened by real people (willing or duped) to move stolen money',
          'Deposit fraud: funding new accounts with bad checks and drawing before the return',
          'Bonus and promotion abuse: serial account opening for incentives',
        ],
      },
      {
        heading: 'Why digital channels got hit, and what changed',
        paragraphs: [
          'The first generation of online account opening collected the same self-reported data as the paper process, at internet speed, with no source verification. Fraud rings automated against it, and one in five financial institutions reported losing over $5 million to fraud in a recent twelve-month period. Many banks responded by shutting the channel.',
          'The current answer is verification-first opening: identity validated against authoritative sources (including SSA-level SSN checks that catch synthetics), funding accounts confirmed by direct connection instead of micro-deposits, and device and behavior signals screening the session itself. Done this way, the digital channel produces better-verified customers than the branch, because staff can’t check SSN issuance records by eye.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between new account fraud and account takeover?',
        a: 'New account fraud opens a fresh account under false pretenses; account takeover hijacks an existing customer’s account. They require different controls: verification at opening versus authentication in servicing.',
      },
      {
        q: 'Why do fraudsters open bank accounts?',
        a: 'A verified bank account is infrastructure for other crimes: a landing spot for stolen funds, a mule hop, a source of checks, or the deposit relationship that anchors future credit for a bust-out.',
      },
      {
        q: 'How do banks prevent account opening fraud without losing good applicants?',
        a: 'By replacing typed-in data with source verification. Authoritative identity checks, eCBSV SSN validation, and instant funding-account confirmation add seconds for legitimate applicants and walls for fraudulent ones.',
      },
    ],
    relatedTerms: ['synthetic-identity-fraud', 'ecbsv', 'bank-account-verification', 'first-party-fraud'],
    relatedArticles: [
      { slug: 'account-opening-fraud-prevention', title: 'Preventing Fraud at Account Opening Without Killing the Channel' },
      { slug: 'chime-account-opening-deposit-war', title: 'Chime Opens Accounts in Two Minutes. What Community Banks Can Actually Copy' },
      { slug: 'best-digital-account-opening-software-community-banks', title: 'Best Digital Account Opening Software for Community Banks (2026)' },
    ],
    relatedSolution: { slug: 'digital-account-opening', label: 'Digital account opening' },
  },
  {
    slug: 'ecbsv',
    term: 'eCBSV',
    metaTitle: 'What Is eCBSV? SSA’s SSN Verification Service',
    metaDescription:
      'eCBSV is the Social Security Administration’s electronic consent-based SSN verification service: a real-time match of name, SSN, and date of birth against SSA records.',
    definition:
      'eCBSV (electronic Consent Based Social Security Number Verification) is a Social Security Administration service that lets permitted entities verify, in real time and with the consumer’s consent, whether a name, SSN, and date of birth combination matches SSA records. It returns a yes/no match plus a death indicator, straight from the agency that issued the number.',
    sections: [
      {
        heading: 'Why it exists',
        paragraphs: [
          'Synthetic identity fraud works by attaching a fabricated person to a real SSN, usually one with no credit history. Traditional checks compare applications against credit bureau data, which a cultivated synthetic identity has already infiltrated. eCBSV checks the combination against the issuance record itself, which a synthetic identity cannot fake. Congress authorized the service in the 2018 Banking Bill specifically to combat synthetic fraud, and it launched in 2020.',
        ],
      },
      {
        heading: 'How it works in practice',
        paragraphs: [
          'The consumer provides written or electronic consent. The financial institution (or its service provider) submits name, SSN, and date of birth; SSA returns a match/no-match and a death indicator in seconds. eCBSV does not return the person’s data, only whether the submitted combination is consistent with SSA records, which keeps it privacy-preserving while killing the core synthetic-identity move.',
          'Access runs through entities enrolled with SSA, and most banks consume it through an identity verification provider rather than enrolling directly. In a verification-first onboarding flow, the check runs invisibly during account opening.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does eCBSV return?',
        a: 'A yes/no indication that the submitted name, SSN, and date of birth match SSA records, plus a death indicator. It does not return any personal data.',
      },
      {
        q: 'Who can use eCBSV?',
        a: 'Permitted entities under the statute, chiefly financial institutions and their service providers, for credit and account-opening use cases, with consumer consent. Most banks access it through an enrolled identity verification provider.',
      },
      {
        q: 'How is eCBSV different from a credit bureau SSN check?',
        a: 'Bureau checks compare against compiled credit-header data, which synthetic identities deliberately seed and can pass. eCBSV checks against the SSA issuance record itself, which a fabricated identity cannot alter.',
      },
    ],
    relatedTerms: ['synthetic-identity-fraud', 'customer-identification-program', 'new-account-fraud'],
    relatedArticles: [
      { slug: 'account-opening-fraud-prevention', title: 'Preventing Fraud at Account Opening Without Killing the Channel' },
    ],
    relatedSolution: { slug: 'kyc-software', label: 'KYC software' },
  },
  {
    slug: 'customer-identification-program',
    term: 'Customer Identification Program',
    abbreviation: 'CIP',
    metaTitle: 'Customer Identification Program (CIP) Requirements',
    metaDescription:
      'CIP is the USA PATRIOT Act requirement that banks verify the identity of everyone opening an account: the four required data points, verification methods, and recordkeeping rules.',
    definition:
      'A Customer Identification Program (CIP) is the written identity verification program every US bank must maintain under Section 326 of the USA PATRIOT Act (31 CFR 1020.220). It requires collecting and verifying identifying information from every person opening an account, keeping records of the verification, and checking applicants against government lists.',
    sections: [
      {
        heading: 'The four required data points',
        paragraphs: [
          'Before opening an account, the bank must collect, at minimum: name, date of birth, address, and an identification number (SSN or TIN for US persons). Collection is only the start; the program must then verify identity through documents, non-documentary methods, or both, within a reasonable time of account opening.',
        ],
      },
      {
        heading: 'Documentary vs. non-documentary verification',
        paragraphs: [
          'Documentary verification inspects credentials: a driver’s license, a passport. Non-documentary verification checks the claimed identity against independent sources: consumer reporting data, public databases, authoritative services like eCBSV, or contacting the customer through verified channels. Most modern programs run both, because documents alone miss the current failure mode: synthetic identities whose documents are technically genuine.',
          'The program must also address recordkeeping (identity records kept five years after account closure), customer notice that identity will be verified, and procedures for when verification fails. Examiners test whether the written program matches actual practice, and whether the bank can reconstruct, for any customer, what was verified, when, and against which source.',
        ],
      },
      {
        heading: 'CIP is a floor, not a fraud program',
        paragraphs: [
          'CIP compliance answers the regulatory question: did you verify identity as your program requires? It does not by itself answer the business question: is this applicant going to defraud you? First-party fraud, in particular, walks through CIP untouched, because the identity is real. Banks increasingly treat CIP as the base layer of a verification stack that also confirms income, employment, funding accounts, and fraud-risk signals in the same flow.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What are the CIP requirements?',
        a: 'Collect name, date of birth, address, and an ID number from every account opener; verify identity via documentary or non-documentary methods within a reasonable time; keep verification records five years after closure; give notice; and check government lists as required.',
      },
      {
        q: 'Does CIP require a physical ID document?',
        a: 'No. The rule permits documentary verification, non-documentary verification, or a combination. Fully digital account opening satisfies CIP when non-documentary methods reliably verify identity.',
      },
      {
        q: 'What do examiners look for in a CIP review?',
        a: 'That the written program is risk-based and board-approved, that actual practice matches it, and that the bank can produce verification records showing what was checked, when, and against what source for any given customer.',
      },
    ],
    relatedTerms: ['ecbsv', 'synthetic-identity-fraud', 'know-your-customer'],
    relatedArticles: [
      { slug: 'account-opening-fraud-prevention', title: 'Preventing Fraud at Account Opening Without Killing the Channel' },
      { slug: '59-billion-compliance-burden', title: 'The $59 Billion Compliance Burden' },
    ],
    relatedSolution: { slug: 'kyc-software', label: 'KYC software' },
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug);
}
