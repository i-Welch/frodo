import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api';
import { ApplicationsList, type IntakeRow } from './applications-list';

export default async function ApplicationsPage() {
  const { getToken } = await auth();
  const token = await getToken();

  let intakes: IntakeRow[] = [];
  try {
    const result = await api<{ intakes: IntakeRow[] }>('/api/v1/wl/intakes?limit=50', {
      token: token ?? undefined,
    });
    intakes = result.intakes;
  } catch {
    // Backend may not be connected, or no intakes yet.
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          White-label intakes from your branded borrower flows, verified and ready for review.
        </p>
      </div>
      <ApplicationsList initial={intakes} />
    </div>
  );
}
