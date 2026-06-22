'use client';

import { useMemo, useState } from 'react';
import type { WhiteLabelConfig } from '../_config/types';
import { sampleApplications, type ApplicationSummary } from '../_config/summary';
import { usd } from '../_config/format';
import { LoPreview } from './lo-preview';
import { GenerateLinkButton } from './generate-link';

/**
 * The loan-officer / dashboard perspective of the demo. A lightweight preview
 * of what Phase 2 builds out fully: a queue of incoming white-label
 * applications, each landing fully verified and synced to the core. Selecting
 * one shows the detailed RAVEN report (LoPreview).
 *
 * `liveSummary` is the application the viewer just completed in the borrower
 * flow (if any); it's pinned to the top of the queue as "Just now".
 */
export function OfficerView({
  config,
  liveSummary,
  highlightId,
}: {
  config: WhiteLabelConfig;
  liveSummary: ApplicationSummary | null;
  /** Application to spotlight as a just-arrived item (the demo handoff). */
  highlightId?: string;
}) {
  const queue = useMemo(() => {
    const samples = sampleApplications(config);
    return liveSummary ? [{ ...liveSummary, age: 'Just now' }, ...samples] : samples;
  }, [config, liveSummary]);

  const [selectedId, setSelectedId] = useState(() => highlightId ?? queue[0]?.applicationId);
  const [calloutOpen, setCalloutOpen] = useState(Boolean(highlightId));
  const selected = queue.find((q) => q.applicationId === selectedId) ?? queue[0];
  const highlighted = highlightId ? queue.find((q) => q.applicationId === highlightId) : undefined;

  return (
    <div className="ov-shell">
      <style>{styles}</style>

      <div className="ov-head">
        <div>
          <div className="ov-title">
            RAVEN <span className="ov-sub">Loan Officer Dashboard</span>
          </div>
          <div className="ov-org">{config.branding.name} workspace</div>
        </div>
        <div className="ov-head-actions">
          <GenerateLinkButton config={config} />
          <span className="ov-phase">Phase 2 preview</span>
        </div>
      </div>

      <div className="ov-stats">
        <div className="ov-stat"><div className="ov-stat-num">{queue.length}</div><div className="ov-stat-label">New applications</div></div>
        <div className="ov-stat"><div className="ov-stat-num">{queue.length}</div><div className="ov-stat-label">Fully verified</div></div>
        <div className="ov-stat"><div className="ov-stat-num">~90s</div><div className="ov-stat-label">Avg. verification</div></div>
        <div className="ov-stat"><div className="ov-stat-num">{config.coreSync.system.toUpperCase()}</div><div className="ov-stat-label">Synced to core</div></div>
      </div>

      {calloutOpen && highlighted && (
        <div className="ov-callout" role="status">
          <span className="ov-callout-dot" />
          <span className="ov-callout-text">
            <strong>Just arrived</strong> — {highlighted.profile.identity.fullName}&rsquo;s{' '}
            {highlighted.product.label.toLowerCase()} request for {usd(highlighted.amount)} came in
            fully verified and synced to {config.coreSync.displayName}. No data entry, no document chase.
          </span>
          <button className="ov-callout-x" aria-label="Dismiss" onClick={() => setCalloutOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      <div className="ov-body">
        <div className="ov-queue">
          <div className="ov-queue-head">Incoming queue</div>
          {queue.map((a) => {
            const isNew = a.applicationId === highlightId;
            return (
              <button
                key={a.applicationId}
                className={`ov-row ${a.applicationId === selected?.applicationId ? 'ov-row-active' : ''} ${isNew ? 'ov-row-new' : ''}`}
                onClick={() => setSelectedId(a.applicationId)}
              >
                <span className="ov-row-top">
                  <span className="ov-row-name">{a.profile.identity.fullName}</span>
                  {isNew ? <span className="ov-row-new-tag">NEW</span> : <span className="ov-row-age">{a.age ?? ''}</span>}
                </span>
                <span className="ov-row-meta">
                  {a.product.label} · {usd(a.amount)}
                </span>
                <span className="ov-row-badge">✓ Verified</span>
              </button>
            );
          })}
        </div>

        <div className="ov-detail">
          {selected && <LoPreview config={config} summary={selected} />}
        </div>
      </div>
    </div>
  );
}

const styles = `
  .ov-shell { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; background: #f5f6f7; color: #171717; flex: 1; min-height: 70vh; padding: 1.5rem; }
  .ov-shell * { box-sizing: border-box; }
  .ov-head { display: flex; align-items: center; justify-content: space-between; max-width: 1080px; margin: 0 auto 1.25rem; }
  .ov-title { font-size: 1rem; font-weight: 700; letter-spacing: 0.06em; }
  .ov-sub { font-weight: 500; letter-spacing: 0; color: #737373; font-size: 0.85rem; }
  .ov-org { font-size: 0.78rem; color: #737373; margin-top: 0.15rem; }
  .ov-head-actions { display: flex; align-items: center; gap: 0.85rem; }
  .ov-phase { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #6941c6; background: #f4ebff; border: 1px solid #e9d7fe; border-radius: 999px; padding: 0.3rem 0.7rem; }

  .ov-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; max-width: 1080px; margin: 0 auto 1.25rem; }
  .ov-stat { background: #fff; border: 1px solid #e5e7e5; border-radius: 12px; padding: 1rem 1.1rem; }
  .ov-stat-num { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
  .ov-stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.07em; color: #969696; margin-top: 0.3rem; }

  .ov-callout { display: flex; align-items: flex-start; gap: 0.7rem; max-width: 1080px; margin: 0 auto 1rem; background: #ecfdf3; border: 1px solid #abefc6; border-radius: 12px; padding: 0.85rem 1rem; animation: ovSlide 420ms cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes ovSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
  .ov-callout-dot { flex-shrink: 0; width: 9px; height: 9px; margin-top: 0.3rem; border-radius: 50%; background: #12b76a; box-shadow: 0 0 0 0 rgba(18,183,106,0.5); animation: ovDot 1.6s infinite; }
  @keyframes ovDot { 0% { box-shadow: 0 0 0 0 rgba(18,183,106,0.5); } 70% { box-shadow: 0 0 0 8px rgba(18,183,106,0); } 100% { box-shadow: 0 0 0 0 rgba(18,183,106,0); } }
  .ov-callout-text { flex: 1; font-size: 0.84rem; line-height: 1.55; color: #067647; }
  .ov-callout-text strong { font-weight: 700; }
  .ov-callout-x { flex-shrink: 0; background: none; border: none; color: #067647; cursor: pointer; padding: 0.1rem; line-height: 0; opacity: 0.7; }
  .ov-callout-x:hover { opacity: 1; }

  .ov-body { display: grid; grid-template-columns: 320px 1fr; gap: 1rem; max-width: 1080px; margin: 0 auto; align-items: start; }
  .ov-queue { background: #fff; border: 1px solid #e5e7e5; border-radius: 14px; overflow: hidden; }
  .ov-queue-head { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: #969696; padding: 1rem 1.1rem 0.5rem; }
  .ov-row { display: flex; flex-direction: column; gap: 0.3rem; width: 100%; text-align: left; background: #fff; border: none; border-top: 1px solid #f0f1f0; padding: 0.85rem 1.1rem; cursor: pointer; font-family: inherit; transition: background 150ms; }
  .ov-row:hover { background: #fafbfa; }
  .ov-row-active { background: #f0f7f4; box-shadow: inset 3px 0 0 #006242; }
  .ov-row-active:hover { background: #f0f7f4; }
  .ov-row-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
  .ov-row-name { font-size: 0.92rem; font-weight: 700; }
  .ov-row-age { font-size: 0.7rem; color: #969696; white-space: nowrap; }
  .ov-row-meta { font-size: 0.8rem; color: #525252; }
  .ov-row-badge { font-size: 0.68rem; font-weight: 600; color: #067647; }
  .ov-row-new { animation: ovNewFlash 2.4s ease-out 1; }
  @keyframes ovNewFlash { 0%, 35% { background: #d1fadf; } 100% { background: #fff; } }
  .ov-row-new.ov-row-active { background: #f0f7f4; }
  .ov-row-new-tag { flex-shrink: 0; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.08em; color: #fff; background: #12b76a; border-radius: 4px; padding: 0.15rem 0.4rem; }

  @media (max-width: 820px) {
    .ov-stats { grid-template-columns: repeat(2, 1fr); }
    .ov-body { grid-template-columns: 1fr; }
  }
`;
