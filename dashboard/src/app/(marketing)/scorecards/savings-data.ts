// Savings scorecard rows. Every number was read on the institution's own pages
// on asOf; sources lists them. A rate we could not verify is null, never a
// guess. apy and conditionalApy are what a $10,000 balance earns (blended when
// a rate applies to only part of it). /scorecard-update re-verifies weekly.

import type { ProductRow, SavingsFacts } from './types';

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
      "apy": null,
      "conditionalApy": null,
      "condition": null,
      "conditionMonthlyCost": 0,
      "noRateWithoutCondition": false,
      "apyNote": "Rate not verifiable today: the product page, the savings hub, capitalone.com/360savings, and the account disclosure (dated 11/17/2026) all render the APY as 'NaN'; the rate is filled in client-side and the rate feed could not be reached. Page says the rate is variable, effective 11/25/2026, and applies to all balances (not tiered).",
      "rateAsOf": null,
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
        "url": "https://www.capitalone.com/bank/savings-accounts/online-performance-savings-account/",
        "what": "No fees or minimums, no ATM withdrawals, multiple savings accounts, support hours, APY shown as NaN"
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
  }
];
