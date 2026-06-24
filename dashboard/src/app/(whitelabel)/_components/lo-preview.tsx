import type { WhiteLabelConfig } from '../_config/types';
import type { ApplicationSummary } from '../_config/summary';
import { usd, pct } from '../_config/format';
import { PdfButton } from './pdf-button';

/**
 * The loan-officer view of a completed white-label intake — i.e. what lands in
 * the RAVEN dashboard the moment a borrower finishes the branded flow. Rendered
 * RAVEN-side (neutral light dashboard), not in the bank's branding, because
 * this is the product the bank's staff log into. Used at the end of the
 * borrower journey and embedded on the audit/comparison page.
 *
 * Plain component (no hooks) so it works in both client and server trees.
 */
export function LoPreview({
  config,
  summary,
}: {
  config: WhiteLabelConfig;
  summary: ApplicationSummary;
}) {
  const { profile } = summary;
  const verificationOnly = summary.amount === 0 && !summary.range;
  const rangeSingle = summary.range ? summary.range.lowApr === summary.range.highApr : false;
  const modules = [
    { name: 'Identity', value: `${profile.identity.fullName} · SSN •••• ${profile.identity.ssnLast4}`, source: 'Socure' },
    { name: 'Contact', value: `${profile.contact.email} · ${profile.contact.phone}`, source: 'Socure' },
    { name: 'Income & Employment', value: `${profile.employment.employer} · ${usd(profile.employment.annualIncome)}/yr`, source: 'Truework' },
    { name: 'Bank & Assets', value: `${profile.financial.institution} · ${usd(profile.financial.checkingBalance + profile.financial.savingsBalance)} on deposit`, source: 'Plaid' },
    { name: 'Property', value: `${usd(profile.residence.estimatedValue)} est. value · ${usd(profile.residence.mortgageBalance)} lien`, source: 'Melissa' },
    { name: 'Credit', value: `${profile.credit.score} · ${profile.credit.openTradelines} tradelines · ${profile.credit.derogatories} derog.`, source: 'Experian' },
  ].filter((m) => {
    // Only show modules this product actually pulled.
    const pulled = new Set(summary.verified.map((v) => v.module));
    const map: Record<string, string> = {
      Identity: 'identity', Contact: 'contact', 'Income & Employment': 'employment',
      'Bank & Assets': 'financial', Property: 'residence', Credit: 'credit',
    };
    return pulled.has(map[m.name]);
  });

  return (
    <div className="lo-preview">
      <style>{`
        .lo-preview { font-family: 'DM Sans', -apple-system, sans-serif; background: #ffffff; color: #171717; border-radius: 14px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .lo-preview * { box-sizing: border-box; }
        .lo-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.25rem; border-bottom: 1px solid #ededed; background: #fafafa; }
        .lo-brand { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; color: #0A0A0A; }
        .lo-brand-sub { font-weight: 500; letter-spacing: 0; color: #737373; font-size: 0.72rem; }
        .lo-env { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #737373; border: 1px solid #e5e5e5; border-radius: 999px; padding: 0.2rem 0.6rem; }
        .lo-head { padding: 1.25rem; border-bottom: 1px solid #f0f0f0; }
        .lo-head-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .lo-app-id { font-size: 0.72rem; color: #737373; font-variant-numeric: tabular-nums; }
        .lo-name { font-size: 1.15rem; font-weight: 700; margin: 0.15rem 0 0; }
        .lo-pill { font-size: 0.7rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 999px; background: #ecfdf3; color: #067647; border: 1px solid #abefc6; white-space: nowrap; }
        .lo-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #f0f0f0; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden; margin-top: 1rem; }
        .lo-meta-cell { background: #fff; padding: 0.75rem 0.85rem; }
        .lo-meta-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: #969696; }
        .lo-meta-val { font-size: 0.92rem; font-weight: 600; margin-top: 0.2rem; }
        .lo-section-title { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: #969696; padding: 1rem 1.25rem 0.4rem; }
        .lo-mod { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.7rem 1.25rem; border-top: 1px solid #f4f4f4; }
        .lo-check { flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%; background: #ecfdf3; color: #067647; display: flex; align-items: center; justify-content: center; margin-top: 0.1rem; }
        .lo-mod-body { flex: 1; min-width: 0; }
        .lo-mod-name { font-size: 0.82rem; font-weight: 600; }
        .lo-mod-val { font-size: 0.8rem; color: #525252; margin-top: 0.1rem; overflow-wrap: anywhere; }
        .lo-mod-src { flex-shrink: 0; font-size: 0.65rem; color: #969696; border: 1px solid #ededed; border-radius: 6px; padding: 0.15rem 0.45rem; align-self: flex-start; margin-top: 0.1rem; }
        .lo-offer { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.75rem; padding: 0.6rem 0.85rem; border-radius: 10px; background: #f0f7f4; border: 1px solid #cdeadd; }
        .lo-offer-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: #067647; font-weight: 700; }
        .lo-offer-val { font-size: 0.88rem; font-weight: 700; color: #044d32; }
        .lo-foot { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 1rem 1.25rem; border-top: 1px solid #f0f0f0; background: #fafafa; flex-wrap: wrap; }
        .lo-foot-sync { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #525252; }
        .lo-sync-dot { width: 7px; height: 7px; border-radius: 50%; background: #12b76a; box-shadow: 0 0 0 3px rgba(18,183,106,0.15); }
        .lo-pdf-btn { display: inline-flex; align-items: center; gap: 0.45rem; font-family: inherit; font-size: 0.78rem; font-weight: 600; color: #171717; background: #fff; border: 1px solid #d4d4d4; border-radius: 8px; padding: 0.5rem 0.85rem; cursor: pointer; transition: border-color 150ms, background 150ms; white-space: nowrap; }
        .lo-pdf-btn:hover { border-color: #006242; color: #006242; }
        @media (max-width: 640px) { .lo-meta { grid-template-columns: repeat(2, 1fr); } .lo-foot { flex-direction: column; align-items: stretch; } .lo-pdf-btn { justify-content: center; } }
      `}</style>

      <div className="lo-topbar">
        <span className="lo-brand">
          RAVEN <span className="lo-brand-sub">Loan Officer Dashboard</span>
        </span>
        <span className="lo-env">{config.branding.name} · workspace</span>
      </div>

      <div className="lo-head">
        <div className="lo-head-row">
          <div>
            <div className="lo-app-id">Application {summary.applicationId}</div>
            <h3 className="lo-name">{profile.identity.fullName}</h3>
          </div>
          <span className="lo-pill">✓ Verified · ready for review</span>
        </div>
        <div className="lo-meta">
          <div className="lo-meta-cell">
            <div className="lo-meta-label">Product</div>
            <div className="lo-meta-val">{summary.product.label}</div>
          </div>
          <div className="lo-meta-cell">
            <div className="lo-meta-label">{verificationOnly ? 'Scope' : 'Requested'}</div>
            <div className="lo-meta-val">{verificationOnly ? 'Identity + data' : usd(summary.amount)}</div>
          </div>
          <div className="lo-meta-cell">
            <div className="lo-meta-label">{summary.ltv !== null ? 'Combined LTV' : 'Est. DTI'}</div>
            <div className="lo-meta-val">
              {summary.ltv !== null ? pct(summary.ltv) : summary.dti !== null ? pct(summary.dti) : '—'}
            </div>
          </div>
          <div className="lo-meta-cell">
            <div className="lo-meta-label">{summary.range ? (rangeSingle ? 'Est. rate' : 'Est. rate range') : 'Status'}</div>
            <div className="lo-meta-val">
              {summary.range
                ? rangeSingle
                  ? pct(summary.range.lowApr)
                  : `${pct(summary.range.lowApr)}–${pct(summary.range.highApr)}`
                : verificationOnly
                  ? 'Verified'
                  : 'Pending decision'}
            </div>
          </div>
        </div>

        {summary.range && (
          <div className="lo-offer">
            <span className="lo-offer-label">{summary.creditPulled ? 'Estimated rate (credit-priced)' : 'Estimated range (no credit pull)'}</span>
            <span className="lo-offer-val">
              {rangeSingle
                ? `${pct(summary.range.lowApr)} APR`
                : `${pct(summary.range.lowApr)}–${pct(summary.range.highApr)} APR`}{' '}
              ·{' '}
              {summary.range.termMonths % 12 === 0
                ? `${summary.range.termMonths / 12} yr`
                : `${summary.range.termMonths} mo`}{' '}
              · {rangeSingle
                ? `${usd(summary.range.lowPayment)}/mo`
                : `${usd(summary.range.lowPayment)}–${usd(summary.range.highPayment)}/mo`}
            </span>
          </div>
        )}
      </div>

      <div className="lo-section-title">Verified borrower data</div>
      {modules.map((m) => (
        <div className="lo-mod" key={m.name}>
          <span className="lo-check">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <div className="lo-mod-body">
            <div className="lo-mod-name">{m.name}</div>
            <div className="lo-mod-val">{m.value}</div>
          </div>
          <span className="lo-mod-src">{m.source}</span>
        </div>
      ))}

      <div className="lo-foot">
        <span className="lo-foot-sync">
          <span className="lo-sync-dot" />
          Synced to {config.coreSync.displayName} · ref {summary.coreRef} · pulled in ~90s
        </span>
        <PdfButton />
      </div>
    </div>
  );
}
