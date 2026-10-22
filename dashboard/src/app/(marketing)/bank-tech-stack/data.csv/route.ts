import { stackCsv } from '../stack-data';

// CSV export of the Bank Tech Stack Tracker, so researchers and reporters can
// cite and reuse the data (with attribution).

export const dynamic = 'force-static';

export function GET() {
  return new Response(stackCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="raven-bank-tech-stack.csv"',
    },
  });
}
