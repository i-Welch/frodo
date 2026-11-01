// When auto-publish may merge content PRs and post to LinkedIn (ET).

// Articles go live once a day at 10am ET on weekdays, so the site and the
// LinkedIn launch post land together. The 11am run catches a missed 10am one.
const PUBLISH_WINDOW = { startHour: 10, endHour: 12 };
// LinkedIn: one post per run, spaced out, during the business day when
// bankers are reading. Queued posts wait for the next open slot.
const POST_GAP_HOURS = 4;
const POST_WINDOW = { startHour: 10, endHour: 17 };

function easternTime(now: Date): Date {
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

function isWeekend(et: Date): boolean {
  return et.getDay() === 0 || et.getDay() === 6;
}

/** Why a ready PR can't merge right now, or undefined when it can. */
export function publishWindowOpen(now: Date): string | undefined {
  const et = easternTime(now);
  if (isWeekend(et)) return 'weekend';
  if (et.getHours() < PUBLISH_WINDOW.startHour || et.getHours() >= PUBLISH_WINDOW.endHour) return 'outside the 10am ET publish window';
  return undefined;
}

/** Why a queued LinkedIn post can't go out right now, or undefined when it can. */
export function postingSlotOpen(now: Date, lastPosted: Date | undefined): string | undefined {
  const et = easternTime(now);
  if (isWeekend(et)) return 'weekend';
  if (et.getHours() < POST_WINDOW.startHour || et.getHours() >= POST_WINDOW.endHour) return 'outside business hours';
  if (lastPosted && now.getTime() - lastPosted.getTime() < POST_GAP_HOURS * 3_600_000) return 'posted recently';
  return undefined;
}
