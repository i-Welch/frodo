'use client';

import { useState, type FormEvent } from 'react';
import { UserButton } from '@neondatabase/auth-ui';
import { authClient } from '@/lib/auth/client';

export default function SettingsPage() {
  const { data: organization } = authClient.useActiveOrganization();
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [message, setMessage] = useState('');

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { data, error } = await authClient.organization.create({ name: organizationName, slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') });
    setMessage(error ? error.message ?? 'Creation failed' : `Organization created. Give RAVEN ops this ID to link the bank tenant: ${data?.id}`);
    if (!error) setOrganizationName('');
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) return;
    const { error } = await authClient.organization.inviteMember({
      organizationId: organization.id,
      email,
      role: 'member',
    });
    setMessage(error ? error.message ?? 'Invitation failed' : 'Invitation sent');
    if (!error) setEmail('');
  }

  return <div className="max-w-xl space-y-8">
    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
    <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
      <h2 className="text-lg font-medium">Account</h2>
      <UserButton />
    </section>
    <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-medium">{organization?.name ?? 'Select an organization'}</h2>
      {organization && <>
        <p className="text-sm text-gray-600">{organization.members.length} members</p>
        <form onSubmit={invite} className="flex gap-2">
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@bank.com" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">Invite member</button>
        </form>
        {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
      </>}
    </section>
    <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
      <h2 className="text-lg font-medium">Set up a bank organization</h2>
      <form onSubmit={createOrganization} className="flex gap-2">
        <input required value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Bank name" className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white">Create</button>
      </form>
      {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
    </section>
  </div>;
}
