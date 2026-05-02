interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

const StepHeader = ({ title, subtitle }: StepHeaderProps) => (
  <header className="mb-3 space-y-1">
    <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      Profile Setup
    </span>
    <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
      {title}
    </h1>
    {subtitle && (
      <p className="max-w-2xl text-sm leading-snug text-muted-foreground">{subtitle}</p>
    )}
  </header>
);

export default StepHeader;
