interface StepShellProps {
  step: number;
  total: number;
  title: string;
  sub?: string;
  onBack?: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/** Full-screen iOS-style step: progress, title, content, and a pinned action at the bottom. */
export function StepShell({ step, total, title, sub, onBack, footer, children }: StepShellProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex h-10 items-center gap-3">
        {onBack ? (
          <button type="button" onClick={onBack} className="-ml-1 px-1 text-[15px] text-scarlet-bright">
            ‹ Back
          </button>
        ) : (
          <span className="w-12" />
        )}
        <div className="flex flex-1 justify-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i <= step ? "w-6 bg-scarlet-bright" : "w-3 bg-line"}`} />
          ))}
        </div>
        <span className="w-12" />
      </div>

      <h1 className="mt-6 font-sora text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
      {sub && <p className="mt-2 text-[15px] text-ink-2">{sub}</p>}

      <div className="mt-7 flex flex-1 flex-col gap-4 pb-36">{children}</div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line-soft bg-night/90 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto max-w-md">{footer}</div>
      </div>
    </main>
  );
}

export const primaryButton =
  "flex w-full items-center justify-center rounded-2xl bg-scarlet px-5 py-4 text-[16px] font-semibold text-white shadow-save disabled:opacity-40 active:scale-[.99]";
