interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

const StepHeader = ({ title, subtitle }: StepHeaderProps) => (
  <div className="mb-4">
    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
      {title}
    </h1>
    {subtitle && (
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    )}
  </div>
);

export default StepHeader;
