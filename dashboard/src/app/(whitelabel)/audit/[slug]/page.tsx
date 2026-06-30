import { Fragment } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendlyButton } from '../../../(marketing)/calendly-button';
import { AnimatedBars, CountUp, ScenarioRange, WhiteLabelPrompt } from '../../../(marketing)/roi/roi-client';
import { computeRoi, getRoiBank, METHODOLOGY_FOOTNOTES } from '../../../(marketing)/roi/roi-data';
import { AUDITS, getAudit } from '../../_config/audit-data';
import { getWlConfig } from '../../_config/registry';
import { buildApplicationSummary } from '../../_config/summary';
import { LoPreview } from '../../_components/lo-preview';

const RAVEN_PATH =
  'M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z';

const STATUS_LABEL: Record<string, string> = { ok: 'Solid', weak: 'Friction', missing: 'No digital path' };

const SEVERITY_LABEL: Record<string, string> = {
  gap: 'High impact',
  friction: 'Enhancement',
  note: 'Advantage',
};

function renderFindingBody(text: string) {
  // Auto-highlight quantitative claims so the card is skimmable at a glance.
  const parts = text.split(
    /(\$[\d,.]+[MKB]?|\b\d+(?:,\d{3})*(?:\.\d+)?%|\b\d+\s+(?:staff\s+)?(?:hours?|days?|minutes?|weeks?|files?|products?|loans?|branches?|employees?)\b|\b\d+\s*(?:of|out\s+of)\s*\d+\b)/gi,
  );
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="aud-stat-hi">{p}</span>
        ) : (
          p
        ),
      )}
    </>
  );
}

const fmtK = (n: number) => `$${Math.round(n / 1000)}K`;

export function generateStaticParams() {
  return AUDITS.filter((a) => getRoiBank(a.slug)).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const audit = getAudit(slug);
  if (!audit) return {};
  const title = `Digital Lending Audit: ${audit.bankName} | RAVEN`;
  const description = `${audit.bankName}'s current digital borrower experience, a live white-label demo of what it could be, and what automated verification would be worth, built from public data.`;
  return {
    title,
    description,
    alternates: { canonical: `https://reportraven.tech/audit/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://reportraven.tech/audit/${slug}`,
      siteName: 'RAVEN',
      type: 'article',
    },
  };
}

