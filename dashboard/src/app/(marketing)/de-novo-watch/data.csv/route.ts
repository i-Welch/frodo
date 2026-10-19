import { trackerCsv } from '../tracker-csv';

// CSV export of the De Novo Watch tracker, so researchers and reporters can
// cite and reuse the data (with attribution).

export const dynamic = 'force-static';

export function GET() {
  return new Response(trackerCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="raven-de-novo-watch.csv"',
    },
  });
}
