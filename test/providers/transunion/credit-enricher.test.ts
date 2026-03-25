import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import { createFixtureEnricher } from '../../../src/providers/test-utils.js';
import { TransUnionCreditEnricher } from '../../../src/providers/transunion/credit-enricher.js';

const FIXTURE = join(import.meta.dirname, '../../fixtures/transunion/credit-report.json');

describe('TransUnionCreditEnricher', () => {
  beforeEach(() => {
    process.env.PROVIDER_TRANSUNION_API_KEY = 'test-tu-key';
    process.env.PROVIDER_TRANSUNION_SUBSCRIBER_CODE = 'test-sub-code';
    process.env.PROVIDER_TRANSUNION_SUBSCRIBER_PREFIX = 'test-prefix';
  });

  afterEach(() => {
    delete process.env.PROVIDER_TRANSUNION_API_KEY;
    delete process.env.PROVIDER_TRANSUNION_SUBSCRIBER_CODE;
    delete process.env.PROVIDER_TRANSUNION_SUBSCRIBER_PREFIX;
  });

  it('enriches credit data from fixture', async () => {
    const enricher = createFixtureEnricher(TransUnionCreditEnricher, FIXTURE);
    const result = await enricher.enrich('user-merry', {});

    // Scores
    expect(result.data.scores).toHaveLength(1);
    expect(result.data.scores![0].bureau).toBe('transunion');
    expect(result.data.scores![0].score).toBe(718);
    expect(result.data.scores![0].date).toBe('2026-03-22');

    // Open accounts — should be 3 (Rivendell Bank is Closed, filtered out)
    expect(result.data.openAccounts).toHaveLength(3);
    expect(result.data.openAccounts![0].creditor).toBe('BANK OF BREE');
    expect(result.data.openAccounts![0].accountType).toBe('revolving');
    expect(result.data.openAccounts![0].balance).toBe(1850);
    expect(result.data.openAccounts![0].limit).toBe(10000);

    // Installment account uses highBalance as limit since creditLimit is 0
    const autoLoan = result.data.openAccounts!.find((a) => a.creditor === 'GONDOR AUTO FINANCE');
    expect(autoLoan).toBeDefined();
    expect(autoLoan!.accountType).toBe('installment');
    expect(autoLoan!.limit).toBe(28000);

    // Payment history — all 4 tradelines
    expect(result.data.paymentHistory).toHaveLength(4);
    expect(result.data.paymentHistory!.every((p) => p.status === 'current')).toBe(true);

    // Inquiries
    expect(result.data.inquiries).toHaveLength(2);
    expect(result.data.inquiries![0].creditor).toBe('PRANCING PONY INSURANCE');
    expect(result.data.inquiries![0].type).toBe('individual');
    expect(result.data.inquiries![1].type).toBe('joint');

    // Derogatory marks — 1 tax lien
    expect(result.data.derogatoryMarks).toHaveLength(1);
    expect(result.data.derogatoryMarks![0].type).toBe('taxlien');
    expect(result.data.derogatoryMarks![0].amount).toBe(2300);

    // Utilization — only revolving + open: Bank of Bree (1850/10000) + Shire CU (420/5000)
    // = 2270 / 15000 = 15.1%
    expect(result.data.utilization).toBeCloseTo(15.1, 0);

    // Metadata
    expect(result.metadata?.transactionId).toBe('tu-txn-merry-001');
    expect(result.metadata?.tradelineCount).toBe(4);
    expect(result.metadata?.publicRecordCount).toBe(1);
  });
});
