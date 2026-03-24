import { AppShell } from "@/components/layout/app-shell";
import { getProfileData } from "@/lib/data";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfileData();

  return <AppShell profile={profile}>{children}</AppShell>;
}
