export default function SleepPage() {
  return (
  <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top ">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          Sleep
        </h1>
        <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-1">
          Log and analyze your sleep quality.
        </p>
      </div>
      
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] mb-4">
          <span className="text-4xl">😴</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Coming Soon</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-[250px]">
          The sleep tracking module is currently being built. Check back soon!
        </p>
      </div>
    </div>
  );
}
