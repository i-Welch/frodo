// Savings scorecard rows. Every number was read on the institution's own pages
// on asOf; sources lists them. A rate we could not verify is null, never a
// guess. apy and conditionalApy are what a $10,000 balance earns (blended when
// a rate applies to only part of it). /scorecard-update re-verifies weekly.

import type { ProductRow, SavingsFacts, UnpublishedRate } from './types';

export const SAVINGS_UPDATED = '2026-11-26';

export const SAVINGS_ROWS: ProductRow<SavingsFacts>[] = [
  {
    "institution": "x-money",
    "name": "X Money account",
    "url": "https://money.x.com/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 4.0,
      "conditionalApy": 6.0,
      "condition": "with a paid X subscription (Premium, Super or Ultra, or legacy Premium+) or $1,000+ in qualifying direct deposits in a trailing 34-day period",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "FAQ: 'All other users earn 4.00% APY.' Up to 6.00% APY accurate as of 10/12/2026. From December 1, 2026 the 6.00% applies only to the first $150,000; the rest earns 4.00%. New York residents earn no APY. Availability: no subscription is required, but X says it is 'currently rolling out to U.S. residents' (50 states and DC), so not every US consumer can open it yet. No monthly account fee appears in the FAQ fee list. HQ is the licensee address on the California DFPI register; older licensing records list San Francisco.",
      "rateAsOf": "2026-10-12",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": null,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No monthly count limit stated; dollar limits vary by method and are shown in the app",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "ACH transfers are free and usually take 1 to 3 business days; instant withdrawals cost 1.75% ($0.25 minimum). Domestic wires $20 each (unlimited free for paid subscribers).",
      "atmAccess": true,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://money.x.com/",
        "what": "Up to 6.00% APY as of 10/12/2026, rollout to select US users, Cross River Bank and $10M sweep coverage, 24/7 support"
      },
      {
        "url": "https://money.x.com/en/i/faq",
        "what": "4.00% base APY, $1,000 qualifying deposit rule, $150,000 cap from Dec 1 2026, fees, joint accounts (beta), secondary accounts, cash deposits, ATM"
      },
      {
        "url": "https://www.engadget.com/2224633/x-money-begins-limited-us-rollout/",
        "what": "News context: limited US rollout began July 2026"
      },
      {
        "url": "https://dfpi.ca.gov/regulated_entity/x-payments-llc",
        "what": "X Payments LLC licensee address (Palo Alto, CA)"
      }
    ],
    "notes": []
  },
  {
    "institution": "robinhood",
    "name": "High-Yield Cash Program (brokerage cash sweep, Robinhood Gold)",
    "url": "https://robinhood.com/us/en/gold/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": null,
      "conditionalApy": 3.6,
      "condition": "with Robinhood Gold, $5/month",
      "conditionMonthlyCost": 5,
      "noRateWithoutCondition": true,
      "apyNote": "3.60% APY for Gold members as of Sept 17, 2026; no cap, no minimum. Robinhood says the program 'allows Robinhood Gold subscribers ($5 monthly subscription) to earn interest'; no rate for non-Gold self-directed accounts is published. The first $10,000 stays as a free credit balance at the broker (SIPC) and still earns the rate; amounts above are swept to FDIC program banks. No FDIC dollar limit for this sweep is stated on the pages read. Robinhood Banking (Coastal Community Bank) also pays 3.60% APY on savings but requires Gold and is by request access; it advertises up to $50 million FDIC coverage via sweep.",
      "rateAsOf": "2026-09-17",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": null,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit stated",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Bank transfers can take up to 4 to 5 days, or instant withdrawal for a 1.5% fee. Cash earns interest only once settled and not part of a pending transfer.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": null
    },
    "sources": [
      {
        "url": "https://robinhood.com/us/en/gold/",
        "what": "3.6% APY on brokerage cash for Gold, $5/month, transfer timing and 1.5% instant fee, HQ address"
      },
      {
        "url": "https://robinhood.com/us/en/support/articles/high-yield-cash-program/",
        "what": "Gold required, eligible account types incl. joint, first $10,000 as free credit balance, SIPC"
      },
      {
        "url": "https://robinhood.com/us/en/support/articles/cash-program-interest-rate/",
        "what": "3.60% for Gold members as of Sept 17, 2026; no non-Gold rate stated"
      },
      {
        "url": "https://robinhood.com/us/en/banking/",
        "what": "Robinhood Banking: 3.60% APY as of 9/17/2026, Gold required, request access, up to $50M FDIC sweep, 24/7 support"
      }
    ],
    "notes": []
  },
  {
    "institution": "chime",
    "name": "Chime Savings Account",
    "url": "https://www.chime.com/savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 1.0,
      "conditionalApy": 4.0,
      "condition": "with Chime Prime status: $3,000+ in qualifying direct deposits in the past 34 days",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rates effective 10/06/26, variable. Three tiers: standard 1.00% APY; Chime Plus 3.00% APY (single qualifying direct deposit of $200+, or $400+ cumulative, in the preceding 34 days); Chime Prime 4.00% APY. Requires a Chime Checking Account. Must keep $0.01 to earn interest.",
      "rateAsOf": "2026-10-06",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit (agreement sets no limit on number of transfers)",
      "externalTransfers": false,
      "instantTransfers": false,
      "transferNotes": "Savings can only be withdrawn by online transfer to Chime Checking, which is available immediately; external transfers go through Checking. Cash deposits at retailers go to Checking, not Savings.",
      "atmAccess": false,
      "subAccounts": null,
      "jointAccounts": false,
      "cashDeposit": false
    },
    "sources": [
      {
        "url": "https://www.chime.com/savings-account/",
        "what": "1.00% base APY, Chime Plus 3.00% and Chime Prime 4.00% conditions, effective 10/06/26, partner banks, cash deposits to Checking"
      },
      {
        "url": "https://www.chime.com/policies/bancorp/savings-account-agreement/",
        "what": "Rate tiers, no transfer limits, no joint ownership, transfer rules, 24/7 Member Services"
      },
      {
        "url": "https://www.chime.com/policies/",
        "what": "Corporate address, San Francisco, CA"
      }
    ],
    "notes": []
  },
  {
    "institution": "sofi",
    "name": "SoFi Savings (SoFi Checking and Savings)",
    "url": "https://www.sofi.com/banking/savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.8,
      "conditionalApy": 3.3,
      "condition": "with Eligible Direct Deposit or $5,000+ in Qualifying Deposits every 31 calendar days",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rate sheet effective October 20, 2026. Standard 0.80% APY without direct deposit, qualifying deposits or SoFi Plus. SoFi Plus (paid subscription) members earn 4.70% APY on the first $20,000 and 3.30% above. Product page also advertises a temporary 1.10% boost for new members for up to six months. HQ is SoFi Bank, N.A.'s FDIC main office.",
      "rateAsOf": "2026-10-20",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": null,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No count limit stated; SoFi sets confidential daily and monthly dollar limits",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "ACH deposits received before 6pm ET on a business day are available the same day. Instant Transfers via FedNow run 24/7 and may carry a fee. Cash deposits (Green Dot) go to Checking only.",
      "atmAccess": false,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": false
    },
    "sources": [
      {
        "url": "https://www.sofi.com/banking/savings-account/",
        "what": "3.30% APY with direct deposit, conditions, rate as of 10/20/2026, no fees, $3M SIDP coverage"
      },
      {
        "url": "https://d32ijn7u0aqfv4.cloudfront.net/wp/wp-content/uploads/raw/SoFi-Bank-Rate-Sheet-October-20-2026.pdf",
        "what": "Rate sheet: 0.80% standard APY, 3.30% with DD, SoFi Plus 4.70% to $20,000 (redirect target of sofi.com/legal/banking-rate-sheet/)"
      },
      {
        "url": "https://www.sofi.com/SoFiBankDepositAccountAgreement/",
        "what": "Deposit Account Agreement effective Oct 22, 2026: Vaults, no debit card for savings, cash deposits not available to savings, Instant Transfers, transaction limits"
      },
      {
        "url": "https://www.sofi.com/banking/joint-bank-account/",
        "what": "Joint accounts offered"
      },
      {
        "url": "https://api.fdic.gov/banks/institutions?filters=NAME%3A%22SoFi%20Bank%2C%20National%20Association%22",
        "what": "FDIC BankFind main office: Cottonwood Heights, UT"
      }
    ],
    "notes": []
  },
  {
    "institution": "varo",
    "name": "Varo Savings Account",
    "url": "https://www.varomoney.com/savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 1.0,
      "conditionalApy": 2.38,
      "condition": "on the first $5,000 with $800+ in direct deposits and a positive balance in all Varo accounts",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "At $10,000: 3.75% on the first $5,000 and 1.00% on the rest, so 2.38% blended when qualified. Accurate as of October 5, 2026. The 3.75% applies only to the first $5,000; the remainder earns 1.00%, so a $10,000 balance that qualifies earns a blended rate below 3.75%. HQ is Varo Bank, N.A.'s FDIC main office.",
      "rateAsOf": "2026-10-05",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "Transfers between Varo Savings and the Varo Bank Account are instant. External deposits are pushed from the other bank using the Varo Savings account and routing numbers. CVS cash deposits ($20 to $500) are offered, but the pages read do not say they can go straight to Savings.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": false,
      "cashDeposit": null
    },
    "sources": [
      {
        "url": "https://www.varomoney.com/savings-account/",
        "what": "1.00% base, 3.75% on first $5,000 with conditions, as of Oct 5 2026, no fees or minimums, no joint accounts, CVS cash deposits"
      },
      {
        "url": "https://support.varomoney.com/hc/en-us/articles/21993909789204-Savings-Transfers",
        "what": "No withdrawal limit, instant internal transfers, external transfer method"
      },
      {
        "url": "https://support.varomoney.com/hc/en-us/articles/360000334946-Contact-Us",
        "what": "Support channels and hours"
      },
      {
        "url": "https://api.fdic.gov/banks/institutions?filters=NAME%3A%22Varo%20Bank%2C%20National%20Association%22",
        "what": "FDIC BankFind main office: Draper, UT"
      }
    ],
    "notes": []
  },
  {
    "institution": "current",
    "name": "Savings Pods",
    "url": "https://current.com/save/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.15,
      "conditionalApy": 2.4,
      "condition": "with at least one eligible payroll deposit of $200+ in a 35-day period",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "At $10,000: the 0.25% base and 4.00% boosted rates apply only to the first $2,000 in each of up to three pods ($6,000), so 0.15% and 2.40% blended. Current pays a 'bonus rate', not a bank APY. Both the 0.25% base and 4.00% boosted rate apply only to the first $2,000 in each of up to three pods ($6,000 total); the rest earns 0.00%, so a $10,000 balance earns a blended rate well below 0.25% (about 0.15% if $6,000 sits in pods). Disclosed rate effective August 1, 2023. Bonuses are paid daily. Monthly fee of 0 is from the fee schedule in the May 29, 2025 agreement, which names an earlier partner bank.",
      "rateAsOf": "2023-08-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": 0.01,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit (no restrictions on moving money in or out of a pod)",
      "externalTransfers": false,
      "instantTransfers": null,
      "transferNotes": "All transfers to and from Savings Pods go through the main Current account. External transfer speeds and limits were not stated on the pages read. Cash loads ($3.50 fee) go to the main account.",
      "atmAccess": false,
      "subAccounts": true,
      "jointAccounts": false,
      "cashDeposit": false
    },
    "sources": [
      {
        "url": "https://current.com/save/",
        "what": "0.25% base and up to 4.00% bonus, $2,000 per pod cap, three pods, $200 payroll deposit condition, Cross River Bank"
      },
      {
        "url": "https://current.com/savings-pods-disclaimer",
        "what": "Remaining balance earns 0.00%, effective August 1, 2023"
      },
      {
        "url": "https://support.current.com/hc/en-us/articles/4406612181275-How-do-I-earn-a-bonus-on-my-Savings-Pods",
        "what": "Bonus is not a bank-provided APY, paid daily"
      },
      {
        "url": "https://support.current.com/hc/en-us/articles/4408253372699-What-are-Savings-Pods",
        "what": "No money movement restrictions on pods"
      },
      {
        "url": "https://current.com/boost_terms_of_service/",
        "what": "In-app chat 24/7, no minimum deposit for Boost"
      },
      {
        "url": "https://current.com/",
        "what": "Cash deposit fee $3.50 per deposit"
      },
      {
        "url": "https://cdn.current.com/choice_account_agreement.pdf",
        "what": "Deposit Account Agreement last updated May 29, 2025 (names Choice Financial Group, an earlier partner): no joint ownership, pod transfers via main account, fee schedule with no monthly fee, New York, NY address"
      }
    ],
    "notes": []
  },
  {
    "institution": "ally-bank",
    "name": "Ally Savings Account",
    "url": "https://www.ally.com/bank/online-savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 3.2,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "3.20% APY accurate as of 11/24/2026, same rate in all balance tiers (under $5,000, $5,000 to $24,999.99, $25,000+). Variable. HQ is Ally Bank's FDIC main office.",
      "rateAsOf": "2026-11-24",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": 10,
      "excessWithdrawalFee": 0,
      "withdrawalLimit": "10 per statement cycle, no fee; Ally may close the account if exceeded more than occasionally",
      "externalTransfers": true,
      "instantTransfers": false,
      "transferNotes": "External ACH transfers offered at Standard (3 business days) and Next Day (1 business day) speeds; dollar limits are disclosed online or by phone at the time of transfer. Cash can be added only to an Ally Spending Account.",
      "atmAccess": false,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": false
    },
    "sources": [
      {
        "url": "https://www.ally.com/bank/online-savings-account/",
        "what": "3.20% APY as of 11/24/2026, tiers, no fees or minimums, 10-transaction limit with no fee, buckets, 24/7 support, cash only to Spending Account"
      },
      {
        "url": "https://www.ally.com/content/dam/pdf/bank/ally-bank-deposit-agreement.pdf",
        "what": "Deposit agreement (Oct 10, 2026 with Nov 20, 2026 changes): no debit card for savings, joint accounts, transfer speeds and limits"
      },
      {
        "url": "https://api.fdic.gov/banks/institutions?filters=NAME%3A%22Ally%20Bank%22",
        "what": "FDIC BankFind main office: Sandy, UT"
      }
    ],
    "notes": []
  },
  {
    "institution": "marcus",
    "name": "Marcus Online Savings Account",
    "url": "https://www.marcus.com/us/en/savings/high-yield-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 3.5,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "3.50% APY as of November 25, 2026, variable. Referral promo: a 1.00% APY boost for 3 months for referrer and new customer (up to 5 referrals). Maximum balance limits apply (amount not stated on page). Deposits issued by Goldman Sachs Bank USA, Salt Lake City Branch; HQ is the bank's FDIC main office.",
      "rateAsOf": "2026-11-25",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit",
      "externalTransfers": true,
      "instantTransfers": false,
      "transferNotes": "Same-day transfers of $100,000 or less to and from other banks; Marcus charges no transfer fee.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": null
    },
    "sources": [
      {
        "url": "https://www.marcus.com/us/en/savings/high-yield-savings",
        "what": "3.50% APY as of Nov 25 2026, referral boost, no fees, no minimum, no withdrawal limit, same-day transfers, 24/7 contact center, joint owners (page returns 403 to WebFetch; read via direct HTTP request)"
      },
      {
        "url": "https://api.fdic.gov/banks/institutions?filters=NAME%3A%22Goldman%20Sachs%20Bank%20USA%22",
        "what": "FDIC BankFind main office: New York, NY"
      }
    ],
    "notes": []
  },
  {
    "institution": "capital-one",
    "name": "360 Performance Savings",
    "url": "https://www.capitalone.com/bank/savings-accounts/online-performance-savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 3.2,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "3.20% APY on all balances (not tiered: every balance tier in the feed, from $0 to $100,000+, carries the same 3.20% APY and 3.154% interest rate), so $10,000 earns 3.20%. Read on 2026-11-26 from Capital One's own deposit-products rate feed, the endpoint the product page's scripts call to fill the rate client-side (POST https://api.capitalone.com/deposits/products/~/search with body {\"include\":[\"RATES\"],\"isRenewableRate\":true} and header Accept: application/json;v=4). Product code 3800 (360 Performance Savings, shortName PSA, matching the page's ${rates:psa:rateType=Standard Rate...} placeholder), rateType 'Standard Rate', rateStatus 'Active'. The feed gives rateEffectiveDate 2026-10-21; the product page labels the rate as variable and effective as of the current date, so rateAsOf is the date the feed was read. Rate is variable.",
      "rateAsOf": "2026-11-26",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "6 transfers per statement cycle under the disclosure, but Capital One says it is not currently enforcing the limit",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "Withdraw online or at a branch, not at an ATM. External ACH dollar limits apply but amounts are not published. ATM cash deposits generally up to $5,000 at a time.",
      "atmAccess": false,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://api.capitalone.com/deposits/products/~/search",
        "what": "Capital One rate feed (POST, include RATES): product 3800 360 Performance Savings, Standard Rate, Active, 3.20% APY / 3.154% interest at every balance tier, effective 2026-10-21"
      },
      {
        "url": "https://www.capitalone.com/bank/savings-accounts/online-performance-savings-account/",
        "what": "Product page: rate placeholder ${rates:psa:rateType=Standard Rate:interestRateType=APY:productType=simple}, applies to all balances, variable, effective as of current date"
      },
      {
        "url": "https://www.capitalone.com/assets/shell/bank/scripts/",
        "what": "Page's bank JS bundle: maps psa to product code 3800 and loads rates from productApiUrl https://api.capitalone.com + /deposits/products/~/search"
      },
      {
        "url": "https://www.capitalone.com/bank/disclosures/savings-accounts/online-performance-savings-account/",
        "what": "Disclosure: 6-transfer limit not enforced, joint ownership, ATM cash deposit limits, APY shown as NaN"
      },
      {
        "url": "https://www.capitalone.com/360savings/",
        "what": "Tried for rate; also shows NaN APY"
      },
      {
        "url": "https://api.fdic.gov/banks/institutions?filters=NAME%3A%22Capital%20One%2C%20National%20Association%22",
        "what": "FDIC BankFind main office: McLean, VA"
      }
    ],
    "notes": []
  },
  {
    "institution": "wealthfront",
    "name": "Wealthfront Cash Account",
    "url": "https://www.wealthfront.com/cash",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 3.55,
      "conditionalApy": 3.8,
      "condition": "with $1,000+/mo direct deposit (or $2,500 recurring deposits) and a funded Wealthfront investing account",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Base 3.55% APY as of 11/13/2026 on the entire balance. Ongoing +0.25% for clients who invest and deposit monthly. New clients also get a 0.65% boost for 3 months on up to $150,000; headline 'up to 4.45%' combines all three. Cash Account is a brokerage cash sweep, not a bank account; balances are SIPC-protected while in transit to program banks.",
      "rateAsOf": "2026-11-13",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 1,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit stated; unlimited free transfers",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Free instant withdrawals 24/7 to RTP or FedNow-eligible accounts; otherwise typically 1 to 2 business days. Withdrawals above $250,000 are split over several business days.",
      "atmAccess": true,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": null
    },
    "sources": [
      {
        "url": "https://www.wealthfront.com/cash",
        "what": "3.55% base APY as of 11/13/2026, +0.25% ongoing and 0.65% new-client boost terms, instant withdrawals, debit card and ATMs, $8M FDIC"
      },
      {
        "url": "https://support.wealthfront.com/hc/en-us/articles/360043196472-What-is-the-Wealthfront-Cash-Account",
        "what": "$1 minimum, joint accounts, $8M/$16M coverage, program bank sweep terms"
      },
      {
        "url": "https://support.wealthfront.com/hc/en-us/articles/360038289152-How-do-I-transfer-funds-to-and-from-Wealthfront",
        "what": "Withdrawal timing, $250,000 split rule"
      },
      {
        "url": "https://support.wealthfront.com/hc/en-us/articles/360037529012-What-level-of-support-can-I-expect-from-Wealthfront",
        "what": "Support weekdays 7am-5pm PT"
      },
      {
        "url": "https://www.wealthfront.com/static/documents/form_adv_part_2.pdf",
        "what": "HQ: 261 Hamilton Avenue, Palo Alto, CA"
      }
    ],
    "notes": []
  },
  {
    "institution": "chase",
    "name": "Chase Savings",
    "url": "https://www.chase.com/personal/savings/savings-account",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.01,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "From Chase's North Carolina consumer rate sheet (rdnc1.pdf), rates in effect as of November 20, 2026. It is the only NC sheet in Chase's rate sheet index, so it covers ZIP 28202 (Charlotte). Chase Savings pays 0.01% APY at every balance tier. Chase Premier Savings pays the same 0.01% standard rate (0.02% relationship rate only with a linked Premier Plus, Sapphire, Private Client or J.P. Morgan checking account) and charges $25 a month unless the balance is $15,000+, so it is not better for a $10,000 emergency fund.",
      "rateAsOf": "2026-11-20",
      "monthlyFee": 5,
      "waive": "balance",
      "waiveBalance": 300,
      "feeWaiver": "Any one per statement period: $300+ balance at the beginning of each day; $25+ in Autosave or other repeating automatic transfers from a personal Chase checking account; linked to a qualifying primary checking account (J.P. Morgan Private Client Checking Plus, J.P. Morgan Classic Checking, Chase Private Client Checking, Chase Sapphire Checking or Chase Premier Plus Checking); linked to a Chase College Checking account enrolled in Overdraft Protection; or an account owner under age 25.",
      "minOpen": 0,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": 0,
      "withdrawalLimit": "No limit: the deposit account agreement allows transfers and withdrawals regardless of number",
      "externalTransfers": null,
      "instantTransfers": false,
      "transferNotes": "Zelle is listed as not available on Chase Savings in the fee disclosure. The account can be linked as an Overdraft Protection backup for a Chase checking account with no transfer fee; transfers to other banks were not checked on an official page.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.chase.com/personal/savings/savings-account",
        "what": "Product page: $5 fee, waivers, no minimum to open"
      },
      {
        "url": "https://www.chase.com/content/dam/chase-ux/ratesheets/pdfs/rdnc1.pdf",
        "what": "North Carolina consumer deposit rate sheet, rates in effect November 20, 2026: Chase Savings and Premier Savings APYs"
      },
      {
        "url": "https://www.chase.com/etc/ratesheets/ratesheets_consumer.json",
        "what": "Chase rate sheet index mapping markets to rate sheet PDFs (single NC sheet)"
      },
      {
        "url": "https://www.chase.com/content/dam/chase-ux/documents/personal/checking/ABSF-en.pdf",
        "what": "Additional Banking Services and Fees, effective 11/15/2026: Chase Savings fee, waivers, services not available (Zelle, debit card), no Overdraft Protection transfer fee"
      },
      {
        "url": "https://www.chase.com/content/dam/chase-ux/documents/personal/checking/deposit-account-agreement.pdf",
        "what": "Deposit Account Agreement, effective 11/15/2026: savings withdrawals unlimited, joint accounts, phone number"
      },
      {
        "url": "https://www.chase.com/personal/savings/interest-savings",
        "what": "Chase Premier Savings page: $25 fee, $15,000 waiver, relationship rate requirements (alternative considered)"
      },
      {
        "url": "https://www.chase.com/digital/customer-service",
        "what": "Customer service phone number"
      }
    ],
    "notes": [
      "hq is the parent company's corporate headquarters, taken from secondary listings; the official pages read today did not state it.",
      "Chase's customer service page lists the phone number but no hours.",
      "ATM access: the fee disclosure lists a debit card as not available on Chase Savings but says an ATM card is available.",
      "subAccounts not verified on an official page."
    ]
  },
  {
    "institution": "bank-of-america",
    "name": "Bank of America Advantage Savings",
    "url": "https://www.bankofamerica.com/deposits/savings/savings-accounts/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.04,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "From Bank of America's Western North Carolina online rate sheet, effective November 24, 2026. The site's ZIP lookup maps 28202 to Mecklenburg County, which it assigns to the Western North Carolina rate group. Advantage Savings pays 0.04% APY at every balance tier. The rate sheet lists no Preferred Rewards or BofA Rewards rate booster for consumer Advantage Savings, so conditionalApy is null.",
      "rateAsOf": "2026-11-24",
      "monthlyFee": 8,
      "waive": "balance",
      "waiveBalance": 500,
      "feeWaiver": "Waived for the first six months on new accounts. After that, any one per statement cycle: $500+ minimum daily balance; owner has a Bank of America Advantage Relationship Banking account; an account owner is enrolled in BofA Rewards at the Preferred Plus, Preferred Honors or Premier tier; or an owner is under age 25.",
      "minOpen": 100,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No withdrawal limit or excess-withdrawal fee listed in the Personal Schedule of Fees",
      "externalTransfers": null,
      "instantTransfers": null,
      "transferNotes": "Advantage Savings can be linked as a backup account for Balance Connect overdraft protection, and the deposit agreement says there is no transfer fee for Balance Connect. Automatic transfers between accounts are offered; transfers to other banks and Zelle from savings were not confirmed on an official page.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.bankofamerica.com/deposits/savings/savings-accounts/",
        "what": "Product page: $8 fee, waivers, Balance Connect, ATM and financial center access"
      },
      {
        "url": "https://www.bankofamerica.com/deposits/bank-account-interest-rates/",
        "what": "Rates page with ZIP lookup that serves the area rate sheet"
      },
      {
        "url": "https://media.bac-assets.com/DigitalDeposit_NC_NC_Western.pdf",
        "what": "Western North Carolina consumer and business online rates, effective November 24, 2026: Advantage Savings 0.04% APY"
      },
      {
        "url": "https://www.bankofamerica.com/salesservices/deposits/resources/personal-schedule-fees/?request_locale=en_US",
        "what": "Personal Schedule of Fees, effective November 13, 2026: fee, waivers, $100 minimum to open, ATM fees"
      },
      {
        "url": "https://www.bankofamerica.com/salesservices/deposits/resources/deposit-agreements/?request_locale=en_US",
        "what": "Deposit Agreement and Disclosures, effective May 15, 2026: no Balance Connect transfer fee, co-owners, savings notice rule"
      },
      {
        "url": "https://www.bankofamerica.com/customer-service/contact-us/checking-savings/",
        "what": "Checking and savings phone number and hours"
      }
    ],
    "notes": [
      "hq is the parent company's corporate headquarters, taken from secondary listings; the official pages read today did not state it.",
      "excessWithdrawalFee is null because no such fee appears in the Personal Schedule of Fees (effective November 13, 2026) or the deposit agreement; no explicit statement of unlimited withdrawals was found.",
      "No paper checks on this account (fee schedule).",
      "subAccounts not verified on an official page."
    ]
  },
  {
    "institution": "wells-fargo",
    "name": "Wells Fargo Platinum Savings",
    "url": "https://www.wellsfargo.com/savings-cds/platinum/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.01,
      "conditionalApy": 0.05,
      "condition": "linked to a Premier Checking account (0.02% APY if linked to Prime Checking)",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rates for ZIP 28202, which Wells Fargo maps to its Charlotte metropolitan area market (Cabarrus, Cleveland, Gaston, Iredell, Mecklenburg, Rowan, Stanly and Union counties), effective 11/21/2026 to 11/27/2026, read from the rates service behind wellsfargo.com/savings-cds/rates (the rendered page showed rates as unavailable). Platinum Savings standard rate is 0.01% APY at all balances. A 3.50% APY promotion for new Wells Fargo savings customers requires a $25,000 balance within 30 days of opening, so it is excluded. Way2Save Savings also pays 0.01% APY in this market; Platinum was chosen because it adds relationship rates and unlimited withdrawals, and its fee is waived at the $10,000 balance used here.",
      "rateAsOf": "2026-11-21",
      "monthlyFee": 12,
      "waive": "balance",
      "waiveBalance": 3500,
      "feeWaiver": "$3,500 minimum daily balance each fee period, or a current U.S. Wells Fargo employee or qualified retiree.",
      "minOpen": 25,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": 0,
      "withdrawalLimit": "Unlimited withdrawals and transfers",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "Wells Fargo online banking can transfer between Wells Fargo accounts and accounts at other U.S. financial institutions after setup and verification. Platinum Savings can provide Overdraft Protection for a linked Wells Fargo checking account, and the fee schedule lists no fee for transfers from eligible savings.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.wellsfargo.com/savings-cds/platinum/",
        "what": "Product page: $12 fee and $3,500 waiver, $25 minimum, 3.50% promo terms, unlimited withdrawals, ATM access, overdraft protection, joint accounts"
      },
      {
        "url": "https://www.wellsfargo.com/savings-cds/rates/",
        "what": "Rates page; rates for ZIP 28202 read from the page's rates service (www.wellsfargo.com/xapi/product-service-research/products-rates/v1/deposit/rates): Platinum standard 0.01%, Prime 0.02%, Premier 0.05%, Way2Save 0.01%"
      },
      {
        "url": "https://www.wellsfargo.com/fetch-pdf?formNumber=CNS2013&subProductCode=ANY",
        "what": "Consumer Account Fee and Information Schedule, effective July 28, 2026: Platinum and Way2Save fees and waivers, no fee for overdraft protection transfers from savings"
      },
      {
        "url": "https://www.wellsfargo.com/fetch-pdf?formNumber=CCB2018C&subProductCode=ANY",
        "what": "Deposit Account Agreement: savings notice rule"
      },
      {
        "url": "https://www.wellsfargo.com/savings-cds/way2save/",
        "what": "Way2Save Savings page: $5 fee and waivers (alternative considered)"
      },
      {
        "url": "https://www.wellsfargo.com/online-banking/transfers/",
        "what": "Transfers to accounts at other U.S. financial institutions"
      },
      {
        "url": "https://www.wellsfargo.com/help/contact-us/",
        "what": "General banking phone number, 24/7"
      }
    ],
    "notes": [
      "hq is the parent company's corporate headquarters, taken from secondary listings; the official pages read today did not state it.",
      "Whether Zelle can send from Platinum Savings was not confirmed on an official page.",
      "Platinum Savings allows check writing (fee schedule).",
      "subAccounts not verified on an official page."
    ]
  },
  {
    "institution": "citi",
    "name": "Citi Savings",
    "url": "https://www.citi.com/banking/savings-account",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "The 3.50% Premium Boost rate needs $30,000+ in combined balances, out of reach for a $10,000 saver, so it is not counted. Rates for ZIP 28202 read from the rates service behind citi.com's savings rates page (APY accurate as of 11/25/2026). Charlotte is outside Citi's branch states, so it is priced in Citi's National Rate Region; standard APY is 0.05% for all balance ranges and the no-tier (Citi Blue) Premium Boost rate is also 0.05%. Citi's former regional high-yield product, Citi Accelerate Savings (offered in NC, SC, GA and select Florida markets), was moved to discontinued products on October 26, 2026 per the deposit agreement amendments, so Citi Savings is what a Southeast customer can open today.",
      "rateAsOf": "2026-11-25",
      "monthlyFee": 4.5,
      "waive": "balance",
      "waiveBalance": 500,
      "feeWaiver": "Any one: in a Citi Relationship Tier; any owner also owns a Citi checking account; or a $500+ average monthly balance.",
      "minOpen": 0,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": 0,
      "withdrawalLimit": "No limit on the number of withdrawals, including checks",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Supports Zelle, real-time transfers and ACH transfers. Citi Savings can be the contributing account for Safety Check, which covers Regular Checking overdrafts in $100 increments.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.citi.com/banking/savings-account",
        "what": "Product page: $4.50 fee and waivers, no minimum deposit, Premium Boost, 65,000+ fee-free ATMs, Zelle and transfers"
      },
      {
        "url": "https://www.citi.com/banking/current-interest-rates/savings-accounts?zipcode=28202",
        "what": "Savings rates page; rates for ZIP 28202 read from its rates service (www.citi.com/gcgapi/prod/public/v1/bank/rates/retrieve): National region, standard 0.05%, Premium Boost 3.50% / 4.00% / 4.35%"
      },
      {
        "url": "https://www.citi.com/content/dam/cfs/mobile/assets/JRS/popups/ao/CDAA.pdf",
        "what": "Consumer Deposit Account Agreement with amendments: fee table, no withdrawal limits, ATM card, Accelerate Savings discontinued October 26, 2026, National Rate Region, Premium Boost rules, Relationship Tier ranges, Safety Check, 24/7 phone"
      }
    ],
    "notes": [
      "hq is the parent company's corporate headquarters, taken from secondary listings; the official pages read today did not state it.",
      "cashDeposit is true for Citi branches and ATMs, but the deposit agreement names only Florida among Southeast states as a Citi branch market, so Charlotte-area customers may have no nearby branch. Non-Citi ATM fee is $2.50.",
      "The Consumer Deposit Account Agreement read is the November 20, 2025 edition with amendments last updated 11/10/2026.",
      "Premium Boost needs well over $25,000 in relationship balances; at a $10,000 balance alone a new customer earns the 0.05% standard rate.",
      "subAccounts not verified on an official page."
    ]
  },
  {
    "institution": "us-bank",
    "name": "U.S. Bank Smartly Savings",
    "url": "https://www.usbank.com/bank-accounts/savings-accounts/bank-smartly-savings.html",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": 2.0,
      "condition": "an owner has a U.S. Bank Smartly Checking, Safe Debit account or Smartly Visa Signature Card, with a Combined Qualifying Balance of $5,000 to $24,999.99 (3.50% at $25,000+)",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rates for ZIP 28202 (U.S. Bank region: Charlotte North Carolina MSA), effective 2026-11-25, read from the rates service behind the Bank Smartly Savings rate page (the rendered page showed a service error). Standard APY is 0.05% at any balance. With an eligible product, total APY is 1.00% under $5,000 CQB, 2.00% at $5,000 to $24,999.99 (the service returns 1.99969), and 3.50% at $25,000+ CQB. Rates shown are for new customers.",
      "rateAsOf": "2026-11-25",
      "monthlyFee": 5,
      "waive": "linked-account",
      "waiveBalance": null,
      "feeWaiver": "Any one: an owner on a U.S. Bank Smartly Checking or Safe Debit account; an owner on a U.S. Bank Smartly Visa Signature Card; or account holder age 17 or younger.",
      "minOpen": 25,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No monthly withdrawal limit or excess-withdrawal fee found in the pricing disclosure or deposit agreement",
      "externalTransfers": null,
      "instantTransfers": true,
      "transferNotes": "Can be linked as Overdraft Protection for a U.S. Bank checking account, and no Overdraft Protection Transfer Fee is charged for transfers from linked deposit accounts. Zelle works with eligible checking or savings accounts; recurring transfers between U.S. Bank accounts are offered.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.usbank.com/bank-accounts/savings-accounts/bank-smartly-savings.html",
        "what": "Product page: $5 fee and waivers, $25 minimum, up to 3.50% APY with eligible product, ATM fees, joint accounts"
      },
      {
        "url": "https://www.usbank.com/bank-accounts/savings-accounts/bank-smartly-savings/savings-account-interest-rates.html",
        "what": "Rate page; rates for ZIP 28202 read from its rates service (www.usbank.com/svt/usbank/zafinRateApi, product DDA4A): standard 0.05%, CQB tiers 1.00% / 2.00% / 3.50%"
      },
      {
        "url": "https://www.usbank.com/content/dam/usbank/en/documents/pdfs/disclosures/consumer-pricing-information.pdf",
        "what": "Consumer Pricing Information, effective August 10, 2026: fee, waivers, $25 minimum, rate bump rules, ATM fees, Zelle"
      },
      {
        "url": "https://www.usbank.com/content/dam/usbank/en/documents/pdfs/disclosures/your-deposit-account-agreement.pdf",
        "what": "Your Deposit Account Agreement, effective November 16, 2026: savings transaction policy, no overdraft protection fee from linked deposit accounts, ATM withdrawals from savings, 24-Hour Banking phone"
      },
      {
        "url": "https://www.usbank.com/bank-accounts/savings-accounts.html",
        "what": "Savings overview: product lineup, branch and ATM withdrawals"
      },
      {
        "url": "https://www.usbank.com/customer-service.html",
        "what": "Customer service phone number"
      }
    ],
    "notes": [
      "hq is the parent company's corporate headquarters, taken from secondary listings; the official pages read today did not state it.",
      "excessWithdrawalFee is null because no such fee appears in the Consumer Pricing Information (effective August 10, 2026) or Your Deposit Account Agreement (effective November 16, 2026); neither states unlimited withdrawals outright.",
      "The Elite Money Market (up to 4.00% APY) needs $25,000+ and is a money market, so it is excluded.",
      "U.S. Bank's customer service page gives 800-USBANKS but no hours; the deposit agreement lists it under 24-Hour Banking.",
      "subAccounts not verified on an official page."
    ]
  },
  {
    "institution": "anderson-brothers-bank",
    "name": "Regular Savings Account",
    "url": "https://www.abbank.com/personal/accounts/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.25% APY, stated as accurate and effective as of 9/17/2026. Interest accrues daily and is paid quarterly; minimum balance to earn interest is $100.",
      "rateAsOf": "2026-09-17",
      "monthlyFee": 2,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "No monthly fee. A $6 service charge applies per quarterly statement cycle if the balance drops below $100 on any day of that cycle; keeping $100 or more every day avoids it. Fee schedule also lists a $5 monthly dormant fee on savings under $100 with no activity for one year.",
      "minOpen": 50,
      "minBalanceForApy": 100,
      "withdrawalsPerMonth": 1,
      "excessWithdrawalFee": 2,
      "withdrawalLimit": "4 free withdrawals per quarterly statement, $2 per debit item after",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and mobile banking transfer between ABB accounts; online banking has a Send Money to Individual feature (email or text notice, or direct deposit with routing and account numbers), and the fee schedule lists $2 for eBanking B2B or P2P outbound transfers. Zelle is not mentioned; the app offers mobile check deposit ($2,500 per day limit).",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.abbank.com/personal/accounts/savings",
        "what": "Product page: APY, as-of date, minimums, quarterly service charge, withdrawal limits, ATM card access"
      },
      {
        "url": "https://www.abbank.com/about-abb/fee-schedule",
        "what": "Fee schedule: dormant fee, P2P/B2B outbound transfer fee, foreign ATM fee"
      },
      {
        "url": "https://www.abbank.com/about-abb/contact-us",
        "what": "Customer service phone hours"
      },
      {
        "url": "https://www.abbank.com/personal/services-resources/online-banking",
        "what": "Online banking transfer and send-money features"
      },
      {
        "url": "https://www.abbank.com/personal/services-resources/mobile-banking",
        "what": "Mobile app transfers and mobile deposit limits"
      }
    ],
    "notes": []
  },
  {
    "institution": "conway-national-bank",
    "name": "Passbook Savings Account",
    "url": "https://conwaynationalbank.com/personal/personal-savings/passbook-savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.35,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.35% rate and 0.35% APY on the deposit rates page, RATES EFFECTIVE: November 25, 2026. Product page says the rate may change quarterly. This is the bank's only general-purpose savings account.",
      "rateAsOf": "2026-11-25",
      "monthlyFee": 0.33,
      "waive": "easy",
      "waiveBalance": null,
      "feeWaiver": "No monthly fee. A $1.00 quarterly maintenance fee applies if the balance falls below the minimum; the page does not define the minimum beyond the $5 opening deposit. Fee page lists a $2 monthly dormant fee after two years without customer activity.",
      "minOpen": 5,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": 2,
      "excessWithdrawalFee": 2,
      "withdrawalLimit": "6 per quarter, $2 per withdrawal after",
      "externalTransfers": null,
      "instantTransfers": null,
      "transferNotes": "The mobile app transfers money between CNB accounts and online banking includes bill pay. Transfers to other banks, Zelle and mobile check deposit are not mentioned on the online or mobile banking pages. Account must be opened in person at a branch.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.conwaynationalbank.com/current-interest-rates/",
        "what": "Deposit rates page: Passbook rate and APY, effective date"
      },
      {
        "url": "https://conwaynationalbank.com/personal/personal-savings/passbook-savings-account/",
        "what": "Product page: opening minimum, quarterly maintenance fee, withdrawal fee"
      },
      {
        "url": "https://www.conwaynationalbank.com/banking-fees/",
        "what": "Fee page: dormant savings fee, ATM fees"
      },
      {
        "url": "https://www.conwaynationalbank.com/contact-us",
        "what": "Customer service and automated line numbers"
      },
      {
        "url": "https://conwaynationalbank.com/about-us/locations-hours/",
        "what": "Banking hours (no phone-specific hours published)"
      },
      {
        "url": "https://www.conwaynationalbank.com/personal/mobile-banking/",
        "what": "Mobile app features"
      },
      {
        "url": "https://www.conwaynationalbank.com/personal/online-banking/",
        "what": "Online banking features"
      }
    ],
    "notes": []
  },
  {
    "institution": "bank-of-travelers-rest",
    "name": "Personal Savings",
    "url": "https://www.bankoftravelersrest.com/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.15,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single tier ($25 and over), 0.15% rate and 0.15% APY; rates page says the APY is accurate as of October 20, 2026.",
      "rateAsOf": "2026-10-20",
      "monthlyFee": 5,
      "waive": "balance",
      "waiveBalance": 200,
      "feeWaiver": "$5 maintenance fee per statement cycle, waived with a $200 daily minimum balance or for savers under age 21",
      "minOpen": 50,
      "minBalanceForApy": 25,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 3,
      "withdrawalLimit": "6 per statement cycle, $3 per withdrawal after",
      "externalTransfers": null,
      "instantTransfers": true,
      "transferNotes": "The mobile app schedules transfers between Bank of Travelers Rest accounts, supports consumer Zelle, and offers mobile check deposit. Transfers to accounts at other banks are not mentioned.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.bankoftravelersrest.com/rates",
        "what": "Rates page: Personal Savings rate, APY, APY minimum balance, as-of date"
      },
      {
        "url": "https://www.bankoftravelersrest.com/savings",
        "what": "Product comparison: opening deposit, maintenance fee and waiver, withdrawal limit and fee"
      },
      {
        "url": "https://www.bankoftravelersrest.com/contact-us",
        "what": "Customer Support Center phone hours"
      },
      {
        "url": "https://www.bankoftravelersrest.com/mobile-banking",
        "what": "Mobile app transfers, Zelle, mobile deposit"
      }
    ],
    "notes": []
  },
  {
    "institution": "south-carolina-federal-credit-union",
    "name": "Share Savings",
    "url": "https://www.scfederal.org/savings/share-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.10% dividend rate and 0.10% APY; dividends paid only on balances over $150. The rates page still shows Effective Date: December 30, 2025 (read 2026-11-26). MY Savings pays 1.11% APY on the first $1,000 but is limited to ages 18-25, so it is excluded.",
      "rateAsOf": "2025-12-30",
      "monthlyFee": 6,
      "waive": "easy",
      "waiveBalance": null,
      "feeWaiver": "$6 monthly account service fee waived for eStatement users (Online Banking enrollment enrolls you in eStatements), members age 18 and under, and accounts open 90 days or less. A separate $6 monthly low balance fee applies if the daily balance is under $100, with the same age and new-account exceptions.",
      "minOpen": 10,
      "minBalanceForApy": 150,
      "withdrawalsPerMonth": 3,
      "excessWithdrawalFee": 5,
      "withdrawalLimit": "3 per month, $5 per withdrawal after",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online Banking transfers money between accounts at South Carolina Federal or other financial institutions. Zelle is available in Online and Mobile Banking.",
      "atmAccess": null,
      "subAccounts": true,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.scfederal.org/rates-fees/savings-certificates-rates",
        "what": "Rates page: Share Savings dividend rate, APY, minimum balance, effective date"
      },
      {
        "url": "https://www.scfederal.org/savings/share-savings",
        "what": "Product page: $10 opening deposit, dividends over $150, multiple savings accounts FAQ"
      },
      {
        "url": "https://www.scfederal.org/rates-fees/fee-schedule",
        "what": "Fee schedule: account service fee and waivers, low balance fee, withdrawal fee"
      },
      {
        "url": "https://www.scfederal.org/why-us/membership-benefits",
        "what": "Membership eligibility"
      },
      {
        "url": "https://www.scfederal.org/branches-atms",
        "what": "Branch locator (31 financial centers returned, all in SC) and Contact Center hours in footer"
      },
      {
        "url": "https://www.scfederal.org/online-mobile-banking/online-banking",
        "what": "External transfers in Online Banking"
      },
      {
        "url": "https://www.scfederal.org/online-mobile-banking/zelle",
        "what": "Zelle availability"
      }
    ],
    "notes": []
  },
  {
    "institution": "srp-federal-credit-union",
    "name": "Member Boost Savings Account",
    "url": "https://srpfcu.org/bank/accounts/member-boost-savings-account/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 1.5,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Tiered by balance: 0.37% APY under $10,000; 1.50% APY $10,000 to $49,999.99; 2.25% APY $50,000 to $249,999.99; 3.00% APY $250,000 and above. Rates page shows As of November 1, 2026 (APY accurate 11/01/2026 to 11/30/2026); the product page footnote says effective 09/01/2026 with the same tiers. A $10,000 balance is at the bottom of the 1.50% tier. One per membership, consumer accounts only. Emergency Fund Builder pays 5.00% APY only on the first $1,000 (0.37% above), so it earns less at $10,000.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No maintenance fee listed for savings. $1 per month mailed statement fee, waived with eStatements.",
      "minOpen": null,
      "minBalanceForApy": 10000,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Not stated",
      "externalTransfers": null,
      "instantTransfers": true,
      "transferNotes": "SRP Online and SRP Mobile transfer between savings, checking and loan accounts, and the app offers mobile check deposit. Pay a Person sends money by email or mobile number to anyone with a checking or savings account at a U.S. financial institution; Zelle is not mentioned.",
      "atmAccess": null,
      "subAccounts": true,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://srpfcu.org/member-news/rates/consumer-business-accounts/",
        "what": "Rates page: Member Boost tiers, Primary Savings and Savings II rates, as-of dates"
      },
      {
        "url": "https://srpfcu.org/bank/accounts/member-boost-savings-account/",
        "what": "Product page: tiered rates and terms"
      },
      {
        "url": "https://srpfcu.org/bank/accounts/savings-accounts/",
        "what": "Savings overview: $0.01 membership share"
      },
      {
        "url": "https://srpfcu.org/bank/fee-schedule/",
        "what": "Truth-in-Savings fee schedule effective September 1, 2026"
      },
      {
        "url": "https://srpfcu.org/become-a-member/",
        "what": "Community charter membership eligibility"
      },
      {
        "url": "https://srpfcu.org/contact/",
        "what": "Phone number and hours"
      },
      {
        "url": "https://srpfcu.org/locations/",
        "what": "Branch list: 13 SC, 8 GA (mobile branch not counted)"
      },
      {
        "url": "https://srpfcu.org/online-services/srp-online/",
        "what": "Online banking transfers"
      },
      {
        "url": "https://srpfcu.org/online-services/srp-mobile/",
        "what": "Mobile app transfers and mobile deposit"
      },
      {
        "url": "https://srpfcu.org/payaperson/",
        "what": "Pay a Person to accounts at other U.S. institutions"
      }
    ],
    "notes": []
  },
  {
    "institution": "safe-federal-credit-union",
    "name": "Flexible Savings",
    "url": "https://www.safefed.org/checking-savings/savings-accounts",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.15,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.15% APY (Regular Savings pays 0.10%). The rates web page shows no date; the Deposit Rate Schedule PDF says Current as of: October 15, 2026. Flexible Savings is a second savings account opened alongside the required primary Regular Savings ($5 par value).",
      "rateAsOf": "2026-10-15",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No monthly maintenance fee. A $5 per month statement mail fee applies unless enrolled in eStatements (not charged under age 18 or 65 and over).",
      "minOpen": 1,
      "minBalanceForApy": 1,
      "withdrawalsPerMonth": 1,
      "excessWithdrawalFee": 1,
      "withdrawalLimit": "1 per month, $1 fee per withdrawal after",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and Mobile Banking include Account to Account transfers to and from your external accounts outside SAFE (primary account holder only) and Pay-a-Person. Zelle is not mentioned; fee schedule lists a $10 convenience fee only for one-time debit card or ACH payments.",
      "atmAccess": null,
      "subAccounts": true,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.safefed.org/rates",
        "what": "Rates page: Flexible Savings and Regular Savings APYs"
      },
      {
        "url": "https://www.safefed.org/sites/default/files/00721%20-%20Deposit%20Rate%20Schedule.pdf",
        "what": "Deposit Rate Schedule PDF, current as of October 15, 2026"
      },
      {
        "url": "https://www.safefed.org/checking-savings/savings-accounts",
        "what": "Product page: Flexible Savings minimums and one-withdrawal limit"
      },
      {
        "url": "https://www.safefed.org/sites/default/files/SAFE%20Federal%20Credit%20Union%20Fee%20Schedule.pdf",
        "what": "Fee schedule PDF (current as of November 01, 2026): Flex Savings excessive withdrawal fee, statement mail fee"
      },
      {
        "url": "https://www.safefed.org/credit-union-membership",
        "what": "Membership eligibility overview"
      },
      {
        "url": "https://www.safefed.org/credit-union-membership/check-eligibility-location",
        "what": "Eligible counties"
      },
      {
        "url": "https://www.safefed.org/contact-support",
        "what": "Call center hours"
      },
      {
        "url": "https://www.safefed.org/branches-atms",
        "what": "Branch locator (18 branches; locator data at /json/locations-prox?service=731 lists 20 Branch entries including the Administrative Office and Operations Building)"
      },
      {
        "url": "https://www.safefed.org/checking-savings/mobile-online-banking",
        "what": "External account transfers and Pay-a-Person"
      }
    ],
    "notes": []
  },
  {
    "institution": "live-oak-bank",
    "name": "Personal High-Yield Savings",
    "url": "https://www.liveoak.bank/personal-savings/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 4.0,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate for all balances (4.00% APY, 3.92% interest rate). Rate data embedded in the page shows a rate effective date of 11/16/2026; the visible 'rates as of' field did not render in the page text.",
      "rateAsOf": "2026-11-16",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": 0.01,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit on the number of transfers; transfers capped at $250,000 per transfer day",
      "externalTransfers": true,
      "instantTransfers": false,
      "transferNotes": "Online-only account: money moves by ACH to and from linked external accounts through the Live Oak portal and mobile app (outgoing ACH arrives in 1 to 2 business days, 5 p.m. ET cutoff). Zelle is not mentioned on the savings page.",
      "atmAccess": false,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": false
    },
    "sources": [
      {
        "url": "https://www.liveoak.bank/personal-savings/",
        "what": "Product page: APY, rate effective date, fees, minimums, transfer limits, support hours, no cash deposits, no debit card"
      },
      {
        "url": "https://resources.liveoak.bank/hubfs/important-disclosures/consumer-fee-and-limits-schedule.pdf",
        "what": "Consumer fee and limits schedule (effective 6.12.24): savings monthly account fee no charge, no excess-withdrawal fee listed"
      },
      {
        "url": "https://support.liveoak.bank/personal-savings-accounts",
        "what": "Support FAQ: no limit on number of transfers, external linked accounts"
      }
    ],
    "notes": [
      "Live Oak is a branchless, nationwide digital bank headquartered in Wilmington; it has no consumer branches and does not accept cash deposits. Consider whether it fits a 'local institution' comparison.",
      "jointAccounts left null: the savings page and support FAQ do not say whether joint ownership is offered on savings (the CD FAQ allows a co-owner, but that was not confirmed for savings).",
      "subAccounts left null: not addressed on the pages read.",
      "atmAccess false: the page says the savings account does not include checks or a debit card."
    ]
  },
  {
    "institution": "north-state-bank",
    "name": "High Yield Savings",
    "url": "https://www.northstatebank.com/personal/spend-and-save/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": null,
      "conditionalApy": 1.0,
      "condition": "Companion account: only available to customers with an active North State Bank checking account or a loan (loan balance must equal or exceed $15,000)",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Premium 1.00% APY on balances up to $10,000; balances greater than $10,000 earn 0.45% APY (blended APY shown on statement). APY available as of July 1, 2026. A $10,000 balance earns 1.00%. No rate is published for the non-relationship Everyday Savings account.",
      "rateAsOf": "2026-07-01",
      "monthlyFee": 6,
      "waive": "balance",
      "waiveBalance": 500,
      "feeWaiver": "Waived with a $500 minimum daily balance",
      "minOpen": 500,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": 2,
      "excessWithdrawalFee": 3,
      "withdrawalLimit": "2 free withdrawals per month, $3 for each additional withdrawal",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and mobile banking can move money between North State Bank accounts and accounts at other financial institutions. Zelle and mobile deposit are available in the North State Bank Mobile app.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.northstatebank.com/personal/spend-and-save/savings",
        "what": "Savings page: High Yield Savings APY tiers, rate date, eligibility, fees, withdrawal limits, comparison table"
      },
      {
        "url": "https://www.northstatebank.com/personal/tools-and-resources/digital-banking",
        "what": "Digital banking: external transfers, Zelle, mobile app"
      },
      {
        "url": "https://www.northstatebank.com/about/connect/contact-us",
        "what": "Contact phone numbers and hours"
      }
    ],
    "notes": [
      "apy is null because the High Yield Savings rate requires an existing checking account or $15,000+ loan, and North State does not publish a rate for its standard Everyday Savings account.",
      "No fee schedule or truth-in-savings PDF was linked from the savings page; terms come from the savings page itself.",
      "atmAccess, subAccounts and jointAccounts not stated on the pages read."
    ]
  },
  {
    "institution": "piedmont-federal-bank",
    "name": "Statement Savings",
    "url": "https://www.piedmontfederal.bank/personal/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.05% APY (0.05% interest). The rates page date field shows the placeholder 'Month Day Year', so no rates-as-of date is published. A $0.01 minimum daily balance is required to obtain the disclosed APY.",
      "rateAsOf": null,
      "monthlyFee": 2,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "Waived with a $100 average daily balance",
      "minOpen": 100,
      "minBalanceForApy": 0.01,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Not stated",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Mobile banking can transfer funds between Piedmont Federal accounts and accounts at other institutions. Zelle is offered in online and mobile banking.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.piedmontfederal.bank/rates",
        "what": "Rates page: Statement Savings 0.05% APY, minimum opening balance, minimum balance to obtain APY"
      },
      {
        "url": "https://www.piedmontfederal.bank/personal/savings",
        "what": "Savings product comparison: opening balance, monthly fee and waiver"
      },
      {
        "url": "https://www.piedmontfederal.bank/personal-features/mobile-banking",
        "what": "Mobile banking: transfers to accounts at other institutions"
      },
      {
        "url": "https://www.piedmontfederal.bank/features/zelle",
        "what": "Zelle availability"
      },
      {
        "url": "https://www.piedmontfederal.bank/contact",
        "what": "Phone numbers and hours"
      }
    ],
    "notes": [
      "The savings page is internally inconsistent on the fee: the comparison card says 'Monthly Fee: $2 or $0' with waivers ($100 average daily balance, $2,500 in Piedmont Federal deposits, or 25 debit card purchases) followed by 'Otherwise, $20 Monthly Fee', while the footnote says the $2 fee is waived with a $100 average daily balance. Recorded $2 with the footnote waiver.",
      "The rates page lists a 'Companion Deposit Account' at 2.25% APY ($2,500 minimum), but the site sitemap files it under Certificates of Deposit and no product page could be found, so it was not used.",
      "PFStart/PFGo Savings (0.20% APY up to $2,500) is a youth account and was excluded.",
      "The Retail Fee Schedule PDF is an image with no extractable text, so withdrawal limits and excess-withdrawal fees could not be verified.",
      "atmAccess, subAccounts and jointAccounts not stated on the pages read."
    ]
  },
  {
    "institution": "coastal-credit-union",
    "name": "High Yield Savings",
    "url": "https://www.coastal24.com/products/checking-savings/savings/high-yield-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 3.0,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Premium tier 3.00% APY (2.96% dividend rate) on average daily balances of $10,000 or more, applied to the entire balance; base tier 0.10% APY at $9,999.99 or less. Tier set by the month's average daily balance. Site footer: rates current as of November 2026; APY accurate as of the last dividend declaration date.",
      "rateAsOf": null,
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 25,
      "minBalanceForApy": 10000,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit stated; the page says you can withdraw or transfer anytime",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Digital banking supports external transfers to your own accounts at other institutions and Zelle person-to-person payments; the Coastal mobile app is available.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.coastal24.com/products/checking-savings/savings/high-yield-savings",
        "what": "Product page: tiers, APY, footnote, fees, access"
      },
      {
        "url": "https://www.coastal24.com/resources/financial-information/rates/checking-savings-rates",
        "what": "Rates page: High Yield Savings and other savings rates, savings FAQ"
      },
      {
        "url": "https://www.coastal24.com/getContentAsset/12a3d4b7-d88b-4974-bc64-485ac5893269/c03b315a-46e9-462a-9072-f0e24631b193/Truth-In-Savings-Savings-and-Checking.pdf?language=en",
        "what": "Truth-in-Savings disclosure: account limitations, tier method"
      },
      {
        "url": "https://www.coastal24.com/getContentAsset/431105ab-b224-44be-8355-7460fbc2aa22/c03b315a-46e9-462a-9072-f0e24631b193/Personal-Fees.pdf?language=en",
        "what": "Personal fee schedule effective January 1, 2026: no excess-withdrawal fee listed; $5/month inactive fee after 6 months inactivity under $250"
      },
      {
        "url": "https://www.coastal24.com/getContentAsset/a71d2a5c-2f30-485b-ac2e-d9e8828e2bf7/c03b315a-46e9-462a-9072-f0e24631b193/Digital-Banking-Services-Agreement-and-Disclosure.pdf?language=en",
        "what": "Digital banking agreement: external transfers, Zelle"
      },
      {
        "url": "https://www.coastal24.com/getContentAsset/25228c05-2f45-41a3-af81-13472efe621c/c03b315a-46e9-462a-9072-f0e24631b193/16-Membership-Account-Agreement.pdf?language=en",
        "what": "Membership and account agreement: joint accounts"
      },
      {
        "url": "https://www.coastal24.com/become-a-member",
        "what": "Membership eligibility, $25 primary savings deposit"
      },
      {
        "url": "https://www.coastal24.com/about/about-coastal/locations",
        "what": "Branch locator: 17 NC branches"
      },
      {
        "url": "https://www.coastal24.com/about/support-contact/contact-us",
        "what": "Phone numbers and hours"
      }
    ],
    "notes": [
      "Membership requires a Primary Savings account ($25 deposit; $5 must stay in it).",
      "The Truth-in-Savings PDF rate schedule template lists five High Yield Savings balance tiers with blank rates; the live product and rates pages show two tiers. The web pages were used.",
      "atmAccess null: the High Yield Savings FAQ lists digital banking, transfers and branches as ways to access funds; ATM access to this account is not stated.",
      "subAccounts null: not stated whether more than one High Yield Savings account can be opened."
    ]
  },
  {
    "institution": "truliant-federal-credit-union",
    "name": "High Yield Rewards Savings",
    "url": "https://www.truliantfcu.org/bank/high-yield-rewards-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": 3.4,
      "condition": "Active Truliant checking account each month: $500+ in deposits from outside Truliant and 10+ withdrawals; the primary owner must own both the checking and the savings. Premium rate is applied automatically for the first two statement cycles.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Premium 3.400% APY on balances up to $25,000 with qualifying checking; non-premium 1.000% APY on balances above $25,000; base 0.100% APY if checking activity does not qualify. Savings rates accurate as of October 1, 2026.",
      "rateAsOf": "2026-10-01",
      "monthlyFee": 10,
      "waive": "balance",
      "waiveBalance": 1000,
      "feeWaiver": "Waived with a $1,000 average monthly balance",
      "minOpen": 1000,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Not stated",
      "externalTransfers": true,
      "instantTransfers": false,
      "transferNotes": "Online banking and the app can move money to your own accounts at other banks (outbound limits start at $3,000 a day and $10,000 per rolling 30 days; 1 to 3 business days). Truliant does not support Zelle.",
      "atmAccess": true,
      "subAccounts": false,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.truliantfcu.org/bank/high-yield-rewards-savings",
        "what": "Product page: premium, non-premium and base APY, qualification rules, fee, minimum, rate date"
      },
      {
        "url": "https://www.truliantfcu.org/rates",
        "what": "Rates page: all savings APYs and rate date"
      },
      {
        "url": "https://www.truliantfcu.org/bank/savings",
        "what": "Savings comparison: minimums, service fee, non-Truliant ATM fee on savings"
      },
      {
        "url": "https://www.truliantfcu.org/fees",
        "what": "Fee schedule: no excess-withdrawal fee listed"
      },
      {
        "url": "https://www.truliantfcu.org/knowledge-base/digital-wallet/truliant-and-the-zelle-app",
        "what": "No Zelle support"
      },
      {
        "url": "https://www.truliantfcu.org/knowledge-base/transfer-money/the-limits-on-transferring-money",
        "what": "External transfer limits"
      },
      {
        "url": "https://www.truliantfcu.org/knowledge-base/mobile-banking/external-transfers-how-long-and-why",
        "what": "External transfer timing"
      },
      {
        "url": "https://www.truliantfcu.org/bank/become-a-member",
        "what": "Membership eligibility"
      },
      {
        "url": "https://www.truliantfcu.org/locations",
        "what": "Branch list (state confirmed on branch pages)"
      },
      {
        "url": "https://www.truliantfcu.org/contact-us",
        "what": "Phone number and hours"
      }
    ],
    "notes": [
      "Truliant also has 2 branches in Virginia (Radford, Wytheville), not counted in the SC/NC/GA/FL fields.",
      "Rainy Day Savings and Save Your Way pay 0.150% APY, slightly above the High Yield Rewards base rate, but both are tied to automatic transfers from checking.",
      "Withdrawal limits for savings are not stated on public pages; Truliant says the full Deposit Account Agreement is only viewable after logging in.",
      "atmAccess true is inferred from the savings comparison table, which lists a $2.00 non-Truliant ATM fee for all three savings accounts.",
      "subAccounts false: 'One High Yield Savings account per membership.' jointAccounts true: the disclosure says joint owners exist but the primary owner must own the checking account."
    ]
  },
  {
    "institution": "allegacy-financial",
    "name": "Daily Access Savings",
    "url": "https://allegacy.org/personal/savings/daily-access",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rate table shows 0.10% APY at every tier (up to $2,500 through $25,000 or more). APY accurate as of 02.17.26. The footnote under the table says '0.30% APY applies to all balance tiers', which contradicts the table.",
      "rateAsOf": "2026-02-17",
      "monthlyFee": 3,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "No fee with a balance of $100 or more; members 23 or younger are exempt (fee schedule says the fee applies to members older than 24)",
      "minOpen": 5,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 5,
      "withdrawalLimit": "6 per month, $5 fee for each additional transaction (per fee schedule)",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Digital banking offers transfers and a pay-a-person service (network not named; Zelle not mentioned). The fee schedule lists $3 for same-day external transfers; standard external transfer terms were not found.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://allegacy.org/personal/savings/daily-access",
        "what": "Product page: rate table, rate date, minimum to open, fee FAQ, access FAQ"
      },
      {
        "url": "https://allegacy.org/rates",
        "what": "Rates page: all savings APYs including AllHealth Wellness Savings"
      },
      {
        "url": "https://allegacy.org/personal/savings",
        "what": "Savings overview: Daily Access Savings features"
      },
      {
        "url": "https://allegacy.org/sites/default/files/2026-09/Fee-Schedule-2026.08.28.pdf",
        "what": "Fee schedule effective 08.2026: excessive transactions, single service fee, external transfer fee"
      },
      {
        "url": "https://allegacy.org/disclosures/fee-schedule",
        "what": "Fee schedule web page"
      },
      {
        "url": "https://allegacy.org/banking-services/ways-to-pay",
        "what": "Pay-a-person and payment options"
      },
      {
        "url": "https://allegacy.org/about/membership",
        "what": "Membership eligibility"
      },
      {
        "url": "https://allegacy.org/locations",
        "what": "Financial center list: 20 NC locations"
      },
      {
        "url": "https://allegacy.org/contact",
        "what": "Phone numbers and hours"
      }
    ],
    "notes": [
      "Judgment call: AllHealth Wellness Savings pays 0.10% to 1.05% APY depending on monthly visits to YMCA of Northwest North Carolina or the Kaplan Center (12 visits for 1.05%; one account per household). It is technically the highest-yielding savings account but is a wellness incentive, not a general emergency-fund account, so Daily Access Savings was used. Swap if you prefer the strict rule (apy 0.10, conditionalApy 1.05).",
      "The savings overview page says 'unlimited withdrawals' for Daily Access Savings, but the fee schedule charges $5 per transaction over six per month for Savings and Money Market accounts. The fee schedule was used.",
      "The product page says there is no monthly maintenance fee but separately describes a $3 single service fee when the balance is under $100; the fee schedule lists it as $3.00 per month.",
      "atmAccess, subAccounts and jointAccounts not stated on the pages read."
    ]
  },
  {
    "institution": "united-bank-zebulon",
    "name": "Regular Savings",
    "url": "https://www.accessunited.com/personal/bank/savings-accounts",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.5,
      "conditionalApy": 0.6,
      "condition": "The Reserve Account is a partner account to Gold Checking: it requires Gold Checking, must be opened in an office, and withdrawals are only allowed as a transfer into the Gold Checking account (6 per statement cycle, $10 fee each after). 0.60% APY applies at a $10,000 balance.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Regular Savings: 0.50% rate / 0.50% APY, single rate. The Reserve Account is tiered: 0.60% APY from $0 to $74,999.99, 0.80% at $75,000 to $99,999.99, 1.16% at $100,000 to $149,999.99, 1.41% at $150,000 to $199,999.99, 1.87% at $200,000 and up. Rates page says 'Effective as of 9/18/2026'.",
      "rateAsOf": "2026-09-18",
      "monthlyFee": 1,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "The charge is $3 per quarter, not per month, and applies only if the balance falls below the $100 minimum; keep $100 or more to avoid it.",
      "minOpen": 50,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": 1,
      "excessWithdrawalFee": 2,
      "withdrawalLimit": "3 free withdrawals per quarter, $2 fee for each additional withdrawal",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Digital banking offers real-time transfers between United Bank accounts, linking of external accounts at other financial institutions, and sending money to others with an email address or cell phone number; the pages read do not name Zelle. The mobile app supports transfers and check deposit.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.accessunited.com/customer-service/current-rates",
        "what": "Current rates page: Regular Savings 0.50% APY and Reserve Account tiers, effective 9/18/2026"
      },
      {
        "url": "https://www.accessunited.com/personal/bank/savings-accounts",
        "what": "Savings accounts page: Regular Savings $50 to open, $3 per quarter below $100, 3 free withdrawals per quarter then $2; Reserve Account terms"
      },
      {
        "url": "https://www.accessunited.com/assets/files/FuG06XLm",
        "what": "Deposit Account Agreement effective August 1, 2026, incl. joint account terms and fee schedule (page 35)"
      },
      {
        "url": "https://www.accessunited.com/customer-service/contact-us",
        "what": "Call center number and hours"
      },
      {
        "url": "https://www.accessunited.com/personal/digital/online-banking",
        "what": "Digital banking transfer features"
      },
      {
        "url": "https://www.accessunited.com/personal/digital/mobile-banking",
        "what": "Mobile app features"
      }
    ],
    "notes": [
      "Monthly fee field holds $3 because that is the charge amount, but United Bank bills it quarterly; the monthly equivalent is $1.",
      "ATM access to savings and sub-accounts are not stated on the pages read, so they are null."
    ]
  },
  {
    "institution": "primesouth-bank",
    "name": "Prime Savings",
    "url": "https://www.primesouth.com/Personal/Personal-Savings/Prime-Savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.01,
      "conditionalApy": 0.5,
      "condition": "Can only be opened with a new or existing Prime Rewards Checking or Prime Interest Checking account; each monthly cycle you must have an active Prime Rewards or Prime Interest Checking account and be enrolled in e-statements. Limit 1 per SSN.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "When qualified: 0.50% APY on daily balances up to $50,000 and 0.35% APY on the portion over $50,000; 0.01% APY on the whole balance if qualifications are not met. The page says 'APYs accurate as of 11/01/2022', so the published rate is about four years old. The standard Statement Savings account publishes no rate ('competitive interest').",
      "rateAsOf": "2022-11-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 25,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "None: page says no transaction limitations apply to this account",
      "externalTransfers": null,
      "instantTransfers": true,
      "transferNotes": "Zelle is available in the PrimeSouth mobile app. Online and mobile banking list transfers between accounts and mobile check deposit; the pages read do not mention transfers to accounts at other banks.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.primesouth.com/Personal/Personal-Savings/Prime-Savings",
        "what": "Prime Savings product page: APYs, qualifications, $25 minimum, no fees, no transaction limits, 'APYs accurate as of 11/01/2022'"
      },
      {
        "url": "https://www.primesouth.com/Personal/Personal-Savings/Statement-Savings",
        "what": "Statement Savings page (no rate published; $3 monthly charge below $100)"
      },
      {
        "url": "https://www.primesouth.com/Tools-Services/Digital-Banking/zelle",
        "what": "Zelle in the mobile app"
      },
      {
        "url": "https://www.primesouth.com/Tools-Services/Digital-Banking/personal-digital-banking",
        "what": "Online and mobile banking features"
      },
      {
        "url": "https://www.primesouth.com/About-Us/contact-us",
        "what": "Support phone number"
      },
      {
        "url": "https://www.primesouth.com/About-Us/locations-hours",
        "what": "Branch lobby hours"
      }
    ],
    "notes": [
      "The only savings rate PrimeSouth publishes carries an as-of date of 11/01/2022; confirm with the bank before relying on it.",
      "No fee schedule or truth-in-savings disclosure was found online. Joint accounts, sub-accounts and ATM access to savings are not stated."
    ]
  },
  {
    "institution": "american-pride-bank",
    "name": "High Yield Savings",
    "url": "https://www.americanpride.bank/personal/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 4.0,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate of 4.00% APY shown, no tiers. The savings page says the APY is 'effective as of 01-15-2026'; the Open Now Account Rates page shows the same 4.00% APY under a footnote dated 12-12-2025. New accounts are opened at a branch.",
      "rateAsOf": "2026-01-15",
      "monthlyFee": 6,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "Waived with a $100 minimum average daily balance.",
      "minOpen": 100,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Not stated",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "Online banking offers Bank to Bank Transfers between linked American Pride accounts and accounts at other financial institutions (external cutoff 3:30 pm on business days). Free mobile app with mobile deposit for qualifying customers; no Zelle mention found on the pages read.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.americanpride.bank/personal/savings",
        "what": "Personal savings page: High Yield Savings 4.00% APY, $100 to open, $6 fee below $100 average daily balance, APY effective 01-15-2026"
      },
      {
        "url": "https://www.americanpride.bank/personal/open-now-account-rates",
        "what": "Open Now Account Rates page: High Yield Savings 4.00% APY"
      },
      {
        "url": "https://www.americanpride.bank/personal/services",
        "what": "Bank to Bank Transfers, mobile banking and mobile deposit"
      },
      {
        "url": "https://www.americanpride.bank/online-and-mobile-banking",
        "what": "Transfer cutoff times"
      },
      {
        "url": "https://www.americanpride.bank/get-to-know-us/contact-us",
        "what": "Contact page: call any branch"
      },
      {
        "url": "https://www.americanpride.bank/locations",
        "what": "Branch locator with hours"
      }
    ],
    "notes": [
      "No fee schedule or truth-in-savings disclosure was found online, so withdrawal limits, excess withdrawal fees, joint and sub-account options and ATM access to savings are unverified.",
      "The two pages give different 'effective as of' dates (01-15-2026 and 12-12-2025) for the same 4.00% APY."
    ]
  },
  {
    "institution": "delta-community-credit-union",
    "name": "Personal Savings Account",
    "url": "https://www.deltacommunitycu.com/personal/banking/savings/savings-accounts.html",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Flat 0.25% dividend rate / 0.25% APY on all balances ($0.01 and up). Savings Account Disclosure Supplement effective 11/01/26; rates page says rates are accurate as of the first business day of the current month. Dividends compound and credit monthly.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 5,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Not stated",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online banking can transfer funds to accounts you own outside the credit union, and Zelle in the Delta Community app works with an eligible checking or savings account. Savings is excluded from Online Bill Pay and Online Deposit.",
      "atmAccess": true,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.deltacommunitycu.com/home/dividend-rates.html",
        "what": "Dividend rates page: Savings 0.25% rate / 0.25% APY, $5 minimum deposit"
      },
      {
        "url": "https://www.deltacommunitycu.com/personal/banking/savings/savings-accounts.html",
        "what": "Personal Savings product page: $5 to open, $0 monthly fee, Additional Savings Accounts, ATM card access, joint owners"
      },
      {
        "url": "https://www.deltacommunitycu.com/content/dam/deltacommunitycreditunionprogram/documents/home/forms/disclosure-supplement-savings.pdf",
        "what": "Savings Account Disclosure Supplement effective 11/01/26: rate tiers, fees, transaction limitations"
      },
      {
        "url": "https://www.deltacommunitycu.com/personal/banking/personal-banking-overview/online-banking.html",
        "what": "Online banking: transfers to accounts you own outside the credit union"
      },
      {
        "url": "https://www.deltacommunitycu.com/personal/banking/personal-banking-overview/zelle.html",
        "what": "Zelle with eligible checking or savings account"
      },
      {
        "url": "https://www.deltacommunitycu.com/home/contact-us.html",
        "what": "Member phone line"
      },
      {
        "url": "https://www.deltacommunitycu.com/personal/eligibility.html",
        "what": "Membership eligibility: 20 metro Atlanta counties, partner companies, associations, relatives"
      },
      {
        "url": "https://www.deltacommunitycu.com/home/atm-and-branch-locations.html",
        "what": "Branch locator used for branch counts and hours"
      }
    ],
    "notes": [
      "GA count of 31 includes three branches behind security (Hartsfield-Jackson airport Concourse A, Technical Operations Center, General Offices) and two Kroger in-store branches; it excludes the Conference Center. The locator also lists one branch each in Florence KY, Salt Lake City UT and Southlake TX.",
      "The savings disclosure lists a $5.00 minimum balance but the rate tier starts at $0.01, so minBalanceForApy is left null. The disclosure reserves a right to 60 days notice before withdrawals but sets no monthly withdrawal count."
    ]
  },
  {
    "institution": "robins-financial-credit-union",
    "name": "Savings Account",
    "url": "https://www.robinsfcu.org/savings-accounts",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.35,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate: 0.350% dividend rate, 0.35% APY, with a $100 minimum balance required to earn the stated APY. 'Rates effective as of November 1, 2026.'",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 3,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "Charged only if the average daily balance drops below $100; waived with direct deposit, a Prestige, Advantage Checking, certificate or IRA account, a current loan, or if age 18 and under or 55 and up.",
      "minOpen": 25,
      "minBalanceForApy": 100,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "6 per month by preauthorized, automatic, internet or phone transfer, check or debit card; going over may bring a fee or account closure",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "Digital banking lets members link accounts at other financial institutions with two micro-deposits and transfer to and from them (members must meet qualifications), plus member-to-member transfers. Mobile apps are on the App Store and Google Play; no Zelle mention found on the pages read.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.robinsfcu.org/rates/dividend/savings-accounts",
        "what": "Savings rates page: 0.350% / 0.35% APY effective November 1, 2026; $3 fee below $100 and waivers"
      },
      {
        "url": "https://www.robinsfcu.org/savings-accounts",
        "what": "Savings product page: $25 to open, $100 minimum balance, account limitations"
      },
      {
        "url": "https://www.robinsfcu.org/rates/fees/consumer",
        "what": "Consumer fee schedule: savings below minimum balance fee $3 per month and qualifiers"
      },
      {
        "url": "https://www.robinsfcu.org/become-member",
        "what": "Membership eligibility"
      },
      {
        "url": "https://www.robinsfcu.org/robins-financial-history",
        "what": "List of 45 eligible Georgia counties"
      },
      {
        "url": "https://www.robinsfcu.org/contact",
        "what": "Call center numbers and hours"
      },
      {
        "url": "https://www.robinsfcu.org/guide/1/en/topic/manage-external-accounts",
        "what": "External account transfers"
      },
      {
        "url": "https://www.robinsfcu.org/guide/1/en/topic/manage-joints",
        "what": "Joint owners on shares"
      },
      {
        "url": "https://www.robinsfcu.org/locations-list",
        "what": "Branch list used for branch counts"
      }
    ],
    "notes": [
      "The fee schedule lists a $15 excessive withdrawal fee only for the Prestige Money Market; the savings account terms say only that going over the limit may bring a fee, so excessWithdrawalFee is null.",
      "ATM access to savings and sub-accounts are not stated on the pages read."
    ]
  },
  {
    "institution": "georgias-own-credit-union",
    "name": "Primary Savings",
    "url": "https://www.georgiasown.org/savings/primary-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Tiered: 0.10% APY from $5.01 to $49,999.99, 0.15% APY from $50,000 to $99,999.99, 0.20% APY at $100,000 or more. Truth-in-Savings Disclosure effective October 01, 2026 through December 31, 2026. Dividends compound and credit quarterly.",
      "rateAsOf": "2026-10-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No monthly fee, but a $5 per mailed statement fee applies unless you enroll in eStatements.",
      "minOpen": 5,
      "minBalanceForApy": 5.01,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 5,
      "withdrawalLimit": "6 withdrawals or transfers per month, $5 fee per item after",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "One-time or recurring account-to-account transfers to your checking, savings or money market accounts at other institutions, typically arriving the next business day. Zelle is available in online banking and the mobile app.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.georgiasown.org/rates-checking-savings",
        "what": "Checking and savings rates page: savings tiers and $5 excess withdrawal fee (rate table loads from the site's own rates feed)"
      },
      {
        "url": "https://www.georgiasown.org/pdf/disclosures/tis_sav_ck.pdf",
        "what": "Consumer Truth-in-Savings Disclosure effective Oct 1 to Dec 31, 2026: rates, $5 minimum, account limitations"
      },
      {
        "url": "https://www.georgiasown.org/savings/primary-savings",
        "what": "Primary Savings product page: $5 opening deposit, no monthly fee with eStatements"
      },
      {
        "url": "https://www.georgiasown.org/about-us/membership",
        "what": "Membership eligibility and county list"
      },
      {
        "url": "https://www.georgiasown.org/contact-us",
        "what": "Member Services numbers and hours"
      },
      {
        "url": "https://www.georgiasown.org/support/digital-banking/transfers",
        "what": "Internal and external (A2A) transfers"
      },
      {
        "url": "https://www.georgiasown.org/support/digital-banking/zelle",
        "what": "Zelle"
      },
      {
        "url": "https://www.georgiasown.org/locations",
        "what": "Branch list used for branch counts"
      }
    ],
    "notes": [
      "GA count of 30 is every entry under 'Georgia's Own Branches', including the self-service-only Engagement Center and the North Fulton Commercial Center.",
      "Joint accounts, sub-accounts and ATM access to savings are not stated on the pages read."
    ]
  },
  {
    "institution": "seacoast-bank",
    "name": "Seacoast Premier Savings",
    "url": "https://www.seacoastbank.com/switch600",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.5,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Tiered: 0.50% APY on $0.10 to $49,999.99; 2.00% APY on $50,000 to $349,999.99; 3.25% APY on $350,000 and up. Rates as of 8/10/26, published only in the disclosure footnote of Seacoast's $600 bundle offer pages (the $200 savings bonus needs $15,000 of new money, but the tiered APY itself has no new-money condition). Seacoast does not publish a rate for its standard Seacoast Savings or Sail Into Savings accounts. The same promo pages also say 'up to 3.35% APY', which conflicts with the 3.25% top tier in the dated footnote.",
      "rateAsOf": "2026-08-10",
      "monthlyFee": 15,
      "waive": "balance",
      "waiveBalance": 2500,
      "feeWaiver": "Keep a minimum daily balance of $2,500",
      "minOpen": 50,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": 3,
      "withdrawalLimit": "Transaction limitations apply (count not stated for Premier Savings; Seacoast's other savings accounts allow 6 withdrawals per quarter, $3 each after)",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Personal customers can transfer between Seacoast checking or savings and their accounts at other financial institutions through Manage External Accounts in online and mobile banking. Zelle is offered in online and mobile banking, with send limits of $500 per transaction and $1,000 per day.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.seacoastbank.com/switch600",
        "what": "Premier Savings tiered APY as of 8/10/26, $15 monthly fee, $2,500 waiver, $50 minimum opening deposit (offer footnote 3)"
      },
      {
        "url": "https://www.seacoastbank.com/home600",
        "what": "Same Premier Savings APY disclosure on the mortgage-customer offer page"
      },
      {
        "url": "https://www.seacoastbank.com/personal/banking/savings/compare-savings-accounts",
        "what": "Savings comparison: withdrawal limits, excess fees and ATM access for the other Seacoast savings accounts"
      },
      {
        "url": "https://www.seacoastbank.com/personal/savings/seacoast-savings",
        "what": "Seacoast Savings product page (no rate published)"
      },
      {
        "url": "https://www.seacoastbank.com/hubfs/Consumer_Account_Fees_and_Service_Charges_Rev09-25.pdf",
        "what": "Consumer fee schedule: $3 per excess savings transaction"
      },
      {
        "url": "https://www.seacoastbank.com/hubfs/Deposit%20Account%20Agreement_010126_FINAL.pdf",
        "what": "Deposit Account Agreement (joint and multiple-party ownership)"
      },
      {
        "url": "https://www.seacoastbank.com/contact-us",
        "what": "Support hours, external transfers and Zelle FAQ"
      }
    ],
    "notes": []
  },
  {
    "institution": "amerant-bank",
    "name": "Savings",
    "url": "https://www.amerantbank.com/personal/personal-savings/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Tiered: 0.05% APY from $50 to $24,999.99 (so $10,000 earns 0.05%); 0.75% APY from $25,000 and up. Rates accurate as of 11/01/2026.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 5,
      "waive": "balance",
      "waiveBalance": 300,
      "feeWaiver": "Average balance of $300 per statement cycle, or keep $1 in an Amerant Checking, Interest Checking or Money Market account on the last business day of the statement cycle",
      "minOpen": 50,
      "minBalanceForApy": 50,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 12,
      "withdrawalLimit": "6 withdrawals or transfers per statement cycle, $12 fee for each one after",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and mobile banking can transfer funds to your own or third-party accounts at other U.S. banks; transfers out of savings count toward the 6 per statement cycle limit. Zelle works with an eligible checking or savings account, and the account can receive FedNow and RTP payments.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.amerantbank.com/personal/personal-savings/",
        "what": "Savings APY tiers as of 11/01/2026, $5 fee and waivers, $50 minimum, $12 excess withdrawal fee"
      },
      {
        "url": "https://www.amerantbank.com/products/personal/personal-savings/savings/",
        "what": "Savings product page (features, fee waiver, online and mobile banking)"
      },
      {
        "url": "https://www.amerantbank.com/zelle/",
        "what": "Zelle with an eligible checking or savings account"
      },
      {
        "url": "https://media.amerantbank.com/wp-content/uploads/2022/12/AMTB-EFT-Format-Eng.pdf",
        "what": "EFT disclosure: ATM card withdrawals from savings, transfers to other U.S. banks, 6 per cycle limit"
      },
      {
        "url": "https://media.amerantbank.com/wp-content/uploads/2023/09/AMTB-Deposit-Agreement.pdf",
        "what": "Deposit Agreement effective June 15, 2026 (joint accounts)"
      },
      {
        "url": "https://www.amerantbank.com/contact-us/",
        "what": "Customer service hours"
      }
    ],
    "notes": []
  },
  {
    "institution": "ocean-bank",
    "name": "Ocean Personal Savings",
    "url": "https://www.oceanbank.com/personal/personal-banking/savings.html",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Tiered: 0.10% APY on $0 to $99,999.99; 0.20% APY on $100,000 and above. The rate sheet linked from the savings page says 'APYs are accurate as of 10/6/2025', more than a year before access; no newer rate sheet was found.",
      "rateAsOf": "2025-10-06",
      "monthlyFee": 5,
      "waive": "balance",
      "waiveBalance": 250,
      "feeWaiver": "Maintain a $250 average daily balance",
      "minOpen": 250,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 5,
      "withdrawalLimit": "6 per month, $5 per excessive transaction (fee schedule); the savings page FAQ says there is no limit on withdrawals",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and mobile banking can transfer funds between Ocean accounts and accounts at other banks, and send domestic and international wires. Zelle is offered in Ocean online and mobile banking; the pages do not say whether savings can be the Zelle funding account.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.oceanbank.com/content/dam/documents-en/deposit-account-rates.pdf",
        "what": "Deposit Account Rates (APYs accurate as of 10/6/2025)"
      },
      {
        "url": "https://www.oceanbank.com/content/dam/documents-en/personal-accounts-overview.pdf",
        "what": "Personal Checking and Savings Account Guide and Schedule of Fees (effective August 28, 2026): $250 minimum, $5 fee, $5 excess transaction fee, six per month limit"
      },
      {
        "url": "https://www.oceanbank.com/personal/personal-banking/savings.html",
        "what": "Savings product page, FAQ, ATM access, support hours"
      },
      {
        "url": "https://www.oceanbank.com/digital-banking/online-banking-mobile-banking.html",
        "what": "Online banking: Zelle, transfers to accounts at other banks"
      }
    ],
    "notes": []
  },
  {
    "institution": "suncoast-credit-union",
    "name": "High Yield Savings",
    "url": "https://www.suncoast.com/For-You/Checking-and-Savings/Savings/High-Yield-Savings-Account",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": 0.46,
      "condition": "Requires an open High Yield Checking account and at least $2,000 in combined monthly deposits into High Yield Checking and High Yield Savings (cash, check, external transfer or direct deposit; internal transfers do not count). The 4.50% APY applies only to the first $500.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Qualified: 4.50% APY on $0 to $500, 0.25% dividend rate on the portion above $500 (APY range 4.50% to 0.26%). Not qualified: 0.25% APY on the whole balance. Truth-in-Savings disclosure 'Last dividend declaration date: 03-04-25 rev 11-25-25'; the savings page shows 'APY accurate as of 03/18/2024'. conditionalApy 0.46 is our blended figure for a $10,000 balance from the published tiers, not a number printed by Suncoast. Regular Share savings also pays 0.25% APY (Share Rate Schedule, last dividend declaration 09/02/2025).",
      "rateAsOf": "2025-11-25",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 0,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No account limitations (Truth-in-Savings disclosure)",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Digital banking offers external account-to-account transfers to and from other U.S. institutions, and Pay a Person sends money to anyone by mobile number or email. Suncoast's pages do not mention Zelle.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://edge.sitecorecloud.io/suncoastcre57dd-suncoast-suncoastprod-d848/media/Project/suncoast/Files/Documents/Fees/High-Yield-Share-Rate-Schedule-English.pdf",
        "what": "High Yield Truth-in-Savings disclosure: tiers, qualification rules, no account limitations"
      },
      {
        "url": "https://edge.sitecorecloud.io/suncoastcre57dd-suncoast-suncoastprod-d848/media/Project/suncoast/Files/Documents/Fees/Share-Rate-Schedule.pdf",
        "what": "Share Rate Schedule: Regular Share 0.25% APY, $5 par share"
      },
      {
        "url": "https://www.suncoast.com/For-You/Checking-and-Savings/Savings/High-Yield-Savings-Account",
        "what": "High Yield Savings product page and FAQ: $0 to open, no monthly fees, $2,000 monthly deposit requirement"
      },
      {
        "url": "https://www.suncoast.com/For-You/Checking-and-Savings/Savings",
        "what": "Savings overview (APY accurate as of 03/18/2024)"
      },
      {
        "url": "https://www.suncoast.com/Why-Suncoast/About-Us/Rates-and-Fees",
        "what": "Rates and Fees page linking the rate schedules and fee schedule"
      },
      {
        "url": "https://www.suncoast.com/Why-Suncoast/Membership-Eligibility",
        "what": "Membership eligibility, joint accounts, 78 branches"
      },
      {
        "url": "https://www.suncoast.com/Contact-Us",
        "what": "Member Care Center hours"
      },
      {
        "url": "https://www.suncoast.com/Why-Suncoast/Digital-Banking",
        "what": "Pay a Person service"
      }
    ],
    "notes": []
  },
  {
    "institution": "vystar-credit-union",
    "name": "Primary Savings (membership share savings)",
    "url": "https://vystarcu.org/personal/bank/savings-accounts",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "0.05% dividend rate and APY on balances of $50 or more (Regular Savings pays the same). The rates page carries a Truth-in-Savings disclosure with 'Effective Date 1/22/2026'; no separate rates-as-of date is shown.",
      "rateAsOf": "2026-01-22",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 5,
      "minBalanceForApy": 50,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "6 withdrawals or transfers per month (savings FAQ); no excess fee listed",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online Banking External Transfers move money between VyStar and accounts at other financial institutions, and the fee schedule lists Person to Person (P2P) payments with no fee. VyStar's pages read for this row do not mention Zelle.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://vystarcu.org/personal/rates/savings-ira-hsa-rates",
        "what": "Savings rates: Primary and Regular Savings 0.05% APY, $50 minimum to earn dividends; disclosure effective 1/22/2026"
      },
      {
        "url": "https://vystarcu.org/personal/bank/savings-accounts",
        "what": "Savings product page: $5 to open, no fees, 6 withdrawals per month"
      },
      {
        "url": "https://assets.ctfassets.net/kw2oi7dtt7lh/15GlunYoDyqOCbdajKbm8L/ead2cd63d36e69dc275729c8722cba40/Fee_Schedule.pdf",
        "what": "Fee Schedule effective February 1, 2026"
      },
      {
        "url": "https://assets.ctfassets.net/kw2oi7dtt7lh/4rVJLccxdYZxNGMakFbiY7/7590f1a0c6541271199a194b4a5cc011/Member_Account_Disclosure.pdf",
        "what": "Membership Agreement and Disclosures (joint accounts, transaction limits, debit card)"
      },
      {
        "url": "https://vystarcu.org/why-join/become-a-member",
        "what": "Who can join, eligible FL and GA counties"
      },
      {
        "url": "https://vystarcu.org/contact-us",
        "what": "Contact Center hours, external transfers FAQ"
      }
    ],
    "notes": []
  },
  {
    "institution": "midflorida-credit-union",
    "name": "High Five Savings",
    "url": "https://www.midflorida.com/personal/savings/high-five-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.99,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Tiered: 5.00% APY (4.889% dividend rate) on balances up to $2,000, and 0.01% on the portion above $2,000. apy 0.99 is the blended APY for a $10,000 balance, computed with the blended-rate formula printed on the product page, not a number MIDFLORIDA prints. Rates effective 11/25/2026 on the Account Rates page; product page APY accurate as of September 1, 2026.",
      "rateAsOf": "2026-11-25",
      "monthlyFee": 10,
      "waive": "balance",
      "waiveBalance": 100,
      "feeWaiver": "Maintain an average daily balance of at least $100",
      "minOpen": 100,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Not stated",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Linked Accounts in online and mobile banking moves money to and from accounts at other financial institutions (usually 1 to 3 business days; holds may apply). Zelle is available in online banking and the MIDFLORIDA app.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.midflorida.com/rates/accounts",
        "what": "Account Rates effective 11/25/2026: High Five, High Yield Savings, Extreme Yield, Regular Savings"
      },
      {
        "url": "https://www.midflorida.com/personal/savings/high-five-savings",
        "what": "High Five Savings product page: tiers, blended-APY formula, $100 minimum, $10 fee, one per member, online only"
      },
      {
        "url": "https://www.midflorida.com/personal/savings/high-yield-savings",
        "what": "High Yield Savings (alternative): 3.00% APY, $25,000 to open, $30 fee"
      },
      {
        "url": "https://www.midflorida.com/resources/account-details/consumer-fees",
        "what": "Consumer fee schedule effective October 1, 2026"
      },
      {
        "url": "https://www.midflorida.com/about-us/service-area",
        "what": "Field of membership: 59 Florida counties"
      },
      {
        "url": "https://www.midflorida.com/locations",
        "what": "Branch locator (queried via its LocationSearch API)"
      },
      {
        "url": "https://www.midflorida.com/services/online-banking/linked-and-external-accounts",
        "what": "Linked Accounts transfers to other institutions"
      },
      {
        "url": "https://www.midflorida.com/services/online-banking/zelle",
        "what": "Zelle"
      }
    ],
    "notes": []
  },
  {
    "institution": "founders-federal-credit-union",
    "name": "Regular Savings Account",
    "url": "https://www.foundersfcu.com/savings-accounts",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.10% dividend rate and 0.10% APY on the dividend rates page, Rates Effective November 25, 2026. Dividends compound and credit monthly. Loyalty Select pays 4.07% APY but cannot take member deposits (it is funded only by Founders loyalty programs, with Edge Up round-ups capped at $100 a month), so it is excluded. Money Market Plus is a money market and is excluded.",
      "rateAsOf": "2026-11-25",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No monthly service fee with eStatements; accounts without eStatements are charged $2 for each periodic statement by mail. Fee schedule lists a $25 monthly dormant fee after 21 months with no member activity.",
      "minOpen": 5,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No savings withdrawal limit or excess withdrawal fee stated on the pages read; the product page says withdrawals at Founders ATMs are unlimited at no charge",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "Founders Online lets members link external accounts for electronic transfers. Founders Pay sends money only to other Founders members by account number; no Zelle mention found on the pages read.",
      "atmAccess": true,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.foundersfcu.com/dividend-rates",
        "what": "Dividend rates page: Regular Savings 0.10% APY, $5 opening deposit, monthly compounding, Rates Effective November 25, 2026, Loyalty Select and Money Market Plus rates"
      },
      {
        "url": "https://www.foundersfcu.com/savings-accounts",
        "what": "Product page: $5 minimum deposit, no monthly fee with eStatements, $2 mailed statement charge, unlimited Founders ATM withdrawals, CO-OP ATMs, joint owner, additional savings accounts"
      },
      {
        "url": "https://www.foundersfcu.com/loyalty-products-terms-and-conditions",
        "what": "Loyalty Select terms: members cannot make deposits into the account"
      },
      {
        "url": "https://www.foundersfcu.com/truth-savings-rates-and-fees-schedule",
        "what": "Rates and fees schedule as of November 24, 2026: dormant fee, statement by mail fee, ATM fees"
      },
      {
        "url": "https://www.foundersfcu.com/founders-online",
        "what": "Online banking: external transfers, mobile deposit, Founders Pay"
      },
      {
        "url": "https://www.foundersfcu.com/founders-pay",
        "what": "Founders Pay sends money only to other Founders members"
      },
      {
        "url": "https://www.foundersfcu.com/contact-information",
        "what": "Member Care phone, Call 24 line, Rock Hill Center has no teller or ATM services"
      },
      {
        "url": "https://www.foundersfcu.com/founders-locations-county",
        "what": "Branch list by county and office hours"
      },
      {
        "url": "https://www.foundersfcu.com/locations",
        "what": "Locations page: 49 offices across the Carolinas"
      }
    ],
    "notes": [
      "Membership eligibility is not published on the Founders site (the Become a Member link goes to an application app that did not render), so membership is left null.",
      "The Regular Savings Account is the primary share account that establishes membership; the product page says it requires a credit evaluation.",
      "Withdrawal limits and any excess withdrawal fee for savings are not stated on the pages read.",
      "Cash deposits are inferred from the branch offices offering teller service (the contact page names Rock Hill Center as the one site without teller service); no page states cash deposits to savings directly.",
      "Membership is taken from the field of membership in Founders' federal charter, as reported in RAVEN's Founders deep dive (/blog/founders-credit-union-mill-town); foundersfcu.com's membership pages refused automated reads on 2026-11-26."
    ]
  },
  {
    "institution": "allsouth-federal-credit-union",
    "name": "Membership Savings",
    "url": "https://www.allsouth.org/membership-savings/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.2,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.20% dividend rate and 0.20% APY on the rates page, Rates effective as of November 1, 2026, with a $100 minimum average daily balance to earn the APY. Super Saver and Savings (Secondary) pay the same 0.20%. Premium Checking pays more but is a checking account; Money Market is a money market. Both are excluded.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No monthly maintenance fee. Fee schedule lists a $10 monthly dormant fee after 12 months with no activity and a $10 fee if the membership savings account is closed within 90 days of opening.",
      "minOpen": 10,
      "minBalanceForApy": 100,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No more than six preauthorized, automatic or telephone transfers per month (Truth-in-Savings disclosure); the limits do not apply at a branch, by mail or at any ATM. Going over may bring a fee or account closure, but the fee schedule lists no amount.",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and Mobile Banking can transfer between AllSouth accounts and accounts at other financial institutions. Zelle is available in Online and Mobile Banking; the Zelle page says you choose a deposit account at enrollment but does not say whether savings can be used.",
      "atmAccess": null,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.allsouth.org/rates/",
        "what": "Rates page: Membership Savings 0.20% APY, $100 minimum average daily balance, rates effective November 1, 2026"
      },
      {
        "url": "https://www.allsouth.org/membership-savings/",
        "what": "Product page: $10 opening deposit and minimum balance, 0.20% APY at $100 average daily balance, no monthly maintenance fee, joint members"
      },
      {
        "url": "https://www.allsouth.org/bank/savings/",
        "what": "Savings comparison: Membership Savings, Super Saver, Christmas Club, Cookie Jar Club"
      },
      {
        "url": "https://www.allsouth.org/fee-schedule/",
        "what": "Fee schedule effective January 28, 2026: dormant savings fee, early closing fee, ATM fees"
      },
      {
        "url": "https://www.allsouth.org/wp-content/uploads/2022/06/Membership_Disclosure_Booklet.pdf",
        "what": "Membership disclosure booklet: six-transfer limit, $10 membership share, joint accounts, dividend rate may change quarterly"
      },
      {
        "url": "https://www.allsouth.org/bank/online-and-mobile-banking/",
        "what": "Online and Mobile Banking: transfers to accounts at other financial institutions"
      },
      {
        "url": "https://www.allsouth.org/bank/zelle/",
        "what": "Zelle in Online and Mobile Banking"
      },
      {
        "url": "https://www.allsouth.org/faqs/",
        "what": "Night deposit for cash and checks at branches with a drive-thru"
      },
      {
        "url": "https://www.allsouth.org/contact-us/",
        "what": "Call Center phone numbers and 24/7 lost card line"
      },
      {
        "url": "https://www.allsouth.org/open-new-account/",
        "what": "Membership eligibility and partner associations"
      },
      {
        "url": "https://www.allsouth.org/locations/",
        "what": "Branch locator: 21 South Carolina branches"
      }
    ],
    "notes": [
      "Membership requires the Membership Savings account with a $10 deposit, and $10 must stay in it.",
      "Call Center hours are labeled business hours on the contact page, but the times are not published.",
      "The disclosure booklet was uploaded in 2022; it is the only Truth-in-Savings text linked from the disclosures page.",
      "ATM access to savings is not stated directly; the booklet only says transfer limits do not apply at an ATM.",
      "No excess withdrawal fee amount is listed in the fee schedule."
    ]
  },
  {
    "institution": "palmetto-citizens-federal-credit-union",
    "name": "Prime Share (Savings)",
    "url": "https://www.palmettocitizens.org/personal/savings/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.25% dividend rate and 0.25% APY on balances of $100 or more; the rates page says savings APYs and dividend rates are accurate as of October 1, 2026. Dividends are paid quarterly. Money Market and Premium Money Market are money markets and are excluded.",
      "rateAsOf": "2026-10-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No minimum balance fee on Prime Share (the rates page shows a $0 minimum balance to avoid a fee). The fee schedule lists a $3 monthly statement mailing fee for personal accounts (no cost for ages 17 and under or 65 and older), a $5 monthly dormant fee after 12 months inactive, and a $15 fee for closing within 90 days.",
      "minOpen": 5,
      "minBalanceForApy": 100,
      "withdrawalsPerMonth": 2,
      "excessWithdrawalFee": 3,
      "withdrawalLimit": "Excessive withdrawal fee of $3 for each withdrawal over 2 per month",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Digital banking transfers between Palmetto Citizens accounts, to your accounts at other financial institutions, to other members, and to anyone else by email address or mobile phone number. The pages read do not name the person-to-person service.",
      "atmAccess": true,
      "subAccounts": true,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.palmettocitizens.org/rates/",
        "what": "Rates page: Prime Share 0.25% APY at $100+, accurate as of October 1, 2026; fee schedule: $5 par value, excessive withdrawal fee, dormant fee, early closing fee, statement mailing fee, ATM fees"
      },
      {
        "url": "https://www.palmettocitizens.org/personal/savings/",
        "what": "Savings page: $5 to open, additional savings accounts, quarterly dividends on $100+, phone hours"
      },
      {
        "url": "https://www.palmettocitizens.org/accounts/",
        "what": "Account access: external transfers, member transfers, transfers by email or mobile number, ATM and branch access"
      },
      {
        "url": "https://www.palmettocitizens.org/other/",
        "what": "Free coin counting machines for members at each office"
      },
      {
        "url": "https://www.palmettocitizens.org/locations/",
        "what": "Branch list (15 SC, 4 GA), branch and drive-thru hours, phone numbers"
      },
      {
        "url": "https://www.palmettocitizens.org/team/",
        "what": "Membership eligibility"
      }
    ],
    "notes": [
      "Membership requires the share savings account with $5 par value, which must stay in savings.",
      "Joint ownership is not stated on the pages read.",
      "Cash deposits are inferred from the branches and the free coin counting machines at each office; no page states cash deposits to savings directly."
    ]
  },
  {
    "institution": "sharonview-federal-credit-union",
    "name": "High-Yield Savings Account",
    "url": "https://www.sharonview.org/banking/savings/high-yield-savings-account",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": 3.2,
      "condition": "Each calendar month, keep a $100 average daily balance and receive at least $100 in aggregate ACH deposits into the account",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "3.15% dividend rate and 3.20% APY on average daily balances from $100 to $100,000 when the monthly requirements are met; 0.05% APY if they are not. A $10,000 balance sits in the $100 to $100,000 tier, so no blending is needed. The rates page says APYs are current as of November 18, 2026; the product page says accurate as of August 1, 2026, with the same rates. The Regular Share pays 0.05% APY with no condition.",
      "rateAsOf": "2026-11-18",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No monthly maintenance fee. The fee schedule lists a $10 monthly paper statement fee, a $20 monthly inactivity fee after 12 months without activity, and a $5 fee for closing within 90 days.",
      "minOpen": 100,
      "minBalanceForApy": 100,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 25,
      "withdrawalLimit": "$25 fee for each withdrawal over six per month",
      "externalTransfers": true,
      "instantTransfers": null,
      "transferNotes": "The fee schedule lists external transfers in and out (free under $2,500 standard delivery, $3 outgoing over $2,500, $5 next business day). No Zelle or person-to-person service found on the pages read.",
      "atmAccess": false,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": null
    },
    "sources": [
      {
        "url": "https://www.sharonview.org/resources/rates-fees/savings-rates-checking-rates",
        "what": "Rates page: High-Yield Savings tiers and APYs, requirements, $100 to open, current as of November 18, 2026, Regular Share rate"
      },
      {
        "url": "https://www.sharonview.org/banking/savings/high-yield-savings-account",
        "what": "Product page: 3.20% APY, ACH deposit requirement, no monthly maintenance fee, $100 minimum, no debit card access, excess withdrawal fee"
      },
      {
        "url": "https://www.sharonview.org/banking/savings/savings-accounts",
        "what": "Regular share: $5 deposit opens membership"
      },
      {
        "url": "https://www.sharonview.org/resources/rates-fees/fee-schedule",
        "what": "Fee schedule effective November 1, 2025: excessive withdrawal, paper statement, inactivity, early closure, external transfer fees"
      },
      {
        "url": "https://www.sharonview.org/resources/join-us/eligibility",
        "what": "Membership eligibility"
      },
      {
        "url": "https://www.sharonview.org/about/locations",
        "what": "Branch locator: 15 branches (5 SC, 10 NC)"
      },
      {
        "url": "https://www.sharonview.org/about/get-in-touch/contact-us",
        "what": "Phone numbers and weekday hours"
      }
    ],
    "notes": [
      "Membership is opened with a Regular Share savings account and a $5 deposit; the High-Yield Savings Account needs its own $100 opening deposit.",
      "The account does not permit debit card access, so atmAccess is false.",
      "Joint accounts, sub-accounts and cash deposits are not stated on the pages read."
    ]
  },
  {
    "institution": "state-employees-credit-union",
    "name": "Share Account",
    "url": "https://www.ncsecu.org/accounts/savings/share.html",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.25% dividend rate and 0.25% APY on the Share and Deposit Account Rates page and rate summary PDF, rates as of 10/1/26. Variable; may change daily. Dividends accrue when the balance is greater than zero, compound daily and are paid monthly.",
      "rateAsOf": "2026-10-01",
      "monthlyFee": 1,
      "waive": "easy",
      "waiveBalance": null,
      "feeWaiver": "$1 monthly maintenance fee if the balance is below $25 on the statement cut-off date; a $25 balance must be kept to retain membership.",
      "minOpen": 25,
      "minBalanceForApy": 0.01,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No count limit stated; the product page advertises unlimited transfers between SECU accounts and the fee schedule lists no excess-withdrawal fee",
      "externalTransfers": true,
      "instantTransfers": false,
      "transferNotes": "Share Accounts are not eligible for ACH withdrawals or debits. Member Access transfers move money between SECU accounts and to other SECU members in real time (Member-to-Member). Outgoing wires can be sent from a Share Account at a branch or through Member Services ($15 domestic). No Zelle or external ACH transfer service found on the pages read.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.ncsecu.org/rates-fees/account-rates.html",
        "what": "Rates page: Share 0.25% / 0.25% APY, rates as of 10/1/26, accrual and minimum balance disclosures"
      },
      {
        "url": "https://www.ncsecu.org/content/dam/ncsecu/pdfs/rates/SECUShareAndDepositAccountRateSummary.pdf",
        "what": "Rate summary PDF as of October 1, 2026: Share $25 minimum, 0.25% APY"
      },
      {
        "url": "https://www.ncsecu.org/accounts/savings/share.html",
        "what": "Product page: $25 opening deposit, $1 fee below $25, unlimited internal transfers, ATM and branch access, no ACH withdrawals"
      },
      {
        "url": "https://www.ncsecu.org/rates-fees/account-fees.html",
        "what": "Fee schedule: $1 Share monthly maintenance fee charged if below minimum on statement date, outgoing domestic wire $15"
      },
      {
        "url": "https://www.ncsecu.org/accounts/services/transfer-funds.html",
        "what": "Transfers between SECU accounts and to other members, no fee"
      },
      {
        "url": "https://www.ncsecu.org/services/member-access.html",
        "what": "Member-to-Member real-time transfers in Member Access"
      },
      {
        "url": "https://www.ncsecu.org/accounts/services/wire-transfer.html",
        "what": "Wires can be sent from a Share Account via branch or Member Services"
      },
      {
        "url": "https://www.ncsecu.org/content/dam/ncsecu/pdfs/account-disclosures/AccountRulesAndRegulations.pdf",
        "what": "Account Rules and Regulations: joint accounts"
      },
      {
        "url": "https://www.ncsecu.org/join.html",
        "what": "Membership eligibility, in-person or mail joining, $25 share deposit, 275 branch locations"
      },
      {
        "url": "https://www.ncsecu.org/contact-us.html",
        "what": "Member Services Support 24/7 helpline, branch hours, live chat"
      },
      {
        "url": "https://www.ncsecu.org/accounts/savings/summer-cash.html",
        "what": "Summer Cash Account limited to certain school system employees via payroll"
      },
      {
        "url": "https://locations.ncsecu.org/",
        "what": "Branch locator: 275 locations in North Carolina"
      }
    ],
    "notes": [
      "Membership is limited to the field of membership described on the join page; new members open the Share Account at a branch or by mail.",
      "The $25 opening deposit is the membership share; a $25 balance must stay in the Share Account.",
      "Summer Cash (3.75% APY) was not used: it is open only to school system employees paid 9, 10 or 11 months a year and is funded by payroll. Holiday Cash Club pays the same 0.25% as the Share Account. Money Market Share and Share Term Certificates are excluded by the method.",
      "instantTransfers set to false: SECU offers real-time Member-to-Member transfers only within SECU; no Zelle, RTP or FedNow service found.",
      "externalTransfers true only because outgoing wires can be sent from a Share Account; there are no online or ACH transfers to other banks from this account.",
      "subAccounts not stated on the pages read."
    ]
  },
  {
    "institution": "civic-federal-credit-union",
    "name": "Select Savings Account",
    "url": "https://www.civicfcu.org/bank/savings/select-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.25% rate and 0.25% APY on the rates page, personal savings section Effective Date: 11/03/2026. APY applies to a minimum balance of $1; dividends compound daily and are paid monthly.",
      "rateAsOf": "2026-11-03",
      "monthlyFee": 1,
      "waive": "easy",
      "waiveBalance": null,
      "feeWaiver": "$1 fee each month the balance falls below $5. Fee schedule also lists a $5 monthly inactive account fee after 18 months of inactivity, which does not apply if you have logged into online banking within the last 18 months.",
      "minOpen": 5,
      "minBalanceForApy": 1,
      "withdrawalsPerMonth": 10,
      "excessWithdrawalFee": 1,
      "withdrawalLimit": "Fee schedule charges $1 per transaction starting with the 11th transaction in a calendar month on Savings and Money Market accounts; the product page says funds are available with no restrictions",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Product page: you can use Zelle and make external transfers from your Select Savings Account in the Civic app. No external transfer fee listed. Overdraft transfers from savings cost $0.50.",
      "atmAccess": true,
      "subAccounts": true,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.civicfcu.org/rates",
        "what": "Rates page: Select Savings 0.25% / 0.25% APY, Steady Save 0.40%, effective 11/03/2026"
      },
      {
        "url": "https://www.civicfcu.org/bank/savings/select-savings",
        "what": "Product page: $5 opening deposit, $1 fee below $5, Zelle and external transfers, debit card on request, multiple accounts, joint holder"
      },
      {
        "url": "https://www.civicfcu.org/fees",
        "what": "Fee schedule: $1 below $5, $1 per transaction from the 11th per month, inactive fee, ATM fee reimbursement"
      },
      {
        "url": "https://www.civicfcu.org/bank/savings/steady-save-savings-account",
        "what": "Steady Save terms: funds held until set distribution dates"
      },
      {
        "url": "https://www.civicfcu.org/bank/savings/savings-overview",
        "what": "Savings FAQ: debit card access for savings-only members, multiple account types"
      },
      {
        "url": "https://www.civicfcu.org/why-civic",
        "what": "Field of membership"
      },
      {
        "url": "https://www.civicfoundationnc.org/friends",
        "what": "Friend of the Civic Foundation: $15 annual donation plus $25 membership deposit"
      },
      {
        "url": "https://www.civicfcu.org/faq-library",
        "what": "Experience Center available 24/7, chat hours, membership FAQs, conflicting $5 and $25 minimums"
      },
      {
        "url": "https://www.civicfcu.org/contact-us",
        "what": "Experience Center phone number"
      },
      {
        "url": "https://www.civicfcu.org/locations/raleigh-branch",
        "what": "Branch hours"
      },
      {
        "url": "https://www.civicfcu.org/services/transfers-payments/add-cash-barcode",
        "what": "Fee-free cash deposits to Civic accounts at retailers"
      },
      {
        "url": "https://www.civicfcu.org/locations/branches",
        "what": "Branch list: 11 branches, all in NC"
      }
    ],
    "notes": [
      "Select Savings is the membership account. The product page and some FAQs give a $5 minimum opening deposit, while other FAQs and the Civic Foundation page give $25; $5 is used for minOpen.",
      "Steady Save Savings (0.40% APY) was not used: funds are held until fixed distribution dates in March and October, and other withdrawals require contacting Civic, so it works like a club account rather than a regular savings account. Money Market and Choice Money Market accounts are excluded by the method.",
      "withdrawalsPerMonth is 10 based on the fee schedule's per-transaction fee from the 11th transaction; the fee schedule says transaction, not only withdrawal.",
      "Support: Civic's FAQ library says the Experience Center and its representatives are available 24/7, including holidays; the contact page itself lists no hours.",
      "jointAccounts true: the product page requires an adult joint account holder on minor accounts; adult joint ownership terms were not read in an account agreement.",
      "Fee schedule shows no effective date."
    ]
  },
  {
    "institution": "self-help-credit-union",
    "name": "Savings Account",
    "url": "https://www.self-help.org/personal/checking-savings-loans/savings/personal-savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.3,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate, 0.30% APR and 0.30% APY for Savings Account on the account rates page, rates effective as of November 1, 2026. No minimum balance to earn dividends per the product page.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 5,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": 1,
      "withdrawalLimit": "Up to 6 preauthorized, automatic, telephone or online banking transfers per statement period; $1 each after 6 per month, not to exceed $10. Transfers to your own Self-Help accounts and ATM, mail or in-person withdrawals do not count.",
      "externalTransfers": true,
      "instantTransfers": false,
      "transferNotes": "The new online and mobile banking platform lists external transfers and member-to-member transfers among its features. Zelle is described as coming soon, not yet available. Outgoing domestic wire $15.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.self-help.org/rates/account-rates",
        "what": "Account rates: Savings Account 0.30% / 0.30% APY, effective November 1, 2026"
      },
      {
        "url": "https://www.self-help.org/rates",
        "what": "Charter split: Self-Help Credit Union serves FL, GA, NC, SC and VA; Self-Help FCU serves CA, CT, IL, WA and WI"
      },
      {
        "url": "https://www.self-help.org/personal/checking-savings-loans/savings/personal-savings",
        "what": "Product page: $5 opening deposit, no minimum balance, nationwide ATM access"
      },
      {
        "url": "https://www.self-help.org/getContentAsset/54a573f7-6a4b-4bbe-9795-2f5190f257ee/c03b315a-46e9-462a-9072-f0e24631b193/SHCU-Fee-Schedule-October-2025_ENG.pdf?language=en",
        "what": "Self-Help CU fee schedule effective October 1, 2025: no savings monthly fee, $1 excess transactions after 6 (max $10), dormant fee, wire fee"
      },
      {
        "url": "https://www.self-help.org/getContentAsset/00789b44-704d-4d21-bdcd-1a28350ccecb/c03b315a-46e9-462a-9072-f0e24631b193/SHCU-Consumer-Account-Agreement-7-1-2025.pdf?language=en",
        "what": "Self-Help CU account agreement and Truth-in-Savings: $5 par value share, savings transfer limitations, joint accounts"
      },
      {
        "url": "https://www.self-help.org/disclosures/fees",
        "what": "Web fee schedule (same savings fees)"
      },
      {
        "url": "https://www.self-help.org/personal/checking-savings-loans/savings/safe-home-savings",
        "what": "SAFE Home Savings limited to Equity Boost home loan borrowers"
      },
      {
        "url": "https://www.self-help.org/digital-experience-upgrades-cu",
        "what": "New digital banking for FL, GA, NC, SC and VA members: external and member-to-member transfers, Zelle coming soon"
      },
      {
        "url": "https://www.self-help.org/personal/join-us/how-to-become-a-member",
        "what": "Membership eligibility, join at a branch, member service center 24/7 statement"
      },
      {
        "url": "https://www.self-help.org/member-services-contacts",
        "what": "Member Support phone (800) 966-7353 for GA, FL, SC, NC and VA"
      },
      {
        "url": "https://www.self-help.org/personal/services-support/member-support-center/banking-faqs",
        "what": "24/7 automated audio banking"
      },
      {
        "url": "https://www.self-help.org/personal/services-support/branch-atm-locations/north-carolina-branches",
        "what": "NC branch list and hours"
      },
      {
        "url": "https://www.self-help.org/personal/services-support/branch-atm-locations/south-carolina-branches",
        "what": "SC branch list: 5"
      },
      {
        "url": "https://www.self-help.org/personal/services-support/branch-atm-locations/georgia-branches",
        "what": "GA branch list: 1"
      },
      {
        "url": "https://www.self-help.org/personal/services-support/branch-atm-locations/florida-branches",
        "what": "FL branch list: 10"
      }
    ],
    "notes": [
      "Charter: Self-Help Credit Union (state-chartered, routing 253184841) is the charter that serves North Carolina consumers; Self-Help Federal Credit Union serves CA, CT, IL, WA and WI. Rates, fee schedule and account agreement used here are Self-Help Credit Union documents.",
      "Membership requires a $5 par value share, which can be held in any savings, checking or certificate account; the $5 Savings Account opening deposit covers it.",
      "Dormant account fee: $10 quarterly after 12 months of inactivity unless the combined balance is $100 or more and there is activity; not counted as a monthly fee.",
      "supportLevel unknown: the join page says the member service center is available 24/7, but the only 24/7 service described elsewhere is automated audio banking; live-agent hours are not stated.",
      "Club Account (0.30%) and Youth Savings (0.30%) pay the same rate; Money Market, IRA savings and certificates are excluded by the method.",
      "The site blocks automated fetches; pages were read in a browser.",
      "subAccounts not stated on the pages read."
    ]
  },
  {
    "institution": "skyla-credit-union",
    "name": "Purpose Savings",
    "url": "https://www.skylacu.com/bank/savings/purpose",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": 4.1,
      "condition": "Deposit at least $25 into the Purpose Savings account each calendar month (the Truth-in-Savings disclosure words this as at least one direct deposit of $25 or more) and enroll in eStatements.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Qualified tiers: 4.889% rate / 5.00% APY on the first $1,000, 3.928% / 4.00% APY on $1,000.01 to $10,000, 0.10% on balances above $10,000. Each rate applies only to the portion of the balance in its tier. Blended at $10,000: $48.89 + $353.52 = $402.41 a year, a 4.024% rate, or 4.10% APY with monthly compounding; this blended figure is our calculation, and it matches the low end of the 4.10% to 5.00% APY range Skyla prints for that tier. Non-qualifying accounts earn 0.10% APY on the whole balance. Rates as of 11/01/2026.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 2,
      "waive": "easy",
      "waiveBalance": null,
      "feeWaiver": "No monthly maintenance fee. A $2 monthly paper statement fee applies unless you enroll in eStatements, which is also required for the qualified rate.",
      "minOpen": 25,
      "minBalanceForApy": 0,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No limit stated; the rates page shows no account limitation for Purpose Savings, unlike Holiday Savings and IRA accounts",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Digital Banking can link accounts at other financial institutions for transfers. Zelle is available free in the Skyla Mobile App; the Zelle page does not say which Skyla accounts can send. Mobile deposit is available.",
      "atmAccess": true,
      "subAccounts": false,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.skylacu.com/rates",
        "what": "Rates page: Primary Savings 0.10%, Purpose Savings up to 5.00%, Holiday Savings 0.05%, Purpose tier footnote, rates as of 11/01/2026, account limitations column"
      },
      {
        "url": "https://www.skylacu.com/bank/savings/purpose",
        "what": "Product page: tiers, $25 monthly deposit and eStatements requirement, $25 opening deposit, no monthly fee, $2 paper statement fee, 6 free foreign ATM withdrawals, one account per member"
      },
      {
        "url": "https://www.skylacu.com/hubfs/Website/PDFs/TIS.pdf",
        "what": "Truth-in-Savings, effective 11.01.2026: Purpose rate schedule and qualification rules, tier method, $5 par value share, paper statement and inactivity fees"
      },
      {
        "url": "https://www.skylacu.com/bank/digital-banking/account-linking",
        "what": "Linking external accounts for transfers"
      },
      {
        "url": "https://www.skylacu.com/zelle",
        "what": "Zelle in the Skyla Mobile App, no fee"
      },
      {
        "url": "https://www.skylacu.com/about-skyla/overview",
        "what": "Membership eligibility, including the American Consumer Council option"
      },
      {
        "url": "https://www.skylacu.com/resources/insured-savings/",
        "what": "NCUA $250,000 plus $250,000 Excess Share Insurance (ESI)"
      },
      {
        "url": "https://www.skylacu.com/about-skyla/contact-us/",
        "what": "Contact center hours and phone numbers"
      },
      {
        "url": "https://www.skylacu.com/locations/",
        "what": "Branch list: 16 NC, 1 SC"
      }
    ],
    "notes": [
      "Membership requires a Primary Savings account; the Truth-in-Savings disclosure sets the par value of one share at $5 and the rates page gives a $5 Primary Savings opening deposit.",
      "The product page says the $25 monthly requirement is a deposit; the Truth-in-Savings disclosure says a direct deposit of $25 or more. The condition text gives both.",
      "The product page and rates page give a $25 minimum opening deposit for Purpose Savings; the Truth-in-Savings rate table layout is hard to read for this account, so the web pages were used.",
      "Excess share insurance above $250,000 is private coverage through ESI, not federal insurance.",
      "Inactivity fee of $5 a month after six months with no activity applies to Primary Savings, Checking and Holiday Savings with aggregate balance under $250; Purpose Savings is not named in it.",
      "subAccounts false: only one Purpose Savings account per primary member; savings goals can be tracked in Digital Banking.",
      "jointAccounts not stated for this account on the pages read.",
      "Brand name is Skyla Credit Union; the insured savings page says Skyla is federally chartered."
    ]
  },
  {
    "institution": "georgia-united-credit-union",
    "name": "High Earning Savings",
    "url": "https://gucu.org/bank/savings/high-earning-savings-account",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 1.75,
      "conditionalApy": 3.15,
      "condition": "Make net deposits totaling $100 or more during the monthly qualification cycle; balances up to $25,000 then earn 3.15% APY.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Without qualifying deposits, the $10,000.00 to $24,999.99 tier pays a 1.74% dividend rate (1.75% APY); the Truth-in-Savings disclosure says the rate for the balance range reached applies to the full balance, so $10,000 earns 1.75% APY. Balances under $10,000 earn 0.10% APY. With $100 or more in net deposits in the month, balances under $25,000 earn a 3.11% dividend rate (3.15% APY). The rates page shows a 'Rates current as of' label with no date; the Truth-in-Savings disclosure lists the same rates with a last dividend declaration date of 2/26/2026.",
      "rateAsOf": null,
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 100,
      "minBalanceForApy": 10000,
      "withdrawalsPerMonth": 2,
      "excessWithdrawalFee": 5,
      "withdrawalLimit": "Two free withdrawals per month, then a $5.00 fee per withdrawal",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online Banking supports one-time or recurring transfers to and from accounts at other financial institutions with no Georgia United fee (setup can take up to 5 business days). Zelle is offered; the pages read do not say whether Zelle can draw on this savings account.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://gucu.org/bank/savings/high-earning-savings-account",
        "what": "Product page: tiers, APY, $100 opening deposit, two free withdrawals, qualifying deposit footnote"
      },
      {
        "url": "https://gucu.org/rates",
        "what": "Rates page: High Earning Savings and Share Savings rates, withdrawal fee, membership share and fee"
      },
      {
        "url": "https://gucu.org/docs/default-source/account-disclosures/truth-in-savings.pdf?sfvrsn=b34b0591_419",
        "what": "Truth-in-Savings disclosure and fee schedule: full-balance tier method, qualification cycle, no service fee, inactive and dormant fees, declaration date"
      },
      {
        "url": "https://gucu.org/open-an-account",
        "what": "Membership share requirement and joint owners on new accounts"
      },
      {
        "url": "https://gucu.org/open-an-account/become-a-member",
        "what": "Membership eligibility"
      },
      {
        "url": "https://gucu.org/about-us/locations",
        "what": "Branch locator: 14 open Georgia branches"
      },
      {
        "url": "https://gucu.org/about-us/contact-us",
        "what": "Member Care Center phone numbers and hours"
      },
      {
        "url": "https://gucu.org/bank-on-the-go/online-banking/transfers",
        "what": "External account transfers"
      },
      {
        "url": "https://gucu.org/bank-on-the-go/online-banking/zelle",
        "what": "Zelle offered"
      },
      {
        "url": "https://gucu.org/learn/faqs",
        "what": "ATM network cash and check deposits, branch services"
      }
    ],
    "notes": [
      "Membership requires a Prime Share Savings account with a $5 opening deposit plus a $5 one-time, nonrefundable membership fee.",
      "The $100 net deposit requirement is treated as a condition, so the no-condition 1.75% is used as apy and 3.15% as conditionalApy. The product page notes that withdrawals can reduce the month's net deposit total.",
      "The fee schedule lists a $5.00 monthly inactive account fee between 6 and 12 months of inactivity and a dormant fee after 60 months, with combined fees capped at $60.00 for the life of the membership.",
      "atmAccess null: the FAQ says members can withdraw at network ATMs, but ATM access to this specific account is not stated.",
      "subAccounts null: not stated whether more than one High Earning Savings account can be opened."
    ]
  },
  {
    "institution": "lge-community-credit-union",
    "name": "Savings",
    "url": "https://www.lgeccu.org/bank/personal-accounts/savings-and-certificates.html",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.25,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "The Savings tier starting at a $100.00 minimum balance pays a 0.250% dividend rate (0.25% APY); the next tier starts at $25,000.00, so $10,000 earns 0.25% APY. Savings rates effective 4/1/2025 per the deposit rates page. A $100 minimum balance is required to earn dividends.",
      "rateAsOf": "2025-04-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "No monthly maintenance fee while the account is active. The account becomes inactive after 12 months with no activity and a balance of $250 or less; the inactive fee amount is in the fee schedule, which is only available in online and mobile banking.",
      "minOpen": null,
      "minBalanceForApy": 100,
      "withdrawalsPerMonth": 5,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Excessive withdrawal fees apply to withdrawals over 5 per month; the fee amount is not published on the public site",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "The External Transfer Service Agreement covers transfers between linked LGE personal deposit accounts and accounts at other financial institutions. Zelle is available in the LGE app; the pages read do not say whether Zelle can draw on a savings account. Access also through Memberline 24-hour automated phone banking, online and mobile banking, and LGE locations.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.lgeccu.org/bank/personal-accounts/savings-and-certificates.html",
        "what": "Savings product details: no monthly fee when active, withdrawal limit, $100 balance to earn dividends, account access"
      },
      {
        "url": "https://www.lgeccu.org/rates/deposit-rates.html",
        "what": "Deposit rates page: Savings tiers and APY, effective 4/1/2025; Nest rate and terms"
      },
      {
        "url": "https://www.lgeccu.org/bank/personal-accounts/savings-and-certificates/nest.html",
        "what": "Nest account opening deposit and funding limits"
      },
      {
        "url": "https://www.lgeccu.org/join/membership.html",
        "what": "Membership eligibility, joint owners"
      },
      {
        "url": "https://www.lgeccu.org/locations/branch-locations.html",
        "what": "Branch locator: 17 Georgia branches"
      },
      {
        "url": "https://www.lgeccu.org/connect/about-lge-community-credit-union/contact-us.html",
        "what": "Contact Center hours and phone, Memberline"
      },
      {
        "url": "https://www.lgeccu.org/content/docs/ExternalTransferAgreement.pdf",
        "what": "External transfers to and from other financial institutions"
      },
      {
        "url": "https://www.lgeccu.org/bank/digital-services/mobile-banking/pay-it-safe-with-zellesupsup.html",
        "what": "Zelle in the LGE app"
      },
      {
        "url": "https://www.lgeccu.org/planned-partnership.html",
        "what": "Merger with Ascend Federal Credit Union"
      }
    ],
    "notes": [
      "The Nest account (3.00% APY) was not used: it opens with a one-time deposit of $1 to $1,000 and can only be added to through transferred dividends, credit card cash back rewards and debit card round-ups, so it cannot be funded to $10,000.",
      "Youth and Young Adult Savings were not used: they are limited to members through age 22 and pay the higher rate only on the first $1,000.",
      "LGE members approved a merger with Ascend Federal Credit Union, expected to be legally effective January 1, 2027; LGE will become a division of Ascend and eventually operate under the Ascend name.",
      "minOpen null: no opening deposit for Savings is stated on the public pages read.",
      "excessWithdrawalFee null: the fee schedule is only available in online and mobile banking.",
      "atmAccess null: ATM access to the savings account is not stated.",
      "subAccounts null: not stated whether more than one Savings account can be opened."
    ]
  },
  {
    "institution": "banksouth",
    "name": "Added Advantage Savings",
    "url": "https://banksouth.com/checking-savings-account-rates",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.7,
      "conditionalApy": 2.22,
      "condition": "Each statement cycle: have a BankSouth Complete, Simple or Young Adult consumer checking account, be enrolled in eStatements for this account, receive at least $500 in direct deposits, make at least 10 debit card transactions (ATM withdrawals do not count) and at least 3 online bill pay transactions.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rates page footnote: if qualifications are not met, the rate is 0.70% (0.70% APY). With qualifications met, the $0.01 to $499,999.99 tier pays a 2.20% interest rate (2.22% APY), so $10,000 earns 2.22%. Rates are listed as effective and revised 9/28/2026. The Personal Savings account pays 0.20% APY with no conditions.",
      "rateAsOf": "2026-09-28",
      "monthlyFee": null,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": "Not published: the rates page is the only BankSouth page that describes this account, and neither it nor the fee schedule lists a maintenance fee for it.",
      "minOpen": 50,
      "minBalanceForApy": 0.01,
      "withdrawalsPerMonth": 5,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "Withdrawal restrictions are the same as Personal Savings: 15 free withdrawals per quarterly statement cycle",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online banking External Transfers move money between BankSouth and your accounts at other U.S. banks, typically posting the next business day. Pay a Person is a free service to send money to anyone in the U.S., instant to BankSouth customers and next business day otherwise. The pages do not say whether savings accounts can be used for either.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": null
    },
    "sources": [
      {
        "url": "https://banksouth.com/checking-savings-account-rates",
        "what": "Rates page: Added Advantage Savings tiers, APY, qualifications, unqualified rate, opening deposit, effective date"
      },
      {
        "url": "https://banksouth.com/personal/savings/",
        "what": "Personal Savings withdrawal limit (15 per quarterly statement cycle), $50 minimums"
      },
      {
        "url": "https://banksouth.com/wp-content/uploads/2025/02/20250401-BankSouth-Schedule-of-Fees-With-Message-V2.pdf",
        "what": "Schedule of fees effective April 1, 2025: no savings maintenance or excess-withdrawal fee listed"
      },
      {
        "url": "https://banksouth.com/help/",
        "what": "Customer care phone numbers and hours, 24-hour telephone banking"
      },
      {
        "url": "https://banksouth.com/help/banking-support/online-banking-faqs/external-transfers-faqs/",
        "what": "External transfers to accounts at other U.S. banks"
      },
      {
        "url": "https://banksouth.com/help/banking-support/online-banking-faqs/person-to-person-faqs/",
        "what": "Pay a Person service"
      }
    ],
    "notes": [
      "BankSouth has no product page for Added Advantage Savings; every account fact comes from the rates page.",
      "monthlyFee null: no maintenance fee or waiver is published for this account. The fee schedule lists no savings maintenance fee, but it does not say it is complete for this account.",
      "The qualifications list checking as one of the requirements for the premium rate, so 0.70% is used as apy. The rates page does not say whether the account can be opened without a BankSouth checking account.",
      "excessWithdrawalFee null: the fee for withdrawals over the limit is not published.",
      "atmAccess, subAccounts, jointAccounts and cashDeposit null: not stated for this account."
    ]
  },
  {
    "institution": "center-parc-credit-union",
    "name": "Kasasa Saver",
    "url": "https://www.mycenterparc.com/personal/savings/kasasa-saver/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.05,
      "conditionalApy": 4.0,
      "condition": "Hold a linked Kasasa Cash or Kasasa Cash Back Checking account (required to have Kasasa Saver) and, each monthly qualification cycle, make at least 12 debit card purchases, have at least one direct deposit or ACH credit and be enrolled in eStatements on the checking account.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "When the linked Kasasa checking qualifications are met, daily balances up to $100,000 earn a 3.930% dividend rate (4.00% APY), so $10,000 earns 4.00%; when they are not met, the entire balance earns 0.050% (0.05% APY). Rates page and consumer rate sheet list these Kasasa Saver rates as effective November 1, 2026; the product page says the APY is accurate as of 03/31/2025 and shows the same figures.",
      "rateAsOf": "2026-11-01",
      "monthlyFee": 0,
      "waive": "none-needed",
      "waiveBalance": null,
      "feeWaiver": null,
      "minOpen": 1,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "The rate sheet says account transfer and withdrawal limitations apply but gives no number for Kasasa Saver",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Checking earnings and ATM fee refunds transfer automatically into Kasasa Saver. The fee schedule lists External Transfer Services (account to account, standard and next-day, in and out) and Zelle person-to-person transfers at $0.00. The pages do not say whether Zelle can draw on Kasasa Saver.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.mycenterparc.com/personal/savings/kasasa-saver/",
        "what": "Product page: 4.00% and 0.05% APY, qualifications, $1 opening deposit, no monthly fee, checking requirement"
      },
      {
        "url": "https://www.mycenterparc.com/resources/rates/",
        "what": "Rates page: Kasasa Saver, Primary Savings and Round Up Savings rates, effective dates"
      },
      {
        "url": "https://www.mycenterparc.com/wp-content/uploads/Rates-Consumer-Account.pdf",
        "what": "Consumer rate sheet and disclosures: tier method, unqualified rate on entire balance, Round Up Savings funding rules"
      },
      {
        "url": "https://www.mycenterparc.com/wp-content/uploads/FeeSchedule.pdf",
        "what": "Fee schedule effective April 15, 2026: $0 Kasasa Saver service charge, inactive fee, external transfer and Zelle fees"
      },
      {
        "url": "https://www.mycenterparc.com/about-us/membership/",
        "what": "Membership eligibility, $1 Primary Savings share"
      },
      {
        "url": "https://www.mycenterparc.com/about-us/locations",
        "what": "Branch locator: 9 Georgia branches, deposit services"
      },
      {
        "url": "https://www.mycenterparc.com/about-us/contact-us",
        "what": "Member service phone numbers and hours"
      }
    ],
    "notes": [
      "Membership requires a Primary Savings (Share) account opened with $1 or more; the Kasasa Cash Checking account also opens with $1.",
      "apy is the 0.05% Kasasa Saver base rate paid when the checking qualifications are not met; holding the account requires a Kasasa checking account. Primary Savings shows its 4th quarter 2026 rate as Not Yet Declared (0.10% APY for the 3rd quarter).",
      "Round Up Savings (7.00% APY on the first $1,000, 0.10% above) was not used: it is funded only by debit card round-ups and deposits or transfers into it are not allowed, so it cannot be funded to $10,000.",
      "The fee schedule lists a $5.00 monthly inactive account fee (up to $60.00) after 12 months without member-initiated activity, unless the member has a Center Parc credit card, IRA, CD or $250 or more in deposits.",
      "withdrawalsPerMonth and excessWithdrawalFee null: the fee schedule's $10.00 fee for more than six withdrawals per month is listed under Money Market fees, and no Kasasa Saver limit is stated.",
      "atmAccess, subAccounts and jointAccounts null: not stated for this account."
    ]
  },
  {
    "institution": "first-federal-bank-lake-city",
    "name": "Statement Savings",
    "url": "https://www.ffbf.com/personal/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.01,
      "conditionalApy": 0.16,
      "condition": "Cash Management Account, a separate savings account that requires keeping a First Federal Bank checking account: 0.16% APY on the $10,000 to $49,999.99 tier. It carries a $14 monthly service charge waived with a $2,500 daily balance and allows 6 telephone, preauthorized or customer-ordered transfers per month ($10 each after).",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Single rate: the rates page lists Personal or Business Savings at 0.01% APY for $1,000 and up, and the product page says Statement Savings earns interest on daily balances over $1,000. Rates & APY Last Updated: October 25, 2025. The rates page calls the account Personal Savings; both pages say this account credits interest quarterly, which identifies it as Statement Savings.",
      "rateAsOf": "2025-10-25",
      "monthlyFee": 4.33,
      "waive": "balance",
      "waiveBalance": 500,
      "feeWaiver": "$13 service charge per quarter (4.33 a month), waived by keeping a $500 daily balance.",
      "minOpen": 50,
      "minBalanceForApy": 1000,
      "withdrawalsPerMonth": 3,
      "excessWithdrawalFee": 6,
      "withdrawalLimit": "9 withdrawals per quarter including in-person withdrawals, $6 for each withdrawal after",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online banking External Transfers move money between your accounts at different institutions. Zelle is in the mobile app and online banking (Bill Pay or Transfer and Pay tab); the pages do not say whether Zelle can be funded from a savings account. Mobile eDeposit limit is $2,500 per day.",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.ffbf.com/personal/savings",
        "what": "Savings comparison: Statement Savings eligibility, $50 opening deposit, $13 quarterly charge and $500 waiver, interest over $1,000, withdrawal limit and fee; Cash Management Account checking requirement, $14 charge, $2,500 waiver and transfer limit"
      },
      {
        "url": "https://www.ffbf.com/rates",
        "what": "Rates page: Personal or Business Savings 0.01% APY, Cash Management Account tiers (0.16% at $10,000 to $49,999.99), last updated October 25, 2025"
      },
      {
        "url": "https://www.ffbf.com/fees",
        "what": "Miscellaneous fee schedule, last updated July 29, 2026: no savings excess-withdrawal fee beyond the product page, $25 early closing fee within 90 days"
      },
      {
        "url": "https://www.ffbf.com/personal/online-banking",
        "what": "Online banking: External Transfers to accounts at other institutions, Zelle"
      },
      {
        "url": "https://www.ffbf.com/zelle",
        "what": "Zelle enrollment in mobile app and online banking"
      },
      {
        "url": "https://www.ffbf.com/contact-us",
        "what": "Customer Care phone number, hours and chat"
      }
    ],
    "notes": [
      "The Cash Management Account is labeled a savings account (not a money market) on the bank's savings page, so its rate is used as the conditional rate. It is a different account from Statement Savings.",
      "The rates were last updated October 25, 2025 according to the rates page, more than a year before this read.",
      "The rates page does not say whether Cash Management tier rates apply to the whole balance; $10,000 falls in the $10,000 to $49,999.99 tier.",
      "atmAccess, subAccounts and jointAccounts are not stated on the pages read.",
      "Vacation and Christmas Club savings also pay 0.01% and require an Elite or Enhanced checking account; Student Savers is limited to ages 0 to 24."
    ]
  },
  {
    "institution": "crews-bank-and-trust",
    "name": "Personal Savings",
    "url": "https://crews.bank/personal/banking/savings",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.07,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Deposit rate sheet, Effective: 10/05/26: Personal Savings pays 0.04% rate and APY at $200.00 to $2,499.99, 0.07% rate and APY at $2,500.00 to $49,999.99, 2.55% rate (2.58% APY) at $50,000.00 to $499,999.99 and 2.85% rate (2.89% APY) at $500,000.00 or higher. A $10,000 balance falls in the 0.07% tier. The sheet says its rates apply to accounts located in Central and Southwest Florida.",
      "rateAsOf": "2026-10-05",
      "monthlyFee": 5,
      "waive": "balance",
      "waiveBalance": 200,
      "feeWaiver": "$5 Maintenance Charge avoided by keeping a $200 minimum daily balance; a separate $3 Maintenance Charge is avoided by enrolling in Online Statements. No Maintenance Charges for account holders under 18.",
      "minOpen": 0,
      "minBalanceForApy": 200,
      "withdrawalsPerMonth": null,
      "excessWithdrawalFee": null,
      "withdrawalLimit": null,
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "Online and mobile banking transfer funds to and from another bank. Zelle (no Crews fee, $1,500 rolling seven-day send limit) is in the mobile app. Rapid Transfer sends to or pulls from an external account by debit card for a fee (1.75% out, 0.75% in, $0.50 minimum).",
      "atmAccess": null,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://crews.bank/personal/banking/savings",
        "what": "Product page: no minimum opening deposit, $5 and $3 Maintenance Charges and how to avoid them, interest on balances of $200 or more, online opening, mobile deposit"
      },
      {
        "url": "https://www.crews.bank/hubfs/_CBT/PDFs/Deposits%20Rate%20Sheet.pdf",
        "what": "Deposit rate sheet effective 10/05/26: Personal Savings tiers and APYs, minimum to obtain interest, Central and Southwest Florida scope"
      },
      {
        "url": "https://www.crews.bank/contact",
        "what": "Phone number and hours, automated telephone banking"
      },
      {
        "url": "https://www.crews.bank/personal/online-banking",
        "what": "Online banking: transfers to and from another bank, Zelle"
      },
      {
        "url": "https://www.crews.bank/personal/online-banking/mobile-banking",
        "what": "Mobile app: external transfers, Zelle pay-a-person"
      },
      {
        "url": "https://www.crews.bank/zelle",
        "what": "Zelle: no Crews fee, delivery in minutes"
      },
      {
        "url": "https://www.crews.bank/personal/online-banking/rapid-transfer",
        "what": "Rapid Transfer fees and timing"
      },
      {
        "url": "https://www.crews.bank/faq",
        "what": "FAQ: Zelle send limit, mobile banking transfers to other institutions, ATM network"
      }
    ],
    "notes": [
      "The product page does not say how often the $5 and $3 Maintenance Charges apply, and no fee schedule or deposit agreement is linked from the site. monthlyFee records the $5 charge as printed, not converted to a monthly figure.",
      "The rate sheet lists tier ranges but does not say whether a tier rate applies to the whole balance. If 0.04% applied to the first $2,499.99 and 0.07% only to the rest, a $10,000 balance would earn about 0.06%.",
      "Withdrawal limits for Personal Savings are not stated on the pages read.",
      "atmAccess, subAccounts and jointAccounts are not stated on the pages read.",
      "Personal Money Market (0.75% APY at $2,500 to $24,999.99) and the HSA (3.05% APY) were excluded as a money market and a health savings account."
    ]
  },
  {
    "institution": "fairwinds-credit-union",
    "name": "Emergency Savings",
    "url": "https://www.fairwinds.org/personal/savings-accounts/emergency-savings-account",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.59,
      "conditionalApy": 3.1,
      "condition": "Save Smart Savings, which must be opened and kept together with a Spend Smart Checking account (no monthly service charge, $25 to open): 3.10% APY on the first $100,000 and 0.10% APY above it.",
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Emergency Savings pays 5.00% APY (4.89% dividend rate) on the portion of the balance up to $1,000 and 0.10% APY (0.10% dividend rate) on the portion above $1,000, per the Truth-in-Savings disclosure. At $10,000 that blends to 0.59% (5.00% on $1,000 and 0.10% on $9,000); the blended figure is our calculation, not one FAIRWINDS prints. Truth-in-Savings: Last Dividend Declaration Date: 11/23/2026. The standard Freedom Savings pays 0.10% APY.",
      "rateAsOf": "2026-11-23",
      "monthlyFee": 5,
      "waive": "balance",
      "waiveBalance": 300,
      "feeWaiver": "$5 monthly service charge waived with any one of: a $300 average monthly balance, $25 or more deposited or transferred into the account each month, a $10,000 average monthly combined savings balance (excluding checking), a Signature Checking account, or at least one Change it Up round-up deposit a month.",
      "minOpen": 10,
      "minBalanceForApy": null,
      "withdrawalsPerMonth": "unlimited",
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No withdrawal or deposit transaction limitations apply (Truth-in-Savings); every FAIRWINDS savings account lists no withdrawal fee",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "FAIRWINDS Online and the mobile app can request account-to-account transfers with accounts at other financial institutions. Zelle is free in the mobile app and online banking. Emergency Savings cannot be used for overdraft transfers to checking.",
      "atmAccess": null,
      "subAccounts": false,
      "jointAccounts": true,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://www.fairwinds.org/personal/savings-accounts/emergency-savings-account",
        "what": "Product page: 5.00% APY on the first $1,000, rate above $1,000, $10 opening deposit, $5 charge and waivers, limit one per member, no overdraft transfers"
      },
      {
        "url": "https://www.fairwinds.org/rates",
        "what": "Rates page: Emergency, Freedom, Signature, Save Smart and Investor Savings APYs"
      },
      {
        "url": "https://assets.ctfassets.net/dmzde5ytz0gs/1UKjsCJCxACIKZ73qqZsQj/bf439c01aab7e9db031e66ecbdccc9e2/Consumer_TIS_11.23.2026.pdf",
        "what": "Truth-in-Savings disclosure, last dividend declaration 11/23/2026: dividend rates and APYs, tier method, $5 membership share, Save Smart and Spend Smart pairing, no transaction limitations"
      },
      {
        "url": "https://www.fairwinds.org/personal/savings-accounts",
        "what": "Savings comparison: service charges, account requirements, no withdrawal fee"
      },
      {
        "url": "https://www.fairwinds.org/personal/smart-bundle",
        "what": "Smart Bundle: Save Smart Savings 3.10% on the first $100,000, required Spend Smart Checking, no monthly charges"
      },
      {
        "url": "https://assets.ctfassets.net/dmzde5ytz0gs/5Yf7BTz8TNI6Tt3YsgrLEW/7819b31e14c682ffc6fac836ad2df1a5/26-MKT-1203_Update_Service_Charge_Schedule_9.18.26_Update.pdf",
        "what": "Consumer Service Charge Schedule effective January 30, 2026: Emergency Savings $5 charge and waivers, $10 monthly dormant fee after 12 months under $500"
      },
      {
        "url": "https://www.fairwinds.org/move-money",
        "what": "Transfers with other financial institutions, branch cash deposits and withdrawals"
      },
      {
        "url": "https://www.fairwinds.org/personal/zelle",
        "what": "Zelle in the mobile app and online banking"
      },
      {
        "url": "https://assets.ctfassets.net/dmzde5ytz0gs/5Z6hCspIg61WyFq7bX9ZRH/c52d4ef38797ab8c6ed6c48c6a1466f1/Member_Handbook_Reg_CC_Revisions_9.10.26-_MS-011_PROOF.pdf",
        "what": "Member Handbook (Membership and Account Agreement): joint accounts"
      },
      {
        "url": "https://www.fairwinds.org/support/knowledge-base/5ce2aa5324c06747be090fc9",
        "what": "Membership requirements: U.S. resident, age 18 or older"
      },
      {
        "url": "https://www.fairwinds.org/locations",
        "what": "Branch locator: 30 Florida locations"
      },
      {
        "url": "https://www.fairwinds.org/support/contact-us",
        "what": "Member Services phone numbers, 24/7 availability, chat"
      }
    ],
    "notes": [
      "Membership requires a $5 Membership Share in addition to the $10 Emergency Savings opening deposit.",
      "Each savings rate on the rates page shows 'Last updated 11/27/2026', which matched the server's UTC date at the time of the read, so the Truth-in-Savings dividend declaration date (11/23/2026) is used as rateAsOf.",
      "The conditional rate is from Save Smart Savings, a different account from Emergency Savings; it has no monthly service charge and no minimum balance.",
      "Signature Savings (2.15% at $10,000) requires Signature Checking; Investor Savings (3.10%) requires $25,000 in LPL investments; My First Home Savings (3.57%) is a 12-month certificate. All were excluded.",
      "subAccounts false: Emergency Savings is limited to one per member.",
      "atmAccess null: ATM access to this savings account is not stated.",
      "Member Services is labeled 24/7 on the contact page; the page does not say whether live agents, rather than the virtual assistant, answer at all hours."
    ]
  },
  {
    "institution": "campus-usa-credit-union",
    "name": "Savings",
    "url": "https://campuscu.com/personal/banking/savings/",
    "asOf": "2026-11-26",
    "facts": {
      "apy": 0.1,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Savings rate table: $5.00 to $1,999 earns 0.00%; $2,000 to $24,999 earns a 0.10% dividend rate and 0.10% APY; higher tiers pay 0.15% to 0.25%. A $10,000 balance falls in the 0.10% tier. Rates page: Effective as of 11/24/2026. The same savings tiers show for every market area on the rates page (Gainesville, Ocala, Lake City, Tallahassee, Crawfordville, The Villages, Leesburg and Outside Market Area).",
      "rateAsOf": "2026-11-24",
      "monthlyFee": 8,
      "waive": "balance",
      "waiveBalance": 250,
      "feeWaiver": "$8.00 a month if the cumulative average daily balance in your deposit accounts is less than $250. No fee if you are under 18, 55 or over, have an active loan or credit card balance, or have Free Checking.",
      "minOpen": 5,
      "minBalanceForApy": 2000,
      "withdrawalsPerMonth": 6,
      "excessWithdrawalFee": null,
      "withdrawalLimit": "No more than 6 preauthorized, automatic, internet, telephone, check, draft or debit card transfers and withdrawals per month; going over may bring a fee or account closure. ATM cash withdrawals are not limited in number.",
      "externalTransfers": true,
      "instantTransfers": true,
      "transferNotes": "The Online Banking External Funds Transfer Service moves money by ACH between eligible CAMPUS accounts and verified accounts at other institutions (requests after 3 p.m. Eastern process the next business day). Zelle is in the CAMPUS mobile app; the pages do not say whether Zelle can be funded from savings. The ATM card can deposit to, withdraw from and transfer from savings.",
      "atmAccess": true,
      "subAccounts": null,
      "jointAccounts": null,
      "cashDeposit": true
    },
    "sources": [
      {
        "url": "https://campuscu.com/rates/?market_area=Gainesville",
        "what": "Rates page: savings tiers, dividend rates and APYs, effective 11/24/2026; club, Kids and money market rates"
      },
      {
        "url": "https://campuscu.com/fee-schedule/",
        "what": "Fee schedule effective 01/2025: $8 monthly savings fee, $250 balance waiver and other waivers, $15 monthly dormant fee"
      },
      {
        "url": "https://campuscu.com/online-disclosures/",
        "what": "EFT and online services disclosures: 6 transfers per month limit, ATM card access to savings, External Funds Transfer Service"
      },
      {
        "url": "https://campuscu.com/personal/banking/savings/",
        "what": "Banking page: savings, club, Kids and money market account descriptions, Zelle"
      },
      {
        "url": "https://campuscu.com/campus-online-mobile-banking/faq/",
        "what": "Online banking FAQ: external transfer cut-off, Zelle, live chat hours"
      },
      {
        "url": "https://campuscu.com/contact/",
        "what": "Phone numbers"
      },
      {
        "url": "https://campuscu.com/atmslocations/",
        "what": "Locations: 23 locations, service center hours"
      }
    ],
    "notes": [
      "Membership requires credit approval and a $5 initial deposit to a savings account.",
      "No truth-in-savings disclosure was found on the site, so the method for applying tier rates is not stated. If 0.10% applied only to the portion above $2,000, a $10,000 balance would earn 0.08%.",
      "excessWithdrawalFee null: the disclosure says excess transfers may be subject to a fee but the fee schedule lists no amount. The fee schedule separately lists $7.50 for each withdrawal check after the first.",
      "Holiday and Vacation Club accounts (1.00%) pay out once a year on a fixed date and CAMPUS Kids (1.00%) is for ages 17 and under, so they were excluded; Money Market Checking was excluded as a money market.",
      "subAccounts and jointAccounts are not stated for this account on the pages read."
    ]
  }
];

