import { PageToolbar } from "@/components/layout/page-toolbar";
import { GoalsPageClient } from "@/components/goals/goals-page-client";
import { getGoalRecords } from "@/lib/data";

export default async function GoalsPage() {
  const goals = await getGoalRecords();

  return (
    <div className="space-y-6">
      <PageToolbar />
      <GoalsPageClient initialGoals={goals} />
    </div>
  );
}
