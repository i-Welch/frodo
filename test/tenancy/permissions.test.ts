import { describe, it, expect, beforeAll } from 'vitest';
import { VerificationTier } from '../../src/types.js';
import { filterByTier, getRequiredTier } from '../../src/tenancy/permissions.js';
import type { TenantPermission } from '../../src/tenancy/types.js';

// Side-effect import — registers module schemas
import '../../src/modules/index.js';

// ---------------------------------------------------------------------------
// Tests — filterByTier
// ---------------------------------------------------------------------------

describe('filterByTier', () => {
  const employmentData = {
    employer: 'Bag End Industries',
    title: 'Chief Hobbit',
    startDate: '2890-09-22',
    salary: 100000,
    history: [
      { employer: 'The Shire', title: 'Gardener' },
    ],
  };

  it('tier 1 (BasicOTP) session sees only tier 1 fields from employment', () => {
    const filtered = filterByTier(
      'employment',
      employmentData,
      VerificationTier.BasicOTP,
    );

    // employer and title are BasicOTP (tier 1) — should be included
    expect(filtered.employer).toBe('Bag End Industries');
    expect(filtered.title).toBe('Chief Hobbit');

    // startDate, salary, history are EnhancedOTP (tier 2) — should be excluded
    expect(filtered.startDate).toBeUndefined();
    expect(filtered.salary).toBeUndefined();
    expect(filtered.history).toBeUndefined();
  });

  it('tier 3 (Identity) session sees all fields', () => {
    const filtered = filterByTier(
      'employment',
      employmentData,
      VerificationTier.Identity,
    );

    expect(filtered.employer).toBe('Bag End Industries');
    expect(filtered.title).toBe('Chief Hobbit');
    expect(filtered.startDate).toBe('2890-09-22');
    expect(filtered.salary).toBe(100000);
    expect(filtered.history).toEqual([
      { employer: 'The Shire', title: 'Gardener' },
    ]);
  });

  it('tier 2 (EnhancedOTP) session sees tier 1 + tier 2 fields from employment', () => {
    const filtered = filterByTier(
      'employment',
      employmentData,
      VerificationTier.EnhancedOTP,
    );

    expect(filtered.employer).toBe('Bag End Industries');
    expect(filtered.title).toBe('Chief Hobbit');
    expect(filtered.startDate).toBe('2890-09-22');
    expect(filtered.salary).toBe(100000);
    expect(filtered.history).toEqual([
      { employer: 'The Shire', title: 'Gardener' },
    ]);
  });

  it('unknown module returns all data unfiltered', () => {
    const data = { foo: 'bar', baz: 42 };
    const filtered = filterByTier(
      'nonexistent-module',
      data,
      VerificationTier.None,
    );

    expect(filtered).toEqual(data);
  });

  it('fields not in the schema are included', () => {
    const dataWithExtra = {
      employer: 'Bag End Industries',
      unknownField: 'extra-value',
    };
    const filtered = filterByTier(
      'employment',
      dataWithExtra,
      VerificationTier.BasicOTP,
    );

    expect(filtered.employer).toBe('Bag End Industries');
    expect(filtered.unknownField).toBe('extra-value');
  });
});

// ---------------------------------------------------------------------------
// Tests — getRequiredTier
// ---------------------------------------------------------------------------

describe('getRequiredTier', () => {
  it('financial module needs tier 3 (Identity)', () => {
    const permissions: TenantPermission[] = [
      { module: 'financial', requiredTier: VerificationTier.Identity },
    ];

    const tier = getRequiredTier(['financial'], permissions);
    expect(tier).toBe(VerificationTier.Identity);
  });

  it('contact module needs tier 1 (BasicOTP)', () => {
    const permissions: TenantPermission[] = [
      { module: 'contact', requiredTier: VerificationTier.BasicOTP },
    ];

    const tier = getRequiredTier(['contact'], permissions);
    // Contact fields are all BasicOTP (tier 1), so max is 1
    expect(tier).toBe(VerificationTier.BasicOTP);
  });

  it('returns the highest tier across multiple modules', () => {
    const permissions: TenantPermission[] = [
      { module: 'contact', requiredTier: VerificationTier.BasicOTP },
      { module: 'financial', requiredTier: VerificationTier.Identity },
    ];

    const tier = getRequiredTier(['contact', 'financial'], permissions);
    expect(tier).toBe(VerificationTier.Identity);
  });

  it('considers field-level tiers even without tenant permissions', () => {
    // No tenant-level permissions, but employment fields go up to tier 2
    const tier = getRequiredTier(['employment'], []);
    expect(tier).toBe(VerificationTier.EnhancedOTP);
  });

  it('returns None when no modules requested', () => {
    const tier = getRequiredTier([], []);
    expect(tier).toBe(VerificationTier.None);
  });

  it('tenant permission can raise tier above field-level max', () => {
    // Contact fields max at tier 1, but tenant requires tier 3
    const permissions: TenantPermission[] = [
      { module: 'contact', requiredTier: VerificationTier.Identity },
    ];

    const tier = getRequiredTier(['contact'], permissions);
    expect(tier).toBe(VerificationTier.Identity);
  });
});
