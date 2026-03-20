import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  eyebrow?: string;
  action?: string;
  className?: string;
  children: ReactNode;
};

export function Panel({ title, eyebrow, action, className = "", children }: PanelProps) {
  return (
    <section
      className={[
        "rounded-3xl border border-white/[0.08] bg-surface/90 p-5 shadow-glow backdrop-blur-sm",
        "transition-transform duration-200 hover:-translate-y-0.5",
        className
      ].join(" ")}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight text-text">{title}</h2>
        </div>
        {action ? <span className="text-xs text-textMuted">{action}</span> : null}
      </header>
      {children}
    </section>
  );
}
