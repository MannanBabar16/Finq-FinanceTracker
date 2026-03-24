function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-warm rounded-2xl ${className}`.trim()} />;
}

export default function AppLoading() {
  return (
    <div className="space-y-6 animate-rise-in">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="rounded-full border border-white/40 bg-background/40 px-3 py-2 backdrop-blur-sm dark:border-white/8">
          <SkeletonBlock className="h-3 w-28" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card rounded-[30px] p-6">
            <div className="flex items-start justify-between gap-4">
              <SkeletonBlock className="h-7 w-28 rounded-full" />
              <SkeletonBlock className="h-11 w-11 rounded-2xl" />
            </div>
            <SkeletonBlock className="mt-6 h-10 w-32" />
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="glass-card rounded-[30px] p-6">
          <div className="flex flex-col gap-4 border-b border-white/35 pb-5 dark:border-white/8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-7 w-56" />
              <SkeletonBlock className="h-4 w-72" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[22px] border border-white/35 p-4 dark:border-white/8">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="mt-3 h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
          <SkeletonBlock className="mt-6 h-[320px] w-full rounded-[26px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="glass-card rounded-[30px] p-6">
              <SkeletonBlock className="h-7 w-44" />
              <SkeletonBlock className="mt-3 h-4 w-56" />
              <div className="mt-6 grid gap-4 lg:grid-cols-[200px_1fr]">
                <SkeletonBlock className="h-[200px] w-full rounded-full" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((__, itemIndex) => (
                    <div key={itemIndex} className="rounded-[22px] border border-white/35 p-4 dark:border-white/8">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="mt-3 h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-[30px] p-6">
        <SkeletonBlock className="h-7 w-48" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
