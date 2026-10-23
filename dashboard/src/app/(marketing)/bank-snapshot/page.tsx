import type { Metadata } from 'next';
import { SiteShell } from '../site-shell';
import { LeadCapture } from '../lead-capture';
import { DEFAULT_OG_IMAGES } from '@/app/og-default';
import { BankSearch } from './bank-search';
import { snapshotStyles } from './styles';

const URL = 'https://reportraven.tech/bank-snapshot';

export const metadata: Metadata = {
  title: 'Bank Peer Snapshot: Compare Any Bank to Its Peers (FDIC Data)',
  description:
    'Free peer comparison for any FDIC-insured bank: return on assets, net interest margin, efficiency ratio, assets per employee, and loan-to-deposit ratio against same-size banks in its state, from the latest call report.',
  alternates: { canonical: URL },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: 'Bank Peer Snapshot',
    description: 'How does your bank compare with banks its size in your state? Latest FDIC call report data, free.',
    url: URL,
    siteName: 'RAVEN',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${URL}#tool`,
      name: 'RAVEN Bank Peer Snapshot',
      url: URL,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      creator: { '@id': 'https://reportraven.tech/#organization' },
      description:
        'Compares an FDIC-insured bank with same-size banks in its state on return on assets, net interest margin, efficiency ratio, assets per employee, and loan-to-deposit ratio.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://reportraven.tech' },
        { '@type': 'ListItem', position: 2, name: 'Bank Peer Snapshot', item: URL },
      ],
    },
  ],
};

const EXAMPLES = [
  { cert: 2102, name: 'The Conway National Bank', slug: 'the-conway-national-bank' },
  { cert: 15085, name: 'Arthur State Bank', slug: 'arthur-state-bank' },
  { cert: 76181, name: 'First Reliance Bank', slug: 'first-reliance-bank' },
];

export default function BankSnapshotPage() {
  return (
    <SiteShell ctaSource="bank-snapshot">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{snapshotStyles}</style>
      <div className="bsn-page">
        <div className="bsn-eyebrow">Free tool</div>
        <h1>Bank peer snapshot</h1>
        <p>
          How does a bank compare with banks its size in its state? Pick any FDIC-insured bank to see
          its latest call report figures next to the peer median: return on assets, net interest
          margin, efficiency ratio, assets per employee, and loan-to-deposit ratio, with where it
          ranks among its peers. Or browse <a href="/bank-rankings">every bank in a state, ranked</a>.
        </p>
        <BankSearch />
        <p className="bsn-meta">
          Examples:{' '}
          {EXAMPLES.map((e, i) => (
            <span key={e.cert}>
              {i > 0 && ' · '}
              <a href={`/bank-snapshot/${e.cert}-${e.slug}`}>{e.name}</a>
            </span>
          ))}
        </p>
        <h2>How the peer group is built</h2>
        <p>
          Peers are banks in the same state with half to twice the bank&rsquo;s total assets, as of
          the same call report quarter. When a state has fewer than eight such banks, the comparison
          uses the same asset band nationally. All figures come from the FDIC&rsquo;s public BankFind
          data and refresh as each quarter&rsquo;s call reports post.
        </p>
        <h2>Why efficiency and assets per employee matter</h2>
        <p>
          A large share of a community bank&rsquo;s noninterest expense is staff time spent chasing
          documents: pay stubs, bank statements, employment letters, identity checks. Banks that
          verify borrowers from the source run leaner on both measures. See what{' '}
          <a href="/solutions">borrower verification automation</a> changes, or read how community
          banks compare on <a href="/blog">lending, fraud, and growth</a>.
        </p>
        <LeadCapture variant="audit" source="bank-snapshot" title="Want the full picture for your bank?" />
      </div>
    </SiteShell>
  );
}
