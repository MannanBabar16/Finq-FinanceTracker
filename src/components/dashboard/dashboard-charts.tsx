"use client";

import { format, startOfMonth, subMonths } from "date-fns";
import { ArrowDownRight, ArrowUpRight, CircleOff } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrency } from "@/components/providers/currency-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExpenseRecord, IncomeRecord } from "@/lib/types";

const incomeColor = "#1f8f6a";
const incomeGlow = "#72d4b2";
const expenseColor = "#d06f4c";
const expenseGlow = "#f0ba9a";

const incomeCategoryColors: Record<string, string> = {
  Salary: "#14b87a",
  Freelance: "#2f7df6",
  Investment: "#c69214",
  Other: "#7b61ff",
};

const expenseCategoryColors: Record<string, string> = {
  Food: "#f97316",
  Rent: "#eab308",
  Transport: "#06b6d4",
  Shopping: "#a855f7",
  Health: "#ef4444",
  Entertainment: "#3b82f6",
  Other: "#64748b",
};

const fallbackIncomePalette = ["#14b87a", "#2f7df6", "#c69214", "#7b61ff", "#ec4899"];
const fallbackExpensePalette = ["#f97316", "#eab308", "#06b6d4", "#a855f7", "#ef4444", "#3b82f6", "#64748b"];

function buildMonthlySeries(income: IncomeRecord[], expenses: ExpenseRecord[]) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = startOfMonth(subMonths(new Date(), 5 - index));
    return {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
      income: 0,
      expenses: 0,
    };
  });

  income.forEach((entry) => {
    const key = format(startOfMonth(new Date(entry.date)), "yyyy-MM");
    const month = months.find((item) => item.key === key);
    if (month) month.income += Number(entry.amount);
  });

  expenses.forEach((entry) => {
    const key = format(startOfMonth(new Date(entry.date)), "yyyy-MM");
    const month = months.find((item) => item.key === key);
    if (month) month.expenses += Number(entry.amount);
  });

  return months;
}

