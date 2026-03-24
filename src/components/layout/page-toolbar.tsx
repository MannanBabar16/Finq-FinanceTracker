import { ThemeToggle } from "@/components/layout/theme-toggle";

export function PageToolbar({ actions }: { actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 animate-rise-in">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-background/45 px-3 py-2 text-[11px] font-medium text-muted-foreground backdrop-blur-sm dark:border-white/8">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
        Live workspace
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <ThemeToggle />
      </div>
    </div>
  );
}
