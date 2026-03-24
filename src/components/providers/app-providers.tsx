import { CurrencyProvider } from "@/components/providers/currency-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { CurrencyCode } from "@/lib/utils";

export function AppProviders({ children, initialCurrency }: { children: React.ReactNode; initialCurrency: CurrencyCode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider initialCurrency={initialCurrency}>{children}</CurrencyProvider>
    </ThemeProvider>
  );
}