function buildCategorySeries(items: Array<{ category: string; amount: number }>) {
  const map = new Map<string, number>();
  items.forEach((item) => {
    map.set(item.category, (map.get(item.category) || 0) + Number(item.amount));
  });

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

function getCategoryColor(name: string, colors: Record<string, string>, fallbackPalette: string[], index: number) {
  return colors[name] ?? fallbackPalette[index % fallbackPalette.length];
}

function sanitizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized;
  const value = Number.parseInt(safe, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: { name?: string } }>;
  label?: string;
}) {
  const { formatCurrency } = useCurrency();

  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[180px] rounded-[22px] border border-white/60 bg-[rgba(255,251,244,0.94)] p-3 shadow-[0_24px_60px_-36px_rgba(81,61,30,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgba(23,30,27,0.94)]">
      {label ? <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p> : null}
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={`${entry.name}-${entry.payload?.name ?? label ?? "item"}`} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name ?? entry.payload?.name ?? "Value"}</span>
            </div>
            <span className="font-semibold">{formatCurrency(Number(entry.value || 0))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoughnutPanel({
  chartId,
  title,
  description,
  data,
  colors,
  fallbackPalette,
  accent,
}: {
  chartId: string;
  title: string;
  description: string;
  data: Array<{ name: string; value: number }>;
  colors: Record<string, string>;
  fallbackPalette: string[];
  accent: string;
}) {
  const { formatCurrency } = useCurrency();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[210px_1fr] lg:items-center">
        <div className="h-[220px]">
          {data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[26px] border border-dashed border-border/80 bg-white/35 text-center dark:bg-white/5">
              <CircleOff className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No data yet</p>
              <p className="mt-1 max-w-[160px] text-xs text-muted-foreground">Add more entries to generate a category breakdown.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {data.map((entry, index) => {
                    const base = getCategoryColor(entry.name, colors, fallbackPalette, index);
                    const gradientId = `${sanitizeId(chartId)}-${sanitizeId(entry.name)}-${index}`;
                    return (
                      <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={base} stopOpacity={1} />
                        <stop offset="100%" stopColor={base} stopOpacity={0.78} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => {
                    const gradientId = `${sanitizeId(chartId)}-${sanitizeId(entry.name)}-${index}`;
                    return <Cell key={entry.name} fill={`url(#${gradientId})`} stroke="none" />;
                  })}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;

                      return (
                        <g>
                          <text x={viewBox.cx} y={viewBox.cy - 4} textAnchor="middle" fill={accent} fontSize="13" fontWeight="600">
                            Total
                          </text>
                          <text x={viewBox.cx} y={viewBox.cy + 20} textAnchor="middle" fill={accent} fontSize="18" fontWeight="700">
                            {formatCurrency(total)}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="space-y-3">
          {data.slice(0, 5).map((entry, index) => {
            const percentage = total > 0 ? (entry.value / total) * 100 : 0;
            const swatch = getCategoryColor(entry.name, colors, fallbackPalette, index);
            const rgb = hexToRgb(swatch);

            return (
              <div
                key={entry.name}
                className="rounded-[22px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                style={{
                  borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
                  backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full ring-2 ring-black/10 dark:ring-white/10"
                      style={{ backgroundColor: swatch }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: swatch }}>{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}% share</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: swatch }}>{formatCurrency(entry.value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({ income, expenses }: { income: IncomeRecord[]; expenses: ExpenseRecord[] }) {
  const { formatCurrency } = useCurrency();
  const trendData = buildMonthlySeries(income, expenses);
  const incomeByCategory = buildCategorySeries(income);
  const expensesByCategory = buildCategorySeries(expenses);
  const latestMonth = trendData.at(-1);
  const latestBalance = latestMonth ? latestMonth.income - latestMonth.expenses : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr] chart-shell">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-white/45 pb-5 dark:border-white/8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Six-month financial movement with live balance context.</CardDescription>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/55 bg-white/45 px-4 py-3 dark:border-white/8 dark:bg-white/5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <ArrowUpRight className="h-3.5 w-3.5" style={{ color: incomeColor }} />
                  Income
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(latestMonth?.income ?? 0)}</p>
              </div>
              <div className="rounded-[22px] border border-white/55 bg-white/45 px-4 py-3 dark:border-white/8 dark:bg-white/5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <ArrowDownRight className="h-3.5 w-3.5" style={{ color: expenseColor }} />
                  Expenses
                </div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(latestMonth?.expenses ?? 0)}</p>
              </div>
              <div className="rounded-[22px] border border-white/55 bg-white/45 px-4 py-3 dark:border-white/8 dark:bg-white/5">
                <div className="mb-2 text-xs font-semibold text-muted-foreground">Balance</div>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(latestBalance)}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[360px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="income-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={incomeGlow} />
                  <stop offset="100%" stopColor={incomeColor} />
                </linearGradient>
                <linearGradient id="expense-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={expenseGlow} />
                  <stop offset="100%" stopColor={expenseColor} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(125, 109, 82, 0.14)" strokeDasharray="4 8" />
              <XAxis
                axisLine={false}
                tickLine={false}
                dataKey="label"
                dy={8}
                stroke="#8f8578"
                tick={{ fontSize: 12, fill: "#8f8578" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="#8f8578"
                tick={{ fontSize: 12, fill: "#8f8578" }}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="url(#income-line)"
                strokeWidth={3.5}
                dot={false}
                activeDot={{ r: 5, fill: incomeColor, stroke: "#fff7ed", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="url(#expense-line)"
                strokeWidth={3.5}
                dot={false}
                activeDot={{ r: 5, fill: expenseColor, stroke: "#fff7ed", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
        <DoughnutPanel
          chartId="expenses-category"
          title="Expenses by Category"
          description="Where spending is concentrated across your wallet."
          data={expensesByCategory}
          colors={expenseCategoryColors}
          fallbackPalette={fallbackExpensePalette}
          accent={expenseColor}
        />
        <DoughnutPanel
          chartId="income-category"
          title="Income by Category"
          description="Your strongest contribution channels at a glance."
          data={incomeByCategory}
          colors={incomeCategoryColors}
          fallbackPalette={fallbackIncomePalette}
          accent={incomeColor}
        />
      </div>
    </div>
  );
}
