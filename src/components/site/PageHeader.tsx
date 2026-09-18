import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <section className="border-b border-border/60 bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {children && <div className="mx-auto mt-4 max-w-2xl text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
