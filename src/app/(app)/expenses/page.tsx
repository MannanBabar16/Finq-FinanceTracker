import { PageToolbar } from "@/components/layout/page-toolbar";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";
import { getExpenseRecords } from "@/lib/data";

export default async function ExpensesPage() {
  const records = await getExpenseRecords();

  return (
    <div className="space-y-6">
      <PageToolbar />
      <ExpensesPageClient initialRecords={records} />
    </div>
  );
}
