import { cn } from "@/lib/utils";

interface SectionTitleProps {
  label?: string;
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

const SectionTitle = ({
  label,
  title,
  highlight,
  description,
  className,
  align = "center",
}: SectionTitleProps) => {
  const titleParts = highlight
    ? title.split(highlight)
    : [title];

  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {label && (
        <span className="chip inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {highlight ? (
          <>
            {titleParts[0]}
            <span className="gradient-text">{highlight}</span>
            {titleParts[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {description && (
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
