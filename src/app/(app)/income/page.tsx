import { PageToolbar } from "@/components/layout/page-toolbar";
import { IncomePageClient } from "@/components/income/income-page-client";
import { getIncomeRecords } from "@/lib/data";

export default async function IncomePage() {
  const records = await getIncomeRecords();

  return (
    <div className="space-y-6">
      <PageToolbar />
      <IncomePageClient initialRecords={records} />
    </div>
  );
}
