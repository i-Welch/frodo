'use client';

import { UserButton } from '@neondatabase/auth-ui';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

export function OrganizationControls() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const activeId = session?.session?.activeOrganizationId ?? '';

  return <div className="space-y-3">
    <label className="block text-xs text-gray-500" htmlFor="active-organization">Organization</label>
    <select
      id="active-organization"
      aria-label="Active organization"
      value={activeId}
      onChange={async (event) => {
        const { error } = await authClient.organization.setActive({ organizationId: event.target.value || null });
        if (!error) router.refresh();
      }}
      className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
    >
      <option value="">Select an organization</option>
      {organizations?.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
    </select>
    <div className="flex items-center gap-2"><UserButton /><span className="text-xs text-gray-500">Account</span></div>
  </div>;
}
