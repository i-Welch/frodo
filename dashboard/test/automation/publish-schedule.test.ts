import { describe, it, expect } from 'vitest';
import { postingSlotOpen, publishWindowOpen, supersedingPullRequest } from '../../../automation/publish-schedule';

// Times are UTC. Nov 4, 2026 is a Wednesday in EST (UTC-5); Oct 28 is in EDT (UTC-4).
describe('publishWindowOpen', () => {
  it('opens at 10am ET on a weekday', () => {
    expect(publishWindowOpen(new Date('2026-11-04T15:05:00Z'))).toBeUndefined();
    expect(publishWindowOpen(new Date('2026-10-28T14:05:00Z'))).toBeUndefined();
  });

  it('lets the 11am run catch a missed 10am run', () => {
    expect(publishWindowOpen(new Date('2026-11-04T16:05:00Z'))).toBeUndefined();
  });

  it('stays closed at other hours', () => {
    expect(publishWindowOpen(new Date('2026-11-04T14:05:00Z'))).toBe('outside the 10am ET publish window');
    expect(publishWindowOpen(new Date('2026-11-04T17:05:00Z'))).toBe('outside the 10am ET publish window');
  });

  it('stays closed on weekends', () => {
    expect(publishWindowOpen(new Date('2026-11-07T15:05:00Z'))).toBe('weekend');
  });
});

describe('postingSlotOpen', () => {
  it('opens with the publish window, not before', () => {
    expect(postingSlotOpen(new Date('2026-11-04T14:05:00Z'), undefined)).toBe('outside business hours');
    expect(postingSlotOpen(new Date('2026-11-04T15:05:00Z'), undefined)).toBeUndefined();
  });

  it('spaces posts four hours apart', () => {
    const last = new Date('2026-11-04T15:05:00Z');
    expect(postingSlotOpen(new Date('2026-11-04T18:05:00Z'), last)).toBe('posted recently');
    expect(postingSlotOpen(new Date('2026-11-04T19:05:00Z'), last)).toBeUndefined();
  });
});

describe('supersedingPullRequest', () => {
  const older = { number: 38, headRefName: 'de-novo/2026-11-09', createdAt: '2026-11-09T11:13:15Z' };
  const newer = { number: 49, headRefName: 'de-novo/2026-11-23', createdAt: '2026-11-23T11:00:00Z' };

  it('names a newer De Novo Watch update', () => {
    expect(supersedingPullRequest(older, [older, newer])).toBe(49);
  });

  it('leaves the newest update alone', () => {
    expect(supersedingPullRequest(newer, [older, newer])).toBeUndefined();
  });

  it('never closes other kinds of PR', () => {
    const visibility = { number: 42, headRefName: 'visibility/2026-11-16', createdAt: '2026-11-16T13:00:00Z' };
    const laterVisibility = { number: 50, headRefName: 'visibility/2026-11-23', createdAt: '2026-11-23T13:34:56Z' };
    expect(supersedingPullRequest(visibility, [laterVisibility, newer])).toBeUndefined();
  });
});
