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
      { slug: 'chime-account-opening-deposit-war', title: 'The 92% Problem' },
      { slug: 'digital-account-opening-community-bank', title: 'Digital Account Opening for Community Banks' },
    ],
    relatedSolution: { slug: 'digital-account-opening', label: 'Digital account opening' },
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
    relatedTerms: ['synthetic-identity-fraud', 'bank-account-verification', 'income-verification'],
    relatedArticles: [
      { slug: 'de-novo-bank-day-one-fraud-program', title: 'The De Novo Bank’s Day-One Fraud Program' },
      { slug: 'how-to-start-a-bank', title: 'How to Start a Bank: The De Novo Playbook' },
    ],
    relatedSolution: { slug: 'de-novo-bank-technology', label: 'De novo bank technology stack' },
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
      { slug: 'chime-account-opening-deposit-war', title: 'The 92% Problem' },
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
    relatedTerms: ['ecbsv', 'synthetic-identity-fraud', 'bank-account-verification'],
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
