import { cookies } from "next/headers";
import { ArrowDownRight, ArrowUpRight, Scale, TrendingUp } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PageToolbar } from "@/components/layout/page-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardData } from "@/lib/data";
import { CURRENCY_COOKIE_NAME, formatCurrency, formatShortDate, resolveCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const currency = resolveCurrency(cookies().get(CURRENCY_COOKIE_NAME)?.value);
  const { income, expenses, investments } = await getDashboardData();

  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const netBalance = totalIncome - totalExpenses;
  const totalInvestments = investments.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    const currentPrice = item.current_price === null ? Number(item.buy_price) : Number(item.current_price);
    return sum + quantity * currentPrice;
  }, 0);

  const recentTransactions = [
    ...income.slice(0, 5).map((item) => ({ ...item, type: "Income" })),
    ...expenses.slice(0, 5).map((item) => ({ ...item, type: "Expense" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <PageToolbar />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Income", value: formatCurrency(totalIncome, currency), icon: ArrowUpRight, tone: "text-emerald-300", chip: "bg-emerald-500/10 text-emerald-300" },
          { label: "Total Expenses", value: formatCurrency(totalExpenses, currency), icon: ArrowDownRight, tone: "text-rose-300", chip: "bg-rose-500/10 text-rose-300" },
          { label: "Net Balance", value: formatCurrency(netBalance, currency), icon: Scale, tone: "text-sky-300", chip: "bg-sky-500/10 text-sky-300" },
          { label: "Investments", value: formatCurrency(totalInvestments, currency), icon: TrendingUp, tone: "text-amber-300", chip: "bg-amber-500/10 text-amber-300" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="surface-shine overflow-hidden">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${card.chip}`}>{card.label}</div>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/35 p-3 dark:border-white/8 dark:bg-white/5">
                  <Icon className={`h-5 w-5 ${card.tone}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-[-0.04em]">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <DashboardCharts income={income} expenses={expenses} />
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-white/40 dark:border-white/8">
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {recentTransactions.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-white/30 p-10 text-center text-sm text-muted-foreground dark:bg-white/5">
              No transactions yet. Add income and expenses to populate your dashboard.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>
                      <Badge variant={item.type === "Income" ? "default" : "destructive"}>{item.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{formatShortDate(item.date)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(item.amount), currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
