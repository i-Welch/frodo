import { AccountSettingsCards } from '@neondatabase/auth/react';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
      <AccountSettingsCards />
    </div>
  );
}
