import { OrganizationProfile } from '@clerk/nextjs';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
      <OrganizationProfile />
    </div>
  );
}