export default async function AuditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audit = getAudit(slug);
  const config = getWlConfig(slug);
  const bank = getRoiBank(slug);
  if (!audit || !config || !bank) notFound();

  const demoSummary = buildApplicationSummary(
    config,
    config.products.find((p) => p.id === 'heloc') ?? config.products[0],
    50000,
    'home-improvement',
    { fullName: 'Jordan Carter', email: 'jordan.carter@example.com', phone: '(864) 555-0142', amount: 50000 },
  );

  const roi = computeRoi(bank);
  const applyDomain = `apply.${audit.bankName.toLowerCase().replace(/[^a-z]/g, '')}.com`;

  const laborBars = roi.laborByCategory.map((c) => ({
    label: c.label,
    sublabel: `(${c.count.toLocaleString('en-US')} files/yr)`,
    value: c.value.expected,
    display: fmtK(c.value.expected),
  }));

  const hoursBars = [
    {
      label: 'Hours spent on manual verification today',
      value: roi.expected.hoursRecovered,
      display: `${roi.expected.hoursRecovered.toLocaleString('en-US')} hrs/yr`,
    },
    {
      label: 'Hours with RAVEN',
      value: Math.round(roi.totalVerifications * 0.25),
      display: `~${Math.round(roi.totalVerifications * 0.25).toLocaleString('en-US')} hrs/yr`,
    },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="aud-shell">
        <nav>
          <a href="/" className="aud-nav-logo">
            <svg width={22} height={22} viewBox="0 0 3000 3000" fill="currentColor">
              <path d={RAVEN_PATH} />
              <circle cx="1500" cy="1500" r="1319.5" fill="none" stroke="currentColor" strokeWidth="109" />
            </svg>
            <span className="aud-nav-wordmark">RAVEN</span>
          </a>
          <div className="aud-nav-links">
            <a href={`/wl/${audit.demoSlug}`} target="_blank" rel="noreferrer">Live demo ↗</a>
            <a href="/blog">Blog</a>
            <a href="tel:+12293796131">(229) 379-6131</a>
            <CalendlyButton source={`audit-nav:${audit.slug}`} label="Book a Demo" buttonClassName="aud-btn" />
          </div>
          <a href="/blog" className="aud-nav-blog-mobile">Blog</a>
        </nav>

        <main className="aud-main">
          {/* ── Header ── */}
          <span className="aud-tag">Digital Lending Audit · {audit.auditDate}</span>
          <h1>{audit.bankName}</h1>
          <p className="aud-intro">{audit.summary}</p>

          <div className="aud-stats">
            {audit.stats.map((s) => (
              <div className="aud-stat" key={s.label}>
                <div className="aud-stat-num">{s.value}</div>
                <div className="aud-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── ROI Hero ── */}
          <div className="aud-roi-hero">
            <div className="aud-roi-glow" aria-hidden="true" />
            <div className="aud-roi-eyebrow">Estimated annual value of verification automation</div>
            <div className="aud-headline-num">
              <CountUp value={Math.round(roi.expected.totalValue / 1000)} prefix="$" suffix="K" />
            </div>
            <div className="aud-roi-context">
              expected case &middot; built from public FDIC &amp; HMDA data &middot;{' '}
              <a href="#methodology">see methodology</a>
            </div>
            <ScenarioRange
              low={roi.conservative.totalValue}
              mid={roi.expected.totalValue}
              high={roi.optimistic.totalValue}
            />
            <div className="aud-roi-breakdown">
              <div className="aud-roi-bp">
                <span className="aud-roi-bp-num">{fmtK(roi.expected.laborValue)}</span>
                <span className="aud-roi-bp-label">Staff time recovered</span>
              </div>
              <span className="aud-roi-plus" aria-hidden="true">+</span>
              <div className="aud-roi-bp">
                <span className="aud-roi-bp-num">{fmtK(roi.expected.pullThroughRevenue)}</span>
                <span className="aud-roi-bp-label">Pull-through revenue</span>
              </div>
              <span className="aud-roi-plus" aria-hidden="true">+</span>
              <div className="aud-roi-bp">
                <span className="aud-roi-bp-num">{fmtK(roi.digitalIntake.expected.value)}</span>
                <span className="aud-roi-bp-label">New-resident lead pipeline</span>
              </div>
            </div>
          </div>

          <p className="aud-sub">{bank.intro}</p>

          {/* ── Section 01: Current experience ── */}
          <div className="aud-section-label"><span className="aud-section-num">01</span> Current experience</div>

          <h2>The borrower journey today</h2>
          <p className="aud-sub">
            How a prospective borrower actually moves through {audit.shortName}&rsquo;s digital
            properties right now, line by line.
          </p>
          <div className="aud-journey">
            {audit.currentJourney.map((j) => (
              <div className={`aud-jrow aud-${j.status}`} key={j.channel}>
                <span className="aud-jchannel">{j.channel}</span>
                <span className="aud-jdetail">{j.detail}</span>
                <span className="aud-jstatus">{STATUS_LABEL[j.status]}</span>
              </div>
            ))}
          </div>

          <h2>What we&rsquo;d upgrade</h2>
          <div className="aud-findings">
            {audit.findings.map((f) => (
              <div className={`aud-finding aud-finding-${f.severity}`} key={f.title}>
                <div className="aud-finding-head">
                  <span className={`aud-finding-sev aud-finding-sev-${f.severity}`}>
                    {f.severity === 'gap' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    )}
                    {f.severity === 'friction' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    )}
                    {f.severity === 'note' && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {SEVERITY_LABEL[f.severity]}
                  </span>
                </div>
                <h3>{f.title}</h3>
                <p>{renderFindingBody(f.body)}</p>
              </div>
            ))}
          </div>

          {/* ── Section 02: The upgrade ── */}
          <div className="aud-section-label"><span className="aud-section-num">02</span> The upgrade</div>

          <h2>What it could look like</h2>
          <p className="aud-sub">
            Below is a live, interactive white-label demo in {audit.shortName}&rsquo;s own branding:
            one front door, every product, with identity, income, and property verified
            automatically. Try it, or open it full-screen.
          </p>
          <div className="aud-demo">
            <div className="aud-device">
              <div className="aud-device-bar">
                <span className="aud-device-dot" /><span className="aud-device-dot" /><span className="aud-device-dot" />
                <span className="aud-device-url">{applyDomain}</span>
              </div>
              <iframe className="aud-iframe" src={`/wl/${audit.demoSlug}?chrome=0`} title={`${audit.bankName} white-label demo`} loading="lazy" />
            </div>
            <a className="aud-demo-open" href={`/wl/${audit.demoSlug}`} target="_blank" rel="noreferrer">
              Open the full demo ↗
            </a>
          </div>

          <h2>Before &amp; after</h2>
          <div className="aud-compare-grid">
            <div className="aud-compare-header aud-compare-header-today">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Current state
            </div>
            <div className="aud-compare-arrow-head" aria-hidden="true"></div>
            <div className="aud-compare-header aud-compare-header-raven">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              With RAVEN
            </div>
            {audit.comparison.map((c) => (
              <Fragment key={c.dimension}>
                <div className="aud-compare-dim">{c.dimension}</div>
                <div className="aud-compare-today">{c.today}</div>
                <div className="aud-compare-arrow" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
                <div className="aud-compare-raven">{c.withRaven}</div>
              </Fragment>
            ))}
          </div>

          <h2>What your loan officer receives</h2>
          <p className="aud-sub">
            The instant a borrower finishes that flow, a fully verified application lands in the
            RAVEN dashboard{config.coreSync.system !== 'unknown' && <> and syncs to {config.coreSync.displayName}</>}. No rekeying, no document
            chase, full audit trail.
          </p>
          <div className="aud-lo">
            <LoPreview config={config} summary={demoSummary} />
          </div>

          {/* ── Section 03: The math ── */}
          <div className="aud-section-label"><span className="aud-section-num">03</span> The math</div>

          <h2>Where the time goes today</h2>
          <p className="aud-sub">
            Roughly {roi.totalVerifications.toLocaleString('en-US')} files a year need borrower
            verification at {bank.shortName}: identity, income, employment, assets, and property,
            collected today through document requests and follow-up calls.
            <a href="#methodology" className="aud-fn-mark">[3]</a>
          </p>
          <AnimatedBars
            ariaLabel={`Estimated annual verification hours at ${bank.name} today versus with RAVEN`}
            data={hoursBars}
          />
          <p className="aud-sub">
            That is{' '}
            <strong>
              <CountUp value={roi.expected.hoursRecovered} suffix=" staff hours" />
            </strong>{' '}
            a year in the expected case, recovered as origination capacity rather than headcount
            reduction.<a href="#methodology" className="aud-fn-mark">[1]</a>
          </p>

          <h2>Value by lending line</h2>
          <p className="aud-sub">
            Different files carry different verification loads. Commercial files (beneficial
            ownership, guarantors, business financials) take the longest; consumer files the least.
            Expected-case annual labor value:<a href="#methodology" className="aud-fn-mark">[1]</a>
            <a href="#methodology" className="aud-fn-mark">[2]</a>
          </p>
          <AnimatedBars ariaLabel={`Expected annual labor value by lending line at ${bank.name}`} data={laborBars} />

          <h2>The full math</h2>
          <div className="aud-table-wrap">
            <table className="aud-table aud-table-num">
              <thead>
                <tr>
                  <th>Line</th>
                  <th className="aud-td-num">Conservative</th>
                  <th className="aud-td-num">Expected</th>
                  <th className="aud-td-num">Optimistic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Staff time savings<a href="#methodology" className="aud-fn-mark">[1][2]</a></td>
                  <td className="aud-td-num">{fmtK(roi.conservative.laborValue)}</td>
                  <td className="aud-td-num">{fmtK(roi.expected.laborValue)}</td>
                  <td className="aud-td-num">{fmtK(roi.optimistic.laborValue)}</td>
                </tr>
                <tr>
                  <td>
                    Pull-through revenue ({roi.conservative.pullThroughLoans}&ndash;
                    {roi.optimistic.pullThroughLoans} added closings)
                    <a href="#methodology" className="aud-fn-mark">[4]</a>
                  </td>
                  <td className="aud-td-num">{fmtK(roi.conservative.pullThroughRevenue)}</td>
                  <td className="aud-td-num">{fmtK(roi.expected.pullThroughRevenue)}</td>
                  <td className="aud-td-num">{fmtK(roi.optimistic.pullThroughRevenue)}</td>
                </tr>
                <tr>
                  <td>
                    New-resident lead pipeline ({bank.market.newHouseholdsPerYear.toLocaleString('en-US')} new households/yr)
                    <a href="#methodology" className="aud-fn-mark">[6]</a>
                  </td>
                  <td className="aud-td-num">{fmtK(roi.digitalIntake.conservative.value)}</td>
                  <td className="aud-td-num">{fmtK(roi.digitalIntake.expected.value)}</td>
                  <td className="aud-td-num">{fmtK(roi.digitalIntake.optimistic.value)}</td>
                </tr>
                <tr className="aud-row-total">
                  <td>Total estimated annual value</td>
                  <td className="aud-td-num">{fmtK(roi.conservative.totalValue)}</td>
                  <td className="aud-td-num">{fmtK(roi.expected.totalValue)}</td>
                  <td className="aud-td-num">{fmtK(roi.optimistic.totalValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Strategic context ── */}
          <h2 className="aud-strategic-h">Why this matters for {bank.shortName}</h2>
          <div className="aud-strategic">
            {bank.strategic.map((s) => (
              <div className="aud-card" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="aud-cta">
            <h2>Want this with {audit.shortName}&rsquo;s real products and rates?</h2>
            <p>
              We&rsquo;ll wire your actual product lineup, your rate card,{config.coreSync.system !== 'unknown' ? <> and a {config.coreSync.displayName} sync</> : ''}{' '}
              into a private demo, then pressure-test every number above against your real volumes.
            </p>
            <CalendlyButton source={`audit:${audit.slug}`} label="Book a Demo Call" buttonClassName="aud-cta-btn" />
          </div>

          <WhiteLabelPrompt bankName={audit.shortName} slug={audit.slug} />

          <p className="aud-sub" style={{ marginTop: '2.5rem' }}>
            We also published an independent analysis of {bank.shortName}&apos;s performance and market:
          </p>
          <a href={`/blog/${bank.articleSlug}`} className="aud-article-link">
            Read: {bank.articleTitle}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>

          <div className="aud-methodology" id="methodology">
            <h2>Methodology &amp; footnotes</h2>
            {METHODOLOGY_FOOTNOTES.map((fn) => (
              <div className="aud-fn" key={fn.id}>
                <div className="aud-fn-num">{fn.id}</div>
                <p className="aud-fn-body"><strong>{fn.title}.</strong> {fn.body}</p>
              </div>
            ))}
            <p className="aud-sources">Digital audit sources: {audit.sources}</p>
            <p className="aud-sources">ROI data sources: {bank.sources}</p>
          </div>
        </main>

        <footer>
          <span>&copy; {new Date().getFullYear()} RAVEN</span>
          <span className="aud-foot-contact">
            <a href="tel:+12293796131">(229) 379-6131</a>
            <span aria-hidden="true"> · </span>
            <a href="mailto:isaac@reportraven.tech">isaac@reportraven.tech</a>
          </span>
        </footer>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
  .aud-shell *, .aud-shell *::before, .aud-shell *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .aud-shell {
    --black: #0A0A0A;
    --g900: #171717; --g800: #262626; --g600: #525252; --g500: #737373; --g400: #A3A3A3; --g300: #D4D4D4; --g200: #E5E5E5;
    --gray-900: #171717; --gray-800: #262626; --gray-600: #525252; --gray-500: #737373; --gray-400: #A3A3A3; --gray-300: #D4D4D4; --gray-200: #E5E5E5;
    --white: #fff;
    --accent: #6C8EFF;
    --accent-dim: rgba(108,142,255,0.12);
    --accent-border: rgba(108,142,255,0.25);
    font-family: 'DM Sans', sans-serif;
    background: var(--black);
    color: var(--white);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  /* Nav */
  .aud-shell nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 3rem; background: rgba(10,10,10,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); }
  .aud-nav-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--white); }
  .aud-nav-wordmark { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.14em; }
  .aud-nav-links { display: flex; gap: 2rem; align-items: center; }
  .aud-nav-links a { color: var(--g400); text-decoration: none; font-size: 0.85rem; transition: color 200ms; }
  .aud-nav-links a:hover { color: var(--white); }
  .aud-nav-blog-mobile { display: none; color: var(--g300); text-decoration: none; font-size: 0.85rem; font-weight: 500; padding: 0.5rem 0.9rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; }
  .aud-btn { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; background: var(--white); color: var(--black); cursor: pointer; transition: opacity 200ms; white-space: nowrap; }
  .aud-btn:hover { opacity: 0.85; }

  /* Main layout */
  .aud-main { max-width: 880px; margin: 0 auto; padding: 9rem 1.5rem 4rem; }
  .aud-tag { display: inline-block; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--g500); margin-bottom: 1rem; }
  .aud-main h1 { font-size: clamp(2rem,4.5vw,3rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.12; margin-bottom: 1.25rem; }
  .aud-intro { font-size: 1.1rem; line-height: 1.8; color: var(--g300); max-width: 760px; margin-bottom: 2.5rem; }
  .aud-main h2 { font-size: 1.6rem; font-weight: 600; letter-spacing: -0.015em; margin: 3.5rem 0 0.75rem; }
  .aud-sub { font-size: 0.95rem; color: var(--g400); line-height: 1.7; margin-bottom: 2rem; max-width: 720px; }
  .aud-sub a { color: var(--g300); }

  /* Stats strip */
  .aud-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }
  .aud-stat { background: var(--black); padding: 1.5rem 1.25rem; }
  .aud-stat-num { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
  .aud-stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--g500); margin-top: 0.5rem; }

  /* ROI Hero */
  .aud-roi-hero {
    position: relative;
    text-align: center;
    padding: 3.5rem 2rem 2.5rem;
    margin: 0 0 2rem;
    border: 1px solid var(--accent-border);
    border-radius: 20px;
    background: rgba(108,142,255,0.04);
    overflow: hidden;
  }
  .aud-roi-glow {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 260px;
    background: radial-gradient(ellipse, rgba(108,142,255,0.18), transparent 65%);
    pointer-events: none;
  }
  .aud-roi-eyebrow { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; position: relative; }
  .aud-headline-num { font-size: clamp(3rem,8vw,5rem); font-weight: 700; letter-spacing: -0.04em; color: var(--accent); position: relative; }
  .aud-roi-context { font-size: 0.8rem; color: var(--g500); margin-top: 0.75rem; position: relative; }
  .aud-roi-context a { color: var(--g400); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 1px; }
  .aud-roi-context a:hover { color: var(--white); }
  .aud-roi-breakdown {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 5rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.08);
    flex-wrap: wrap;
    position: relative;
  }
  .aud-roi-bp { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
  .aud-roi-bp-num { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; color: var(--white); }
  .aud-roi-bp-label { font-size: 0.72rem; color: var(--g500); text-transform: uppercase; letter-spacing: 0.1em; }
  .aud-roi-plus { font-size: 1.2rem; color: var(--accent-border); font-weight: 300; margin-bottom: 1.2rem; }

  /* Section labels */
  .aud-section-label { display: flex; align-items: center; gap: 0.75rem; margin: 4rem 0 -1rem; }
  .aud-section-num { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; color: var(--accent); background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: 999px; padding: 0.2rem 0.6rem; }
  .aud-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

  /* Journey */
  .aud-journey { display: flex; flex-direction: column; gap: 0.5rem; }
  .aud-jrow { display: grid; grid-template-columns: 200px 1fr auto; gap: 1rem; align-items: center; padding: 1rem 1.25rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; border-left-width: 3px; }
  .aud-jrow.aud-ok { border-left-color: #22c55e; }
  .aud-jrow.aud-weak { border-left-color: #f59e0b; }
  .aud-jrow.aud-missing { border-left-color: #ef4444; }
  .aud-jchannel { font-size: 0.95rem; font-weight: 600; }
  .aud-jdetail { font-size: 0.85rem; color: var(--g400); line-height: 1.55; }
  .aud-jstatus { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--g300); white-space: nowrap; border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; padding: 0.25rem 0.7rem; }
  .aud-ok .aud-jstatus { color: #86efac; border-color: rgba(34,197,94,0.4); }
  .aud-weak .aud-jstatus { color: #fcd34d; border-color: rgba(245,158,11,0.4); }
  .aud-missing .aud-jstatus { color: #fca5a5; border-color: rgba(239,68,68,0.4); }

  /* Findings */
  .aud-findings { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.25rem; }
  .aud-finding { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; background: rgba(255,255,255,0.02); border-top-width: 3px; }
  .aud-finding-gap { border-top-color: var(--accent); }
  .aud-finding-friction { border-top-color: #f59e0b; }
  .aud-finding-note { border-top-color: #22c55e; }
  .aud-finding-head { margin-bottom: 0.9rem; }
  .aud-finding-sev { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 999px; }
  .aud-finding-sev-gap { background: rgba(108,142,255,0.15); color: var(--accent); }
  .aud-finding-sev-friction { background: rgba(245,158,11,0.15); color: #fcd34d; }
  .aud-finding-sev-note { background: rgba(34,197,94,0.15); color: #86efac; }
  .aud-finding h3 { font-size: 1.02rem; font-weight: 600; margin-bottom: 0.65rem; line-height: 1.3; }
  .aud-finding p { font-size: 0.86rem; color: var(--g400); line-height: 1.7; }
  .aud-stat-hi { font-weight: 700; color: var(--g200); background: rgba(255,255,255,0.06); border-radius: 3px; padding: 0 3px; }

  /* Demo embed */
  .aud-demo { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
  .aud-device { width: 100%; max-width: 480px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; overflow: hidden; background: #000; box-shadow: 0 24px 80px rgba(0,0,0,0.5); }
  .aud-device-bar { display: flex; align-items: center; gap: 0.4rem; padding: 0.7rem 1rem; background: #1a1a1a; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .aud-device-dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.2); }
  .aud-device-url { margin-left: 0.75rem; font-size: 0.72rem; color: var(--g500); }
  .aud-iframe { width: 100%; height: 680px; border: none; background: #fff; display: block; }
  .aud-demo-open { font-size: 0.9rem; font-weight: 500; color: var(--black); background: var(--white); padding: 0.75rem 1.4rem; border-radius: 8px; text-decoration: none; transition: opacity 200ms; }
  .aud-demo-open:hover { opacity: 0.85; }

  /* Tables */
  .aud-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .aud-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .aud-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--g500); font-weight: 500; padding: 0.7rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.15); }
  .aud-table td { padding: 0.9rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); vertical-align: top; color: var(--g300); }
  .aud-table td:first-child { color: var(--white); }
  /* Before & after comparison grid */
  .aud-compare-grid { display: grid; grid-template-columns: minmax(120px, 1.5fr) 2fr 28px 2fr; gap: 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; font-size: 0.88rem; }
  .aud-compare-header { display: flex; align-items: center; gap: 0.45rem; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 0.75rem 1rem; }
  .aud-compare-header-today { background: rgba(245,158,11,0.1); color: #fcd34d; grid-column: 2; }
  .aud-compare-arrow-head { background: rgba(255,255,255,0.03); grid-column: 3; }
  .aud-compare-header-raven { background: rgba(108,142,255,0.12); color: var(--accent); grid-column: 4; }
  .aud-compare-dim { padding: 0.85rem 1rem; font-weight: 600; color: var(--white); font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; background: rgba(255,255,255,0.01); }
  .aud-compare-today { padding: 0.85rem 1rem; color: var(--g400); border-top: 1px solid rgba(255,255,255,0.06); line-height: 1.5; display: flex; align-items: center; background: rgba(245,158,11,0.04); }
  .aud-compare-arrow { display: flex; align-items: center; justify-content: center; color: var(--g600); border-top: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
  .aud-compare-raven { padding: 0.85rem 1rem; color: var(--g200); border-top: 1px solid rgba(255,255,255,0.06); line-height: 1.5; display: flex; align-items: center; background: rgba(108,142,255,0.05); }
  .aud-table-num th:last-child { color: var(--g500); }
  .aud-td-num { text-align: right; font-variant-numeric: tabular-nums; }
  th.aud-td-num { text-align: right; }
  .aud-table-num tr.aud-row-total td { font-weight: 700; color: var(--accent); border-top: 1px solid rgba(108,142,255,0.3); }
  .aud-fn-mark { color: var(--g500); font-size: 0.75em; vertical-align: super; text-decoration: none; }
  .aud-fn-mark:hover { color: var(--white); }

  .aud-lo { margin-top: 0.5rem; }

  /* ROI scenario range */
  .roi-range { margin: 4.5rem 0 3.5rem; padding: 0 2.5rem; }
  .roi-range-track { position: relative; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); }
  .roi-range-fill { position: absolute; inset: 0; border-radius: 3px; background: linear-gradient(90deg, rgba(108,142,255,0.4), var(--accent)); transform: scaleX(0); transform-origin: left; transition: transform 1200ms cubic-bezier(0.22,1,0.36,1); }
  .roi-range-in .roi-range-fill { transform: scaleX(1); }
  .roi-range-marker { position: absolute; top: -4px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.3rem; opacity: 0; transition: opacity 500ms ease 900ms; }
  .roi-range-in .roi-range-marker { opacity: 1; }
  .roi-range-marker::before { content: ''; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); border: 3px solid var(--black); box-shadow: 0 0 0 1px var(--accent-border); }
  .roi-range-num { font-size: 1.05rem; font-weight: 700; margin-top: 0.4rem; }
  .roi-range-tag { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--g500); }

  /* ROI bars */
  .roi-bars { display: flex; flex-direction: column; gap: 1.4rem; margin: 2rem 0; }
  .roi-bar-head { display: flex; justify-content: space-between; margin-bottom: 0.5rem; gap: 1rem; }
  .roi-bar-label { font-size: 0.9rem; color: var(--g300); }
  .roi-bar-sublabel { color: var(--g500); font-size: 0.8rem; }
  .roi-bar-value { font-size: 0.9rem; font-weight: 600; white-space: nowrap; color: var(--accent); }
  .roi-bar-track { height: 10px; border-radius: 5px; background: rgba(255,255,255,0.07); overflow: hidden; }
  .roi-bar-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, rgba(108,142,255,0.5), var(--accent)); width: 0%; transition: width 1100ms cubic-bezier(0.22,1,0.36,1); }

  /* Strategic cards */
  .aud-strategic-h { margin-top: 3.5rem; }
  .aud-strategic { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin: 2rem 0 3.5rem; }
  .aud-card { border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid var(--accent); border-radius: 0 12px 12px 0; padding: 1.6rem; background: rgba(108,142,255,0.03); }
  .aud-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.6rem; line-height: 1.35; }
  .aud-card p { font-size: 0.85rem; color: var(--g400); line-height: 1.65; }

  /* Methodology */
  .aud-methodology { margin-top: 4rem; padding-top: 2.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
  .aud-methodology h2 { font-size: 1.2rem; margin: 0 0 1.5rem; }
  .aud-fn { display: flex; gap: 0.9rem; margin-bottom: 1.25rem; }
  .aud-fn-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--accent-border); background: var(--accent-dim); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--accent); }
  .aud-fn-body { font-size: 0.84rem; color: var(--g400); line-height: 1.7; }
  .aud-fn-body strong { color: var(--g200); font-weight: 600; }
  .aud-article-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--g300); text-decoration: none; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.6rem 1.1rem; margin-top: 1rem; transition: border-color 200ms, color 200ms; }
  .aud-article-link:hover { border-color: rgba(255,255,255,0.4); color: var(--white); }

  /* CTA */
  .aud-cta { text-align: center; margin: 4.5rem 0 2rem; padding: 3.5rem 2rem; border: 1px solid var(--accent-border); border-radius: 16px; background: rgba(108,142,255,0.04); }
  .aud-cta h2 { margin: 0 0 0.75rem; }
  .aud-cta p { font-size: 0.95rem; color: var(--g400); margin-bottom: 2rem; max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.7; }
  .aud-cta-btn { font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600; padding: 1rem 2rem; border-radius: 10px; border: none; background: var(--accent); color: var(--white); cursor: pointer; transition: opacity 200ms; white-space: nowrap; }
  .aud-cta-btn:hover { opacity: 0.85; }

  .aud-sources { font-size: 0.75rem; color: var(--g600); line-height: 1.7; margin-top: 1.25rem; font-style: italic; }

  /* WhiteLabelPrompt modal */
  .demo-modal-overlay { --black: #0A0A0A; --white: #fff; --g500: #737373; --gray-400: #A3A3A3; --gray-500: #737373; }

  /* Interest form (used in WhiteLabelPrompt) */
  .interest-form { max-width: 520px; margin: 0 auto; }
  .form-row { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
  .form-input { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: var(--white); outline: none; transition: border-color 200ms; flex: 1; min-width: 160px; }
  .form-input::placeholder { color: var(--g500); }
  .form-input:focus { border-color: rgba(255,255,255,0.4); }
  .form-btn { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; background: var(--white); color: var(--black); cursor: pointer; transition: opacity 200ms; white-space: nowrap; }
  .form-btn:hover { opacity: 0.85; }
  .form-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-error { color: #ef4444; font-size: 0.8rem; margin-top: 0.75rem; }
  .form-success { text-align: center; }
  .form-success-check { width: 48px; height: 48px; border-radius: 50%; background: rgba(34,197,94,0.15); color: #22c55e; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
  .form-success-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.3rem; }
  .form-success-sub { font-size: 0.9rem; color: var(--g400); }

  /* Demo modal animations */
  @keyframes demoOverlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes demoModalIn { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .demo-modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(10,10,10,0.45); backdrop-filter: blur(16px) saturate(160%); -webkit-backdrop-filter: blur(16px) saturate(160%); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: demoOverlayIn 250ms ease-out both; }
  .demo-modal { animation: demoModalIn 380ms cubic-bezier(0.22,1,0.36,1) 60ms both; font-family: 'DM Sans', sans-serif; position: relative; width: 100%; max-width: 560px; background: rgba(23,23,23,0.85); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 3rem 2.5rem 2.5rem; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.5); }
  .demo-modal h2 { font-size: 1.6rem; font-weight: 600; letter-spacing: -0.02em; color: #fff; margin-bottom: 0.75rem; }
  .demo-modal > p { font-size: 0.95rem; color: #A3A3A3; line-height: 1.7; margin-bottom: 1.75rem; }
  .demo-modal-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #737373; cursor: pointer; padding: 0.4rem; line-height: 0; transition: color 200ms; }
  .demo-modal-close:hover { color: #fff; }
  @media (prefers-reduced-motion: reduce) { .demo-modal-overlay, .demo-modal { animation: none; } }

  /* Footer */
  .aud-shell footer { padding: 2rem 3rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
  .aud-shell footer span { font-size: 0.75rem; color: var(--g600); }
  .aud-foot-contact a { color: var(--g300); text-decoration: none; transition: color 200ms; }
  .aud-foot-contact a:hover { color: var(--white); }

  @media (max-width: 768px) {
    .aud-shell nav { padding: 1rem 1.5rem; }
    .aud-nav-links { display: none; }
    .aud-nav-blog-mobile { display: inline-block; }
    .aud-main { padding: 7rem 1.25rem 3rem; }
    .aud-stats { grid-template-columns: repeat(2,1fr); }
    .aud-findings { grid-template-columns: 1fr; }
    .aud-strategic { grid-template-columns: 1fr; }
    .aud-jrow { grid-template-columns: 1fr; gap: 0.4rem; }
    .aud-jstatus { justify-self: start; }
    .aud-iframe { height: 600px; }
    .aud-table { font-size: 0.8rem; }
    .aud-table th, .aud-table td { padding: 0.6rem 0.6rem; }
    .aud-shell footer { padding: 1.5rem; flex-direction: column; gap: 1rem; }

    /* ROI hero */
    .aud-roi-hero { padding: 2rem 1.1rem 1.75rem; }
    .aud-roi-breakdown { flex-direction: column; align-items: center; gap: 1.25rem; padding-top: 1.5rem; margin-top: 5rem; }
    .aud-roi-plus { display: none; }
    .aud-roi-bp { flex-direction: row; align-items: center; gap: 0.75rem; }
    .aud-roi-bp-label { text-align: left; }

    /* Scenario range */
    .roi-range { margin: 4.5rem 0 0; padding: 0; }
    .roi-range-num { font-size: 0.8rem; }
    .roi-range-tag { font-size: 0.6rem; }
    .roi-range-low { transform: none; align-items: flex-start; }
    .roi-range-low .roi-range-tag { display: none; }
    .roi-range-high { left: auto; right: 0; transform: none; align-items: flex-end; }

    /* Section labels */
    .aud-section-label { margin: 2.5rem 0 -1rem; }

    /* Before & after: collapse 4-column to stacked per row */
    .aud-compare-grid { grid-template-columns: 1fr; }
    .aud-compare-header { display: none; }
    .aud-compare-arrow-head { display: none; }
    .aud-compare-arrow { display: none; }
    .aud-compare-header-today,
    .aud-compare-arrow-head,
    .aud-compare-header-raven { grid-column: 1; }
    .aud-compare-dim {
      background: rgba(255,255,255,0.03);
      border-top: 1px solid rgba(255,255,255,0.1);
      border-bottom: none;
      color: var(--g500);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.55rem 1rem;
    }
    .aud-compare-today {
      border-top: none;
      border-bottom: 1px solid rgba(245,158,11,0.12);
      flex-direction: column;
      align-items: flex-start;
      padding: 0.6rem 1rem 0.65rem;
      gap: 0.3rem;
      font-size: 0.84rem;
    }
    .aud-compare-raven {
      border-top: none;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.6rem 1rem 0.85rem;
      gap: 0.3rem;
      font-size: 0.84rem;
    }
    .aud-compare-today::before {
      content: 'Before';
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #fcd34d;
      flex-shrink: 0;
    }
    .aud-compare-raven::before {
      content: 'With RAVEN';
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      flex-shrink: 0;
    }
  }
`;
