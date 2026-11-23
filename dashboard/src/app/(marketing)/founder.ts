/**
 * Founder facts: the single source for the homepage founder section, the About
 * page, JSON-LD and llms.txt. Isaac asked for a high-level biography: name
 * Upstart and Affirm and the stack he has worked with, but no job titles,
 * dates or bank-client names.
 */

const SITE = 'https://reportraven.tech';

export const FOUNDER = {
  name: 'Isaac Welch',
  location: 'Greenville, South Carolina',
  email: 'isaac@reportraven.tech',
  headline:
    'A bank technology consultant who built the banking arm of Upstart and Affirm, helping banks set up operations, integrate modern technology, adopt AI safely, and pass examiner scrutiny, with software he has built himself.',
  bio: [
    'Isaac Welch built the banking arm at Upstart and at Affirm: the side of a lending fintech that has to work with partner banks, their regulators, and the systems in between. It is the same machinery every bank runs on (a core, an origination system, verification, compliance) built to the standard a regulated partner bank and its examiners expect.',
    'Since then he has helped traditional banks modernize their stack, with hands-on work on the Finxact cloud core, Plaid income verification, and the Vesta loan origination system. Along the way he built RAVEN’s borrower verification software.',
    'RAVEN is the practice he runs from Greenville, South Carolina, for new banks and community banks that want an operator who has built this from the inside, not a vendor with something to sell or an advisor who has only read about it.',
  ],
  experience: [
    'Built the banking arm at Upstart',
    'Built the banking arm at Affirm',
    'Core modernization on Finxact',
    'Plaid income verification',
    'Vesta loan origination',
    'Built RAVEN verification software',
  ],
  sameAs: ['https://www.linkedin.com/in/isaac-welch-22a463179', 'https://github.com/i-Welch'],
} as const;

/** Person node for JSON-LD graphs. Employers only, no dates. */
export function founderJsonLd(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': `${SITE}/about#founder`,
    name: FOUNDER.name,
    jobTitle: 'Founder, bank technology consultant',
    url: `${SITE}/about`,
    email: FOUNDER.email,
    sameAs: [...FOUNDER.sameAs],
    alumniOf: [
      { '@type': 'Organization', name: 'Upstart' },
      { '@type': 'Organization', name: 'Affirm' },
    ],
    knowsAbout: [
      'De novo bank operations',
      'Core banking modernization',
      'Loan origination systems',
      'Income verification',
      'AI governance in banking',
      'Fintech bank partnerships',
      'IT examination readiness',
      'Borrower verification',
    ],
    workLocation: { '@type': 'Place', name: FOUNDER.location },
  };
}
