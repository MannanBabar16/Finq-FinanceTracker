import { PageToolbar } from "@/components/layout/page-toolbar";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { getProfileData } from "@/lib/data";

export default async function SettingsPage() {
  const profile = await getProfileData();

  return (
    <div className="space-y-6">
      <PageToolbar />
      <SettingsPageClient profile={profile} />
    </div>
  );
}
