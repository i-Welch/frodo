import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InterestForm } from '../../../(marketing)/interest-form';
import { DemoModal } from '../../../(marketing)/demo-modal';
import { AUDITS, getAudit } from '../../_config/audit-data';
import { getWlConfig } from '../../_config/registry';
import { buildApplicationSummary } from '../../_config/summary';
import { LoPreview } from '../../_components/lo-preview';

const RAVEN_PATH =
  'M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8ZM1326.1,1075.5c50.8-26.4,106-35.6,161.9-39.4,111.3-7.5,221.7-2.3,329.1,32,28.7,9.2,56.6,20.3,85.5,35-222-20.9-439.8-17.1-656.4,43.6,23-29.9,47.6-54.5,79.8-71.3ZM1150.4,943.8c31.7.5,57,26.5,56.9,58.5,0,30.6-26.9,56.6-57.6,55.9-31.8-.8-57-27-56.6-58.8.4-31.6,25.6-56,57.3-55.5Z';

export function generateStaticParams() {
  return AUDITS.map((a) => ({ slug: a.slug }));
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
  const description = `A look at ${audit.bankName}'s current digital borrower experience, and a live white-label demo of what it could be with RAVEN.`;
  return {
    title,
    description,
    robots: { index: false, follow: false },
  };
}

const STATUS_LABEL: Record<string, string> = { ok: 'Solid', weak: 'Friction', missing: 'No digital path' };

