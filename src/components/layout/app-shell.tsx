"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, CreditCard, Heart, LayoutDashboard, LogOut, Menu, Settings, Target, TrendingUp, Wallet } from "lucide-react";
import { useState, useTransition } from "react";
import { useCurrency } from "@/components/providers/currency-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, type CurrencyCode } from "@/lib/utils";
import type { ProfileData } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/wishlist", label: "Wants & Needs", icon: Heart },
  { href: "/ai", label: "AI Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Financial Overview",
  "/income": "Income Ledger",
  "/expenses": "Expense Control",
  "/goals": "Savings Goals",
  "/investments": "Investments",
  "/wishlist": "Wants & Needs",
  "/ai": "AI Finance Assistant",
  "/settings": "Settings",
};

function SidebarContent({ profile, onNavigate }: { profile: ProfileData; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <div className="glass-card surface-shine rounded-[32px] p-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-accent-foreground/70">Personal finance workspace</p>
        <h2 className="mt-3 text-4xl font-semibold leading-[0.95] text-primary">Finq</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">Track money flow, shape better habits, and ask smarter questions about where your cash is going.</p>
      </div>
      <div className="glass-card rounded-[28px] p-4 transition-[transform,box-shadow] duration-300 hover:translate-y-[-2px]">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-1 ring-border/70">
            <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            <AvatarFallback label={profile.displayName} />
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{profile.displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-2 pr-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm transition-[transform,background-color,color,box-shadow] duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_18px_38px_-26px_hsl(var(--foreground)/0.5)]"
                    : "hover:translate-x-[2px] hover:bg-secondary/75",
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform duration-200", !active && "group-hover:scale-110")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" className="flex-1 justify-center" onClick={handleLogout} disabled={pending}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
      <SelectTrigger className="h-10 w-[132px] rounded-full border-border/70 bg-background/50 text-xs font-medium text-muted-foreground sm:w-[152px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PKR">Pakistan Rupee</SelectItem>
        <SelectItem value="USD">US Dollar</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function AppShell({ profile, children }: { profile: ProfileData; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = pageTitles[pathname] || "Finq";

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 p-4 md:gap-6 md:p-6">
        <aside className="hidden w-[320px] shrink-0 xl:block">
          <div className="sticky top-6 h-[calc(100vh-3rem)] animate-rise-in">
            <SidebarContent profile={profile} />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="glass-card sticky top-4 z-30 flex items-center justify-between rounded-[28px] px-4 py-4 animate-rise-in md:px-6">
            <div className="flex items-center gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="xl:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="left-0 top-0 h-screen max-w-sm translate-x-0 translate-y-0 rounded-none border-r p-0">
                  <DialogTitle className="sr-only">Navigation</DialogTitle>
                  <SidebarContent profile={profile} onNavigate={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Finq workspace</p>
                <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySwitcher />
              <Avatar className="h-11 w-11 ring-1 ring-border/70 transition-transform duration-200 hover:scale-[1.03]">
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                <AvatarFallback label={profile.displayName} />
              </Avatar>
            </div>
          </header>
          <main className="flex-1 animate-rise-in">{children}</main>
        </div>
      </div>
    </div>
  );
}


