type WordmarkProps = {
  className?: string;
  /** Primary word color (Analytic). */
  primaryClassName?: string;
  /** Secondary word color (Castle). */
  secondaryClassName?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-[13.5px]",
  md: "text-[14px]",
  lg: "text-[15px]",
} as const;

/** Lockup: AnalyticCastle, Inter Extrabold, dual-tone Castle. */
export function Wordmark({
  className = "",
  primaryClassName = "text-inherit",
  secondaryClassName = "text-wordmark-muted",
  size = "md",
}: WordmarkProps) {
  return (
    <span
      className={`inline font-extrabold tracking-[-0.01em] ${sizes[size]} ${className}`}
    >
      <span className={primaryClassName}>Analytic</span>
      <span className={secondaryClassName}>Castle</span>
    </span>
  );
}