export default async function AuditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audit = getAudit(slug);
  const config = getWlConfig(slug);
  if (!audit || !config) notFound();

  // A representative completed application to show the loan-officer view.
  const demoSummary = buildApplicationSummary(
    config,
    config.products.find((p) => p.id === 'heloc') ?? config.products[0],
    50000,
    'home-improvement',
    { fullName: 'Jordan Carter', email: 'jordan.carter@example.com', phone: '(864) 555-0142', amount: 50000 },
  );

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
            <DemoModal source={`audit-nav:${audit.slug}`} label="Request a Demo" buttonClassName="aud-btn" />
          </div>
        </nav>

        <main className="aud-main">
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

          {/* The journey today */}
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

          {/* Findings */}
          <h2>What we&rsquo;d change</h2>
          <div className="aud-findings">
            {audit.findings.map((f) => (
              <div className={`aud-finding aud-finding-${f.severity}`} key={f.title}>
                <span className="aud-finding-sev">{f.severity}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>

          {/* Live demo embed */}
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
                <span className="aud-device-url">apply.arthurstatebank.com</span>
              </div>
              <iframe className="aud-iframe" src={`/wl/${audit.demoSlug}?chrome=0`} title={`${audit.bankName} white-label demo`} loading="lazy" />
            </div>
            <a className="aud-demo-open" href={`/wl/${audit.demoSlug}`} target="_blank" rel="noreferrer">
              Open the full demo ↗
            </a>
          </div>

          {/* Comparison */}
          <h2>Today vs. with RAVEN</h2>
          <div className="aud-table-wrap">
            <table className="aud-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Today</th>
                  <th>With RAVEN white-label</th>
                </tr>
              </thead>
              <tbody>
                {audit.comparison.map((c) => (
                  <tr key={c.dimension}>
                    <td className="aud-dim">{c.dimension}</td>
                    <td className="aud-today">{c.today}</td>
                    <td className="aud-raven">{c.withRaven}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LO view */}
          <h2>What your loan officer receives</h2>
          <p className="aud-sub">
            The instant a borrower finishes that flow, a fully verified application lands in the
            RAVEN dashboard and syncs to {config.coreSync.displayName}. No rekeying, no document
            chase, full audit trail.
          </p>
          <div className="aud-lo">
            <LoPreview config={config} summary={demoSummary} />
          </div>

          <div className="aud-cta">
            <h2>Want this with {audit.shortName}&rsquo;s real products and rates?</h2>
            <p>
              We&rsquo;ll wire your actual product lineup, your rate card, and a Jack Henry sync into
              a private demo, then walk your team through it end to end.
            </p>
            <InterestForm source={`audit:${audit.slug}`} />
          </div>

          <p className="aud-sources">Sources: {audit.sources}</p>
        </main>

        <footer>
          <span>&copy; {new Date().getFullYear()} RAVEN</span>
          <span>reportraven.tech</span>
        </footer>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
  .aud-shell *, .aud-shell *::before, .aud-shell *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .aud-shell { --black:#0A0A0A; --g900:#171717; --g600:#525252; --g500:#737373; --g400:#A3A3A3; --g300:#D4D4D4; --g200:#E5E5E5; --white:#fff; --raven:#22c55e;
    font-family:'DM Sans',sans-serif; background:var(--black); color:var(--white); -webkit-font-smoothing:antialiased; min-height:100vh; }
  .aud-shell nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center; padding:1.5rem 3rem; background:rgba(10,10,10,0.8); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-bottom:1px solid rgba(255,255,255,0.06); }
  .aud-nav-logo { display:flex; align-items:center; gap:0.6rem; text-decoration:none; color:var(--white); }
  .aud-nav-wordmark { font-size:0.85rem; font-weight:700; letter-spacing:0.14em; }
  .aud-nav-links { display:flex; gap:2rem; align-items:center; }
  .aud-nav-links a { color:var(--g400); text-decoration:none; font-size:0.85rem; transition:color 200ms; }
  .aud-nav-links a:hover { color:var(--white); }
  .aud-btn { font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:500; padding:0.8rem 1.5rem; border-radius:8px; border:none; background:var(--white); color:var(--black); cursor:pointer; transition:opacity 200ms; white-space:nowrap; }
  .aud-btn:hover { opacity:0.85; }

  .aud-main { max-width:880px; margin:0 auto; padding:9rem 1.5rem 4rem; }
  .aud-tag { display:inline-block; font-size:0.7rem; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--g500); margin-bottom:1rem; }
  .aud-main h1 { font-size:clamp(2rem,4.5vw,3rem); font-weight:700; letter-spacing:-0.025em; line-height:1.12; margin-bottom:1.25rem; }
  .aud-intro { font-size:1.1rem; line-height:1.8; color:var(--g300); max-width:760px; margin-bottom:2.5rem; }
  .aud-main h2 { font-size:1.6rem; font-weight:600; letter-spacing:-0.015em; margin:3.5rem 0 0.75rem; }
  .aud-sub { font-size:0.95rem; color:var(--g400); line-height:1.7; margin-bottom:2rem; max-width:700px; }

  .aud-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; margin-bottom:1rem; }
  .aud-stat { background:var(--black); padding:1.5rem 1.25rem; }
  .aud-stat-num { font-size:1.5rem; font-weight:700; letter-spacing:-0.02em; }
  .aud-stat-label { font-size:0.72rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--g500); margin-top:0.5rem; }

  /* Journey */
  .aud-journey { display:flex; flex-direction:column; gap:0.5rem; }
  .aud-jrow { display:grid; grid-template-columns:200px 1fr auto; gap:1rem; align-items:center; padding:1rem 1.25rem; border:1px solid rgba(255,255,255,0.08); border-radius:10px; border-left-width:3px; }
  .aud-jrow.aud-ok { border-left-color:#22c55e; }
  .aud-jrow.aud-weak { border-left-color:#f59e0b; }
  .aud-jrow.aud-missing { border-left-color:#ef4444; }
  .aud-jchannel { font-size:0.95rem; font-weight:600; }
  .aud-jdetail { font-size:0.85rem; color:var(--g400); line-height:1.55; }
  .aud-jstatus { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--g300); white-space:nowrap; border:1px solid rgba(255,255,255,0.15); border-radius:999px; padding:0.25rem 0.7rem; }
  .aud-ok .aud-jstatus { color:#86efac; border-color:rgba(34,197,94,0.4); }
  .aud-weak .aud-jstatus { color:#fcd34d; border-color:rgba(245,158,11,0.4); }
  .aud-missing .aud-jstatus { color:#fca5a5; border-color:rgba(239,68,68,0.4); }

  /* Findings */
  .aud-findings { display:grid; grid-template-columns:repeat(2,1fr); gap:1.25rem; }
  .aud-finding { border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.5rem; background:rgba(255,255,255,0.02); }
  .aud-finding-sev { display:inline-block; font-size:0.62rem; text-transform:uppercase; letter-spacing:0.12em; font-weight:600; padding:0.2rem 0.55rem; border-radius:999px; margin-bottom:0.8rem; }
  .aud-finding-gap .aud-finding-sev { background:rgba(239,68,68,0.15); color:#fca5a5; }
  .aud-finding-friction .aud-finding-sev { background:rgba(245,158,11,0.15); color:#fcd34d; }
  .aud-finding-note .aud-finding-sev { background:rgba(34,197,94,0.15); color:#86efac; }
  .aud-finding h3 { font-size:1.02rem; font-weight:600; margin-bottom:0.5rem; line-height:1.3; }
  .aud-finding p { font-size:0.86rem; color:var(--g400); line-height:1.65; }

  /* Demo embed */
  .aud-demo { display:flex; flex-direction:column; align-items:center; gap:1.25rem; }
  .aud-device { width:100%; max-width:480px; border:1px solid rgba(255,255,255,0.12); border-radius:16px; overflow:hidden; background:#000; box-shadow:0 24px 80px rgba(0,0,0,0.5); }
  .aud-device-bar { display:flex; align-items:center; gap:0.4rem; padding:0.7rem 1rem; background:#1a1a1a; border-bottom:1px solid rgba(255,255,255,0.08); }
  .aud-device-dot { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,0.2); }
  .aud-device-url { margin-left:0.75rem; font-size:0.72rem; color:var(--g500); }
  .aud-iframe { width:100%; height:680px; border:none; background:#fff; display:block; }
  .aud-demo-open { font-size:0.9rem; font-weight:500; color:var(--black); background:var(--white); padding:0.75rem 1.4rem; border-radius:8px; text-decoration:none; transition:opacity 200ms; }
  .aud-demo-open:hover { opacity:0.85; }

  /* Comparison */
  .aud-table-wrap { overflow-x:auto; }
  .aud-table { width:100%; border-collapse:collapse; font-size:0.9rem; }
  .aud-table th { text-align:left; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--g500); font-weight:500; padding:0.7rem 1rem; border-bottom:1px solid rgba(255,255,255,0.15); }
  .aud-table th:last-child { color:#86efac; }
  .aud-table td { padding:0.9rem 1rem; border-bottom:1px solid rgba(255,255,255,0.06); vertical-align:top; }
  .aud-dim { color:var(--white); font-weight:600; width:30%; }
  .aud-today { color:var(--g400); }
  .aud-raven { color:var(--g200); }

  .aud-lo { margin-top:0.5rem; }

  .aud-cta { text-align:center; margin:4.5rem 0 2rem; padding:3.5rem 2rem; border:1px solid rgba(255,255,255,0.1); border-radius:16px; background:rgba(255,255,255,0.03); }
  .aud-cta h2 { margin:0 0 0.75rem; }
  .aud-cta p { font-size:0.95rem; color:var(--g400); margin-bottom:2rem; max-width:520px; margin-left:auto; margin-right:auto; line-height:1.7; }
  .aud-sources { font-size:0.75rem; color:var(--g600); line-height:1.7; margin-top:2.5rem; font-style:italic; }

  .interest-form { max-width:520px; margin:0 auto; }
  .form-row { display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; }
  .form-input { font-family:'DM Sans',sans-serif; font-size:0.9rem; padding:0.8rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:var(--white); outline:none; transition:border-color 200ms; flex:1; min-width:160px; }
  .form-input::placeholder { color:var(--g500); }
  .form-input:focus { border-color:rgba(255,255,255,0.4); }
  .form-btn { font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:500; padding:0.8rem 1.5rem; border-radius:8px; border:none; background:var(--white); color:var(--black); cursor:pointer; transition:opacity 200ms; white-space:nowrap; }
  .form-btn:hover { opacity:0.85; }
  .form-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .form-error { color:#ef4444; font-size:0.8rem; margin-top:0.75rem; }
  .form-success { text-align:center; }
  .form-success-check { width:48px; height:48px; border-radius:50%; background:rgba(34,197,94,0.15); color:#22c55e; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; }
  .form-success-title { font-size:1.2rem; font-weight:600; margin-bottom:0.3rem; }
  .form-success-sub { font-size:0.9rem; color:var(--g400); }

  .aud-shell footer { padding:2rem 3rem; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; align-items:center; }
  .aud-shell footer span { font-size:0.75rem; color:var(--g600); }

  @media (max-width:768px) {
    .aud-shell nav { padding:1rem 1.5rem; }
    .aud-nav-links a:not(.aud-btn) { display:none; }
    .aud-main { padding:7rem 1.25rem 3rem; }
    .aud-stats { grid-template-columns:repeat(2,1fr); }
    .aud-findings { grid-template-columns:1fr; }
    .aud-jrow { grid-template-columns:1fr; gap:0.4rem; }
    .aud-jstatus { justify-self:start; }
    .aud-iframe { height:600px; }
    .aud-shell footer { padding:1.5rem; flex-direction:column; gap:1rem; }
  }
`;
