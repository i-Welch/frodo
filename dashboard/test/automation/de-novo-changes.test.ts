import { describe, it, expect } from 'vitest';
import { diffTracker } from '../../../automation/de-novo-changes';

const labels = { 'application-pending': 'Application pending', open: 'Open' };

describe('diffTracker', () => {
  it('reports new banks and status changes, not unchanged rows', () => {
    const before = [
      { name: 'A Bank', location: 'Tampa, FL', status: 'application-pending' },
      { name: 'B Bank', location: 'Miami, FL', status: 'open' },
    ];
    const after = [
      { name: 'A Bank', location: 'Tampa, FL', status: 'open', leadership: 'CEO Jane Doe.' },
      { name: 'B Bank', location: 'Miami, FL', status: 'open' },
      { name: 'C Bank', location: 'Macon, GA', status: 'application-pending' },
    ];
    expect(diffTracker(before, after, labels)).toEqual([
      '  - A Bank (Tampa, FL): Application pending -> Open. Leadership: CEO Jane Doe.',
      '  - New: C Bank (Macon, GA), Application pending.',
    ]);
  });
});
