import { cookies } from "next/headers";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { CURRENCY_COOKIE_NAME, formatCurrency, resolveCurrency } from "@/lib/utils";

export default function HomePage() {
  const currency = resolveCurrency(cookies().get(CURRENCY_COOKIE_NAME)?.value);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-4 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(233,184,108,0.22),transparent_22%),radial-gradient(circle_at_78%_12%,rgba(53,140,110,0.2),transparent_24%),radial-gradient(circle_at_70%_72%,rgba(58,98,188,0.12),transparent_26%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-4 xl:min-h-[calc(100vh-4rem)] xl:grid-cols-[1.12fr_0.88fr] xl:gap-6">
        <section className="order-2 flex flex-col justify-between rounded-[32px] border border-white/40 bg-[rgba(255,248,239,0.68)] p-5 shadow-[0_30px_90px_-40px_rgba(77,54,21,0.35)] backdrop-blur-xl dark:border-white/6 dark:bg-[rgba(22,30,26,0.72)] md:p-8 xl:order-1 xl:min-h-[620px]">
          <div className="space-y-5 md:space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-[12px] font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[rgb(234,185,104)]" />
                Finq
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                User-scoped data
              </div>
            </div>

            <div className="max-w-4xl space-y-3">
              <h1 className="text-balance text-4xl font-semibold leading-[0.95] text-primary md:text-6xl xl:text-7xl">
                Personal finance, with a calmer surface.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-xl md:leading-8">
                Track money clearly. See better patterns.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-[linear-gradient(135deg,rgba(255,250,242,0.86),rgba(244,235,222,0.62))] p-4 dark:border-white/6 dark:bg-[linear-gradient(135deg,rgba(31,43,38,0.9),rgba(18,25,22,0.82))] md:p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[rgba(234,185,104,0.18)] blur-3xl" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between md:mb-8">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Weekly pulse</p>
                    <p className="mt-1 text-xl font-semibold text-primary md:text-2xl">{formatCurrency(42800, currency)} available</p>
                  </div>
                  <div className="rounded-[20px] border border-white/60 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/55 bg-white/55 p-4 dark:border-white/8 dark:bg-white/5">
                    <p className="text-[12px] text-muted-foreground">Income</p>
                    <p className="mt-2 text-base font-semibold text-primary md:text-lg">{formatCurrency(185000, currency)}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/55 bg-white/55 p-4 dark:border-white/8 dark:bg-white/5">
                    <p className="text-[12px] text-muted-foreground">Expenses</p>
                    <p className="mt-2 text-base font-semibold text-primary md:text-lg">{formatCurrency(142200, currency)}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/55 bg-white/55 p-4 dark:border-white/8 dark:bg-white/5">
                    <p className="text-[12px] text-muted-foreground">Goal pace</p>
                    <p className="mt-2 text-base font-semibold text-primary md:text-lg">68%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 relative flex items-center justify-center rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(21,30,27,0.98),rgba(14,21,18,0.96))] p-4 shadow-[0_35px_90px_-44px_rgba(0,0,0,0.62)] md:p-7 xl:order-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(234,185,104,0.18),transparent_56%)]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[rgba(20,184,122,0.12)] blur-3xl" />
          <div className="relative w-full max-w-xl">
            <AuthForm />
          </div>
        </section>
      </div>
    </main>
  );
}
