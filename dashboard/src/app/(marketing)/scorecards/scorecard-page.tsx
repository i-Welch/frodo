import { SiteShell } from '../site-shell';
import { snapshotStyles } from '../bank-snapshot/styles';
import { ScorecardTable } from './scorecard-table';
import { scorecardStyles } from './styles';
import { scorecardFaqs } from './faq';
import { bestOn, rankedRows } from './scoring';
import { tableData } from './view-data';
import { SITE, scorecardPath } from './products';
import { NATIONAL_KINDS, SCORECARD_STATES, STATE_LABELS, type ProductType, type ScorecardView } from './types';

// Shared body of the Southeast-wide and per-state scorecard pages.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scorecardTitle(type: ProductType<any>, view: ScorecardView) {
  const where = view === 'all' ? 'the Southeast' : STATE_LABELS[view].name;
  const label = type.label.replace(/\b\w/g, (c) => c.toUpperCase());
  const month = new Date(`${type.updated}T12:00:00Z`).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return `Best ${label} in ${where} (${month}), Scored and Ranked`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scorecardDescription(type: ProductType<any>, view: ScorecardView) {
  const rows = rankedRows(type, view);
  const ranked = rows.filter((r) => r.overall !== null);
  const where = view === 'all' ? 'SC, NC, GA and FL' : STATE_LABELS[view].name;
  return `${ranked.length} ${type.label.toLowerCase()} from fintechs, the big five banks and local banks and credit unions in ${where}, scored on rate, fees, money movement, in-person access and protections. Every fact sourced and dated; verified ${type.updated}.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ScorecardPage({ type, view }: { type: ProductType<any>; view: ScorecardView }) {
  const rows = rankedRows(type, view);
  const ranked = rows.filter((r) => r.overall !== null);
  const faqs = scorecardFaqs(type, view);
  const where = view === 'all' ? 'the Southeast' : STATE_LABELS[view].name;
  const url = `${SITE}${scorecardPath(type.slug, view === 'all' ? undefined : view)}`;
  const local = rows.filter((r) => !NATIONAL_KINDS.includes(r.inst.kind)).length;

  const leaders = [
    { label: 'Top score', row: ranked[0], detail: ranked[0] && `${ranked[0].overall!.toFixed(1)} / 10` },
    { label: 'Best rate', row: bestOn(rows, 'rate'), detail: undefined as string | undefined },
    {
      label: view === 'all' ? 'Best with branches' : `Best with a ${view} branch`,
      row: ranked.find((r) => (view === 'all' ? Object.values(r.inst.branches).some((n) => n > 0) : r.inst.branches[view] > 0)),
      detail: undefined as string | undefined,
    },
    { label: 'Best local institution', row: ranked.find((r) => !NATIONAL_KINDS.includes(r.inst.kind)), detail: undefined as string | undefined },
  ].filter((l, i, all) => l.row && !all.slice(0, i).some((p) => p.row?.inst.slug === l.row!.inst.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${url}#dataset`,
        name: `RAVEN ${type.label} Scorecard${view === 'all' ? '' : `: ${where}`}`,
        description: scorecardDescription(type, view),
        url,
        creator: { '@id': `${SITE}/#organization` },
        isAccessibleForFree: true,
        dateModified: type.updated,
        distribution: { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${SITE}/scorecards/${type.slug}/data.csv` },
        spatialCoverage: view === 'all' ? 'SC, NC, GA, FL, United States' : { '@type': 'State', name: where },
      },
      {
        '@type': 'ItemList',
        name: scorecardTitle(type, view),
        itemListElement: ranked.slice(0, 10).map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${r.inst.name} ${r.row.name}`,
          url: r.row.url,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Product Scorecards', item: `${SITE}/scorecards` },
          { '@type': 'ListItem', position: 3, name: type.label, item: `${SITE}${scorecardPath(type.slug)}` },
          ...(view === 'all' ? [] : [{ '@type': 'ListItem', position: 4, name: where, item: url }]),
        ],
      },
    ],
  };

  return (
    <SiteShell ctaSource={`scorecard-${type.slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{snapshotStyles + scorecardStyles}</style>
      <div className="bsn-page sc-page">
        <div className="bsn-eyebrow">
          <a href="/scorecards">Product Scorecards</a>
          {view !== 'all' && (
            <>
              {' / '}
              <a href={scorecardPath(type.slug)}>{type.label}</a>
            </>
          )}
        </div>
        <h1>
          Best {type.label.toLowerCase()} in {where}
        </h1>
        <p className="bsn-meta">
          Verified {type.updated} &middot; {ranked.length} ranked &middot; free to cite with attribution to RAVEN (reportraven.tech) &middot;{' '}
          <a href={`/scorecards/${type.slug}/data.csv`}>CSV</a>
        </p>
        <p>
          We scored the {type.singular} at {rows.length} institutions {view === 'all' ? 'serving the Southeast' : `serving ${where}`}: fintech apps
          and online banks, the big five banks, and {local} local {local === 1 ? 'bank or credit union' : 'banks and credit unions'}
          {view === 'all' ? ' headquartered in South Carolina, North Carolina, Georgia and Florida' : ` with branches in ${where}`}. Each gets a
          0 to 10 score on five criteria and an overall score, and every number links to the page it came from.
        </p>

        <div className="sc-leaders">
          {leaders.map((l) => (
            <div className="sc-leader" key={l.label}>
              <div className="sc-leader-label">{l.label}</div>
              <div className="sc-leader-name">{l.row!.inst.name}</div>
              <div className="sc-leader-detail">{l.detail ?? `${type.headline.label}: ${type.headline.value(l.row!.row)} · ${l.row!.overall!.toFixed(1)} / 10`}</div>
            </div>
          ))}
        </div>

        <h2>The scorecard</h2>
        <ScorecardTable data={tableData(type)} view={view === 'all' ? undefined : view} />

        <h2>What each score measures</h2>
        <dl className="sc-criteria">
          {type.criteria.map((c) => (
            <div key={c.key}>
              <dt>{c.label}</dt>
              <dd>{c.description}</dd>
            </div>
          ))}
        </dl>

        <h2>Method</h2>
        {type.method.map((m) => (
          <p key={m}>{m}</p>
        ))}
        <p>
          No institution pays to be listed or ranked, and the scorecard carries no affiliate links. Rates change often: check the
          institution&rsquo;s own page before you open an account.
        </p>

        <h2 id="faq">Frequently asked questions</h2>
        {faqs.map((f) => (
          <div key={f.q}>
            <h3 className="bsn-faq-q">{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        <div className="bsn-callout">
          <strong>Run a community bank or credit union?</strong> The scorecard shows where local institutions lead (branches, service) and where
          online banks pull deposits away (rate, digital money movement). <a href="/services">See how RAVEN helps banks modernize their deposit products</a>.
        </div>

        <p className="bsn-note">
          {view === 'all' ? 'By state: ' : 'Other states: '}
          {SCORECARD_STATES.filter((s) => s !== view).map((s, i) => (
            <span key={s}>
              {i > 0 && ' · '}
              <a href={scorecardPath(type.slug, s)}>{STATE_LABELS[s].name}</a>
            </span>
          ))}
          {view !== 'all' && (
            <>
              {' · '}
              <a href={scorecardPath(type.slug)}>All four states</a>
            </>
          )}
        </p>
      </div>
    </SiteShell>
  );
}
