'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WhiteLabelConfig, WLProduct } from '../../_config/types';
import { matchProducts } from '../../_config/types';
import { intakeToSummary, type ApplicationSummary } from '../../_config/summary';
import {
  FLOWS,
  getFlow,
  type FlowKind,
} from '../../_config/flows';
import { client } from '../../_client';
import type { Intake, PullStep, SubmitResult } from '../../_client/client';
import { usd, pct, indefiniteArticle } from '../../_config/format';
import { LoPreview } from '../../_components/lo-preview';
import { OfficerView } from '../../_components/officer-view';
import { MockAction } from '../../_components/mock-action';

type Perspective = 'borrower' | 'officer';

// Handoff pacing (tune these for live-demo cadence).
const BRIDGE_DELAY_MS = 2600;
const HANDOFF_AUTO_ADVANCE_MS = 14000;

const MODULE_LABELS: Record<string, string> = {
  identity: 'Identity',
  contact: 'Contact info',
  employment: 'Income & employment',
  residence: 'Property / residence',
  financial: 'Bank accounts & assets',
  credit: 'Credit',
};
const DEFAULT_DATA_ONLY_MODULES = ['identity', 'employment', 'financial'];

const fmtTerm = (m: number) => (m % 12 === 0 ? `${m / 12} yr` : `${m} mo`);

