"use client";

import { useRouter } from "next/navigation";
import { createContext, startTransition, useContext, useMemo, useState } from "react";
import { CURRENCY_COOKIE_NAME, formatCurrency as baseFormatCurrency, resolveCurrency, type CurrencyCode } from "@/lib/utils";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (value: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialCurrency,
}: {
  children: React.ReactNode;
  initialCurrency: CurrencyCode;
}) {
  const router = useRouter();
  const [currency, setCurrencyState] = useState<CurrencyCode>(resolveCurrency(initialCurrency));

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency: (nextCurrency) => {
        const resolved = resolveCurrency(nextCurrency);
        setCurrencyState(resolved);
        localStorage.setItem(CURRENCY_COOKIE_NAME, resolved);
        document.cookie = `${CURRENCY_COOKIE_NAME}=${resolved}; path=/; max-age=31536000; samesite=lax`;
        startTransition(() => {
          router.refresh();
        });
      },
      formatCurrency: (value) => baseFormatCurrency(value, currency),
    }),
    [currency, router],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }

  return context;
}

