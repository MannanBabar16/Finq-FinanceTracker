import { PageToolbar } from "@/components/layout/page-toolbar";
import { InvestmentsPageClient } from "@/components/investments/investments-page-client";
import { getInvestmentRecords } from "@/lib/data";

export default async function InvestmentsPage() {
  const records = await getInvestmentRecords();

  return (
    <div className="space-y-6">
      <PageToolbar />
      <InvestmentsPageClient initialRecords={records} />
    </div>
  );
}