export function Journey({
  config,
  initialFlow,
  showChrome = true,
  prefill,
}: {
  config: WhiteLabelConfig;
  initialFlow: FlowKind;
  showChrome?: boolean;
  /** Seeded from a generated verification link (LO view): predetermined modules
   * + the borrower's contact info. */
  prefill?: {
    modules?: string[];
    applicant?: { fullName: string; email: string; phone: string };
  };
}) {
  const b = config.branding;
  const allowedFlows = config.defaultFlows ?? (['rate_range'] as FlowKind[]);

  const [flow, setFlow] = useState<FlowKind>(initialFlow);
  const [stageIndex, setStageIndex] = useState(0);
  const [perspective, setPerspective] = useState<Perspective>('borrower');

  // Collected inputs
  const [purpose, setPurpose] = useState(config.purposes[0].value);
  const [amount, setAmount] = useState(50000);
  const [product, setProduct] = useState<WLProduct | null>(null);
  // data_only: the modules are predetermined by the link the requester generates
  // (the customer doesn't choose). A verification link supplies them; otherwise
  // the demo uses a fixed default set. Only known module ids are honored.
  const [modules] = useState<string[]>(() => {
    const fromLink = prefill?.modules?.filter((m) => m in MODULE_LABELS);
    return fromLink && fromLink.length > 0 ? fromLink : DEFAULT_DATA_ONLY_MODULES;
  });
  const [applicant, setApplicant] = useState(
    prefill?.applicant ?? { fullName: '', email: '', phone: '' },
  );

  // Server-side (client seam) results
  const [intake, setIntake] = useState<Intake | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const advancingRef = useRef(false);

  // Demo officer view
  const [showLo, setShowLo] = useState(false);
  const [handoff, setHandoff] = useState<'idle' | 'bridging' | 'done'>('idle');
  const [highlightLive, setHighlightLive] = useState(false);
  const bridgedRef = useRef(false);

  const flowDef = getFlow(flow);
  const stages = flowDef.stages;
  const stage = stages[stageIndex];
  const liveSummary: ApplicationSummary | null = intake ? intakeToSummary(config, intake) : null;

  const { sliderMin, sliderMax } = useMemo(() => {
    const ps = config.products.filter((p) => p.purposes.includes(purpose));
    if (ps.length === 0) return { sliderMin: 5000, sliderMax: 500000 };
    return {
      sliderMin: Math.min(...ps.map((p) => p.minAmount)),
      sliderMax: Math.max(...ps.map((p) => p.maxAmount)),
    };
  }, [config.products, purpose]);

  useEffect(() => {
    setAmount((a) => Math.min(Math.max(a, sliderMin), sliderMax));
  }, [sliderMin, sliderMax]);

  const matched = useMemo(() => matchProducts(config, amount, purpose), [config, amount, purpose]);

  function resetTo(nextFlow: FlowKind) {
    setFlow(nextFlow);
    setStageIndex(0);
    setProduct(null);
    setIntake(null);
    setSubmitResult(null);
    setShowLo(false);
    setHandoff('idle');
    setHighlightLive(false);
    bridgedRef.current = false;
    setPerspective('borrower');
  }

  async function startIntakeNow(): Promise<Intake> {
    return client.startIntake({
      slug: config.slug,
      flow,
      applicant: {
        fullName: applicant.fullName.trim(),
        email: applicant.email.trim(),
        phone: applicant.phone.trim(),
      },
      product: product ?? undefined,
      amount: product ? amount : undefined,
      purpose: product ? purpose : undefined,
      modules: flow === 'data_only' ? modules : undefined,
    });
  }

  // Generic stage advance. Side effects are keyed off the stage we're entering:
  // entering dataPull starts the intake; entering confirmation submits it.
  const advance = useCallback(async () => {
    const next = stages[stageIndex + 1];
    // Ref guard blocks same-tick re-entry (a fast double-click would otherwise
    // advance twice, skipping a stage and double-firing the intake). The `busy`
    // state is only for disabling UI.
    if (!next || advancingRef.current) return;
    advancingRef.current = true;
    setBusy(true);
    try {
      let current = intake;
      if (next === 'dataPull' && !current) {
        current = await startIntakeNow();
        setIntake(current);
      }
      if (next === 'confirmation' && !submitResult) {
        if (!current) {
          current = await startIntakeNow();
          setIntake(current);
        }
        setSubmitResult(await client.submit(current.intakeId));
      }
      setStageIndex((i) => i + 1);
    } finally {
      setBusy(false);
      advancingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, stageIndex, intake, submitResult, flow, product, amount, purpose, applicant, modules]);

  const back = useCallback(() => setStageIndex((i) => Math.max(0, i - 1)), []);

  async function chooseTerm(termMonths: number) {
    if (!intake) return;
    const updated = await client.selectTerm(intake.intakeId, termMonths);
    setIntake({ ...updated });
  }

  const goToQueue = useCallback(() => {
    setHandoff('done');
    setHighlightLive(true);
    setPerspective('officer');
  }, []);

  useEffect(() => {
    if (stage !== 'confirmation' || perspective !== 'borrower' || bridgedRef.current) return;
    bridgedRef.current = true;
    const t = setTimeout(() => setHandoff('bridging'), BRIDGE_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage, perspective]);

  const switchPerspective = useCallback(
    (p: Perspective) => {
      if (p === 'officer' && intake) setHighlightLive(true);
      setHandoff('done');
      setPerspective(p);
    },
    [intake],
  );

  const cssVars = {
    '--wl-primary': b.primary,
    '--wl-primary-dark': b.primaryDark,
    '--wl-accent': b.accent,
    '--wl-bg': b.bg,
    '--wl-surface': b.surface,
    '--wl-text': b.text,
    '--wl-muted': b.textMuted,
    '--wl-border': b.border,
    '--wl-radius': b.radius,
    '--wl-font': b.font,
  } as React.CSSProperties;

  const onBack = stageIndex > 0 ? back : undefined;

  function renderStage() {
    switch (stage) {
      case 'frontDoor':
        return (
          <FrontDoor
            config={config}
            purpose={purpose}
            setPurpose={setPurpose}
            amount={amount}
            setAmount={setAmount}
            sliderMin={sliderMin}
            sliderMax={sliderMax}
            onContinue={advance}
            matchedCount={matched.length}
          />
        );
      case 'product':
        return (
          <Products
            products={matched}
            amount={amount}
            onBack={onBack}
            onSelect={(p) => {
              setProduct(p);
              setAmount((a) => Math.min(Math.max(a, p.minAmount), p.maxAmount));
              advance();
            }}
          />
        );
      case 'applicant':
        return (
          <Applicant
            product={product}
            amount={amount}
            applicant={applicant}
            setApplicant={setApplicant}
            onBack={onBack}
            onContinue={advance}
          />
        );
      case 'consent':
        return <Consent config={config} flow={flow} modules={modules} onBack={onBack} onContinue={advance} busy={busy} />;
      case 'dataPull':
        return intake ? (
          <DataPull
            shortName={b.shortName}
            firstName={applicant.fullName.split(' ')[0]}
            steps={intake.steps}
            onDone={advance}
          />
        ) : (
          <Loading />
        );
      case 'rate':
        return intake?.range ? (
          <RateStage
            config={config}
            intake={intake}
            onSelectTerm={chooseTerm}
            onContinue={advance}
          />
        ) : (
          <Loading />
        );
      case 'confirmation':
        return submitResult && liveSummary ? (
          <Confirmation
            config={config}
            summary={liveSummary}
            terminal={submitResult.terminal}
            showLo={showLo}
            setShowLo={setShowLo}
          />
        ) : (
          <Loading />
        );
      default:
        return null;
    }
  }

  const bankHeader = (
    <>
      <header className="wl-header">
        <div className="wl-wordmark">
          <span className="wl-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
          </span>
          <div>
            <div className="wl-bankname">{b.wordmark}</div>
            {b.tagline && <div className="wl-tagline">{b.tagline}</div>}
          </div>
        </div>
        <MockAction
          placement="bottom"
          align="right"
          note={`On the live site, this opens ${b.shortName}'s online banking. It's mocked up for the demo.`}
        >
          {(toggle) => (
            <a className="wl-login" href="#" onClick={toggle}>Log in</a>
          )}
        </MockAction>
      </header>
      {stageIndex > 0 && (
        <div className="wl-progress">
          <div
            className="wl-progress-fill"
            style={{ width: `${(stageIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
      )}
    </>
  );

  const borrowerShell = (
    <div className="wl-shell">
      <main className="wl-main">{renderStage()}</main>
      <footer className="wl-footer">
        <span>{b.name} · Member FDIC · Equal Housing Lender</span>
        <span className="wl-powered">Powered by RAVEN</span>
      </footer>
    </div>
  );

  return (
    <div className="wl-demo-root" style={cssVars}>
      <style>{styles}</style>
      <div className="wl-sticky-top">
        {showChrome && (
          <DemoBanner
            bankName={b.name}
            perspective={perspective}
            onSwitch={switchPerspective}
            flow={flow}
            allowedFlows={allowedFlows}
            onSwitchFlow={resetTo}
          />
        )}
        {perspective === 'borrower' && bankHeader}
      </div>
      {perspective === 'officer' ? (
        <OfficerView
          config={config}
          liveSummary={liveSummary}
          highlightId={highlightLive && liveSummary ? liveSummary.applicationId : undefined}
        />
      ) : (
        borrowerShell
      )}
      {handoff === 'bridging' && perspective === 'borrower' && liveSummary && (
        <HandoffOverlay config={config} summary={liveSummary} onProceed={goToQueue} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Demo banner (perspective toggle + flow switcher)                    */
/* ------------------------------------------------------------------ */

function DemoBanner({
  bankName,
  perspective,
  onSwitch,
  flow,
  allowedFlows,
  onSwitchFlow,
}: {
  bankName: string;
  perspective: Perspective;
  onSwitch: (p: Perspective) => void;
  flow: FlowKind;
  allowedFlows: FlowKind[];
  onSwitchFlow: (f: FlowKind) => void;
}) {
  return (
    <div className="wl-banner">
      <div className="wl-banner-left">
        <span className="wl-banner-badge">DEMO</span>
        <span className="wl-banner-text">
          RAVEN white-label for <strong>{bankName}</strong> · sample data
        </span>
      </div>
      <div className="wl-banner-controls">
        <div className="wl-banner-toggle" role="tablist" aria-label="Flow">
          {allowedFlows.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={flow === f}
              className={flow === f ? 'wl-tab wl-tab-on' : 'wl-tab'}
              onClick={() => onSwitchFlow(f)}
            >
              {FLOWS[f].label}
            </button>
          ))}
        </div>
        <div className="wl-banner-toggle" role="tablist" aria-label="Perspective">
          <button
            role="tab"
            aria-selected={perspective === 'borrower'}
            className={perspective === 'borrower' ? 'wl-tab wl-tab-on' : 'wl-tab'}
            onClick={() => onSwitch('borrower')}
          >
            Borrower
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'officer'}
            className={perspective === 'officer' ? 'wl-tab wl-tab-on' : 'wl-tab'}
            onClick={() => onSwitch('officer')}
          >
            Loan officer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Narrated handoff                                                    */
/* ------------------------------------------------------------------ */

function HandoffOverlay({
  config,
  summary,
  onProceed,
}: {
  config: WhiteLabelConfig;
  summary: ApplicationSummary;
  onProceed: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onProceed, HANDOFF_AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [onProceed]);

  const firstName = summary.profile.identity.fullName.split(' ')[0];

  return (
    <div className="wl-handoff" role="dialog" aria-modal="true" aria-label="Switching to the loan officer view" onClick={onProceed}>
      <div className="wl-handoff-card" onClick={(e) => e.stopPropagation()}>
        <div className="wl-handoff-flow" aria-hidden="true">
          <span className="wl-handoff-node wl-handoff-done">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Borrower
          </span>
          <span className="wl-handoff-line" />
          <span className="wl-handoff-node wl-handoff-next">
            <span className="wl-handoff-pulse" /> Loan officer
          </span>
        </div>
        <h3>That&rsquo;s all {firstName} had to do.</h3>
        <p>
          The moment they finished, a fully verified submission landed in{' '}
          {config.branding.shortName}&rsquo;s team queue and synced to {config.coreSync.displayName}.
          Here&rsquo;s what just hit your team.
        </p>
        <button className="wl-handoff-btn" onClick={onProceed}>
          See what hit your team&rsquo;s queue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </button>
        <p className="wl-handoff-hint">Switching to the loan officer view automatically, or click to jump ahead.</p>
        <div className="wl-handoff-progress"><span style={{ animationDuration: `${HANDOFF_AUTO_ADVANCE_MS}ms` }} /></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stages                                                              */
/* ------------------------------------------------------------------ */

function Loading() {
  return (
    <div className="wl-card wl-step" style={{ textAlign: 'center' }}>
      <span className="wl-spinner" style={{ margin: '1rem auto' }} />
    </div>
  );
}

function FrontDoor({
  config, purpose, setPurpose, amount, setAmount, sliderMin, sliderMax, onContinue, matchedCount,
}: {
  config: WhiteLabelConfig;
  purpose: string;
  setPurpose: (v: string) => void;
  amount: number;
  setAmount: (n: number) => void;
  sliderMin: number;
  sliderMax: number;
  onContinue: () => void;
  matchedCount: number;
}) {
  const step = sliderMax > 200000 ? 5000 : 1000;
  return (
    <div className="wl-card wl-frontdoor wl-step">
      <span className="wl-eyebrow">Personalized lending</span>
      <h1>Let&rsquo;s find the right way to fund it.</h1>
      <p className="wl-lede">
        Tell us what you need. We&rsquo;ll match you to the right {config.branding.shortName} product
        and verify the details for you in minutes, no paperwork.
      </p>
      <label className="wl-field">
        <span className="wl-label">What are you looking to do?</span>
        <select className="wl-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          {config.purposes.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>
      <div className="wl-field">
        <div className="wl-amount-head">
          <span className="wl-label">How much do you need?</span>
          <span className="wl-amount">{usd(amount)}</span>
        </div>
        <input
          className="wl-range"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={step}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="wl-range-ends">
          <span>{usd(sliderMin)}</span>
          <span>{usd(sliderMax)}</span>
        </div>
      </div>
      <button className="wl-btn wl-btn-primary wl-btn-block" onClick={onContinue}>
        See my options{matchedCount > 0 ? ` (${matchedCount})` : ''}
      </button>
      <p className="wl-fineprint">
        Checking your options won&rsquo;t affect your credit score. Interactive demo using sample data.
      </p>
    </div>
  );
}

function Products({
  products, amount, onBack, onSelect,
}: {
  products: WLProduct[];
  amount: number;
  onBack?: () => void;
  onSelect: (p: WLProduct) => void;
}) {
  return (
    <div className="wl-step">
      {onBack && <button className="wl-back" onClick={onBack}>← Back</button>}
      <h2>Here&rsquo;s what fits {usd(amount)}.</h2>
      <p className="wl-lede">Choose a product to continue. You can change the amount anytime.</p>
      <div className="wl-products">
        {products.map((p) => (
          <button key={p.id} className="wl-product" onClick={() => onSelect(p)}>
            <span className="wl-product-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {p.iconPath.split(' M').map((seg, i) => (
                  <path key={i} d={i === 0 ? seg : `M${seg}`} />
                ))}
              </svg>
            </span>
            <span className="wl-product-body">
              <span className="wl-product-label">{p.label}</span>
              <span className="wl-product-blurb">{p.blurb}</span>
              {p.rateTeaser && <span className="wl-product-rate">{p.rateTeaser}</span>}
            </span>
            <span className="wl-product-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Applicant({
  product, amount, applicant, setApplicant, onBack, onContinue,
}: {
  product: WLProduct | null;
  amount: number;
  applicant: { fullName: string; email: string; phone: string };
  setApplicant: (a: { fullName: string; email: string; phone: string }) => void;
  onBack?: () => void;
  onContinue: () => void;
}) {
  const valid = applicant.fullName.trim().length > 1 && /.+@.+\..+/.test(applicant.email);
  return (
    <div className="wl-card wl-step">
      {onBack && <button className="wl-back" onClick={onBack}>← Back</button>}
      {product && <span className="wl-eyebrow">{product.label} · {usd(amount)}</span>}
      <h2>Let&rsquo;s start with the basics.</h2>
      <p className="wl-lede">
        This is all we need from you. We&rsquo;ll securely verify your identity, income, and the
        rest, no documents to upload.
      </p>
      <label className="wl-field">
        <span className="wl-label">Full name</span>
        <input className="wl-input" value={applicant.fullName} onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })} placeholder="Jordan Carter" autoComplete="name" />
      </label>
      <label className="wl-field">
        <span className="wl-label">Email</span>
        <input className="wl-input" type="email" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
      </label>
      <label className="wl-field">
        <span className="wl-label">Mobile phone</span>
        <input className="wl-input" type="tel" value={applicant.phone} onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })} placeholder="(864) 555-0142" autoComplete="tel" />
      </label>
      <button className="wl-btn wl-btn-primary wl-btn-block" disabled={!valid} onClick={onContinue}>
        Continue securely
      </button>
    </div>
  );
}

function Consent({
  config, flow, modules, onBack, onContinue, busy,
}: {
  config: WhiteLabelConfig;
  flow: FlowKind;
  modules: string[];
  onBack?: () => void;
  onContinue: () => void;
  busy: boolean;
}) {
  const [agreed, setAgreed] = useState(false);
  const isApplication = getFlow(flow).isLegalApplication;
  // For data_only, show the customer the predetermined data set (chosen when the
  // link was generated) so they can see exactly what they're authorizing.
  const showDataList = flow === 'data_only' && modules.length > 0;
  const body = isApplication
    ? `I authorize ${config.branding.shortName} to obtain my credit report and verify my information to evaluate my application. I understand this is an application for credit.`
    : `I authorize ${config.branding.shortName} and RAVEN to verify my identity, income, and the information needed for this request with trusted data partners.`;
  return (
    <div className="wl-card wl-step">
      {onBack && <button className="wl-back" onClick={onBack}>← Back</button>}
      <span className="wl-eyebrow">Your authorization</span>
      <h2>{isApplication ? 'Authorize your application' : 'Authorize verification'}</h2>
      <p className="wl-lede">{body}</p>
      {showDataList && (
        <div className="wl-data-list">
          <span className="wl-data-list-label">{config.branding.shortName} will verify</span>
          <ul>
            {modules.map((m) => (
              <li key={m}>
                <span className="wl-data-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                {MODULE_LABELS[m]}
              </li>
            ))}
          </ul>
        </div>
      )}
      <label className="wl-consent">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          I agree.{' '}
          {isApplication
            ? 'Demo only: sample data, no real credit is pulled.'
            : 'Demo only: sample data, no credit check.'}
        </span>
      </label>
      <button className="wl-btn wl-btn-primary wl-btn-block" disabled={!agreed || busy} onClick={onContinue}>
        {busy ? 'Working…' : isApplication ? 'Agree & submit application' : 'Agree & continue'}
      </button>
    </div>
  );
}

function DataPull({
  shortName, firstName, steps, onDone,
}: {
  shortName: string;
  firstName: string;
  steps: PullStep[];
  onDone: () => void;
}) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(-1);
  const [awaitingConnect, setAwaitingConnect] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function advanceFrom(i: number) {
    const next = i + 1;
    if (next >= steps.length) {
      timer.current = setTimeout(onDone, 700);
      return;
    }
    setActive(next);
  }

  useEffect(() => {
    if (active >= steps.length) return;
    if (steps[active].interactive) {
      setAwaitingConnect(true);
      return;
    }
    timer.current = setTimeout(() => {
      setDone(active);
      advanceFrom(active);
    }, 950);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function handleConnect() {
    setAwaitingConnect(false);
    timer.current = setTimeout(() => {
      setDone(active);
      advanceFrom(active);
    }, 1300);
  }

  return (
    <div className="wl-card wl-step">
      <span className="wl-eyebrow">Verifying</span>
      <h2>Verifying your information{firstName ? `, ${firstName}` : ''}.</h2>
      <p className="wl-lede">
        We&rsquo;re securely gathering what we need so you don&rsquo;t have to. This usually takes
        under two minutes.
      </p>
      <ul className="wl-pull-list">
        {steps.map((s, i) => {
          const state = done >= i ? 'done' : active === i ? 'active' : 'pending';
          return (
            <li key={`${s.module}-${i}`} className={`wl-pull wl-pull-${state}`}>
              <span className="wl-pull-icon">
                {state === 'done' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : state === 'active' ? (
                  <span className="wl-spinner" />
                ) : (
                  <span className="wl-dot" />
                )}
              </span>
              <span className="wl-pull-label">{s.label}</span>
              <span className="wl-pull-provider">{s.provider}</span>
            </li>
          );
        })}
      </ul>
      {awaitingConnect && (
        <div className="wl-connect">
          <p className="wl-connect-copy">
            Securely connect your bank to verify income and balances. Your credentials are never
            shared with {shortName}.
          </p>
          <button className="wl-btn wl-btn-primary wl-btn-block" onClick={handleConnect}>
            <span className="wl-connect-lock" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </span>
            Connect with Plaid
          </button>
        </div>
      )}
    </div>
  );
}

function RateStage({
  config, intake, onSelectTerm, onContinue,
}: {
  config: WhiteLabelConfig;
  intake: Intake;
  onSelectTerm: (termMonths: number) => void;
  onContinue: () => void;
}) {
  const range = intake.range!;
  const [term, setTerm] = useState(range.selectedTermMonths);
  const current = range.options.find((o) => o.termMonths === term) ?? range.options[0];
  const credit = Boolean(intake.creditPulled); // full_application = individualized point; rate_range = band
  const firstName = intake.profile.identity.fullName.split(' ')[0];
  const apr = (o: typeof current) => (o.lowApr === o.highApr ? pct(o.lowApr) : `${pct(o.lowApr)}–${pct(o.highApr)}`);
  const pay = (o: typeof current) => (o.lowPayment === o.highPayment ? `${usd(o.lowPayment)}/mo` : `${usd(o.lowPayment)}–${usd(o.highPayment)}/mo`);

  function pick(t: number) {
    setTerm(t);
    onSelectTerm(t);
  }

  return (
    <div className="wl-card wl-step wl-estimate">
      <span className="wl-eyebrow">{credit ? 'Estimated rate' : 'Estimated range'} · {intake.product?.label}</span>
      <h2>Here&rsquo;s your estimated {credit ? 'rate' : 'range'}, {firstName}.</h2>
      <p className="wl-lede">
        {credit
          ? `Based on your verified information and credit, here’s ${config.branding.shortName}’s estimated rate for ${usd(intake.amount ?? 0)}. Final terms are subject to approval.`
          : `Based on the details we verified (no credit check), here’s the rate range ${config.branding.shortName} offers for ${usd(intake.amount ?? 0)}. Your actual rate depends on your credit and final terms.`}
      </p>
      <div className="wl-est-grid">
        <div className="wl-est-hero">
          <div className="wl-est-apr">
            {current.lowApr === current.highApr
              ? pct(current.lowApr)
              : <>{pct(current.lowApr)} <span className="wl-est-apr-dash">–</span> {pct(current.highApr)}</>}
          </div>
          <div className="wl-est-apr-label">
            {credit ? 'estimated APR · subject to final approval' : `estimated APR range · lowest with ${range.tierLow.toLowerCase()}`}
          </div>
        </div>
        <div className="wl-est-cells">
          <div className="wl-est-cell">
            <div className="wl-est-cell-label">Est. monthly payment</div>
            <div className="wl-est-cell-val">{pay(current)}</div>
          </div>
          <div className="wl-est-cell">
            <div className="wl-est-cell-label">Term</div>
            <div className="wl-est-cell-val">{fmtTerm(current.termMonths)}</div>
          </div>
          <div className="wl-est-cell">
            <div className="wl-est-cell-label">Amount</div>
            <div className="wl-est-cell-val">{usd(intake.amount ?? 0)}</div>
          </div>
          <div className="wl-est-cell">
            <div className="wl-est-cell-label">Credit check</div>
            <div className="wl-est-cell-val">{credit ? 'Completed' : 'Not run'}</div>
          </div>
        </div>
      </div>
      <div className="wl-term-picker">
        <span className="wl-label">Choose your term</span>
        <div className="wl-term-options">
          {range.options.map((o) => (
            <button key={o.termMonths} className={`wl-term ${o.termMonths === term ? 'wl-term-on' : ''}`} onClick={() => pick(o.termMonths)}>
              <span className="wl-term-len">{fmtTerm(o.termMonths)}</span>
              <span className="wl-term-pay">{pay(o)}</span>
              <span className="wl-term-apr">{apr(o)}</span>
            </button>
          ))}
        </div>
      </div>
      <button className="wl-btn wl-btn-primary wl-btn-block" onClick={onContinue}>
        {credit ? `Submit application (${fmtTerm(current.termMonths)})` : `Continue with ${fmtTerm(current.termMonths)} term`}
      </button>
      <p className="wl-fineprint">
        {credit
          ? 'Estimated rate, not a final offer. Subject to verification and final approval.'
          : 'Estimate only, not an offer of credit. The lowest rates require excellent credit.'}{' '}
        {intake.product?.disclosure}
      </p>
    </div>
  );
}

function Confirmation({
  config, summary, terminal, showLo, setShowLo,
}: {
  config: WhiteLabelConfig;
  summary: ApplicationSummary;
  terminal: SubmitResult['terminal'];
  showLo: boolean;
  setShowLo: (v: boolean) => void;
}) {
  const firstName = summary.profile.identity.fullName.split(' ')[0];
  const article = indefiniteArticle(config.branding.shortName, true);
  const isDecision = terminal === 'decision';
  const isVerify = terminal === 'routeToLo' && summary.amount === 0;

  return (
    <div className="wl-step">
      <div className="wl-card wl-confirm">
        <span className="wl-confirm-check" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
        <h2>
          {isDecision ? 'Application received' : 'You’re all set'}, {firstName}.
        </h2>
        <p className="wl-lede">
          {isDecision
            ? `${config.branding.shortName} is reviewing your application and will reach out with a decision shortly.`
            : isVerify
              ? `Your information is verified and on its way to ${config.branding.shortName}. ${article} ${config.branding.shortName} representative will follow up.`
              : `Your ${summary.product.label.toLowerCase()} request for ${usd(summary.amount)} is in. ${article} ${config.branding.shortName} loan officer will reach out shortly to finalize your rate.`}
        </p>

        <div className="wl-confirm-receipt">
          <div className="wl-receipt-row">
            <span>{isVerify ? 'Verification' : 'Application'}</span><strong>{summary.applicationId}</strong>
          </div>
          {!isVerify && (
            <div className="wl-receipt-row">
              <span>Product</span><strong>{summary.product.label}</strong>
            </div>
          )}
          {summary.range && (() => {
            const r = summary.range;
            const single = r.lowApr === r.highApr;
            return (
              <>
                <div className="wl-receipt-row">
                  <span>{single ? 'Estimated rate' : 'Estimated rate range'}</span>
                  <strong>
                    {single ? pct(r.lowApr) : `${pct(r.lowApr)}–${pct(r.highApr)}`} APR · {fmtTerm(r.termMonths)}
                  </strong>
                </div>
                <div className="wl-receipt-row">
                  <span>Estimated payment</span>
                  <strong>{single ? `${usd(r.lowPayment)}/mo` : `${usd(r.lowPayment)}–${usd(r.highPayment)}/mo`}</strong>
                </div>
              </>
            );
          })()}
          {isDecision && (
            <div className="wl-receipt-row">
              <span>Status</span><strong>Under review</strong>
            </div>
          )}
          <div className="wl-receipt-row">
            <span>Synced to core</span>
            <strong className="wl-synced">
              <span className="wl-sync-dot" /> {config.coreSync.displayName}
            </strong>
          </div>
        </div>

        <button className="wl-btn wl-btn-ghost wl-btn-block" onClick={() => setShowLo(!showLo)}>
          {showLo ? 'Hide' : 'See'} what the loan officer receives
        </button>
      </div>

      {showLo && (
        <div className="wl-lo-wrap">
          <p className="wl-lo-caption">
            The moment you finished, this appeared in {config.branding.shortName}&rsquo;s RAVEN
            dashboard, fully verified and synced to {config.coreSync.displayName}.
          </p>
          <LoPreview config={config} summary={summary} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = `
  .wl-demo-root { display: flex; flex-direction: column; min-height: 100vh; font-family: var(--wl-font); }
  .wl-sticky-top, .wl-sticky-top * { box-sizing: border-box; }
  .wl-sticky-top { position: sticky; top: 0; z-index: 200; }
  .wl-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    padding: 0.5rem 1rem; min-height: 44px;
    background: #0A0A0A; color: #fff;
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .wl-banner-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
  .wl-banner-badge { flex-shrink: 0; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.14em; background: #fff; color: #0A0A0A; border-radius: 4px; padding: 0.2rem 0.45rem; }
  .wl-banner-text { font-size: 0.78rem; color: #A3A3A3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wl-banner-text strong { color: #fff; font-weight: 600; }
  .wl-banner-controls { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; min-width: 0; }
  .wl-banner-toggle { display: flex; flex-wrap: wrap; gap: 2px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 3px; min-width: 0; }
  .wl-tab { font-family: inherit; font-size: 0.74rem; font-weight: 600; color: #A3A3A3; background: transparent; border: none; border-radius: 6px; padding: 0.32rem 0.6rem; cursor: pointer; white-space: nowrap; transition: background 150ms, color 150ms; }
  .wl-tab:hover { color: #fff; }
  .wl-tab-on { background: #fff; color: #0A0A0A; }
  .wl-tab-on:hover { color: #0A0A0A; }
  @media (max-width: 720px) {
    .wl-banner { flex-wrap: wrap; }
    .wl-banner-text { white-space: normal; }
    .wl-banner-controls { width: 100%; justify-content: flex-start; }
    .wl-tab { font-size: 0.72rem; padding: 0.3rem 0.5rem; }
  }

  .wl-handoff, .wl-handoff * { box-sizing: border-box; }
  .wl-handoff {
    position: fixed; inset: 0; z-index: 300;
    display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    background: rgba(10,10,10,0.55);
    backdrop-filter: blur(14px) saturate(150%); -webkit-backdrop-filter: blur(14px) saturate(150%);
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    animation: wlFadeIn 240ms ease-out both;
  }
  .wl-handoff-card {
    position: relative; width: 100%; max-width: 460px; text-align: center;
    background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.12);
    border-radius: 18px; padding: 2.25rem 2rem 1.5rem; overflow: hidden;
    box-shadow: 0 30px 90px rgba(0,0,0,0.55);
    animation: wlPopIn 420ms cubic-bezier(0.22,1,0.36,1) 40ms both;
  }
  @keyframes wlFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes wlPopIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
  .wl-handoff-flow { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.25rem; }
  .wl-handoff-node { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 0.75rem; border-radius: 999px; }
  .wl-handoff-done { color: #86efac; background: rgba(34,197,94,0.14); }
  .wl-handoff-next { color: #fff; background: rgba(255,255,255,0.1); }
  .wl-handoff-line { width: 28px; height: 2px; background: linear-gradient(90deg, rgba(34,197,94,0.5), rgba(255,255,255,0.4)); }
  .wl-handoff-pulse { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 0 rgba(34,197,94,0.5); animation: wlPulse 1.5s infinite; }
  @keyframes wlPulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); } 70% { box-shadow: 0 0 0 9px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
  .wl-handoff-card h3 { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.6rem; }
  .wl-handoff-card p { font-size: 0.9rem; line-height: 1.65; color: #A3A3A3; margin-bottom: 1.5rem; }
  .wl-handoff-btn { display: inline-flex; align-items: center; gap: 0.5rem; font-family: inherit; font-size: 0.92rem; font-weight: 600; background: #fff; color: #0A0A0A; border: none; border-radius: 10px; padding: 0.8rem 1.4rem; cursor: pointer; transition: opacity 150ms; }
  .wl-handoff-btn:hover { opacity: 0.88; }
  .wl-handoff-hint { font-size: 0.72rem; color: #737373; margin-top: 0.9rem; }
  .wl-handoff-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,0.08); }
  .wl-handoff-progress span { display: block; height: 100%; width: 0%; background: #22c55e; animation: wlProg linear both; }
  @keyframes wlProg { from { width: 0%; } to { width: 100%; } }
  @media (prefers-reduced-motion: reduce) { .wl-handoff, .wl-handoff-card { animation: none; } }

  .wl-shell, .wl-shell *, .wl-shell *::before, .wl-shell *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .wl-shell { font-family: var(--wl-font); background: var(--wl-bg); color: var(--wl-text); flex: 1; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased; }
  .wl-header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.5rem; background: var(--wl-surface); border-bottom: 1px solid var(--wl-border); }
  .wl-wordmark { display: flex; align-items: center; gap: 0.7rem; }
  .wl-mark { width: 38px; height: 38px; border-radius: 9px; color: #fff; background: var(--wl-primary); display: flex; align-items: center; justify-content: center; }
  .wl-bankname { font-size: 0.95rem; font-weight: 700; letter-spacing: 0.06em; color: var(--wl-primary); }
  .wl-tagline { font-size: 0.72rem; color: var(--wl-muted); margin-top: 1px; }
  .wl-login { font-size: 0.85rem; font-weight: 600; color: var(--wl-primary); text-decoration: none; }

  .wl-progress { height: 3px; background: var(--wl-border); }
  .wl-progress-fill { height: 100%; background: var(--wl-primary); transition: width 500ms cubic-bezier(0.22,1,0.36,1); }

  .wl-main { flex: 1; width: 100%; max-width: 560px; margin: 0 auto; padding: 2.5rem 1.25rem 3rem; }
  .wl-card { background: var(--wl-surface); border: 1px solid var(--wl-border); border-radius: calc(var(--wl-radius) + 4px); padding: 2rem 1.75rem; box-shadow: 0 1px 2px rgba(16,24,40,0.04); }
  .wl-step { animation: wlIn 380ms cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes wlIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  .wl-eyebrow { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wl-primary); margin-bottom: 0.6rem; }
  .wl-shell h1 { font-size: 1.7rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 0.6rem; }
  .wl-shell h2 { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.015em; line-height: 1.2; margin-bottom: 0.5rem; }
  .wl-lede { font-size: 0.95rem; line-height: 1.6; color: var(--wl-muted); margin-bottom: 1.5rem; }

  .wl-field { display: block; margin-bottom: 1.25rem; }
  .wl-label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.45rem; }
  .wl-select, .wl-input { width: 100%; font-family: inherit; font-size: 0.95rem; color: var(--wl-text); padding: 0.8rem 0.9rem; border: 1px solid var(--wl-border); border-radius: var(--wl-radius); background: var(--wl-surface); outline: none; transition: border-color 150ms, box-shadow 150ms; }
  .wl-select:focus, .wl-input:focus { border-color: var(--wl-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--wl-primary) 18%, transparent); }

  .wl-amount-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.5rem; }
  .wl-amount { font-size: 1.35rem; font-weight: 700; color: var(--wl-primary); font-variant-numeric: tabular-nums; }
  .wl-range { width: 100%; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px; background: var(--wl-border); outline: none; }
  .wl-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--wl-primary); border: 3px solid var(--wl-surface); box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: pointer; }
  .wl-range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: var(--wl-primary); border: 3px solid var(--wl-surface); cursor: pointer; }
  .wl-range-ends { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--wl-muted); margin-top: 0.5rem; }

  .wl-btn { font-family: inherit; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.4rem; border-radius: var(--wl-radius); border: none; cursor: pointer; transition: transform 120ms, opacity 150ms, background 150ms; }
  .wl-btn:active { transform: translateY(1px); }
  .wl-btn-block { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; }
  .wl-btn-primary { background: var(--wl-primary); color: #fff; }
  .wl-btn-primary:hover { background: var(--wl-primary-dark); }
  .wl-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .wl-btn-ghost { background: transparent; color: var(--wl-primary); border: 1px solid var(--wl-border); }
  .wl-btn-ghost:hover { border-color: var(--wl-primary); }
  .wl-fineprint { font-size: 0.72rem; color: var(--wl-muted); line-height: 1.5; margin-top: 0.9rem; text-align: center; }
  .wl-back { display: block; width: fit-content; background: none; border: none; color: var(--wl-muted); font-family: inherit; font-size: 0.85rem; cursor: pointer; margin-bottom: 1rem; padding: 0; }
  .wl-back:hover { color: var(--wl-text); }

  .wl-products { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1.25rem; }
  .wl-product { display: flex; align-items: center; gap: 1rem; text-align: left; width: 100%; background: var(--wl-surface); border: 1px solid var(--wl-border); border-radius: calc(var(--wl-radius) + 2px); padding: 1.1rem 1.2rem; cursor: pointer; font-family: inherit; color: var(--wl-text); transition: border-color 150ms, box-shadow 150ms, transform 120ms; }
  .wl-product:hover { border-color: var(--wl-primary); box-shadow: 0 4px 16px rgba(16,24,40,0.08); transform: translateY(-1px); }
  .wl-product-icon { flex-shrink: 0; width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; color: var(--wl-primary); background: color-mix(in srgb, var(--wl-primary) 10%, transparent); }
  .wl-product-body { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
  .wl-product-label { font-size: 1rem; font-weight: 700; }
  .wl-product-blurb { font-size: 0.83rem; color: var(--wl-muted); line-height: 1.45; }
  .wl-product-rate { font-size: 0.78rem; font-weight: 600; color: var(--wl-primary); margin-top: 0.15rem; }
  .wl-product-arrow { flex-shrink: 0; color: var(--wl-muted); }
  .wl-product:hover .wl-product-arrow { color: var(--wl-primary); }

  /* Read-only "what we'll verify" list (data_only consent) */
  .wl-data-list { margin: 0.25rem 0 1.25rem; padding: 0.9rem 1rem; background: color-mix(in srgb, var(--wl-primary) 4%, transparent); border: 1px solid var(--wl-border); border-radius: var(--wl-radius); }
  .wl-data-list-label { display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wl-muted); margin-bottom: 0.55rem; }
  .wl-data-list ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
  .wl-data-list li { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; font-weight: 600; color: var(--wl-text); }
  .wl-data-check { flex-shrink: 0; width: 20px; height: 20px; border-radius: 6px; background: var(--wl-primary); color: #fff; display: flex; align-items: center; justify-content: center; }

  /* Consent */
  .wl-consent { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.85rem; color: var(--wl-text); line-height: 1.5; margin: 0.5rem 0 1.5rem; cursor: pointer; }
  .wl-consent input { margin-top: 0.15rem; width: 18px; height: 18px; accent-color: var(--wl-primary); flex-shrink: 0; }

  .wl-pull-list { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; margin: 1.5rem 0 0.5rem; }
  .wl-pull { display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 0.95rem; border-radius: var(--wl-radius); border: 1px solid transparent; transition: background 200ms, border-color 200ms, opacity 200ms; }
  .wl-pull-pending { opacity: 0.5; }
  .wl-pull-active { background: color-mix(in srgb, var(--wl-primary) 7%, transparent); border-color: color-mix(in srgb, var(--wl-primary) 25%, transparent); }
  .wl-pull-done { opacity: 1; }
  .wl-pull-icon { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .wl-pull-done .wl-pull-icon { background: var(--wl-primary); color: #fff; }
  .wl-pull-label { flex: 1; font-size: 0.9rem; font-weight: 600; }
  .wl-pull-provider { font-size: 0.7rem; color: var(--wl-muted); border: 1px solid var(--wl-border); border-radius: 6px; padding: 0.15rem 0.45rem; }
  .wl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--wl-border); }
  .wl-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid color-mix(in srgb, var(--wl-primary) 30%, transparent); border-top-color: var(--wl-primary); animation: wlSpin 700ms linear infinite; }
  @keyframes wlSpin { to { transform: rotate(360deg); } }
  .wl-connect { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--wl-border); }
  .wl-connect-copy { font-size: 0.85rem; color: var(--wl-muted); line-height: 1.55; margin-bottom: 1rem; }
  .wl-connect-lock { display: inline-flex; }

  .wl-est-grid { margin: 0.5rem 0 1.5rem; }
  .wl-est-hero { text-align: center; padding: 1.75rem 1rem; border-radius: calc(var(--wl-radius) + 4px); background: var(--wl-primary); color: #fff; margin-bottom: 0.85rem; }
  .wl-est-apr { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
  .wl-est-apr-dash { font-weight: 500; opacity: 0.7; }
  .wl-est-apr-label { font-size: 0.8rem; opacity: 0.9; margin-top: 0.5rem; }
  .wl-est-cells { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--wl-border); border: 1px solid var(--wl-border); border-radius: calc(var(--wl-radius) + 2px); overflow: hidden; }
  .wl-est-cell { background: var(--wl-surface); padding: 0.95rem 1rem; }
  .wl-est-cell-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--wl-muted); }
  .wl-est-cell-val { font-size: 1.15rem; font-weight: 700; margin-top: 0.2rem; }
  .wl-est-cell-sub { font-size: 0.8rem; font-weight: 500; color: var(--wl-muted); margin-left: 1px; }

  .wl-term-picker { margin: 0 0 1.5rem; }
  .wl-term-picker .wl-label { margin-bottom: 0.6rem; }
  .wl-term-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 0.5rem; }
  .wl-term { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; font-family: inherit; cursor: pointer; padding: 0.7rem 0.5rem; border: 1px solid var(--wl-border); border-radius: var(--wl-radius); background: var(--wl-surface); color: var(--wl-text); transition: border-color 150ms, box-shadow 150ms, background 150ms; }
  .wl-term:hover { border-color: var(--wl-primary); }
  .wl-term-on { border-color: var(--wl-primary); background: color-mix(in srgb, var(--wl-primary) 8%, transparent); box-shadow: 0 0 0 1px var(--wl-primary) inset; }
  .wl-term-len { font-size: 0.95rem; font-weight: 700; }
  .wl-term-pay { font-size: 0.8rem; font-weight: 600; color: var(--wl-primary); }
  .wl-term-apr { font-size: 0.72rem; color: var(--wl-muted); }

  .wl-confirm { text-align: center; }
  .wl-confirm-check { width: 64px; height: 64px; border-radius: 50%; background: color-mix(in srgb, var(--wl-primary) 12%, transparent); color: var(--wl-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.1rem; }
  .wl-confirm-receipt { text-align: left; border: 1px solid var(--wl-border); border-radius: calc(var(--wl-radius) + 2px); padding: 0.4rem 1.1rem; margin: 1.5rem 0; }
  .wl-receipt-row { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0; border-bottom: 1px solid var(--wl-border); font-size: 0.88rem; gap: 1rem; }
  .wl-receipt-row:last-child { border-bottom: none; }
  .wl-receipt-row span { color: var(--wl-muted); }
  .wl-receipt-row strong { text-align: right; }
  .wl-synced { display: inline-flex; align-items: center; gap: 0.4rem; }
  .wl-sync-dot { width: 7px; height: 7px; border-radius: 50%; background: #12b76a; box-shadow: 0 0 0 3px rgba(18,183,106,0.18); }
  .wl-lo-wrap { margin-top: 1.5rem; animation: wlIn 380ms cubic-bezier(0.22,1,0.36,1) both; }
  .wl-lo-caption { font-size: 0.85rem; color: var(--wl-muted); line-height: 1.55; margin-bottom: 0.9rem; text-align: center; }

  .wl-footer { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-top: 1px solid var(--wl-border); font-size: 0.72rem; color: var(--wl-muted); background: var(--wl-surface); }
  .wl-powered { font-weight: 600; }

  @media (max-width: 600px) {
    .wl-shell h1 { font-size: 1.45rem; }
    .wl-card { padding: 1.6rem 1.25rem; }
    .wl-footer { flex-direction: column; gap: 0.4rem; text-align: center; }
  }
`;