// Institutions checked whose own pages publish no savings rate, so they cannot
// be scored. Shown on the scorecard pages; re-checked with every expansion.
export const SAVINGS_UNPUBLISHED: UnpublishedRate[] = [
  {
    "name": "Southern First Bank",
    "kind": "community-bank",
    "state": "SC",
    "fdicCert": 35295,
    "url": "https://www.southernfirst.com/personal/savings",
    "checked": "2026-11-26",
    "note": "Its savings page and site publish no savings rate. FIRST Savings lists no APY, and the site says to call 877-679-9646 for rates. The site map has no rate page or rate disclosure."
  },
  {
    "name": "Coastal States Bank",
    "kind": "community-bank",
    "state": "SC",
    "fdicCert": 57756,
    "url": "https://www.coastalstatesbank.com/personal/personal-savings/savings-account",
    "checked": "2026-11-26",
    "note": "The Savings Account page and the online account opening page say only competitive interest rates. The site publishes rates only for CDs and money markets."
  },
  {
    "name": "First Community Bank",
    "kind": "community-bank",
    "state": "SC",
    "fdicCert": 34047,
    "url": "https://www.firstcommunitybankers.com/personal/savings-cds",
    "checked": "2026-11-26",
    "note": "The site (now firstcommunitybankers.com) lists terms for Regular and Premium Savings but no interest rate or APY for any account, and it links no rate sheet."
  },
  {
    "name": "South Atlantic Bank",
    "kind": "community-bank",
    "state": "SC",
    "fdicCert": 58689,
    "url": "https://southatlantic.bank/personal/savings/personal-savings/",
    "checked": "2026-11-26",
    "note": "The Personal Savings page says only that the rate is competitive. The site publishes no rate page or rate disclosure."
  },
  {
    "name": "Security Federal Bank",
    "kind": "community-bank",
    "state": "SC",
    "fdicCert": 31100,
    "url": "https://www.securityfederalbank.com/personal/savings/compare-savings-accounts",
    "checked": "2026-11-26",
    "note": "The savings comparison page says only that Regular savings offers competitive interest on balances of $100 or more. The site publishes a checking APY but no savings rate, and its site map has no rates page."
  },
  {
    "name": "First Capital Bank",
    "kind": "community-bank",
    "state": "SC",
    "fdicCert": 34966,
    "url": "https://www.bankwithfirstcapital.com/savings/",
    "checked": "2026-11-26",
    "note": "The Personal Savings page compares Capital Savings and First Savings and says both earn interest, but it lists no rate or APY. The site links no rate sheet. The FDIC web address (bankwithfirstcapitalbank.com) redirects to a placeholder page; the bank's site is bankwithfirstcapital.com."
  },
  {
    "name": "First Bank",
    "kind": "community-bank",
    "state": "NC",
    "fdicCert": 15019,
    "url": "https://localfirstbank.com/personal/savings-accounts-cds/everywhere-savings/",
    "checked": "2026-11-26",
    "note": "localfirstbank.com shows no savings rate: the Everywhere Savings, compare-accounts, money market and CD pages list fees and minimums but no APY, the site has no deposit rates page (/rates/ redirects to an image), and the fee sheet carries no rates."
  },
  {
    "name": "The Fidelity Bank",
    "kind": "community-bank",
    "state": "NC",
    "fdicCert": 11507,
    "url": "https://www.fidelitybanknc.com/personal-banking/savings/personal-savings/",
    "checked": "2026-11-26",
    "note": "fidelitybanknc.com publishes no savings rate. The Personal Savings page gives fees and terms only, and the personal fee disclosure says current rate and yield information is available by contacting your local branch."
  },
  {
    "name": "Southern Bank and Trust Company",
    "kind": "community-bank",
    "state": "NC",
    "fdicCert": 15359,
    "url": "https://www.southernbank.com/personal/savings/",
    "checked": "2026-11-26",
    "note": "southernbank.com publishes no savings rate. The savings page lists features only, the site has no rates page, and the online account opening data shows the Regular Savings rate and APY as TBD."
  },
  {
    "name": "HomeTrust Bank",
    "kind": "community-bank",
    "state": "NC",
    "fdicCert": 27677,
    "url": "https://htb.com/personal-banking/accounts/savings/",
    "checked": "2026-11-26",
    "note": "htb.com publishes no savings rate. The savings page describes Statement Savings and Super Savers with competitive market rates but no APY, and the site map has no deposit rates page."
  },
  {
    "name": "Metro City Bank",
    "kind": "community-bank",
    "state": "GA",
    "fdicCert": 58181,
    "url": "https://www.metrocitybank.bank/personal/products/gold-diamond-and-premium-installment-savings",
    "checked": "2026-11-26",
    "note": "The personal savings page (Personal, Gold and Diamond Personal Savings) says only 'competitive interest' or 'enhanced rates' with no rate figures, and the site and sitemap have no rates page or rate disclosure."
  },
  {
    "name": "Vallant Bank",
    "kind": "community-bank",
    "state": "GA",
    "fdicCert": 14065,
    "url": "https://vallant.bank/personal/savings-plans/simple-savings/",
    "checked": "2026-11-26",
    "note": "The Simple Savings and savings plans pages print no rate or APY, and no rates page was found on vallant.bank (the FAQ also gives no rate)."
  },
  {
    "name": "Colony Bank",
    "kind": "community-bank",
    "state": "GA",
    "fdicCert": 22257,
    "url": "https://colony.bank/personal/savings/regular-savings/",
    "checked": "2026-11-26",
    "note": "The Regular Savings page says it earns interest on the average daily balance but prints no rate (its comparison table lists interest as N/A), and no rates page was found on colony.bank."
  },
  {
    "name": "Queensborough National Bank & Trust",
    "kind": "community-bank",
    "state": "GA",
    "fdicCert": 2138,
    "url": "https://www.qnbtrust.bank/Personal/Accounts/Savings",
    "checked": "2026-11-26",
    "note": "The savings page (Q Savings, Q Young Savers, Q Money Market) prints no rate or APY, and no rates page was found on qnbtrust.bank."
  },
  {
    "name": "Associated Credit Union",
    "kind": "credit-union",
    "state": "GA",
    "fdicCert": null,
    "url": "https://www.acuonline.org/home/rates/personal/savings-iras",
    "checked": "2026-11-26",
    "note": "Its current-quarter savings rates read 'Not Yet Decided': the rates page lists the Q4 2026 (good through December 31, 2026) dividend rate and APY for every savings account that way. The only printed figures are Q3 2026 rates good through September 30, 2026."
  },
  {
    "name": "Thomasville National Bank",
    "kind": "community-bank",
    "state": "GA",
    "fdicCert": 34068,
    "url": "https://tnbank.com/personal-banking/savings-accounts",
    "checked": "2026-11-26",
    "note": "The savings page lists the Personal Savings and Personal Gold Investment Money Market interest rate as 'variable' with no figure, and no rates page or rate disclosure was found on tnbank.com."
  },
  {
    "name": "PeoplesSouth Bank",
    "kind": "community-bank",
    "state": "GA",
    "fdicCert": 21292,
    "url": "https://www.peoplessouth.com/products-and-services/checking-savings-and-time-deposits",
    "checked": "2026-11-26",
    "note": "The Personal Savings Account description gives minimums and fees but no rate or APY, and refers to a Truth-In-Savings disclosure that is not posted; no rates page was found on peoplessouth.com."
  },
  {
    "name": "Capital City Bank",
    "kind": "community-bank",
    "state": "FL",
    "fdicCert": 9622,
    "url": "https://www.ccbg.com/personal/savings",
    "checked": "2026-11-26",
    "note": "Its savings page and site describe Everyday Savings as having tiered interest rates but publish no rate or APY; no rate sheet is linked."
  },
  {
    "name": "The Bank of Tampa",
    "kind": "community-bank",
    "state": "FL",
    "fdicCert": 21031,
    "url": "https://www.bankoftampa.com/personal/personal-banking/",
    "checked": "2026-11-26",
    "note": "Its personal banking page says to speak with a personal banker for current rates on Minaret Savings; no savings rate is published."
  }
];
