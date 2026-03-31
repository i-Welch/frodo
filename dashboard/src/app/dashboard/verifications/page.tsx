import { auth } from '@clerk/nextjs/server';
import { api } from '@/lib/api';
import { NewVerificationButton } from './new-verification-button';
import { VerificationsList } from './verifications-list';

interface Verification {
  requestId: string;
  userId: string;
  status: string;
  modules: string[];
  borrowerName?: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  createdAt: string;
}

export default async function VerificationsPage() {
  const { getToken } = await auth();
  const token = await getToken();

  let verifications: Verification[] = [];
  try {
    const result = await api<{ verifications: Verification[] }>('/api/v1/verifications?limit=50', { token: token ?? undefined });
    verifications = result.verifications;
  } catch {
    // API might not be connected yet
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Verifications</h1>
        <NewVerificationButton />
      </div>

      <VerificationsList initial={verifications} />
    </div>
  );
}
