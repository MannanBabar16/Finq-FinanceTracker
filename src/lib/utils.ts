import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export type CurrencyCode = "PKR" | "USD";

export const DEFAULT_CURRENCY: CurrencyCode = "PKR";
export const CURRENCY_COOKIE_NAME = "finq-currency";
export const PKR_PER_USD = 280;

const currencyConfigs: Record<CurrencyCode, { locale: string; currency: string; maximumFractionDigits: number }> = {
  PKR: { locale: "en-PK", currency: "PKR", maximumFractionDigits: 0 },
  USD: { locale: "en-US", currency: "USD", maximumFractionDigits: 2 },
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveCurrency(value: string | null | undefined): CurrencyCode {
  return value === "USD" ? "USD" : DEFAULT_CURRENCY;
}

export function convertCurrencyValue(value: number, currency: CurrencyCode) {
  const safeValue = Number(value || 0);
  if (currency === "USD") return safeValue / PKR_PER_USD;
  return safeValue;
}

export function convertCurrencyInputToBase(value: number, currency: CurrencyCode) {
  const safeValue = Number(value || 0);
  if (currency === "USD") return safeValue * PKR_PER_USD;
  return safeValue;
}

export function formatCurrency(value: number, currency: CurrencyCode = DEFAULT_CURRENCY) {
  const config = currencyConfigs[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(convertCurrencyValue(value, currency));
}

export function formatShortDate(value: string | Date | null | undefined) {
  if (!value) return "No date";
  return format(new Date(value), "dd MMM yyyy");
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const incomeCategories = [
  "Salary",
  "Freelance",
  "Investment",
  "Other",
] as const;

export const expenseCategories = [
  "Food",
  "Rent",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
] as const;

export const investmentTypes = ["stock", "crypto", "gold", "fund", "real_estate", "other"] as const;
export const wishlistItemTypes = ["want", "need"] as const;
export const goalStatuses = ["active", "completed", "cancelled"] as const;

export const expenseCategoryColors: Record<string, string> = {
  Food: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Rent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Transport: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Shopping: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Health: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Entertainment: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Other: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};
